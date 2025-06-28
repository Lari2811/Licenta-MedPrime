import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../../context/AppContex";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEye, faEyeSlash, faL, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useParams } from "react-router-dom";
import { assets } from "../../../assets/assets";
import { selectOptions } from "../../../utils/selectOptions";
import CustomSelect from "../../../components/customSelect";
import Loader from "../../../components/Loader";



const AddDoctos = ({onCloseSave, onClose}) => {

    const { backendUrl } = useContext(AppContext)

    const { adminID } = useParams()
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    //form
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone:"",
        type: ""
    })

    const [errors, setErrors] = useState({});

    const finalCheck = () => {
        const newErrors = {};
        const invalidFields = [];

        if (!formData.firstName.trim()) {
            newErrors.firstName = true;
            invalidFields.push("Prenume medic");
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = true;
            invalidFields.push("Nume medic");
        }

        
        if (!formData.phone.trim() || !/^(02|03|07)\d{8}$/.test(formData.phone)) {
            newErrors.phone = true;
            invalidFields.push("Telefon (format valid)");
        }
            
        

        if (!formData.type) {
            newErrors.type = true;
            invalidFields.push("Tip medic");
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
    }


    const handleSave = async () => {
        const isValid = finalCheck();
        if (!isValid) return;

        try {
            setLoading(true)
            setLoadingMessage("Se salvează medicul...");

            const response = await axios.post(
                `${backendUrl}/api/admin/add-doctor`,
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    type: formData.type,
                    adminID
                }
                );

            toast.success("Medicul a fost creat cu succes!");
            toast.info("Acum trebuie aleasă specialitatea, locația și programul!")
            onCloseSave({
                doctorID: response.data.doctorID,
                lastName: response.data.lastName,
                firstName: response.data.firstName,
            })
            
        } catch (error) {
            
        } finally {
            setLoading(false)
        }
    }
   
  return (
   <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl w-[90%]  max-w-6xl max-h-[90%] overflow-y-auto">
            <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
            <h3 className="text-2xl font-semibold text-gray-800 text-center mb-3">Adaugă Medic</h3>
            <p className='border-b-1 mb-5'></p>

            {/* Info */}

                {/* Imagine */}
                <div className="flex justify-center mb-6">
                    <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border">
                        <img src={assets.doctor_default} alt="default" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-10">

                    {/* Col 1 */}
                    <div className="space-y-5">
                        {/* Nume */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Nume*
                            </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData((prev) => ({ ...prev, lastName: value }));

                                        if (value.trim() !== "") {
                                        setErrors((prev) => ({ ...prev, lastName: false }));
                                        } 
                                        else
                                            setErrors((prev) => ({ ...prev, lastName: true }));
                                    }}
                                    className={`w-full p-2 border rounded text-sm ${errors.lastName ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                                    
                                />

                            
                        </div>

                        {/* Prenume */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Prenume*
                            </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData((prev) => ({ ...prev, firstName: value }));

                                        if (value.trim() !== "") {
                                        setErrors((prev) => ({ ...prev, firstName: false }));
                                        } 
                                        else
                                            setErrors((prev) => ({ ...prev, firstName: true }));
                                    }}
                                    className={`w-full p-2 border rounded text-sm ${errors.lastName ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""}`}
                                    
                                />

                            
                        </div>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-5">
                        {/* Telefon */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Telefon serviciu*
                            </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData((prev) => ({ ...prev, phone: value }));

                                        const phoneRegex = /^(02|03|07)\d{8}$/;
                                        if (phoneRegex.test(value)) {
                                        setErrors((prev) => ({ ...prev, phone: false }));
                                        } else {
                                        setErrors((prev) => ({ ...prev, phone: true }));
                                        }
                                    }}
                                    className={`w-full p-2 border rounded text-sm ${
                                        errors.phone ? "border-red-500 shadow-[0_0_0_0.2px_#f87171]" : ""
                                    }`}
                                    />


                            
                        </div>

                        {/* Tip medic */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-0 ml-1">
                            Tip medic*
                            </label>

                            <CustomSelect
                                options={selectOptions.doctorType}
                                value={formData.type}
                                onChange={(value) => {
                                    setFormData((prev) => ({
                                    ...prev,
                                    type: value
                                    }));

                                    if (value) {
                                    setErrors((prev) => ({ ...prev, type: false }));
                                    } else {
                                    setErrors((prev) => ({ ...prev, type: true }));
                                    }
                                }}
                                hasError={errors.type}
                                placeholder="Selectează tipul"
                                />

                        </div>
                    </div>


                </div>
                

            {/* Butoane */}
            <div className="flex justify-center gap-3 mt-5 border-t pt-4">
                <button
                    onClick={onClose}
                    className="btn-outline-red-little-little"
                >
                    <FontAwesomeIcon icon={faTimesCircle    } />
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
  );
};

export default AddDoctos