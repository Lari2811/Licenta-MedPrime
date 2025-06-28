import React, { useContext, useEffect } from 'react'
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  addItem, removeItem, addFaq, removeFaq } from '../../../utils/formUtils';
import axios from 'axios';

import CustomSelect from '../../../components/customSelect';
import { selectOptions } from '../../../utils/selectOptions';

import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import Loader from '../../../components/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { assets } from '../../../assets/assets';

const AddInvestigation = ({ onClose, onCloseSave }) => {

    const { backendUrl } = useContext(AppContext)

    const { adminID } = useParams()

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    
    const [errors, setErrors] = useState({});

    //-------------------------------------------------
    const [formData, setFormData] = useState({

        investigationID: "",       
        name: "",               
        shortDescription: [],   
        numberOfSlots: "",

        requiresDoctor: true,          

        consultationSteps: [],   
        preparationTips: [], 

        faq: [ ],

        profileImage: null, 
        profileImageUrl: null
        
    });


    const [consultaionInput, setConsultationInput] = useState('');
    const [preparationInput, setPreparationInput] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');

   
    //-------------------------------------------------------------------
    // State-uri pentru inputuri FAQ
    const [faqQuestion, setFaqQuestion] = useState('');
    const [faqAnswer, setFaqAnswer] = useState('');

    const handleAddFaq = () => {
        if (!faqQuestion.trim() || !faqAnswer.trim()) {
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

    // Obiecte - lista =========================
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

    //---------------------------------------------------------------------

    const finalCheck = () => {
        const newErrors = {};
        const invalidFields = [];

        // === Validare câmpuri text ===
        if (!formData.name.trim()) {
            newErrors.name = true;
            invalidFields.push("Denumire investigație");
        }

        if (formData.shortDescription.length === 0) {
            newErrors.shortDescription = true;
            invalidFields.push("Descriere (minim 1 element)");
        }


        if (!formData.numberOfSlots || isNaN(formData.numberOfSlots) || Number(formData.numberOfSlots) <= 0) {
            newErrors.numberOfSlots = true;
            invalidFields.push("Număr sloturi (trebuie să fie un număr pozitiv)");
        }

        if (formData.requiresDoctor === "" || formData.requiresDoctor === null || formData.requiresDoctor === undefined) {
            newErrors.requiresDoctor = true;
            invalidFields.push("Necesită medic (selectează o opțiune)");
        }

       
        if (invalidFields.length > 0) {
            setErrors(newErrors);

            toast.error("Există câmpuri necompletate sau incorecte!");

            toast.error(invalidFields.join("\n"), {
            autoClose: 5000,
            closeOnClick: true,
            draggable: true,
            pauseOnHover: true,
            style: { whiteSpace: 'pre-line' },
            });

            return false;
        }

        setErrors({});
        return true;
        };


    const handleSave = async () => 
    {
        const isValid = finalCheck();
        if (!isValid) return;

        try {

            setLoading(true)
            setLoadingMessage("Se salvează investigația...");

            // Creează FormData
            const form = new FormData();
            form.append('adminID', adminID);  
            form.append('formData', JSON.stringify(formData)); 

            // Imaginea 
            if (formData.profileImage) {
            form.append('profileImage', formData.profileImage);
            }

            // Trimite request-ul
            const response = await axios.post(
            `${backendUrl}/api/admin/add-investigation`,
            form
            );

            toast.success(response.data.message || 'Investigația adăugată cu succes!');
            //toast.info("Acum trebuie să asociezi specialitățile.")
           // Trimite datele la onClose
            onCloseSave({
                investigationID: response.data.investigationID,
                investigationName: formData.name
            });

        } catch (error) {
            console.error('Eroare la trimiterea datelor:', error);
            toast.error(error.response?.data?.message || 'Eroare la adăugare.');
        }
        finally {
            setLoading(false);
            setLoadingMessage("");
        }
    
    }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl w-[90%]  max-w-6xl max-h-[90%] overflow-y-auto">
            <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
            <p className="text-2xl font-semibold text-gray-800 text-center">Adaugă Investigație</p>
            <p className="text-xl font-semibold text-gray-700 text-center mb-3">~ Informații generale ~</p>
            <p className='border-b-1 mb-5'></p>

            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Col 1 */}
                <div className='space-y-5'>
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
                            <img src={assets.investigation_default} alt="default" className="w-full h-full object-cover" />
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
                    Denumire investigației*
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
                            placeholder='ex: Ecografie'
                        />

                    
                    </div>

                    {/* Scurta descriere */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                        Scurtă descriere* (adaugi mai multe părți)
                    </label>
                    <div className="flex gap-2 w-full">
                        <textarea
                        rows={1}
                        type="text"
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        className={`border p-2 rounded text-sm flex-1 ${errors.shortDescription ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                        placeholder="ex: Descriere scurtă"
                        />
                        <button
                        type="button"
                        onClick={() => handleAddItem(descriptionInput, setDescriptionInput, 'shortDescription')}
                        className="btn-outline-purple-little-little"
                        >
                        + Adaugă
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.shortDescription.map((desc, index) => (
                        <div key={index} className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                            {desc}
                            <button
                            onClick={() => handleRemoveItem(index, 'shortDescription')}
                            className="text-gray-800 text-sm font-medium hover:text-red-600"
                            >
                            x
                            </button>
                        </div>
                        ))}
                    </div>
                    </div>

                     {/* Numar sloturi */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                   Număr sloturi* (un slot = 15 min)
                    </label>
                        <input
                            type="text"
                            value={formData.numberOfSlots}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData((prev) => ({ ...prev, numberOfSlots: value }));

                                if (value.trim() !== "") {
                                setErrors((prev) => ({ ...prev, numberOfSlots: false }));
                                } 
                                else
                                    setErrors((prev) => ({ ...prev, numberOfSlots: true }));
                            }}
                            className={`w-full p-2 border rounded text-sm ${errors.numberOfSlots ? "border-red-500 shadow-[0_0_0_0.2px_#f87171] " : ""}`}
                            placeholder='ex: 2'
                        />

                    
                    </div>

                    {/* Necesitate medic */}
                     <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                                Necesită medic?
                            </label>
                          
                
                        <CustomSelect
                            options={selectOptions.requiresDoctorOptions}
                            value={formData.requiresDoctor}
                            onChange={(value) => setFormData(prev => ({ ...prev, requiresDoctor: value }))}
                            placeholder="Alege dacă necesită doctor"
                            hasError={errors.requiresDoctor}
                        />
                    </div>

                </div>

                {/* Col 2 */}
                <div className='space-y-5'>

                    {/* Pasi consultatie */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Pașii consultației
                        </label>
                        <div className="flex gap-2 w-full">
                            <textarea
                                rows={1}
                                type="text"
                                value={consultaionInput}
                                onChange={(e) => setConsultationInput(e.target.value)}
                                className={`border p-2 rounded text-sm flex-1 ${errors.consultationSteps ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                                placeholder="ex: 1. Verificare documente medicale"
                            />
                            
                            <button
                            type="button"
                            onClick={() => handleAddItem(consultaionInput, setConsultationInput, 'consultationSteps')}
                            className="btn-outline-purple-little-little"
                            >
                            + Adaugă
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.consultationSteps.map((reason, index) => (
                            <div key={index} className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                                {reason}
                                <button
                                onClick={() => handleRemoveItem(index, 'consultationSteps')}
                                className="text-gray-800 font-medium text-sm hover:text-red-600"
                                >
                                x
                                </button>
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips pentru pregatire */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Tips pentru pregătire
                        </label>
                        <div className="flex gap-2">
                            <textarea
                                rows={1}
                                type="text"
                                value={preparationInput}
                                onChange={(e) => setPreparationInput(e.target.value)}
                                className={`border p-2 rounded text-sm flex-1 ${errors.preparationTips ? 'border-red-500 shadow-[0_0_0_0.2px_#f87171]' : ''}`}
                                placeholder="ex: Nu consumați alimente cu 8 ore înainte"
                            />
                            <button
                            type="button"
                            onClick={() => handleAddItem(preparationInput, setPreparationInput, 'preparationTips')}
                            className="btn-outline-purple-little-little"
                            >
                            + Adaugă
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.preparationTips.map((reason, index) => (
                            <div key={index} className="bg-gray-100 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                                {reason}
                                <button
                                onClick={() => handleRemoveItem(index, 'preparationTips')}
                                className="text-gray-800 font-medium text-sm hover:text-red-600"
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
                            <div className="flex justify-end">
                             <button
                                type="button"
                                onClick={handleAddFaq}
                                className="btn-outline-purple-little-little"
                            >
                                + Adaugă
                            </button>
                            </div>

                            {/* Afisare intrebari + raspunsuri */}
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


export default AddInvestigation