import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPenToSquare, faLock, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import { selectOptions } from "../../../utils/selectOptions";
import CustomSelect from "../../../components/customSelect";
import { validateCNP, extractBirthDateAndAge } from "../../../utils/validateCNP";
import { toast } from "react-toastify";


const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone) =>
  /^(\+4)?07\d{8}$/.test(phone);

const PersonalInfo = ({ patientData, onSave }) => {

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cnp: "",
    birthDate: "",
    age: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patientData) {
      setFormData({
        firstName: patientData.firstName || "",
        lastName: patientData.lastName || "",
        email: patientData.email || "",
        phone: patientData.phone || "",
        cnp: patientData.cnp || "",
        age: patientData.age || "",
        birthDate: patientData.birthDate || "",
        gender: patientData.gender || "",
      });
      setErrors({});
    }
  }, [patientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

const handleCNPChange = (e) => {
  const value = e.target.value;
  let error = ""
  setFormData((prev) => ({
    ...prev,
    cnp: value,
    birthDate: "",
    age: "",
  }));

  // Validare în timp real
  if (value.length === 13) {
     const errorMsg = validateCNP(value);
      error = errorMsg;

   if (!errorMsg) {
      const { birthDate, age } = extractBirthDateAndAge(value);
      setFormData((prev) => ({
        ...prev,
        birthDate: birthDate || "",
        age: age || "",
      }));
      setErrors((prev) => ({ ...prev, cnp: undefined, birthDate: undefined, age: undefined }));
    } else {
      setErrors((prev) => ({ ...prev, cnp: errorMsg, birthDate: undefined, age: undefined }));
      setFormData((prev) => ({
        ...prev,
        birthDate: "",
        age: "",
      }));
    }
  } else if (value.length > 0) {
    setErrors((prev) => ({ ...prev, cnp: "CNP trebuie să aibă 13 cifre." }));
    setFormData((prev) => ({
      ...prev,
      birthDate: "",
      age: "",
    }));
  } else {
    setErrors((prev) => ({ ...prev, cnp: undefined }));
    setFormData((prev) => ({
      ...prev,
      birthDate: "",
      age: "",
    }));
  }
};

  const validateFields = () => {
  let error = "";
  const errorMsg = validateCNP(formData.cnp);
  error = errorMsg;

  const newErrors = {};

  if (!formData.firstName.trim()) newErrors.firstName = "Prenumele este obligatoriu.";
  if (!formData.lastName.trim()) newErrors.lastName = "Numele este obligatoriu.";
  if (!validateEmail(formData.email)) newErrors.email = "Email invalid.";
  if (!validatePhone(formData.phone)) newErrors.phone = "Telefon invalid.";
  if (errorMsg) newErrors.cnp = "CNP invalid.";
  if (!formData.gender) newErrors.gender = "Genul este obligatoriu.";
  if (!formData.birthDate) newErrors.birthDate = "Data nașterii nu poate fi determinată.";
  if (!formData.age) newErrors.age = "Vârsta nu poate fi determinată.";

  setErrors(newErrors);

  const hasErrors = Object.keys(newErrors).length > 0;

  if (hasErrors) {
    toast.error("Te rog să completezi corect câmpurile evidențiate!");
  }

  return !hasErrors;
};


  const handleSave = () => {
    if (validateFields()) {
      onSave(formData);
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    setFormData({
      firstName: patientData.firstName || "",
      lastName: patientData.lastName || "",
      email: patientData.email || "",
      phone: patientData.phone || "",
      cnp: patientData.cnp || "",
      birthDate: patientData.birthDate || "",
      age: patientData.age || "",
      gender: patientData.gender || "",

    });
    setErrors({});
    setIsEditing(false);
  };

  return (
     <div className="mb-10 shadow-xl rounded-3xl bg-white/95 w-full border-l-7 border-r-7 border-b-10 border-purple-100">
        <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
          <h3 className="text-lg font-bold text-purple-800">
            <FontAwesomeIcon icon={faUser} className="mr-2"/> Informații Personale
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
               <FontAwesomeIcon icon={faCheck } />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-7 gap-1 p-5">

          <div>
            {/* Nume */}
            <div className="mb-5">
              <p className="font-semibold">Nume:</p>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    className={`border rounded px-2 py-1.5 md:w-full lg:w-full w-full text-medium ${
                              errors.lastName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-xs">{errors.lastName}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800 text-base border p-1 w-full rounded-sm">{formData.lastName} </p>
              )}
            </div>
            {/* Prenume */}
            <div className="mb-5">
              <p className="font-semibold">Prenume:</p>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    className={`border rounded px-2 py-1.5 md:w-full lg:w-full w-full text-medium ${
                        errors.firstName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-xs">{errors.firstName}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800 text-base border p-1 w-full rounded-sm">{formData.firstName} </p>
              )}
            </div>
            {/* Email */}
            <div className="mb-5">
              <p className="font-semibold">Email:</p>
              {isEditing ? (
                <>
                  <p className="text-gray-800 text-base border p-1.5 w-full rounded-sm">{formData.email}</p>
                  <p className="text-red-600 text-xs">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Email-ul se poate schimba din setări
                  </p>
                  {errors.email && (
                    <p className="text-red-600 text-xs">{errors.email}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800 text-base border p-1 w-full rounded-sm">{formData.email}</p>
              )}
            </div>
            {/* Telefon */}
            <div className="mb-5">
              <p className="font-semibold">Telefon:</p>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className={`border rounded px-2 py-1.5 md:w-full lg:w-full w-full text-medium ${
                        errors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-xs">{errors.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800 text-base border p-1 w-full rounded-sm">{formData.phone} </p>
              )}
            </div>
          </div>


          <div>
            {/* Gen */}
            <div className="mb-5">
              <p className="font-semibold">Gen:</p>
              {isEditing ? (
                <>
                  <CustomSelect
                    options={selectOptions.genderOptions}
                    value={formData.gender}
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: selectedOption,
                      }))
                    }
                    placeholder="Selectează genul"
                    className="md:w-full lg:w-full w-full"
                    hasError={!!errors.gender}
                  />
                  {errors.gender && (
                    <p className="text-red-600 text-xs">{errors.gender}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800 text-base border p-1 w-full rounded-sm">{formData.gender}</p>
              )}
            </div>
            {/* CNP */}
            <div className="mb-5">
              <p className="font-semibold">CNP:</p>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="cnp"
                    value={formData.cnp || ""}
                    onChange={handleCNPChange}
                    className={`border rounded px-2 py-1.5 md:w-full lg:w-full w-full text-medium ${
                        errors.cnp ? "border-red-500" : ""
                    }`}
                  />
                  {errors.cnp && (
                    <p className="text-red-600 text-xs">{errors.cnp}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800 text-base border p-1 w-full rounded-sm">{formData.cnp} </p>
              )}
            </div>
            {/* Data Nasteri */}
            <div className="mb-5">
              <p className="font-semibold">Data Nașterii:</p>
              {isEditing ? (
                <>
                  <p className="text-gray-800 text-base border px-2 py-1.5 w-full rounded-sm flex items-center">
                            {formData.birthDate ? formData.birthDate : <span className="text-gray-400">—</span>}
                        </p>
                  {errors.birthDate && (
                    <p className="text-red-600 text-xs">{errors.birthDate}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm flex items-center">
                            {formData.birthDate ? formData.birthDate : <span className="text-gray-400">—</span>}
                        </p>
              )}
            </div>
            {/* Varsta */}
            <div className="mb-5">
              <p className="font-semibold">Vârsta:</p>
              {isEditing ? (
                <>
                  <p className="text-gray-800 text-base border px-2 py-1.5 w-full rounded-sm flex items-center">
                      {formData.age ?  `${formData.age} ani` : <span className="text-gray-400">—</span>}
                  </p>
                  {errors.age && (
                    <p className="text-red-600 text-xs">{errors.age}</p>
                  )}
                </>
              ) : (
                
              <p className="text-gray-800 text-base border px-2 py-1 w-full rounded-sm flex items-center">
                      {formData.age ?  `${formData.age} ani` : <span className="text-gray-400">—</span>}
                  </p>
              )}
            </div>
          </div>
        </div>

       
    </div>
  );
};

export default PersonalInfo;
