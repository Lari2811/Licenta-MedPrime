import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPenToSquare, faLock, faSearchLocation, faMapLocationDot, faBook, faBookMedical, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { selectOptions } from "../../../utils/selectOptions";
import CustomSelect from "../../../components/customSelect";
import { toast } from "react-toastify";

const MedicalInfo =  ({ patientData, onSave }) => {

    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        bloodGroup: "",
        rh: "",
        insurance: "", 
        allergies: [],
        familyDoctor: "",
        emergencyContact: {
            fullName: "",
            relation: "",
            phone: ""
            },
    });

    useEffect(() => {
        if (patientData) {
            setFormData({
                bloodGroup: patientData.bloodGroup || "",
                rh: patientData.rh || "",
                insurance: patientData.insurance || "",
                allergies: patientData.allergies || [],
                familyDoctor: patientData.familyDoctor || "",
                emergencyContact: {
                    fullName: patientData.emergencyContact?.fullName || "",
                    relation: patientData.emergencyContact?.relation || "",
                    phone: patientData.emergencyContact?.phone || ""
                }
            });
            setErrors({});
        }
    }, [patientData]);
  
    const [errors, setErrors] = useState({});

    const validateFields = () => {
    const newErrors = {};

    if (!formData.bloodGroup) newErrors.bloodGroup = "Selectează grupa sanguină!";
    if (!formData.rh) newErrors.rh = "Selectează RH!";
    if (!formData.insurance) newErrors.insurance = "Selectează asigurarea!";

    const phone = formData.emergencyContact.phone.trim();
    if (phone) {
        if (!/^(02|03|07)\d{8}$/.test(phone)) {
            newErrors.emergencyContactPhone = "Numărul trebuie să aibă 10 cifre și să înceapă cu 02, 03 sau 07!";
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSave = () => {
        if (validateFields()) {
        onSave(formData);
        setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            bloodGroup: patientData.bloodGroup || "",
            rh: patientData.rh || "",
            insurance: patientData.insurance || "",
            allergies: patientData.allergies || [],
            familyDoctor: patientData.familyDoctor || "",
            emergencyContact: {
                fullName: patientData.emergencyContact?.fullName || "",
                relation: patientData.emergencyContact?.relation || "",
                phone: patientData.emergencyContact?.phone || ""
            }
        });
        setErrors({});
        setIsEditing(false);
    };


// Alergii
const [newAllergy, setNewAllergy] = useState("");

const addItem = (item, setItem, list, setList) => {
    const trimmed = item.trim();
    if (trimmed && !list.includes(trimmed)) {
        setList([...list, trimmed]);
        setItem("");
    }
};

const removeItem = (index, list, setList) => {
    setList(list.filter((_, i) => i !== index));
};

return (
    <div className="mb-10 shadow-xl rounded-3xl bg-white/95 w-full border-l-7 border-r-7 border-b-10 border-purple-100">
        <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
            <h3 className="text-lg font-bold text-purple-800">
                <FontAwesomeIcon icon={faBookMedical } className="mr-2"/> Informații medicale
            </h3>
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-purple-600 hover:underline flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                    <span className="hidden md:inline text-base mt-1">Editează</span>
                </button>
            )}

             {isEditing && (
                <div className="col-span-full flex justify-end gap-4">
                    <button
                    onClick={handleCancel}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 hover:text-gray-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center"
                    >
                    <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <button
                    onClick={handleSave}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm border border-purple-700 flex items-center"
                    >
                    <FontAwesomeIcon icon={faCheck} />
                    </button>
                </div>
                )}
            
        </div>

        {/* Afisare date */}
        <div className="md:gap-7 gap-1 px-5">

            {/* Grupa sanguina + rh */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-7 gap-1 mt-0">
                {/* Grupa sanguina */}
                <div className="mt-4">
                    <p className="font-semibold">Grupa sanguină</p>
                    {isEditing ? (
                        <>
                        <CustomSelect
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            options={selectOptions.bloodTypes}
                            onChange={(value) =>
                                setFormData((prev) => ({ ...prev, bloodGroup: value }))
                            }
                            className={`w-full ${errors.bloodGroup ? "border-red-500" : ""}`}
                            placeholder="Selectează grupa"
                        />
                        {errors.bloodGroup && (
                            <p className="text-red-500 text-xs mt-0">{errors.bloodGroup}</p>
                        )}
                        </>
                    ) : (
                        <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">
                            {formData.bloodGroup}
                        </p>
                    )}
                </div>
                {/* RH */}
                <div className="mt-4">
                    <p className="font-semibold">RH</p>
                    {isEditing ? (
                        <>
                            <CustomSelect
                                name="rh"
                                value={formData.rh}
                                options={selectOptions.bloodTypesRH}
                                onChange={(value) =>
                                    setFormData((prev) => ({ ...prev, rh: value }))
                                }
                                className={`w-full ${errors.rh ? "border-red-500" : ""}`}
                                placeholder="Selectează RH"
                            />
                            {errors.rh && (
                                <p className="text-red-500 text-xs mt-0">{errors.rh}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">
                            {formData.rh}
                        </p>
                    )}
                </div>
            </div>

            {/* Asigurare + medic familie */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-7 gap-1 mt-0">
                {/* Asigurare */}
                <div className="mt-4">
                    <p className="font-semibold">Asigurare</p>
                    {isEditing ? (
                        <>
                        <CustomSelect
                            name="insurance"
                            value={formData.insurance}
                            options={selectOptions.insurance}
                            onChange={(value) =>
                                setFormData((prev) => ({ ...prev, insurance: value }))
                            }
                            className={`w-full ${errors.insurance ? "border-red-500" : ""}`}
                            placeholder="Selectează asigurare"
                        />
                        {errors.insurance && (
                            <p className="text-red-500 text-xs mt-0">{errors.insurance}</p>
                        )}
                        </>
                    ) : (
                        <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">
                            {formData.insurance}
                        </p>
                    )}
                </div>

                {/* Medic de familie */}
                <div className="mt-4">
                    <p className="font-semibold">Medic de familie</p>
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                name="familyDoctor"
                                value={formData.familyDoctor}
                                onChange={handleChange}
                                className={`w-full border px-2 py-1.5 rounded-sm ${errors.familyDoctor ? "border-red-500" : ""}`}
                                placeholder="Introduceți numele medicului de familie"
                            />
                            {errors.familyDoctor && (
                                <p className="text-red-500 text-xs mt-0">{errors.familyDoctor}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm flex items-center">
                            {formData.familyDoctor ? formData.familyDoctor : <span className="text-gray-400">—</span>}
                        </p>
                    )}
                </div>
            </div>

            {/* Persoana de contact */}
            <div className="mt-4">
                <p className="font-semibold mb-1">Persoană de contact</p>
                <div className="grid grid-cols-1 md:grid-cols-3 md:gap-7 gap-1">
                    {/* Nume */}
                    <div>
                        <p className="font-semibold text-sm">Nume</p>
                        {isEditing ? (
                            <input
                                type="text"
                                name="emergencyContactFullName"
                                value={formData.emergencyContact.fullName}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        emergencyContact: {
                                            ...prev.emergencyContact,
                                            fullName: e.target.value
                                        }
                                    }))
                                }
                                className="w-full border rounded px-2 py-1.5"
                                placeholder="Nume"
                            />
                        ) : (
                            <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">
                                {formData.emergencyContact.fullName || <span className="text-gray-400">—</span>}
                            </p>
                        )}
                    </div>
                    {/* Relatie */}
                    <div>
                        <p className="font-semibold text-sm">Relație</p>
                        {isEditing ? (
                            <input
                                type="text"
                                name="emergencyContactRelation"
                                value={formData.emergencyContact.relation}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        emergencyContact: {
                                            ...prev.emergencyContact,
                                            relation: e.target.value
                                        }
                                    }))
                                }
                                className="w-full border rounded px-2 py-1.5"
                                placeholder="Relație"
                            />
                        ) : (
                            <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">
                                {formData.emergencyContact.relation || <span className="text-gray-400">—</span>}
                            </p>
                        )}
                    </div>
                    {/* Telefon */}
                    <div>
                        <p className="font-semibold text-sm">Telefon</p>
                        {isEditing ? (
                            <>
                            <input
                                type="text"
                                name="emergencyContactPhone"
                                value={formData.emergencyContact.phone}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        emergencyContact: {
                                            ...prev.emergencyContact,
                                            phone: e.target.value
                                        }
                                    }))
                                }
                                className="w-full border rounded px-2 py-1.5"
                                placeholder="Telefon"
                            />
                            {errors.emergencyContactPhone && (
                                <p className="text-red-500 text-xs mt-0">{errors.emergencyContactPhone}</p>
                            )}
                            </>
                             
                        ) : (
                            <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">
                                {formData.emergencyContact.phone || <span className="text-gray-400">—</span>}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Alergii */}
            <div className="mt-4 mb-5">
                <p className="font-semibold mb-1">Alergii</p>
                {isEditing ? (
                    <>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newAllergy}
                                onChange={(e) => setNewAllergy(e.target.value)}
                                className="border p-2 rounded text-sm flex-1"
                                placeholder="ex. Polen, Lactate"
                            />
                            <button
                                type="button"
                                className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-sm"
                                onClick={() => {
                                    addItem(
                                        newAllergy,
                                        setNewAllergy,
                                        formData.allergies,
                                        (value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                allergies: value,
                                            }))
                                    );
                                    setErrors((prev) => ({ ...prev, allergies: "" }));
                                }}
                            >
                                + Adaugă
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.allergies.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2"
                                >
                                    {item}
                                    <button
                                        onClick={() =>
                                            removeItem(index, formData.allergies, (value) =>
                                                setFormData((prev) => ({ ...prev, allergies: value }))
                                            )
                                        }
                                        className="text-purple-600 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {errors.allergies && (
                                <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div>
                        {formData.allergies && formData.allergies.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                                {formData.allergies.map((item, idx) => (
                                    <li key={idx} className="text-gray-800">{item}</li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-gray-400">—</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
)
}

export default MedicalInfo