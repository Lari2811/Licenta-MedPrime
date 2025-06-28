import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPenToSquare, faLock, faSearchLocation, faMapLocationDot, faBook, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { selectOptions } from "../../../utils/selectOptions";
import CustomSelect from "../../../components/customSelect";
import { toast } from "react-toastify";

const ProfessionalInfo = ({ patientData, onSave }) => {

    const [isEditing, setIsEditing] = useState(false);

     const [formData, setFormData] = useState({
        occupation: {
            profession: "",
            workPlace: "",
            domain: "",
            institution: "",
            otherDetails: ""
        },
    });
    const [errors, setErrors] = useState({});

      useEffect(() => {
        if (patientData) {
        setFormData({
             occupation: {
                profession: patientData.occupation?.profession || "",
                workPlace: patientData.occupation?.workPlace || "",
                domain: patientData.occupation?.domain || "",
                institution: patientData.occupation?.institution || "",
                otherDetails: patientData.occupation?.otherDetails || ""
            },
        });
        setErrors({});
        }
    }, [patientData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, occupation: { ...prev.occupation, [name]: value, }, }));
        setErrors((prev) => ({...prev, occupation: { ...prev.occupation,  [name]: undefined, }, }));
    };

    const validateFields = () => {
        let valid = true;
        const newErrors = {};
        const { occupation } = formData;

        // Validare profession (status)
        if (!occupation.profession || occupation.profession.trim() === "") {
            newErrors.profession = "Selectează statusul profesional.";
            valid = false;
        }

        // Validare pe baza statusului profesional
        if (occupation.profession === "angajat") {
            if (!occupation.workPlace || occupation.workPlace.trim().length < 2) {
            newErrors.workPlace = "Completează locul de muncă (minim 2 caractere).";
            valid = false;
            }
            if (!occupation.domain || occupation.domain.trim() === "") {
            newErrors.domain = "Selectează domeniul de activitate.";
            valid = false;
            }
        }

        if (occupation.profession === "student" || occupation.profession === "elev") {
            if (!occupation.institution || occupation.institution.trim().length < 2) {
            newErrors.institution = "Completează instituția de învățământ.";
            valid = false;
            }
        }

        if (occupation.profession === "altul") {
            if (!occupation.otherDetails || occupation.otherDetails.trim().length < 5) {
            newErrors.otherDetails = "Adaugă detalii (minim 5 caractere).";
            valid = false;
            }
        }

        setErrors(newErrors);

        if (!valid) {
            toast.error("Te rog să completezi câmpurile evidențiate!");
        }

        return valid;
        };


     const handleCancel = () => {
        setFormData({
             occupation: {
                profession: patientData.occupation?.profession || "",
                workPlace: patientData.occupation?.workPlace || "",
                domain: patientData.occupation?.domain || "",
                institution: patientData.occupation?.institution || "",
                otherDetails: patientData.occupation?.otherDetails || ""
            },
        });
        setErrors({});
        setIsEditing(false);
    };

    const handleSave = () => {
        if (validateFields()) {
            onSave(formData);
            setIsEditing(false);
        }
    };

    
  return (
   <div className="mb-10 shadow-xl rounded-3xl bg-white/95 w-full border-l-7 border-r-7 border-b-10 border-purple-100">
        <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
            <h3 className="text-lg font-bold text-purple-800">
                <FontAwesomeIcon icon={faBook } className="mr-2"/> Informații profesionale
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
                <div className="col-span-full flex justify-end gap-4 mt">
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

        {/* Informatii */}
        <div className="md:gap-7 gap-1 p-5">
            {/* Status */}
            <div className="mb-4">
                <p className="font-semibold">Status profesional: </p>
                {isEditing ? (
                    <>
                        <CustomSelect
                        options={selectOptions.professionalStatus}
                        value={formData.occupation.profession}
                        onChange={(selectedOption) =>
                            setFormData((prev) => ({
                                ...prev,
                                occupation: {
                                    ...prev.occupation,
                                    profession: selectedOption
                                }
                            }))
                        }
                        placeholder="Selectează județul"
                        className="md:w-full lg:w-full w-full"
                        hasError={!!errors.profession}
                        />
                        {errors.profession && (
                        <p className="text-red-600 text-xs">{errors.profession}</p>
                        )}
                    </>
                    ) : (
                    <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm ">{formData.occupation.profession}</p>
                    )}
            </div>

             {/* daca e Angajat */}
            {formData.occupation.profession === "angajat" && (
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-7 gap-1 mt-0">
                    <div className="mt-4">
                    <p className="font-semibold">Locul de muncă</p>
                    {isEditing ? (
                    <>
                        <input
                            type="text"
                            name="workPlace"
                            value={formData.occupation.workPlace}
                            onChange={handleChange}
                            className={`w-full border rounded px-3 py-1.5
                                ${
                                    errors.workPlace ? "border-red-500" : "border" }
                            `}
                            />
                            {errors.workPlace && (
                                <p className="text-red-500 text-xs mt-0">{errors.workPlace}</p>
                            )}
                    </>
                    ) : (
                    <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">{formData.occupation.workPlace} </p>
                    )}
                    </div>

                    <div className="mt-4">
                        <p className="font-semibold">Domeniul de activitate </p>
                        {isEditing ?  (
                        <>
                            <CustomSelect
                                name="field"
                                options={selectOptions.professionalFields}
                                value={formData.occupation.domain}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev,  occupation: {...prev.occupation, domain: value}}));
                                    setErrors(prev => ({ ...prev, domain: "" }));
                                }}
                                className="md:w-full lg:w-full w-full"
                                placeholder="Selectează domeniul"
                                hasError={!!errors.domain}
                            />
                            {errors.domain && (
                            <p className="text-red-500 text-xs mt-0">{errors.domain}</p>
                            )}
                            </>
                        ) : (
                                <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">{formData.occupation.domain}</p>
                        )}
                    </div>
                </div>
            )}

            {/* daca e Student sau Elev */}
            {(formData.occupation.profession === "student" || formData.occupation.profession === "elev") && (
                <div className="mt-4">
                    <p className="font-semibold">Instituția de învățământ </p>
                    {isEditing ? (
                    <>
                        <input
                            type="text"
                            name="institution"
                            value={formData.occupation.institution}
                            onChange={handleChange}
                            className={`w-full border rounded px-2 py-1.5
                                ${
                                    errors.institution ? "border-red-500" : "border" }
                            `}
                            />
                            {errors.institution && (
                                <p className="text-red-500 text-xs mt-0">{errors.institution}</p>
                            )}
                    </>
                    ) : (
                    <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">{formData.occupation.institution} </p>
                    )}
                </div>
            )}

            {/* daca e Altul */}
            {formData.occupation.profession === "altul" && (
                <div className="mt-4">
                    <p className="font-semibold">Alte detalii</p>
                    {isEditing ? (
                    <>
                        <textarea
                            name="otherDetails"
                            value={formData.occupation.otherDetails}
                            onChange={handleChange}
                            className={`w-full border rounded px-3 py-2
                                ${
                                    errors.otherDetails ? "border-red-500" : "border" }
                                `}
                        ></textarea>
                        {errors.otherDetails && (
                        <p className="text-red-500 text-xs mt-0">{errors.otherDetails}</p>
                        )}
                    </>
                    ) : (
                        <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">{formData.occupation.otherDetails} </p>
                    )}
                </div>
            )}
        </div>
    </div>
  )
}

export default ProfessionalInfo