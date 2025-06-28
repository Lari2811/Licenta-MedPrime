import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPenToSquare, faLock, faSearchLocation, faMapLocationDot, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { selectOptions } from "../../../utils/selectOptions";
import CustomSelect from "../../../components/customSelect";
import { toast } from "react-toastify";


const AddressInfo =  ({ patientData, onSave }) => {

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        address: {
            address_details: "",
            city: "",
            county: "",
            postalCode: ""
        },
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (patientData) {
        setFormData({
             address: {
                address_details: patientData.address?.address_details || "",
                city: patientData.address?.city || "",
                county: patientData.address?.county || "",
                postalCode: patientData.address?.postalCode || ""
            },
        });
        setErrors({});
        }
    }, [patientData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, address: { ...prev.address, [name]: value, }, }));
        setErrors((prev) => ({...prev, address: { ...prev.address,  [name]: undefined, }, }));
    };


    const validateFields = () => {
        let valid = true;
        const newErrors = {};

        const { address } = formData;

        // Validare city (minim 2 caractere)
        if (!address.city || address.city.trim().length < 2) {
            newErrors.city = "Completează un oraș valid (minim 2 caractere).";
            valid = false;
        }

        // Validare county (obligatoriu selectat)
        if (!address.county || address.county.trim() === "") {
            newErrors.county = "Selectează un județ.";
            valid = false;
        }

        // Validare postalCode (exact 6 cifre)
        if (!address.postalCode || !/^\d{6}$/.test(address.postalCode)) {
            newErrors.postalCode = "Codul poștal trebuie să aibă exact 6 cifre.";
            valid = false;
        }

        // Validare address_details (minim 5 caractere)
        if (!address.address_details || address.address_details.trim().length < 5) {
            newErrors.address_details = "Adresa trebuie să conțină minim 5 caractere.";
            valid = false;
        }

        setErrors(newErrors);

        if (!valid) {
            toast.error("Te rog să completezi corect câmpurile evidențiate!");
        }

        return valid;
        };


    const handleCancel = () => {
        setFormData({
             address: {
                address_details: patientData.address?.address_details || "",
                city: patientData.address?.city || "",
                county: patientData.address?.county || "",
                postalCode: patientData.address?.postalCode || ""
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
            <FontAwesomeIcon icon={faMapLocationDot } className="mr-2"/> Informații Adresă
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

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-7 gap-1 p-5">
            <div>
                {/* Oras */}
                <div className="mb-5">
                    <p className="font-semibold">Oraș:</p>
                    {isEditing ? (
                    <>
                        <input
                        type="text"
                        name="city"
                        value={formData.address.city || ""}
                        onChange={handleChange}
                        className={`border rounded px-2 py-1.5 md:w-full lg:w-full w-50 text-medium ${
                            errors.city ? "border-red-500" : ""
                        }`}
                        />
                        {errors.city && (
                        <p className="text-red-600 text-xs">{errors.city}</p>
                        )}
                    </>
                    ) : (
                    <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">{formData.address.city} </p>
                    )}
                </div>

                {/* Detalii adresa */}
                <div className="mb-5">
                    <p className="font-semibold">Adresă completă:</p>
                    {isEditing ? (
                    <>
                        <input
                        type="text"
                        name="address_details"
                        value={formData.address.address_details || ""}
                        onChange={handleChange}
                        className={`border rounded px-2 py-1.5 md:w-full lg:w-full w-full text-medium ${
                            errors.address_details ? "border-red-500" : ""
                        }`}
                        />
                        {errors.address_details && (
                        <p className="text-red-600 text-xs">{errors.address_details}</p>
                        )}
                    </>
                    ) : (
                    <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">{formData.address.address_details} </p>
                    )}
                </div>
            </div>

            <div>
               

                {/* Judet */}
                <div className="mb-5">
                    <p className="font-semibold">Județ: </p>
                    {isEditing ? (
                        <>
                            <CustomSelect
                            options={selectOptions.counties}
                            value={formData.address.county}
                            onChange={(selectedOption) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    address: {
                                        ...prev.address,
                                        county: selectedOption
                                    }
                                }))
                            }
                            placeholder="Selectează județul"
                            className="md:w-full lg:w-full w-full"
                            hasError={!!errors.county}
                            />
                            {errors.county && (
                            <p className="text-red-600 text-xs">{errors.county}</p>
                            )}
                        </>
                        ) : (
                        <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">{formData.address.county}</p>
                        )}
                </div>

                 {/* Cod postal */}
                <div className="mb-5">
                    <p className="font-semibold">Cod poștal:</p>
                    {isEditing ? (
                    <>
                        <input
                        type="text"
                        name="postalCode"
                        value={formData.address.postalCode || ""}
                        onChange={handleChange}
                         className={`border rounded px-2 py-1.5 md:w-full lg:w-full w-full text-medium ${
                            errors.postalCode ? "border-red-500" : ""
                        }`}
                        />
                        {errors.postalCode && (
                        <p className="text-red-600 text-xs">{errors.postalCode}</p>
                        )}
                    </>
                    ) : (
                    <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm">{formData.address.postalCode} </p>
                    )}
                </div>

            </div>

            
       </div>
      
     
    </div>
  )
}

export default AddressInfo