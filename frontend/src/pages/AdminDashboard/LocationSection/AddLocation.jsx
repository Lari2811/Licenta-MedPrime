import React, { useContext, useEffect, useRef } from 'react'
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomSelect from '../../../components/customSelect';
import { selectOptions } from '../../../utils/selectOptions';
import { AppContext } from '../../../context/AppContex';
import { addItem, removeItem } from '../../../utils/formUtils';
import { assets } from '../../../assets/assets';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../../components/Loader';

const AddLocation = ({onClose, onCloseSaveLocation}) => {

    const { backendUrl } = useContext(AppContext)

    const { adminID } = useParams()

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");


    const [formData, setFormData] = useState({
        locationID: "",
        clinicName: "",
        phone: "",
        email: "",

        address: {
            address_details: "",
            city: "",
            county: "",
            postalCode: "",
            latitude: null, 
            longitude: null,
        },

       schedule: [],

        images: {
            profileImage: null,        
            profileImageUrl: "",      
            galleryFiles: [],          
            galleryUrls: []          
        },

        infoProfile: "",
        otherInformations: [],
        facilities: [],

        isLocationActive: true,
        status: "",
        closedReason: "",
        reopenDate: ""
        });

    const [facilityInput, setFacilityInput] = useState('');
    const [otherInfoInput, setOtherInfoInput] = useState('');

    const [profileImagePreview, setProfileImagePreview] = useState(null); 
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const [errors, setErrors] = useState({});

    
    // Pentru program
    const [selectedDay, setSelectedDay] = useState("");
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("20:00");
    
    //handlere =======================================
    const handleAdaugaProgram = () => {
        if (!selectedDay || !startTime || !endTime) {
            toast.error("Completează toate câmpurile!");
            return;
        }

        // Validare: start < end
        if (startTime >= endTime) {
            toast.error("Ora de început trebuie să fie mai mică decât ora de sfârșit!");
            return;
        }

        // Transforma in numere pentru comparare (ex: 09:30 -> 930)
        const toNumber = (time) => parseInt(time.replace(":", ""));

        const newStart = toNumber(startTime);
        const newEnd = toNumber(endTime);

        // Verifica suprapuneri in programul deja adaugat (formData.schedule)
        const conflict = formData.schedule.find((prog) => {
            if (prog.day === selectedDay) {
            const existingStart = toNumber(prog.startTime);
            const existingEnd = toNumber(prog.endTime);

            return (
                (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd)
            );
            }
            return false;
        });

        if (conflict) {
            toast.error(`Există deja un program pentru ${selectedDay} care se suprapune!`);
            return;
        }

        // Adauga programul in formData.schedule
        setFormData((prev) => ({
            ...prev,
            schedule: [
            ...prev.schedule,
            { day: selectedDay, startTime, endTime },
            ],
        }));

        // Reset campuri
        setSelectedDay("");
        setStartTime("08:00");
        setEndTime("20:00");
        };

    // Imagini ---------------------------------------------
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);

        // Calculam totalul imaginilor
        const totalImages = (formData.images.galleryFiles?.length || 0) + (formData.images.galleryUrls?.length || 0) + files.length;
        if (totalImages > 15) {
            toast.error("Poți adăuga maxim 15 imagini.");
            return;
        }

        // Actualizam formData cu noile fisiere
        setFormData((prev) => ({
            ...prev,
            images: {
                ...prev.images,
                galleryFiles: [...(prev.images.galleryFiles || []), ...files], 
                galleryUrls: prev.images.galleryUrls || [] 
            }
        }));

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setGalleryPreviews((prev) => [...prev, ...newPreviews]);

        e.target.value = ''; 
    };

    // stergere imagine
    const handleRemoveGalleryFile = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: {
                ...prev.images,
                galleryFiles: prev.images.galleryFiles.filter((_, i) => i !== index),
                galleryUrls: prev.images.galleryUrls
            }
    }));

    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // reordonare imagini
    const handleRemoveGalleryUrl = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: {
                ...prev.images,
                galleryFiles: prev.images.galleryFiles,
                galleryUrls: prev.images.galleryUrls.filter((_, i) => i !== index)
            }
        }));
    };


    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const reorder = (list, startIndex, endIndex) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        };

        setFormData((prev) => ({
            ...prev,
            images: {
            ...prev.images,
            galleryFiles: reorder(prev.images.galleryFiles, result.source.index, result.destination.index),
            galleryUrls: prev.images.galleryUrls,
            },
        }));

        setGalleryPreviews((prev) => reorder(prev, result.source.index, result.destination.index));
    };

    // Obiecte - lista =========================
    const handleAddFacility = () => {
        if (!facilityInput.trim()) return;

        const newList = [...formData.facilities, facilityInput];

        addItem(
            facilityInput,
            setFacilityInput,
            formData.facilities,
            (newList) => setFormData((prev) => ({
            ...prev,
            facilities: newList
            }))
        );

        // Elimina eroarea 
        setErrors((prev) => ({ ...prev, facilities: false }));
    };

    const handleRemoveFacility = (index) => {

        removeItem(
            index,
            formData.facilities,
            (newList) => setFormData((prev) => ({
            ...prev,
            facilities: newList
            }))
        );

        if (!facilityInput.trim())
            setErrors((prev) => ({ ...prev, facilities: true }));
    };

    const handleAddOtherInfo = () => {
        addItem(
            otherInfoInput,
            setOtherInfoInput,
            formData.otherInformations,
            (newList) => setFormData((prev) => ({
            ...prev,
            otherInformations: newList
            }))
        );
    };

    const handleRemoveOtherInfo = (index) => {
        removeItem(
            index,
            formData.otherInformations,
            (newList) => setFormData((prev) => ({
            ...prev,
            otherInformations: newList
            }))
        );
    };
    //=============================================

    
    const finalCheck = () => {
        const newErrors = {};
        const invalidFields = [];

        // === Validare campuri text ===
        if (!formData.clinicName.trim()) {
            newErrors.clinicName = true;
            invalidFields.push("Denumire clinică");
        }

        if (!formData.infoProfile.trim()) {
            newErrors.infoProfile = true;
            invalidFields.push("Informații de profil");
        }

        if (!formData.address.city.trim()) {
            newErrors.city = true;
            invalidFields.push("Oraș");
        }

        if (!formData.address.county.trim()) {
            newErrors.county = true;
            invalidFields.push("Județ");
        }

        if (!formData.address.address_details.trim()) {
            newErrors.address_details = true;
            invalidFields.push("Adresă");
        }

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            newErrors.email = true;
            invalidFields.push("Email (format valid)");
        }


        if (!formData.phone.trim() || !/^(02|03|07)\d{8}$/.test(formData.phone)) {
            newErrors.phone = true;
            invalidFields.push("Telefon (format valid)");
        }

        if (formData.status === "deschis" && formData.schedule.length === 0) {
            newErrors.schedule = true;
            newErrors.day = true;
            newErrors.startTime = true;
            newErrors.endTime = true;
            invalidFields.push("Program (minim 1)");
        }

        if (!formData.status) {
            newErrors.status = true;
            invalidFields.push("Status locație");
        }

        if (formData.status === "inchis temporar") {
            if (!formData.closedReason.trim()) {
                newErrors.closedReason = true;
                invalidFields.push("Motiv închidere temporară");
            }
            if (!formData.reopenDate.trim() || new Date(formData.reopenDate) <= new Date()) {
                newErrors.reopenDate = true;
                invalidFields.push("Dată redeschidere (viitor)");
            }

        }

        if (formData.status === "inchis definitiv") {
            if (!formData.closedReason.trim()) {
                newErrors.closedReason = true;
                invalidFields.push("Motiv închidere definitivă");
            }
        }


       if (invalidFields.length > 0) {
            setErrors(newErrors);

            toast.error("Există câmpuri necompletate sau incorecte!");

            toast.error(invalidFields.join("\n"), {
                autoClose: 5000,
                closeOnClick: true,
                draggable: true,
                pauseOnHover: true,
                style: { whiteSpace: 'pre-line' }
            });

            return false;
        }
        return true;
    };

    
    const handleSave = async () => {
        const isValid = finalCheck();
        if (!isValid) return;

        const adresaCompleta = `${formData.address.address_details}, ${formData.address.city}, ${formData.address.county}, Romania`;

        // Obtine coordonatele de la Google Maps API
        const apiKey = 'AIzaSyCSe7L7NxIN43yKm3-Mawph0xF4KSE1Vqo'; // Cheia Google Maps
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(adresaCompleta)}&key=${apiKey}`;

        let coords = null;
        let postalCode = null;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            coords = { lat, lng };

            // Extrage codul postal din address_components
            const postalComponent = data.results[0].address_components.find(comp =>
            comp.types.includes("postal_code")
            );
            postalCode = postalComponent ? postalComponent.long_name : "";

            //toast.success("Adresa găsită!");
        } else {
            toast.error("Adresa nu a fost găsită.");
            return;
        }
        } catch (error) {
            console.error("Eroare la obținerea coordonatelor:", error);
            toast.error("Eroare la obținerea coordonatelor.");
            return;
        }
        //  Actualizează formData cu coordonatele
        const updatedFormData = {
            ...formData,
            address: {
            ...formData.address,
            latitude: coords.lat,
            longitude: coords.lng,
            postalCode: postalCode
            }
        };

        setFormData(updatedFormData); 

       
        try {
            
            setLoading(true)
            setLoadingMessage("Se salvează locația...");

            //  Construim FormData
            const formDataToSend = new FormData();
            formDataToSend.append('locationDataForm', JSON.stringify(updatedFormData));
            formDataToSend.append('adminID', adminID);

            if (updatedFormData.images.profileImage) {
            formDataToSend.append('profileImage', updatedFormData.images.profileImage);
            }

            updatedFormData.images.galleryFiles.forEach((file) => {
            formDataToSend.append('galleryImages', file);
            });

            //  Cerere POST către API
            const response = await axios.post(`${backendUrl}/api/admin/add-location`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            });

            // Succes
            toast.success(response.data.message || 'Locația a fost adăugată cu succes!');
            //console.log(' Răspuns API:', response.data);
            
         
            onCloseSaveLocation(  {
                locationID: response.data.location.locationID,
                clinicName: response.data.location.clinicName,
                status: response.data.location.status
            });

        } catch (error) {
            console.error('Eroare la salvare locație:', error);
            toast.error(error.response?.data?.message || 'Eroare la salvarea locației!');
        } finally {
            setLoading(false);
            setLoadingMessage("");
            }
    };

  return (
     <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%]  max-w-6xl max-h-[90%] overflow-y-auto">
                <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
                <p className="text-2xl font-semibold text-gray-800 text-center mb-3">Adaugă Locație</p>
                <p className='border-b-1 mb-5'></p>
    
            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* Col 1 */}
                <div className="space-y-5">
                    {/* Imagine */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Fotografie de profil
                        </label>
                        <div className="flex items-center">
                        <div
                            
                            className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4 border 
                            "
                        >
                        {formData.images.profileImage ? (
                            <img src={URL.createObjectURL(formData.images.profileImage)} alt="preview" className="w-full h-full object-cover" />
                            ) : formData.images.profileImageUrl ? (
                            <img src={formData.images.profileImageUrl} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                            <img src={assets.location_default} alt="default" className="w-full h-full object-cover" />
                            )}

                        </div>
                      
                        <div>
                            <input
                            type="file"
                            accept="image/*"
                            id="mainImageInput"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                setFormData((prev) => ({
                                    ...prev,
                                    images: {
                                    ...prev.images,
                                    profileImage: file
                                    }
                                }));
                                }
                            }}
                            />
                            <button
                            type="button"
                            onClick={() => document.getElementById('mainImageInput').click()}
                            className="btn-outline-purple-little-little"
                            >
                            + Adaugă imagine
                            </button>
                        </div>
                        </div>
                    </div>

                    {/* Denumire clinica */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                        Denumire clinică*
                        </label>
                            <input
                                type="text"
                                name="clinicName"
                                value={formData.clinicName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prev) => ({ ...prev, clinicName: value }));

                                    if (value.trim() !== "") {
                                    setErrors((prev) => ({ ...prev, clinicName: false }));
                                    } 
                                    else
                                        setErrors((prev) => ({ ...prev, clinicName: true }));
                                }}
                                className={`w-full p-2 border rounded text-sm ${errors.clinicName ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                                placeholder='ex: MedPrime Arad'
                            />

                        
                    </div>

                    {/* Info Profil */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Informații de profil*
                        </label>
                        <textarea
                            value={formData.infoProfile}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({ ...prev, infoProfile: e.target.value }));
                                    if (value.trim() !== "") {
                                    setErrors((prev) => ({ ...prev, infoProfile: false }));
                                    }
                                    else
                                        setErrors((prev) => ({ ...prev, infoProfile: true }));
                                    
                                }}
                            placeholder="ex: Clinica oferă servicii medicale moderne..."
                            rows={2}
                            className={`w-full border p-2 rounded text-sm ${errors.infoProfile ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                        ></textarea>
                        
                    </div>

                    {/* Alte informatii */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                        Alte informații
                    </label>
                    <div className="flex gap-2">
                        <textarea
                            rows={1}
                            value={otherInfoInput}
                            onChange={(e) => setOtherInfoInput(e.target.value)}
                            className="border p-2 rounded text-sm flex-1"
                            placeholder="ex: acces persoane cu dizabilități"
                        />
                        <button
                        type="button"
                        onClick={handleAddOtherInfo}
                        className="btn-outline-purple-little-little"
                        >
                        + Adaugă
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.otherInformations.map((info, index) => (
                        <div key={index} className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                            {info}
                            <button
                            onClick={handleRemoveOtherInfo}                            
                            className="text-gray-800 font-medium text-sm hover:text-red-600"

                            >
                            x
                            </button>
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Facilitati */}
                    <div >
                    <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                        Facilități
                    </label>
                    <div className="flex gap-2">
                        <textarea
                            rows={1}
                            type="text"
                            value={facilityInput}
                            onChange={(e) => setFacilityInput(e.target.value)}
                            className={`border p-2 rounded text-sm flex-1 ${errors.facilities ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                            placeholder="ex: parcare, lift..."
                            />
                        <button
                        type="button"
                        onClick={handleAddFacility}
                        className="btn-outline-purple-little-little"
                        >
                        + Adaugă
                        </button>
                    </div>

              
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.facilities.map((item, index) => (
                        <div key={index} className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                            {item}
                            <button
                            onClick={handleRemoveFacility}
                            className="text-gray-800 font-medium text-sm hover:text-red-600"
                            >
                            x
                            </button>
                        </div>
                        ))}
                    </div>
                    </div>

                </div>


                {/* Col 2 */}
                <div className="space-y-5">
                   
                    
                    {/* Judet */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                        Județ*
                    </label>
                   <CustomSelect
                        options={selectOptions.counties}
                        value={formData.address.county}
                        onChange={(value) => {
                            setFormData((prev) => ({
                                ...prev,
                                address: {
                                    ...prev.address,
                                    county: value
                                }
                            }));

                            if (!value || value.trim() === "") {
                                setErrors((prev) => ({ ...prev, county: true }));
                            } else {
                                setErrors((prev) => ({ ...prev, county: false }));
                            }
                        }}
                        placeholder="Selectează județul"
                        hasError={errors.county}
                        />
                   
                    </div>  

                    {/* Oras */}
                    <div>
                        <label className="block text-sm font-medium mb-0 ml-1">Oraș *</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.address.city}
                            onChange={(e) => {
                                const value = e.target.value;

                                setFormData((prev) => ({
                                    ...prev,
                                    address: {
                                        ...prev.address,
                                        city: value
                                    }
                                }));

                                if (value.trim() !== "") {
                                    setErrors((prev) => ({ ...prev, city: false }));
                                } else {
                                    setErrors((prev) => ({ ...prev, city: true }));
                                }
                            }}
                            className={`w-full border rounded p-2 text-sm
                                ${
                                    errors.city ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : "border" }
                                `}
                                placeholder='ex: Arad'
                        />
                     
                    </div>

                    {/* Strada / detalii */}
                    <div>
                        <label className="block text-sm font-medium mb-0 ml-1">Stradă / Detalii*</label>
                        <input
                            type="text"
                            name="address_details"
                            value={formData.address.address_details}
                             onChange={(e) => {
                                const value = e.target.value;

                                setFormData((prev) => ({
                                    ...prev,
                                    address: {
                                        ...prev.address,
                                        address_details: value
                                    }
                                }));

                                if (value.trim() !== "") {
                                    setErrors((prev) => ({ ...prev, address_details: false }));
                                } else {
                                    setErrors((prev) => ({ ...prev, address_details: true }));
                                }
                            }}
                            className={`w-full border rounded p-2 text-sm
                                ${
                                    errors.address_details ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : "border" }
                                `}
                                placeholder='ex: str. Libertății'
                        />
                       
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                        Email*
                        </label>
                            <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({ ...prev, email: value }));

                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                if (emailRegex.test(value)) {
                                    setErrors((prev) => ({ ...prev, email: false }));
                                } else {
                                    setErrors((prev) => ({ ...prev, email: true }));
                                }
                            }}

                            className={`w-full p-2 border rounded text-sm ${errors.email ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                            placeholder="ex: denumire@medprime.com"
                            />
                        
                        
                    </div>

                     {/* Telefon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                        Telefon*
                        </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prev) => ({ ...prev, phone: value }));

                                    const phoneRegex = /^(02|03|07)\d{8}$/;
                                    if (phoneRegex.test(value)) {
                                    setErrors((prev) => ({ ...prev, phone: false }));
                                    } 
                                    else
                                        setErrors((prev) => ({ ...prev, phone: true }));
                                }}
                                className={`w-full p-2 border rounded text-sm ${errors.phone ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                                placeholder='ex: 02xxxxxxxx'
                                />

                       
                       
                    </div>

                    {/* Afisare status locatie) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Locație
                        </label>
                        <div
                            className={`w-full p-2 border rounded text-sm font-medium flex items-center gap-2 ${
                            formData.isLocationActive ? "border-green-500 text-green-700 bg-green-50" : "border-red-500 shadow-[0_0_0_0.2px_#f87171] text-red-700 bg-red-50"
                            }`}
                        >
                            {formData.isLocationActive ? (
                            <>
                               <FontAwesomeIcon icon={faCheckCircle} />
                                <span>Locație: Activă</span>
                            </>
                            ) : (
                            <>
                                <FontAwesomeIcon icon={faTimesCircle} />
                                <span>Locație: Inactivă</span>
                            </>
                            )}
                        </div>
                    </div>

                
                </div>

                {/* Col 3 */}
                <div className="space-y-5">
                     

                     {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Status*
                        </label>
                       <CustomSelect
                            options={selectOptions.statusLocations}
                            value={formData.status}
                            onChange={(value) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    status: value,
                                    isLocationActive: value === "deschis" ? true : false,
                                    closedReason: value === "deschis" ? prev.closedReason : "",
                                    reopenDate:
                                        value === "deschis"
                                            ? prev.reopenDate
                                            : value === "inchis definitiv"
                                            ? prev.reopenDate
                                            : "",
                                }));

                                if (!value || value.trim() === "") {
                                    setErrors((prev) => ({ ...prev, status: true }));
                                } else {
                                    setErrors((prev) => ({ ...prev, status: false }));
                                }
                            }}
                            hasError={errors.status}
                            placeholder="Selectează statusul"
                        />


                    </div>  

                    {/* Closed Reason + Reopen Date */}
                    {formData.status === "inchis temporar" && (
                    <div className="mt-4 space-y-3">
                        {/* Closed Reason */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motiv închidere temporară
                        </label>
                        <input
                            type="text"
                            value={formData.closedReason}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({ ...prev, closedReason: value }));
                                if (value.trim() !== "") setErrors((prev) => ({ ...prev, closedReason: false }));
                            }}
                            className={`w-full p-2 border rounded text-sm ${errors.closedReason ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                        />
                        </div>

                        {/* Reopen Date */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dată redeschidere
                        </label>
                        <input
                            type="date"
                            value={formData.reopenDate ? formData.reopenDate.split('T')[0] : ""}
                            onChange={(e) => {
                                const selectedDate = e.target.value;
                                const today = new Date();
                                const selected = new Date(selectedDate);

                                if (selected <= today) {
                                    toast.error("Data de redeschidere trebuie să fie în viitor!");
                                    setErrors((prev) => ({ ...prev, reopenDate: true }));
                                } else {
                                    //toast.success("Data este validă!");
                                    setErrors((prev) => ({ ...prev, reopenDate: false }));
                                }

                                setFormData((prev) => ({
                                    ...prev,
                                    reopenDate: selectedDate
                                }));
                            }}
                            className={`w-full p-2 border rounded text-sm ${errors.reopenDate ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                        />
                        </div>
                    </div>
                    )}

                    {formData.status === "inchis definitiv" && (
                    <div className="mt-4 space-y-3">
                        {/* Closed Reason */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motiv închidere definitiv
                        </label>
                        <input
                            type="text"
                            value={formData.closedReason}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({ ...prev, closedReason: value }));
                                if (value.trim() !== "") setErrors((prev) => ({ ...prev, closedReason: false }));
                                else
                                setErrors((prev) => ({ ...prev, closedReason: true }));
                            }}
                            className={`w-full p-2 border rounded text-sm ${errors.closedReason ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                        />
                        </div>

                    </div>
                    )}

                    {/* Program */}
                    {formData.status === "deschis" && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Program*
                        </label>

                        {/* Zi */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Zi*
                            </label>
                            <CustomSelect
                                options={selectOptions.days}
                                value={selectedDay}
                                onChange={(selectedOption) => {
                                    setSelectedDay(selectedOption);

                                    setErrors((prev) => ({
                                        ...prev,
                                        day: selectedOption || formData.schedule.length > 0 ? false : true, // ✅
                                    }));
                                }}
                                placeholder="Selectează ziua"
                                hasError={errors.day}
                            />
                        </div>

                        {/* Ore */}
                        <div className="flex flex-wrap md:flex-nowrap items-end gap-4 mt-2">
                            {/* Ora de inceput */}
                            <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ora de început*
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => {
                                    setStartTime(e.target.value);
                                    setErrors((prev) => ({ ...prev, startTime: false }));
                                }}
                                className={`border p-2 rounded w-full ${errors.startTime ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                            />
                            </div>

                            {/* Ora de final */}
                            <div className="flex flex-col flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ora de final*
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => {
                                    setEndTime(e.target.value);
                                    setErrors((prev) => ({ ...prev, endTime: false }));
                                }}
                                className={`border p-2 rounded w-full ${errors.endTime ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                            />
                            </div>

                            
                        </div>

                        {/* Buton Adauga */}
                        <div className="flex flex-col items-end justify-end mt-2">
                            <button
                                onClick={handleAdaugaProgram}
                                className="btn-outline-purple-little-little"
                            >
                                <FontAwesomeIcon icon={faAdd} /> Adaugă
                            </button>
                        </div>

                        {/* Lista Program */}
                        {formData.schedule.length > 0 && (
                            <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">Program adăugat:</h4>
                            {formData.schedule.map((prog, index) => (
                                <div
                                key={index}
                                className="bg-gray-100 text-gray-800 font-medium text-sm px-3 py-1 rounded-lg flex justify-between items-center"
                                >
                                <span>
                                    {prog.day && prog.day.charAt(0).toUpperCase() + prog.day.slice(1)}: {prog.startTime} - {prog.endTime}
                                </span>
                                <button
                                    onClick={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        schedule: prev.schedule.filter((_, i) => i !== index),
                                    }))
                                    }
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    x
                                </button>
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    )}

                    {/* Galerie Imagini */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adaugă imagini locație
                    </label>

                    {/* input invizibil */}
                    <input
                        type="file"
                        id="galleryUpload"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryChange}
                        className="hidden"
                    />

                    {/* buton personalizat */}
                    <button
                        type="button"
                        disabled={formData.images.galleryFiles.length + formData.images.galleryUrls.length >= 15}
                        onClick={() => document.getElementById('galleryUpload').click()}
                        className={`btn-outline-purple-little-little ${
                        formData.images.galleryFiles.length + formData.images.galleryUrls.length >= 15
                            ? "btn-outline-red-little-little  cursor-not-allowed"
                            : ""
                        }`}
                    >
                        + Adaugă fotografii
                    </button>

                    {/* preview + drag */}
                    {(galleryPreviews.length > 0 || formData.images.galleryUrls.length > 0) && (
                        <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="gallery" direction="horizontal">
                            {(provided) => (
                            <div
                                className="flex flex-wrap gap-4 mt-4"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {/* Previews din galerie nouă */}
                                {galleryPreviews.map((src, index) => (
                                <Draggable key={`new-${index}`} draggableId={`new-${index}`} index={index}>
                                    {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="relative w-24 h-24 border rounded overflow-hidden"
                                    >
                                        <img src={src} alt={`preview-${index}`} className="w-full h-full object-cover" />
                                        <button
                                        onClick={() => handleRemoveGalleryFile(index)}
                                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                        >
                                        ×
                                        </button>
                                    </div>
                                    )}
                                </Draggable>
                                ))}

                                {/* Previews din galleryUrls (imagini deja existente) */}
                                {formData.images.galleryUrls.map((url, index) => (
                                <Draggable key={`existing-${index}`} draggableId={`existing-${index}`} index={index + galleryPreviews.length}>
                                    {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="relative w-24 h-24 border rounded overflow-hidden"
                                    >
                                        <img src={url} alt={`existing-${index}`} className="w-full h-full object-cover" />
                                        <button
                                        onClick={() => handleRemoveGalleryUrl(index)}
                                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                        >
                                        ×
                                        </button>
                                    </div>
                                    )}
                                </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                            )}
                        </Droppable>
                        </DragDropContext>
                    )}
                    </div>
                </div>
            </div>

            {/* Butoane */}
            <div className="flex justify-center gap-3 mt-5 border-t pt-4">
                <button
                    onClick={onClose}
                    className="btn-outline-red-little-little"
                >
                    <FontAwesomeIcon icon={faTimesCircle} />
                    Anulează
                </button>

                <button
                    onClick={handleSave}  
                    className="btn-outline-green-little-little"
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Continuă
                </button>
                </div>

            </div>

        {loading && <Loader message={loadingMessage} />}
    </div>
  )
}

export default AddLocation