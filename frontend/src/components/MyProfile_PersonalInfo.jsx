import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope, faLocationDot, faPenToSquare, faPhone, faUser
} from "@fortawesome/free-solid-svg-icons";


const MyProfile_PersonalInfo = ({ userData, onSaveSection }) => {

  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState(userData);

  const [errors, setErrors] = useState({});

  const [successMessages, setSuccessMessages] = useState({
    personal: "",
    address: "",
    professional: "",
    medical: ""
  });
    const isEditing = (section) => editingSection === section;



    useEffect(() => {
        setFormData(userData);
    }, [userData]); 

  console.log("info primite: ", formData)

  
  const countys = [
    "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov", "Brăila",
    "București", "Buzău", "Călărași", "Caraș-Severin", "Cluj", "Constanța", "Covasna", "Dâmbovița",
    "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov",
    "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare", "Sibiu",
    "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui", "Vrancea"
  ];

  const professionalFields = [
    "Sănătate", "Educație", "IT & Software", "Comerț", "Construcții",
    "Transport", "Administrație publică", "Producție", "Finanțe", "Altele"
  ];
  
  const statusOptions = [
    "Angajat", "Șomer", "Student", "Elev", "Pensionar", "Casnic(ă)", "Altul"
  ];
  
  const bloodTypes = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-", "Nu cunosc"
  ];

    const status = formData.professionalStatus;
    const showWorkplaceAndField = status === "Angajat";
    const showSchool = status === "Student" || status === "Elev";
    const showOtherDetails = status === "Altul";


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(userData);
    setEditingSection(null);
    setErrors({});
  };
  

  
  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return "";
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

    const validatePersonalForm = () => {
        const newErrors = {};
        const requiredFields = ["firstName", "lastName", "email", "cnp", "dateOfBirth", "gender", "phone"];
        requiredFields.forEach(field => {
          if (!formData[field]) {
            newErrors[field] = "Acest câmp este obligatoriu.";
          }
        });
      
        if (formData.cnp && !/^\d{13}$/.test(formData.cnp)) {
          newErrors.cnp = "CNP-ul trebuie să conțină exact 13 cifre.";
        }
      
        if (formData.phone && !/^(07|02|03)\d{8}$/.test(formData.phone)) {
          newErrors.phone = "Numărul trebuie să înceapă cu 07 / 02 / 03 și să aibă exact 10 cifre.";
        }
      
        const todayStr = new Date().toISOString().split("T")[0];
        if (formData.dateOfBirth && formData.dateOfBirth > todayStr) {
          newErrors.dateOfBirth = "Data nu poate fi în viitor.";
        }
      
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      
      const validateAddressForm = () => {
        const newErrors = {};
      
        if (!formData.address) {
          newErrors.address = "Adresa este obligatorie.";
        }
      
        if (!formData.city) {
          newErrors.city = "Orașul este obligatoriu.";
        }
      
        if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
            newErrors.postalCode = "Codul poștal trebuie să conțină exact 6 cifre.";
          }
      
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const validateProfessionalForm = () => {
        const newErrors = {};
        const status = formData.professionalStatus;
      
        if (!status) {
          newErrors.professionalStatus = "Selectează statutul profesional.";
        } else {
          if (status === "Angajat") {
            if (!formData.workplace) newErrors.workplace = "Locul de muncă este obligatoriu.";
            if (!formData.field) newErrors.field = "Completează domeniul de activitate.";
            formData.school = "";
            formData.otherDetails = "";
          } else if (status === "Student" || status === "Elev") {
            if (!formData.school) newErrors.school = "Instituția de învățământ este obligatorie.";
            formData.workplace = "";
            formData.field = "";
            formData.otherDetails = "";
          } else if (status === "Altul") {
            if (!formData.otherDetails) newErrors.otherDetails = "Introduceți detalii relevante.";
            formData.workplace = "";
            formData.field = "";
            formData.school = "";
          } else {
            formData.workplace = "";
            formData.field = "";
            formData.school = "";
            formData.otherDetails = "";
          }
        }
      
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const validateMedicalForm = () => {
        const newErrors = {};
        if (!formData.bloodType) newErrors.bloodType = "Selectează grupa sanguină.";
        if (!formData.familyDoctor) newErrors.familyDoctor = "Numele medicului de familie este obligatoriu.";
        if (!formData.cnasInsured) newErrors.cnasInsured = "Selectează opțiunea.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const handleSave = (section) => {
        const isValid = section === "personal"
          ? validatePersonalForm()
          : section === "address"
          ? validateAddressForm()
          : section === "professional"
          ? validateProfessionalForm()
          : section === "medical"
          ? validateMedicalForm()
          : true;
      
        if (!isValid) return;
      
        setEditingSection(null);
        setErrors({});
        setSuccessMessages(prev => ({
          ...prev,
          [section]: "Informațiile au fost salvate cu succes!"
        }));
      
        if (onSaveSection) {
          onSaveSection(section, formData);
        }
      
        setTimeout(() => {
          setSuccessMessages(prev => ({ ...prev, [section]: "" }));
        }, 3000);
      };
  
  return (
    <div className="px-6 mt-6">

      {/* HERO */}
        <div className="bg-gradient-to-r from-purple-200 to-pink-100 border border-gray-100 rounded-xl shadow-md p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start">
            <img
            src={userData.imageUrl}
            alt="Profil"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-purple-800">{userData.lastName} {userData.firstName}</h2>
            <p className="text-sm text-gray-600">Pacient MedPrime din 2023</p>
            </div>
        </div>

      {/* SECTIONS: Personal Info + Address */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">

            {/* Informatii Personale */}
            <div className="bg-white rounded-xl shadow border border-gray-100 w-full md:basis-1/2 p-4">
            <div className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-t-xl mb-4">
                <h3 className="text-md font-semibold text-purple-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} /> Informații Personale
                </h3>
                {!isEditing("personal") && (
                <button
                    onClick={() => setEditingSection("personal")}
                    className="text-purple-600 hover:underline flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                    <span className="hidden md:inline text-base mt-1"> Editează </span>
                 
                </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {[ 
                    { label: "Nume", name: "lastName" },
                    { label: "Prenume", name: "firstName" },
                    { label: "Email", name: "email" },
                    { label: "CNP", name: "cnp" },
                    {
                        label: "Data nașterii",
                        name: "dateOfBirth",
                        type: "date"
                    },
                    {
                    label: "Vârsta",
                    name: "age",
                    customRender: () => (
                        <p>{calculateAge(formData.dateOfBirth)} ani</p>
                    )
                    },
                    {
                        label: "Gen",
                        name: "gender",
                        type: "select",
                        options: ["Feminin", "Masculin", "Altul"]
                    },
                    { label: "Telefon", name: "phone" }
                ].map(({ label, name, type = "text", options, customRender }) => (
                    <div key={name} className="mb-2">
                    <p className="font-semibold text-base">{label}:</p>

                {customRender ? (
                    <>
                    {customRender()}
                    {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
                    </>
                    ) : isEditing("personal") ? (
                    type === "select" ? (
                    <>
                        <select
                        name        ={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className={`border rounded-md px-2 py-1 w-full ${errors[name] ? "border-red-500" : ""}`}
                        >
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                        </select>
                        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
                    </>
                    ) : (
                    <>
                        <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className={`border rounded-md px-2 py-1 w-full ${errors[name] ? "border-red-500" : ""}`}
                        max={name === "dateOfBirth" ? new Date().toISOString().split("T")[0] : undefined}
                        />
                        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
                    </>
                    )
                ) : (
                    <>
                    <p>{formData[name]}</p>
                    {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
                    </>
                )}
                </div>
            ))}
            </div>

            {successMessages.personal && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 border border-green-300">
                    {successMessages.personal}
                </div>
            )}
                    

            {isEditing("personal") && (
                <div className="flex justify-end gap-4 mt-4">
                <button 
                onClick={handleCancel} 
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                    Anulează
                </button>
                <button 
                onClick={() => handleSave("personal")} 
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    Salvează
                </button>
                </div>
            )}
        </div>

            {/* Adresă */}
            <div className="bg-white rounded-xl shadow border border-gray-100 w-full md:basis-1/2 p-4">
                <div className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-t-xl mb-4">
                    <h3 className="text-md font-semibold text-purple-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLocationDot} /> Adresă
                    </h3>
                    {!isEditing("address") && (
                    <button
                        onClick={() => setEditingSection("address")}
                        className="text-purple-600 hover:underline flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                        <span className="hidden md:inline text-base mt-1"> Editează </span>
                    </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {[
                    { label: "Stradă", name: "address" },
                    { label: "Oraș", name: "city" },
                    {
                        label: "Județ",
                        name: "county",
                        type: "select",
                        options: countys,
                    },
                    { label: "Cod Poștal", name: "postalCode" },
                    ].map(({ label, name, type = "text", options }) => (
                    <div key={name} className="mb-2">
                        <p className="font-semibold">{label}:</p>

                        {isEditing("address") ? (
                        type === "select" ? (
                            <>
                            <select
                                name={name}
                                value={formData[name]}
                                onChange={handleChange}
                                className={`border rounded-md px-2 py-1 w-full ${errors[name] ? "border-red-500" : ""}`}
                            >
                                {options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors[name] && (
                                <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
                            )}
                            </>
                        ) : (
                            <>
                            <input
                                type="text"
                                name={name}
                                value={formData[name]}
                                onChange={handleChange}
                                className={`border rounded-md px-2 py-1 w-full ${errors[name] ? "border-red-500" : ""}`}
                            />
                            {errors[name] && (
                                <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
                            )}
                            </>
                        )
                        ) : (
                        <>
                            <p>{formData[name]}</p>
                            {errors[name] && (
                            <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
                            )}
                        </>
                        )}
                    </div>
                    ))}
                </div>

                {successMessages.address && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 border border-green-300">
                    {successMessages.address}
                </div>
                )}

                {isEditing("address") && (
                    <div className="flex justify-end gap-4 mt-4">
                    <button
                        onClick={handleCancel}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Anulează
                    </button>
                    <button
                        onClick={() => handleSave("address")}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                        Salvează
                    </button>
                    </div>
                )}
                </div>


        </div>

      {/* SECTIONS: Professional Info + Medical */}
         <div className="flex flex-col md:flex-row gap-6 mb-6">


            {/* Professional Info */}
            <div className="bg-white rounded-xl shadow border border-gray-100 w-full md:basis-1/2 p-4">

            <div className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-t-xl mb-4">
                <h3 className="text-md font-semibold text-purple-700">Informații Profesionale</h3>
                {!isEditing("professional") && (
                <button
                    onClick={() => setEditingSection("professional")}
                    className="text-purple-600 hover:underline flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                    <span className="hidden md:inline text-base mt-1"> Editează </span>
                </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {/* Statut profesional */}
                <div className="mb-2">
                <p className="font-semibold">Statut profesional:</p>
                {isEditing("professional") ? (
                    <select
                    name="professionalStatus"
                    value={formData.professionalStatus}
                    onChange={handleChange}
                    className={`border rounded-md px-2 py-1 w-full ${errors.professionalStatus ? "border-red-500" : ""}`}
                    >
                    <option value="">Selectează</option>
                    {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                    </select>
                ) : (
                    <p>{formData.professionalStatus || "—"}</p>
                )}
                {errors.professionalStatus && <p className="text-sm text-red-500 mt-1">{errors.professionalStatus}</p>}
                </div>

                {/* Loc de munca */}
                <div className="mb-2">
                <p className="font-semibold">Loc de muncă:</p>
                {isEditing("professional") ? (
                    status === "Angajat" ? (
                    <input
                        type="text"
                        name="workplace"
                        value={formData.workplace}
                        onChange={handleChange}
                        className={`border rounded-md px-2 py-1 w-full ${errors.workplace ? "border-red-500" : ""}`}
                    />
                    ) : (
                    <p className="text-gray-500">—</p>
                    )
                ) : (
                    <p>{formData.workplace || "—"}</p>
                )}
                {errors.workplace && <p className="text-sm text-red-500 mt-1">{errors.workplace}</p>}
                </div>

                {/* Domeniu activitate */}
                <div className="mb-2">
                <p className="font-semibold">Domeniu de activitate:</p>
                {isEditing("professional") ? (
                    status === "Angajat" ? (
                    <select
                        name="field"
                        value={formData.field}
                        onChange={handleChange}
                        className={`border rounded-md px-2 py-1 w-full ${errors.field ? "border-red-500" : ""}`}
                    >
                        <option value="">Selectează domeniul</option>
                        {professionalFields.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    ) : (
                    <p className="text-gray-500">—</p>
                    )
                ) : (
                    <p>{formData.field || "—"}</p>
                )}
                {errors.field && <p className="text-sm text-red-500 mt-1">{errors.field}</p>}
                </div>

                {/* Scoala */}
                <div className="mb-2">
                <p className="font-semibold">Instituție de învățământ:</p>
                {isEditing("professional") ? (
                    (status === "Student" || status === "Elev") ? (
                    <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        className={`border rounded-md px-2 py-1 w-full ${errors.school ? "border-red-500" : ""}`}
                    />
                    ) : (
                    <p className="text-gray-500">—</p>
                    )
                ) : (
                    <p>{formData.school || "—"}</p>
                )}
                {errors.school && <p className="text-sm text-red-500 mt-1">{errors.school}</p>}
                </div>

                {/* Alte detalii */}
                <div className="mb-2 sm:col-span-2">
                <p className="font-semibold">Alte detalii:</p>
                {isEditing("professional") ? (
                    status === "Altul" ? (
                    <textarea
                        name="otherDetails"
                        value={formData.otherDetails}
                        onChange={handleChange}
                        className={`border rounded-md px-2 py-1 w-full ${errors.otherDetails ? "border-red-500" : ""}`}
                    />
                    ) : (
                    <p className="text-gray-500">—</p>
                    )
                ) : (
                    <p>{formData.otherDetails || "—"}</p>
                )}
                {errors.otherDetails && <p className="text-sm text-red-500 mt-1">{errors.otherDetails}</p>}
                </div>
            </div>

            {successMessages.professional && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded mt-4 border border-green-300">
                {successMessages.professional}
                </div>
            )}

            {isEditing("professional") && (
                <div className="flex justify-end gap-4 mt-4">
                <button onClick={handleCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Anulează</button>
                <button onClick={() => handleSave("professional")} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Salvează</button>
                </div>
            )}
            </div>   

            {/* Medical Info */}
            <div className="bg-white rounded-xl shadow border border-gray-100 w-full md:basis-1/2 p-4">
                <div className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-t-xl mb-4">
                    <h3 className="text-md font-semibold text-purple-700">Informații Medicale</h3>
                    {!isEditing("medical") && (
                    <button
                        onClick={() => setEditingSection("medical")}
                        className="text-purple-600 hover:underline flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                        <span className="hidden md:inline text-base mt-1"> Editează </span>
                    </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {/* Grupa de sânge */}
                    <div className="mb-2">
                        <p className="font-semibold">Grupa sanguină:</p>
                        {isEditing("medical") ? (
                            <select
                            name="bloodType"
                            value={formData.bloodType}
                            onChange={handleChange}
                            className={`border rounded-md px-2 py-1 w-full ${errors.bloodType ? "border-red-500" : ""}`}
                            >
                            <option value="">Selectează grupa</option>
                            {bloodTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                            </select>
                        ) : (
                            <p>{formData.bloodType || "—"}</p>
                        )}
                        {errors.bloodType && <p className="text-sm text-red-500 mt-1">{errors.bloodType}</p>}
                    </div>

                    {/* Alergii */}
                    <div className="mb-2">
                    <p className="font-semibold">Alergii cunoscute:</p>
                    {isEditing("medical") ? (
                        <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        className="border rounded-md px-2 py-1 w-full"
                        />
                    ) : (
                        <p>{formData.allergies || "—"}</p>
                    )}
                    </div>

                    {/* Afectiuni existente */}
                    <div className="mb-2">
                    <p className="font-semibold">Afecțiuni medicale:</p>
                    {isEditing("medical") ? (
                        <input
                        type="text"
                        name="conditions"
                        value={formData.conditions}
                        onChange={handleChange}
                        className="border rounded-md px-2 py-1 w-full"
                        />
                    ) : (
                        <p>{formData.conditions || "—"}</p>
                    )}
                    </div>

                    {/* Medicul de familie */}
                    <div className="mb-2">
                    <p className="font-semibold">Medicul de familie:</p>
                    {isEditing("medical") ? (
                        <input
                        type="text"
                        name="familyDoctor"
                        value={formData.familyDoctor}
                        onChange={handleChange}
                        className={`border rounded-md px-2 py-1 w-full ${errors.familyDoctor ? "border-red-500" : ""}`}
                        />
                    ) : (
                        <p>{formData.familyDoctor || "—"}</p>
                    )}
                    {errors.familyDoctor && <p className="text-sm text-red-500 mt-1">{errors.familyDoctor}</p>}
                    </div>

                    {/* Asigurat la CNAS */}
                    <div className="mb-2">
                    <p className="font-semibold">Asigurat la CNAS:</p>
                    {isEditing("medical") ? (
                        <select
                        name="cnasInsured"
                        value={formData.cnasInsured}
                        onChange={handleChange}
                        className={`border rounded-md px-2 py-1 w-full ${errors.cnasInsured ? "border-red-500" : ""}`}
                        >
                        <option value="">Selectează</option>
                        <option value="Da">Da</option>
                        <option value="Nu">Nu</option>
                        </select>
                    ) : (
                        <p>{formData.cnasInsured || "—"}</p>
                    )}
                    {errors.cnasInsured && <p className="text-sm text-red-500 mt-1">{errors.cnasInsured}</p>}
                    </div>
                </div>

                {successMessages.medical && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded mt-4 border border-green-300">
                    {successMessages.medical}
                    </div>
                )}

                {isEditing("medical") && (
                    <div className="flex justify-end gap-4 mt-4">
                    <button onClick={handleCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                        Anulează
                    </button>
                    <button onClick={() => handleSave("medical")} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                        Salvează
                    </button>
                    </div>
                )}
                </div>
        </div>
        </div>
  );
};

export default MyProfile_PersonalInfo;
