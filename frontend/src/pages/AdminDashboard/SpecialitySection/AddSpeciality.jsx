import React, { useContext, useEffect } from 'react'
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  addItem, removeItem, addFaq, removeFaq } from '../../../utils/formUtils';
import axios from 'axios';

import CustomSelect from '../../../components/customSelect';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { assets } from '../../../assets/assets';
import { getStatusLabel } from '../../../utils/getStatusLabel';

const AddSpeciality = ({ onClose, onCloseSave }) => {


    const { backendUrl } = useContext(AppContext)

    const { adminID } = useParams()

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [formData, setFormData] = useState({
        specialityID: "",       
        name: "",               
        shortDescription: "",   

        otherInfo: [],          
        reasonsToConsult: [],   
        consultationBenefits: [], 

        faq: [ ],

        profileImage: null,
        profileImageUrl: null
    
    });

   
    const [otherInfoInput, setOtherInfoInput] = useState('');
    const [reasonsInput, setReasonsInput] = useState('');
    const [benefitsInput, setBenefitsInput] = useState('');

    //===============================================
    // State-uri pentru inputuri FAQ
    const [faqQuestion, setFaqQuestion] = useState('');
    const [faqAnswer, setFaqAnswer] = useState('');

    const handleAddFaq = () => {
        if (!faqQuestion.trim() || !faqAnswer.trim()) {
            // Marchează eroarea dacă lipsește întrebarea sau răspunsul
            setErrors((prev) => ({ ...prev, faq: true }));
            return;
        }

        const newList = [...formData.faq, { question: faqQuestion, answer: faqAnswer }];

        setFormData((prev) => ({
            ...prev,
            faq: newList
        }));

        setFaqQuestion('');
        setFaqAnswer('');

        setErrors((prev) => ({ ...prev, faq: false }));
    };

    const handleRemoveFaq = (index) => {
        const newList = formData.faq.filter((_, i) => i !== index);

        setFormData((prev) => ({
            ...prev,
            faq: newList
        }));

        if (newList.length === 0) {
            setErrors((prev) => ({ ...prev, faq: true }));
        } else {
            setErrors((prev) => ({ ...prev, faq: false }));
        }

    };

    const handleAddItem = (inputValue, setInputValue, fieldKey) => {
        if (!inputValue.trim()) {
            setErrors((prev) => ({ ...prev, [fieldKey]: true }));
            return;
        }

        const newList = [...formData[fieldKey], inputValue];

        setFormData((prev) => ({
            ...prev,
            [fieldKey]: newList,
        }));

        setInputValue('');

        setErrors((prev) => ({ ...prev, [fieldKey]: false }));
    };

    const handleRemoveItem = (index, fieldKey) => {
        const newList = formData[fieldKey].filter((_, i) => i !== index);

        setFormData((prev) => ({
            ...prev,
            [fieldKey]: newList,
        }));

        if (newList.length === 0) {
            setErrors((prev) => ({ ...prev, [fieldKey]: true }));
            } else {
                setErrors((prev) => ({ ...prev, [fieldKey]: false })); 
            }
    };

    //=============================================================

    const [errors, setErrors] = useState({});

    //============================================================

    const finalCheck = () => {
        const newErrors = {};
        const invalidFields = [];

        if (!formData.name.trim()) {
            newErrors.name = true;
            invalidFields.push("Denumire specialitate");
        }

        if (!formData.shortDescription.trim()) {
            newErrors.shortDescription = true;
            invalidFields.push("Scurtă descriere");
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

        setErrors({});
        return true;
    };

    const handleSave = async () => {

        const isValid = finalCheck();
        if (!isValid) return;

          try {

            setLoading(true)
            setLoadingMessage("Se salvează specialitatea...");

            const form = new FormData();
            form.append('adminID', adminID);  
            form.append('formData', JSON.stringify(formData)); 

            // Imaginea (dacă există)
            if (formData.profileImage) {
            form.append('profileImage', formData.profileImage);
            }

            // Trimite request-ul
            const response = await axios.post(
            `${backendUrl}/api/admin/add-speciality`,
            form
            );

            toast.success(response.data.message || 'Specialitate adăugată cu succes!');
            
            // Trimite datele la onClose
            onCloseSave({
                specialityID: response.data.specialityID,
                specialityName: formData.name
            });

        } catch (error) {
            console.error('Eroare la trimiterea datelor:', error);
            toast.error(error.response?.data?.message || 'Eroare la adăugare.');
        }
        finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };

 
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%]  max-w-6xl max-h-[90%] overflow-y-auto">
                <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
                <p className="text-2xl font-semibold text-gray-800 text-center ">Adaugă Specialitate</p>
                <p className="text-xl font-semibold text-gray-700 text-center mb-3">~ Informații generale ~</p>
                <p className='border-b-1 mb-5'></p>

                {/* Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

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
                            {formData.profileImage ? (
                                <img src={URL.createObjectURL(formData.profileImage)} alt="preview" className="w-full h-full object-cover" />
                                ) : formData.profileImageUrl ? (
                                <img src={formData.profileImageUrl} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                <img src={assets.speciality_default} alt="default" className="w-full h-full object-cover" />
                                )}
    
                            </div>
                            
                            <div>
                                <input
                                type="file"
                                accept="image/*"
                                id="profileImageInput"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                    setFormData((prev) => ({
                                        ...prev, 
                                        profileImage: file
                                        }
                                    ));
                                    }
                                }}
                                />
                                <button
                                type="button"
                                onClick={() => document.getElementById('profileImageInput').click()}
                                className="btn-outline-purple-little-little"
                                >
                                + Adaugă imagine
                                </button>
                            </div>
                            </div>
                        </div>

                        {/* Denumire */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                        Denumire specialitate*
                        </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData((prev) => ({ ...prev, name: value }));

                                    if (value.trim() !== "") {
                                    setErrors((prev) => ({ ...prev, name: false }));
                                    } 
                                    else
                                        setErrors((prev) => ({ ...prev, name: true }));
                                }}
                                className={`w-full p-2 border rounded text-sm ${errors.name ? "border-red-500 shadow-[0_0_0_0.2px_#f87171] " : ""}`}
                                placeholder='ex: Cardiologie'
                            />

                        
                        </div>

                        {/* Scurta descriere */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Descriere*
                        </label>
                        <textarea
                            value={formData.shortDescription}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({ ...prev, shortDescription: e.target.value }));
                                    if (value.trim() !== "") {
                                    setErrors((prev) => ({ ...prev, shortDescription: false }));
                                    }
                                    else
                                        setErrors((prev) => ({ ...prev, shortDescription: true }));
                                    
                                }}
                            placeholder="ex: consultații doar pe bază de programare..."
                            rows={2}
                            className={`w-full border p-2 rounded text-sm ${errors.shortDescription ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                        ></textarea>
                        
                        </div>

                        {/* Alte info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                                Alte informații
                            </label>
                            <div className="flex gap-2">
                                <textarea
                                rows={1}
                                type="text"
                                value={otherInfoInput}
                                onChange={(e) => setOtherInfoInput(e.target.value)}
                                className="border p-2 rounded text-sm flex-1"
                                placeholder="ex: acces persoane cu dizabilități"
                                />
                                <button
                                type="button"
                                onClick={() => handleAddItem(otherInfoInput, setOtherInfoInput, 'otherInfo')}
                                className="btn-outline-purple-little-little"
                                >
                                + Adaugă
                                </button>
                            </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.otherInfo.map((info, index) => (
                            <div key={index} className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                                {info}
                                <button
                                onClick={() => handleRemoveItem(index, 'otherInfo')}                       
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

                        {/* Motive pentru consult */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Când să consulți un specialist

                        </label>
                        <div className="flex gap-2">
                           <textarea
                                rows={1}
                                type="text"
                                value={reasonsInput}
                                onChange={(e) => setReasonsInput(e.target.value)}
                                className={`border p-2 rounded text-sm flex-1 ${errors.reasonsToConsult ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                                placeholder="ex: dureri persistente"
                            />
                            <button
                            type="button"
                            onClick={() => handleAddItem(reasonsInput, setReasonsInput, 'reasonsToConsult')}
                            className="btn-outline-purple-little-little"
                            >
                            + Adaugă
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.reasonsToConsult.map((reason, index) => (
                            <div key={index} className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                                {reason}
                                <button
                                onClick={() => handleRemoveItem(index, 'reasonsToConsult')}
                                className="text-gray-800 font-medium text-sm hover:text-red-600 ml-2"
                                >
                                x
                                </button>
                            </div>
                            ))}
                        </div>
                        </div>

                        {/* Beneficii */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Beneficiile consultație
                        </label>
                        <div className="flex gap-2">
                            <textarea
                                rows={1}
                                type="text"
                                value={benefitsInput}
                                onChange={(e) => setBenefitsInput(e.target.value)}
                                className={`border p-2 rounded text-sm flex-1 ${errors.consultationBenefits ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                                placeholder="ex: diagnostic precis"
                            />
                            <button
                            type="button"
                            onClick={() => handleAddItem(benefitsInput, setBenefitsInput, 'consultationBenefits')}
                            className="btn-outline-purple-little-little"
                            >
                            + Adaugă
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.consultationBenefits.map((benefit, index) => (
                            <div key={index} className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                                {benefit}
                                <button
                                onClick={() => handleRemoveItem(index, 'consultationBenefits')}
                                className="text-gray-800 text-sm font-medium hover:text-red-600"
                                >
                                x
                                </button>
                            </div>
                            ))}
                        </div>
                        </div>

                        {/* Intrebari frecvente (FAQ) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                                Întrebări frecvente (FAQ)
                            </label>

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <textarea
                                    rows={1}
                                    type="text"
                                    placeholder="ex: Care este durata unei consultații?"
                                    value={faqQuestion}
                                    onChange={(e) => setFaqQuestion(e.target.value)}
                                    className={`border p-2 rounded text-sm flex-1 ${errors.faq ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                                />
                                <textarea
                                    rows={1}
                                    type="text"
                                    placeholder="Răspunsul..."
                                    value={faqAnswer}
                                    onChange={(e) => setFaqAnswer(e.target.value)}
                                    className={`border p-2 rounded text-sm flex-1 ${errors.faq ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                                />
                               
                                </div> 
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={handleAddFaq}
                                        className="btn-outline-purple-little-little"
                                    >
                                        + Adaugă
                                    </button>
                                </div>

                                {/* Afișare întrebări + răspunsuri */}
                                <div className="flex flex-col gap-2 mt-2">
                                    {formData.faq.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm"
                                            >
                                            <div>
                                                <p className="font-medium">{item.question}</p>
                                                <p className="text-xs text-gray-600">{item.answer}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFaq(index)}
                                                className="text-red-600 text-sm hover:text-red-800"
                                            >
                                                x
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                        Salvează 
                    </button>
                </div>
            </div>

        {loading && <Loader message={loadingMessage} />}
    </div>
  )
}

export default AddSpeciality