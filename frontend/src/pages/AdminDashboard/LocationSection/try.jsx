import React, { useContext, useEffect } from 'react'
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  addItem, removeItem, addFaq, removeFaq } from '../../../utils/formUtils';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';

const AddInvestigation = ({ onClose, refreshSpecialities, refreshInvestigations}) => {

    const { backendUrl } = useContext(AppContext)

    //form


    const [selectedSpecialityID, setSelectedSpecialityID] = useState('');
    const [addedSpecialities, setAddedSpecialities] = useState([]);
    const [specialityLocationLinks, setSpecialityLocationLinks] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]); // locațiile filtrate pe baza specialității

    

    const [errors, setErrors] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [locationsData, setLocationsData] = useState([]);
    const [specialitiesData, setSpecialitiesData] = useState([]);

    const [locationInputs, setLocationInputs] = useState({});

    const [availabilityEntries, setAvailabilityEntries] = useState([]);

    const handlePriceChange = (locationID, value) => {
        setLocationInputs(prev => ({
            ...prev,
            [locationID]: { ...prev[locationID], price: parseInt(value) }
        }));
    };

    const handleActiveChange = (locationID, isActive) => {
        setLocationInputs(prev => ({
            ...prev,
            [locationID]: { ...prev[locationID], isActive }
        }));
    };

    const addAvailabilityEntry = (locationID) => {
        const input = locationInputs[locationID];
        const price = input?.price;

        if (price === undefined || isNaN(price)) {
            toast.error("Introduceți un preț valid");
            return;
        }

        if (price < 0) {
            toast.error("Prețul nu poate fi negativ");
            return;
        }

        if (price == 0) {
            toast.error("Prețul nu poate fi 0");
            return;
        }

        const newEntry = {
            specialityID: selectedSpecialityID,
            locationID,
            price: parseFloat(price),
            isActive: input?.isActive || false,
        };

        const exists = availabilityEntries.find(
            (e) => e.specialityID === newEntry.specialityID && e.locationID === newEntry.locationID
        );
        if (exists) {
            toast.warn("Această locație este deja adăugată");
            return;
        }

        
        setAvailabilityEntries((prev) => [...prev, newEntry]);
        setErrors(prev => ({ ...prev, specLocation: '' }));
        
        toast.success("Locația a fost adăugată cu succes!");
    };


    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    //get datas from MongoDB
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-locations`);
        if (res.data.success) {
          setLocationsData(res.data.locations);
          console.log("Locatii:", res.data.locations)
        } else {
          toast.error(res.data.message || "Eroare la încărcarea locațiilor");
        }
      } catch (err) {
        toast.error("Eroare server la locații");
      }
    };

    const fetchSpecialities = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-specialities`);
        if (res.data.success) {
          setSpecialitiesData(res.data.data);
          console.log("Specialitati:", res.data.data)
        } else {
          toast.error(res.data.message || "Eroare la încărcarea specialităților");
        }
      } catch (err) {
        toast.error("Eroare server la specialități");
      }
    };

    const fetchSpecialityLocationLinks = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/admin/get-speciality-locations`);
            if (res.data.success) {
            console.log("Legaturi:", res.data.data)
            setSpecialityLocationLinks(res.data.data);
            }
        } catch (error) {
            toast.error("Eroare la legătura specialitate-locație");
        }
    };

    useEffect(() => {
      fetchSpecialities();
      fetchLocations();
      fetchSpecialityLocationLinks();
    }, []);

    const handleAddSpeciality = () => {
        if (!selectedSpecialityID) return;

        const existing = addedSpecialities.find(spec => spec.specialityID === selectedSpecialityID);
        if (existing) return;

        const selectedSpec = specialitiesData.find(s => s.specialityID === selectedSpecialityID);
        if (selectedSpec) {
        setAddedSpecialities([...addedSpecialities, selectedSpec]);
        setSelectedSpecialityID('');
        }

        if (errors.specialities) {
        setErrors(prev => ({ ...prev, specialities: '' }));
        }
    };

    const handleSpecialitySelect = (specialityID) => {
    setSelectedSpecialityID(specialityID);

    // 1. Găsim toate locationID active pt specialitatea selectată
    const linkedLocationsIDs = specialityLocationLinks
        .filter(link => link.specialityID === specialityID && link.isActive)
        .map(link => link.locationID);

    // 2. Excludem locațiile deja adăugate pentru această specialitate
    const alreadyAddedLocs = availabilityEntries
        .filter(entry => entry.specialityID === specialityID)
        .map(entry => entry.locationID);

    // 3. Filtrăm doar cele care sunt active și încă neadăugate
    const filtered = locationsData.filter(
        loc => linkedLocationsIDs.includes(loc.locationID) && !alreadyAddedLocs.includes(loc.locationID)
    );

    
    setFilteredLocations(filtered);
};


    const validate = () => {
        const newErrors = {};

        if (!name.trim()) newErrors.name = 'Denumirea este obligatorie';

        if (!durationSlots.trim() || isNaN(durationSlots) || parseInt(durationSlots) <= 0) {
            newErrors.duration = 'Introduceți un număr valid de sloturi';
        }

        if (requiredDoctor === '') {
            newErrors.requiredDoctor = 'Selectează dacă este necesar medic';
        }

        if (availabilityEntries.length == 0) {
            newErrors.specLocation = 'Adaugă cel puțin o locație cu preț pentru această investigație';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsSubmitting(true);


        try {
            //  PASUL 1: Trimitem investigația (fără availability)
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("durationSlots", durationSlots);
            formData.append("requiredDoctor", requiredDoctor);
            formData.append("consultationSteps", JSON.stringify(consultationSteps));
            formData.append("preparationTips", JSON.stringify(preparationTips));
            formData.append("faqList", JSON.stringify(faqList));
            if (image) formData.append("image", image);

        
            const res = await fetch(`${backendUrl}/api/admin/add-investigation`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json(); 
            
            if (res.status === 409) {
                toast.error(data.message || 'Această investigație există deja.');
            } 

            if (!res.ok) {
                toast.error(data.message || 'Eroare la salvarea investigației.');
                return;
            }

            const investigationID = data.investigationID;
            if (!investigationID) {
                toast.error('Investigația a fost salvată, dar nu am primit ID-ul.');
                return;
            }

            // PASUL 2: Trimitem availabilityEntries legate de acel investigationID
            const availabilityPayload = availabilityEntries.map(entry => ({
                investigationID,
                specialityID: entry.specialityID,
                locationID: entry.locationID,
                price: entry.price,
                isActive: entry.isActive
            }));

            const res2 = await fetch(`${backendUrl}/api/admin/add-investigation-availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(availabilityPayload)
            });

            const data2 = await res2.json();

            if (!res2.ok) {
            toast.error(data2.message || 'Investigația a fost salvată, dar locațiile nu.');
            return;
            }

            localStorage.setItem("refreshInvestigation", "true");

            toast.success('Investigația și locațiile au fost salvate cu succes!');
            onClose();
            refreshInvestigations();
            refreshSpecialities();

            } catch (err) {
                console.error('Eroare rețea:', err);
                toast.error('Eroare de rețea.');
            } finally {
                setIsSubmitting(false);
            }
        };



    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%]  max-w-5xl max-h-[90%] overflow-y-auto">
                <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-3">Adaugă Investigație</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-10">
                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center">
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4 border"
                                    >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <i className="fas fa-user-md text-gray-400 text-3xl"></i>
                                    )}
                                </div>
    
                                <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="ImageInput"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('ImageInput').click()}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-sm cursor-pointer whitespace-nowrap !rounded-button"
                                >
                                    + Adaugă imagine
                                </button>
                                </div>
                            </div>
                        </div>
                    
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Denumire* </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
    
                                    // elimină eroarea imediat ce începe să scrie
                                    if (errors.name) {
                                    setErrors((prev) => ({ ...prev, name: '' }));
                                    }
                                }}
                                className={`w-full p-2 border rounded text-sm ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="ex. Electrocardiogramă (ECG)"
                            />
    
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Descriere </label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border rounded text-sm "
                                placeholder="ex. Specialitate care se ocupă cu..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Număr sloturi* (un slot = 15 min) </label>
                            <input
                                type="text"
                                value={durationSlots}
                                onChange={(e) => {
                                    setDurationSlots(e.target.value);
    
                                    // elimină eroarea imediat ce începe să scrie
                                    if (errors.duration) {
                                    setErrors((prev) => ({ ...prev, duration: '' }));
                                    }
                                }}
                                className={`w-full p-2 border rounded text-sm ${errors.duration ? 'border-red-500' : ''}`}
                                placeholder="ex. 3"
                            />
    
                            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                        </div>
    
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Pașii consultației </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={consultaionInput}
                                    onChange={(e) => setConsultationInput(e.target.value)}
                                    className="border p-2 rounded text-sm flex-1"
                                    placeholder = "ex. Verificare documente medicale"
                                />
                                <button
                                    type="button"
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-sm cursor-pointer"
                                    onClick={() => addItem(consultaionInput, setConsultationInput, consultationSteps, setConsultationSteps)}
                                >
                                + Adaugă
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {consultationSteps.map((step, index) => (
                                <div key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                                    {step}
                                    <button onClick={() => removeItem(index, consultationSteps, setConsultationSteps)} 
                                    className="text-green-600 hover:text-red-600">×</button>
                                </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">  Tips pentru pregătire </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={preparationInput}
                                    onChange={(e) => setPreparationInput(e.target.value)}
                                    className="border p-2 rounded text-sm flex-1"
                                    placeholder = "ex. Nu consumați alimente cu 8 ore înainte"
                                />
                                <button
                                    type="button"
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-sm cursor-pointer"
                                    onClick={() => addItem(preparationInput, setPreparationInput, preparationTips, setPreparationTips)}
                                >
                                + Adaugă
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {preparationTips.map((tips, index) => (
                                <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                                    {tips}
                                    <button onClick={() => removeItem(index, preparationTips, setPreparationTips)} 
                                    className="text-blue-600 hover:text-red-600">×</button>
                                </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Întrebări și răspunsuri </label>
                            <input
                                type="text"
                                value={questionInput}
                                onChange={(e) => setQuestionInput(e.target.value)}
                                className="border p-2 rounded w-full mb-1 text-sm"
                                placeholder="Întrebare"
                            />
                            <input
                                type="text"
                                value={answerInput}
                                onChange={(e) => setAnswerInput(e.target.value)}
                                className="border p-2 rounded w-full mb-1 text-sm"
                                placeholder="Răspuns"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={() => addFaq(questionInput, answerInput, faqList, setFaqList, setQuestionInput, setAnswerInput)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-sm cursor-pointer"
                                >
                                    + Adaugă
                                </button>
                            </div>
                            <div className="mt-1">
                                {faqList.map((faq, index) => (
                                <div key={index} className="border border-gray-400 p-2 rounded-xl mb-1">
                                    <p className="font-semibold">{faq.question}</p>
                                    <p className="text-sm">{faq.answer}</p>
                                    <button onClick={() => removeFaq(index, faqList, setFaqList)} className="text-red-500 text-xs">× Șterge</button>
                                </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Necesită medic?</label>
                           <select
                                value={
                                    requiredDoctor === true ? 'true' :
                                    requiredDoctor === false ? 'false' :
                                    ''
                                }
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (val === 'true') {
                                        setRequiredDoctor(true);
                                    } else if (val === 'false') {
                                        setRequiredDoctor(false);
                                    } else {
                                        setRequiredDoctor('');
                                    }

                                    if (val !== '') {
                                        setErrors(prev => ({ ...prev, requiredDoctor: '' }));
                                    }
                                }}
                                
                                className={`border p-2 rounded text-sm w-full ${errors.requiredDoctor ? 'border-red-500' : ''}`}
                                >
                                <option value=''>Selectează opțiunea</option>
                                <option value='true'>Da</option>
                                <option value='false'>Nu</option>
                                </select>

                            {errors.requiredDoctor && (
                            <p className="text-red-500 text-sm mt-1">{errors.requiredDoctor}</p>
                            )}

                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alege specialitate</label>
                            

                            <select
                                value={selectedSpecialityID}
                                onChange={(e) => handleSpecialitySelect(e.target.value)}
                                className="border p-2 rounded text-sm w-full"
                                >
                                <option value="">Selectează specialitate</option>
                                {specialitiesData.map(spec => (
                                    <option key={spec.specialityID} value={spec.specialityID}>
                                    {spec.specialityID} – {spec.name}
                                    </option>
                                ))}
                            </select>

                            {filteredLocations.length > 0 && (
                                <div className="mt-4 space-y-4">
                                    {filteredLocations.map(loc => (
                                    <div key={loc.locationID} className="border border-gray-400 rounded-lg bg-white p-2 shadow-xs">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-semibold text-gray-800">
                                            {loc.locationID} - {loc.clinicName}
                                            </h4>
                                            <button
                                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-md transition"
                                            onClick={() => addAvailabilityEntry(loc.locationID)}
                                            >
                                            + Adaugă
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                            {/* Preț */}
                                            <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Preț investigație</label>
                                            <div className="flex items-center">
                                                <input
                                                type="number"
                                                placeholder="ex: 250"
                                                onChange={(e) => handlePriceChange(loc.locationID, e.target.value)}
                                                className="border border-gray-300 p-1 rounded-l-md text-sm w-full max-w-[120px] "
                                                />
                                                <span className="bg-gray-100 text-gray-600 p-1 rounded-r-md text-sm border border-l-0 border-gray-300">
                                                RON
                                                </span>
                                            </div>
                                            </div>

                                            {/* Activ */}
                                            <div className="flex flex-col justify-center">
                                            <label className="text-xs font-medium text-gray-700 mb-1">Activ</label>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleActiveChange(loc.locationID, e.target.checked)}
                                                className="h-4 w-4 ml-1 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                            />
                                            </div>
                                        </div>
                                    </div>

                                    ))}
                                </div>
                            )}

                            {availabilityEntries.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Locații adăugate pentru investigație:</h4>
                                    <ul className="space-y-2">
                                    {availabilityEntries.map((entry, index) => {
                                        const loc = locationsData.find(l => l.locationID === entry.locationID);
                                        const locName = loc ? loc.clinicName : entry.locationID;
                                        const county = loc ? loc.address.county : entry.locationID;
                                        const spec = specialitiesData.find(s => s.specialityID === entry.specialityID);
                                        const specName = spec ? spec.name : entry.specialityID;

                                        return (
                                        <li key={index} className="border p-2 rounded bg-white shadow flex justify-between items-center">
                                            <div>
                                            <p className="text-sm font-medium">
                                                <span className="text-purple-700 font-semibold">{specName}</span> - {locName} - {county}
                                            </p>
                                            <p className="text-sm text-gray-600">Preț: {entry.price} lei | Activ: {entry.isActive ? 'Da' : 'Nu'}</p>
                                            </div>
                                            <button
                                                className="text-red-600 text-sm hover:underline"
                                                onClick={() => {
                                                    const deletedSpecialityID = spec.specialityID;

                                                    // 1. Șterge specialitatea din listă
                                                    const updatedSpecialities = addedSpecialities.filter(s => s.specialityID !== deletedSpecialityID);
                                                    setAddedSpecialities(updatedSpecialities);

                                                    // 2. Șterge locațiile asociate acestei specialități
                                                    const updatedEntries = availabilityEntries.filter(entry => entry.specialityID !== deletedSpecialityID);
                                                    setAvailabilityEntries(updatedEntries);

                                                    // 3. Dacă specialitatea ștearsă era cea selectată, resetează și lista de locații filtrate
                                                    if (selectedSpecialityID === deletedSpecialityID) {
                                                    setSelectedSpecialityID('');
                                                    setFilteredLocations([]);
                                                    }
                                                }}
                                                >
                                                Șterge
                                                </button>

                                        </li>
                                        );
                                    })}
                                    </ul>
                                </div>
                            )}

                            {errors.specLocation && <p className="text-red-500 text-sm mt-1">{errors.specLocation}</p>}



                            
                            


                        </div>

                     

                    </div>
                </div>

                {/* Butoane */}
                <div className="flex justify-center gap-2 mt-5 border-t pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Anulează
                    </button>

                    <button
                        onClick={handleSave}  // ✅ Aici e legătura cu funcția de validare
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700"
                    >
                        Salvează
                    </button>
                </div>

                {isSubmitting && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                        <div className="bg-white p-5 rounded shadow-lg flex flex-col items-center gap-3">
                        <svg className="animate-spin h-6 w-6 text-purple-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-sm text-gray-700 font-medium">Se salvează investigația...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AddInvestigation