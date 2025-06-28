import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle , faTasks, faArrowLeft, faArrowRight, faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { FaUser, FaHome, FaBriefcase, FaHeartbeat } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";
import { useRef } from 'react';

import { useCheckPatientAccess } from '../../accessControl/useCheckPatientAccess';
import { AppContext } from '../../context/AppContex';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import axios from 'axios'

import CustomSelect from '../../components/customSelect';
import { selectOptions } from "../../utils/selectOptions";

import { validateCNP, extractBirthDateAndAge } from "../../utils/validateCNP";

import { addItem, removeItem } from '../../utils/formUtils';

const FinishRegistration = () => {

    useCheckPatientAccess();

    const { patientID } = useParams();

    const { backendUrl } = useContext(AppContext);

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("personal");
    const [errors, setErrors] = useState({});

    const [userData, setUserData] = useState([])
    const [patientData, setPatientData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [profileImage, setProfileImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null); 
    
    const [patientDataForm, setPatientDataForm] = useState();


    //API get user data by ID (for mustCompleted)
    const fetchUser = async () => {
        try {
            console.log("ID", patientID);
            setLoading(true);
            setLoadingMessage("Încărcare date utilizator...");

            const res = await axios.get(`${backendUrl}/api/main/get-user-by-ID/${patientID}`);

            const status = res.status;
            const data = res.data;

            if (status === 200 && data.success) {
            setUserData(data.data);
            //toast.success(data.message || "Datele utilizatorului au fost încărcate cu succes!");
            console.log("User complet:", data.data);
            } else if (status === 404) {
            toast.error(data.message || "Utilizatorul nu a fost găsit.");
                } else {
            toast.error(data.message || "Eroare necunoscută.");
            }

        } catch (error) {
            if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || "Eroare necunoscută.";

            if (status === 404) {
                toast.error(message);
            } else if (status === 500) {
                toast.error("Eroare server. Încearcă mai târziu.");
            } else {
                toast.error(message);
            }
            } else {
            toast.error("Eroare de rețea. Verifică conexiunea la internet.");
            }

            console.error("Eroare API:", error);
        } finally {
            setLoading(false);
        }
        };

    //API get patient data by id
    const fetchPatient = async () => {
    try {
        setLoading(true);
        setLoadingMessage("Încărcare date pacient...");

        const response = await axios.get(`${backendUrl}/api/patient/get-patient-by-ID/${patientID}`);
        const status = response.status;
        const data = response.data;

        if (status === 200 && data.success) {
            setPatientData(data.data);
            //toast.success(data.message || "Datele pacientului au fost încărcate cu succes!");
            console.log("Pacient complet:", data.data);
        } else if (status === 404) {
            toast.error(data.message || "Pacientul nu a fost găsit.");
        } else {
            toast.error(data.message || "Eroare necunoscută.");
        }

    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || "Eroare necunoscută.";

            if (status === 404) {
                toast.error(message);
            } else if (status === 500) {
                toast.error("Eroare server. Încearcă mai târziu.");
            } else {
                toast.error(message);
            }
        } else {
            toast.error("Eroare de rețea. Verifică conexiunea la internet.");
        }

        console.error("Eroare API:", error);
    } finally {
        setLoading(false);
    }
    };

    useEffect(() => {

    if (!patientID) return; 
    
    fetchUser();
    fetchPatient();
    }, [patientID]);

    useEffect(() => {
        if (patientData && patientData.firstName) {
            setFormData((prev) => ({
            ...prev,
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            email: patientData.email,
            }));
        }
        }, [patientData]);

    const [newAllergy, setNewAllergy] = useState("");

    const [formData, setFormData] = useState({
        // Date personale
        firstName:  "",
        lastName: "",
        email:  "",
        phone: "",
        cnp: "",
        birthDate: "",  
        age: "",        
        gender: "",

        address: {
            address_details: "",
            city: "",
            county: "",
            postalCode: ""
        },
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

        occupation: {
            profession: "",
            workPlace: "",
            domain: "",
            institution: "",
            otherDetails: ""
        },

        status: "activ",

        profileImage: null, 
        profileImageUrl: null
    });


    //Handlere ========================================
   const handleChange = (e) => {
        const { name, value } = e.target;
        let error = "";

    // ------------------- CNP si telefon -------------------
        if (name === "cnp") {
            const errorMsg = validateCNP(value);
            error = errorMsg;

            if (!errorMsg && value.length === 13) {
            const { birthDate, age } = extractBirthDateAndAge(value);
            setFormData((prev) => ({
                ...prev,
                cnp: value,
                birthDate: birthDate || "",
                age: age || "",
            }));
            setErrors((prev) => ({
                ...prev,
                cnp: "",
                birthDate: "",
                age: "",
            }));
            } else {
            setFormData((prev) => ({
                ...prev,
                cnp: value,
                birthDate: "",
                age: "",
            }));
            setErrors((prev) => ({
                ...prev,
                cnp: errorMsg || "CNP invalid",
                birthDate: "Data nașterii este obligatorie",
                age: "Introdu CNP valid pentru determinarea vârstei",
            }));
            }
            return;
        }

        if (name === "phone") {
            if (!/^0[237]\d{8}$/.test(value)) {
            error = "Numărul trebuie să înceapă cu 02, 03 sau 07 și să aibă exact 10 cifre";
            }
            setErrors((prev) => ({ ...prev, phone: error }));
            setFormData((prev) => ({ ...prev, phone: value }));
            return;
        }


   // ------------------- Adresa -------------------
  if (["city", "address_details", "postalCode"].includes(name)) {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value || "", 
      },
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    return;
  }


  // ------------------- Info profesionale -------------------
   if (["workplace", "domain", "institution", "otherDetails", "profession"].includes(name)) {
    if (formData.occupation.profession === "Angajat" && name === "workplace") {
        if (!value.trim()) error = "Introduceți locul de muncă";
    }
    if (formData.occupation.profession === "Angajat" && name === "domain") {
        if (!value.trim()) error = "Selectează domeniul de activitate";
    }
    if ((formData.occupation.profession === "Student" || formData.occupation.profession === "Elev") && name === "institution") {
        if (!value.trim()) error = "Introduceți instituția de învățământ";
    }
    if (formData.occupation.profession === "Altul" && name === "otherDetails") {
        if (!value.trim()) error = "Introduceți detalii relevante";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    setFormData((prev) => ({
        ...prev,
        occupation: { ...prev.occupation, [name]: value },
    }));
    return;
    }

    // ------------------- Info medicale -------------------
    if (["familyDoctor", "insurance", "bloodGroup", "rh"].includes(name)) {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        return;
    }

    // ------------------- Contact de urgenta -------------------
    if (["emergencyContact_fullName", "emergencyContact_relation", "emergencyContact_phone"].includes(name)) {
        const field = name.split("_")[1]; 
        setFormData((prev) => ({
            ...prev,
            emergencyContact: {
            ...prev.emergencyContact,
            [field]: value,
            },
        }));

        let error = "";

        // Validare telefon doar daca e completat ceva
        if (field === "phone") {
            if (value && !/^0[237]\d{8}$/.test(value)) {
            error = "Numărul trebuie să înceapă cu 02, 03 sau 07 și să aibă exact 10 cifre";
            }
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
        return;
    }
    
    // ------------------- Default (fallback) -------------------
    setErrors((prev) => ({ ...prev, [name]: error }));
    setFormData((prev) => ({ ...prev, [name]: value }));
};


    const handleFinalSubmit = async () => {
        const formDataUpload = new FormData();

        if (formData.profileImage instanceof File) {
            formDataUpload.append("profileImage", formData.profileImage);
        }

        //  Adaugă datele JSON
        formDataUpload.append("patientDataForm", JSON.stringify(formData));

        formDataUpload.append("oldProfileImage", formData.profileImageUrl || ""); 

        try {

            setLoading(true);
            setLoadingMessage("Se actualizează datele pacientului...");

            const res = await axios.put(
            `${backendUrl}/api/patient/update-patient-profile/${patientID}`,
            formDataUpload,
            { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (res.status === 200) {
            toast.success("Profilul a fost actualizat cu succes!");
            navigate(`/profil-pacient/${patientID}/informatii-personale`);
            }
        } catch (error) {
            console.error("Eroare la update profil pacient:", error);
            toast.error("Eroare la actualizare profil.");
        } finally {setLoading(false);}
        };


        //Validari pe sectiuni
        const validatePersonalInfo = async () => {
        const newErrors = {};

        // Validare format CNP
        if (!formData.cnp || formData.cnp.length !== 13) {
            newErrors.cnp = "CNP-ul trebuie să aibă 13 cifre";
            newErrors.birthDate = "Introdu CNP valid pentru a determina data nașterii";
            newErrors.age = "Introdu CNP valid pentru a determina vârsta";
        } else {
            try {
            const response = await axios.post(`${backendUrl}/api/patient/check-cnp`, {
                cnp: formData.cnp,
            });

            const { exists } = response.data;

            if (exists) {
                newErrors.cnp = "CNP-ul introdus aparține deja unui alt pacient.";
                toast.error("CNP-ul trebuie să fie unic. Există deja un pacient cu acest CNP.");
            }
            } catch (error) {
            const message = error?.response?.data?.message || "Eroare la verificarea CNP-ului.";
            toast.error(message);
            console.error("Eroare la verificarea CNP:", error);
            }
        }

        // Alte validari
        if (!formData.birthDate) {
            newErrors.birthDate = "Data nașterii nu a fost generată. Introdu CNP valid.";
        }

        if (!formData.age) {
            newErrors.age = "Vârsta nu a fost generată. Introdu CNP valid.";
        }

        if (!formData.gender) {
            newErrors.gender = "Genul este obligatoriu";
        }

        if (!formData.phone || !/^0[237]\d{8}$/.test(formData.phone)) {
            newErrors.phone = "Numărul trebuie să înceapă cu 02, 03 sau 07 și să aibă exact 10 cifre";
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
        };


      const validateAddressInfo = () => {
        const newErrors = {};

        //  Validare oras
        if (!formData.address.city || formData.address.city.trim() === "") {
            newErrors.city = "Orașul este obligatoriu";
        }

        //  Validare judet
        if (!formData.address.county) {
            newErrors.county = "Selectează județul";
        }

        //  Validare adresa completa
        if (!formData.address.address_details || formData.address.address_details.trim() === "" ) {
            newErrors.address_details = "Adresa completă este obligatorie";
        }

        //  Validare cod postal
        if ( (formData.address.postalCode && !/^\d{1,6}$/.test(formData.address.postalCode)) || formData.address.postalCode.trim() === "" ) {
            newErrors.postalCode = "Codul poștal trebuie să conțină doar cifre (max 6)";
        }

        //  Setam erorile
        setErrors((prev) => ({ ...prev, ...newErrors }));

        return Object.keys(newErrors).length === 0;
        };

      const validateProfessionalInfo = () => {
        const newErrors = {};
        let isValid = true;

        // Status profesional (obligatoriu)
        if (!formData.occupation.profession) {
            newErrors.profession  = "Selectează statusul profesional";
            isValid = false;
        }

        // daca e Angajat
        if (formData.occupation.profession === "Angajat") {
            if (!formData.occupation.workPlace || formData.occupation.workPlace.trim() === "") {
            newErrors.workplace = "Completează locul de muncă";
            isValid = false;
            }
            if (!formData.occupation.domain || formData.occupation.domain.trim() === "") {
            newErrors.domain = "Selectează domeniul de activitate";
            isValid = false;
            }
        }

        // daca e Student sau Elev
        if (
            (formData.occupation.profession === "Student" || formData.occupation.profession === "Elev") &&
            (!formData.occupation.institution || formData.occupation.institution.trim() === "")
        ) {
            newErrors.institution = "Completează instituția de învățământ";
            isValid = false;
        }

        // daca e Altul
        if (
            formData.occupation.profession === "Altul" &&
            (!formData.occupation.otherDetails || formData.occupation.otherDetails.trim() === "")
        ) {
            newErrors.otherDetails = "Completează detaliile";
            isValid = false;
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return isValid;
        };

      const validateMedicalInfo = () => {
        let isValid = true;
        const newErrors = {};

        // Grupa sanguina
        if (!formData.bloodGroup) {
            newErrors.bloodGroup = "Selectează grupa sanguină";
            isValid = false;
        }

        // Rh
        if (!formData.rh) {
            newErrors.rh = "Selectează Rh-ul";
            isValid = false;
        }

        // Asigurare
        if (!formData.insurance) {
            newErrors.insurance = "Selectează tipul asigurării";
            isValid = false;
        }

        const { fullName, relation, phone } = formData.emergencyContact;

        const isAnyEmergencyFilled = fullName || relation || phone;

        if (isAnyEmergencyFilled) {
            if (!fullName || fullName.trim() === "") {
            newErrors.emergencyContact_fullName = "Completează numele persoanei de contact";
            isValid = false;
            }
            if (!relation || relation.trim() === "") {
            newErrors.emergencyContact_relation = "Completează relația";
            isValid = false;
            }
            if (!phone || !/^0[237]\d{8}$/.test(phone)) {
            newErrors.emergencyContact_phone = "Numărul trebuie să înceapă cu 02, 03 sau 07 și să aibă exact 10 cifre";
            isValid = false;
            }
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return isValid;
        };


    //===============================================


  return (
    <div className="min-h-screen flex items-center justify-center relative">
         
         {/* Buton colt dreapta sus */}
           <button
             onClick={() => navigate("/")}
             className="absolute top-3 right-3 btn-outline-purple"
           >
             <FontAwesomeIcon icon={faRightToBracket} className="text-purple-700" />
             Înapoi la site-ul principal
           </button>
         
         {/* Background image */}
        <div className="absolute inset-0 -z-10">
            <img
                src={assets.login_img}
                alt="Medical Background"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"></div>
        </div>

        {/* Container pt info */}
        <div className="w-full px-7 sm:px-10 md:px-40 lg:px-70 py-7 sm:py-3 md:py-7 lg:py-15">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl md:p-8 p-3">
            
                <h2 className="md:text-2xl text-xl text-center text-purple-900 font-extrabold mb-10">
                    <FontAwesomeIcon icon={faTasks} className="mr-2" />
                    Completează fiecare secțiune pentru a continua
                </h2>

                {/* Tab Selector */}
                <div className="flex mb-6 bg-gray-200 rounded-xl p-1 md:text-base text-base">
                    <button
                    
                    className={`w-1/4 p-2 flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer 
                    ${
                        activeTab === "personal"
                        ? "bg-white text-purple-700 shadow-lg"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    >
                        <FaUser  className='mr-2'/>
                        <span className="hidden md:inline">Personale</span>
                    </button>
                    
                    <button
                    
                    className={`w-1/4 p-2 flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer  
                        ${
                        activeTab === "address"
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    >
                        <FaHome className='mr-2'/>
                        <span className="hidden md:inline" > Domiciliu </span>
                    </button>

                    <button
                
                    className={`w-1/4 p-2 flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer  
                    ${
                        activeTab === "professional"
                        ? "bg-white text-purple-700 shadow-lg"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    >
                        <FaBriefcase className='mr-2'/>
                        <span className="hidden md:inline"> Profesionale </span>
                    </button>

                    <button
                
                    className={`w-1/4 p-2 flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer  
                    ${
                        activeTab === "medical"
                        ? "bg-white text-purple-700 shadow-lg"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    >
                        <FaHeartbeat className='mr-2'/>
                        <span className="hidden md:inline" > Medicale </span>
                    </button>
                </div>

                {/* Informatii personale */}
                {activeTab === "personal" && (
                <div className="space-y-5 mt-4">
                   <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fotografie de profil
                        </label>

                        <div className="flex items-center">
                            <div
                            className={`w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4 border`}
                            >
                            {mainImagePreview ? (
                                <img src={mainImagePreview} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <i className="fas fa-user-md text-gray-400 text-3xl"></i>
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
                                    setFormData((prev) => ({ ...prev, profileImage: file }));
                                    setErrors((prev) => ({ ...prev, profileImage: "" }));

                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                    setMainImagePreview(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => document.getElementById('profileImageInput').click()}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md text-sm cursor-pointer whitespace-nowrap"
                            >
                                + Adaugă imagine
                            </button>
                            </div>
                        </div>

                        
                        </div>
                    {/* Nume + Prenume */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div>
                        <label className="block text-sm font-medium mb-0 ml-1">Nume *</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            className="w-full border bg-gray-100 rounded px-3 py-2 text-gray-600 cursor-not-allowed"
                            readOnly
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium mb-0 ml-1">Prenume *</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            className="w-full border bg-gray-100 rounded px-3 py-2 text-gray-600 cursor-not-allowed"
                            readOnly
                        />
                        </div>
                    </div>

                    {/* Email si Telefon */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div >
                            <label className="block text-sm font-medium mb-0 ml-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="w-full border bg-gray-100 rounded px-3 py-2 text-gray-600 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Număr de telefon *</label>
                            <input
                            
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                ${
                                    errors.phone ? "border-red-500" : "border" }
                                `}
                                placeholder="ex: 07xxxxxxxx"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-0">{errors.phone}</p>}
                    </div>

                    </div>

                    {/* CNP si Gen */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            <div>
                            <label className="block text-sm font-medium mb-0 ml-1">CNP *</label>
                            <input
                                type="text"
                                name="cnp"
                                value={formData.cnp}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                ${
                                    errors.cnp ? "border-red-500" : "border" }
                                `}
                                placeholder="ex: 5010205223456"
                            />
                            {errors.cnp && <p className="text-red-500 text-xs mt-0">{errors.cnp}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Gen *</label>
                            <CustomSelect
                                options={selectOptions.genderOptions}
                                value={formData.gender}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, gender: value }));
                                    setErrors(prev => ({ ...prev, gender: "" }));
                                }}
                                placeholder="Selectează genul"
                                />
                            {errors.gender && <p className="text-red-500 text-xs mt-0">{errors.gender}</p>}
                        </div>


                    </div>

                    {/* Data nasteri si Varsta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Data nașterii *</label>
                            <input
                                type="text"
                                name="birthDate"
                                value={formData.birthDate}
                                readOnly
                                disabled
                                className={`w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed
                                ${
                                        errors.birthDate ? "border-red-500" : "border" }
                                    `}
                                placeholder= "dd-mm-yyyy"
                                />
                                
                            {errors.birthDate && <p className="text-red-500 text-xs mt-0">{errors.birthDate}</p>}

                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Vârstă</label>
                            <input
                            type="text"
                            name="age"
                            value={formData.age}
                            readOnly
                            disabled
                                className={`w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed
                                ${
                                        errors.age ? "border-red-500" : "border" }
                                    `}
                            placeholder= "ex: 20"
                            />
                            {errors.age && <p className="text-red-500 text-xs mt-0">{errors.age}</p>}

                        </div>
                    </div>

                    {/* Butoane */}
                    <div className="mt-6 flex justify-end flex-row">
                        <button
                            className="px-6 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                            onClick={async () => {
                                const isValid = await validatePersonalInfo();
                                if (isValid) {
                                    setActiveTab("address");
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                    toast.success("Date personale valide!");
                                    console.log("Form pana acum: ", formData);
                                } else {
                                    toast.error("Date personale invalide!");
                                }
                                }}
                        >
                            Continuă
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>

                    

                </div>
                )}

                {/* Informatii de domiciliu */}
                {activeTab === "address" && (
                <div className="space-y-5 mt-4">
                    {/* Oras si Judet */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Oraș *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.address.city}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.city ? "border-red-500" : "border" }
                                    `}
                                    placeholder='Arad'
                            />
                            {errors.city && <p className="text-red-500 text-xs mt-0">{errors.city}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Județ *</label>
                            <CustomSelect
                                name="county"
                                options={selectOptions.counties}
                                value={formData.address.county}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev,  address: {...prev.address, county: value}}));
                                    setErrors(prev => ({ ...prev, county: "" }));
                                }}
                                placeholder="Selectează județul"
                            />
                            {errors.county && <p className="text-red-500 text-xs mt-0">{errors.county}</p>}
                        </div>
                    </div>

                    {/* Detalii adresa si Cod Postal */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div >
                            <label className="block text-sm font-medium mb-0 ml-1">Adresă completă *</label>
                            <input
                                type="text"
                                name="address_details"
                                value={formData.address.address_details}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.address_details ? "border-red-500" : "border" }
                                    `}
                                placeholder='ex: Str. Libertății nr. 10, bl. A, ap. 5'
                            />
                            {errors.address_details && <p className="text-red-500 text-xs mt-0">{errors.address_details}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Cod poștal *</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.address.postalCode}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.postalCode ? "border-red-500" : "border" }
                                    `}
                                    placeholder="ex: 300100"
                            />
                            {errors.postalCode && <p className="text-red-500 text-xs mt-0">{errors.postalCode}</p>}
                        </div>
                    </div>
                     

                    {/* Butoane */}
                    <div className="mt-6 flex flex-row justify-between gap-4">
                        <button
                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                            onClick={() => setActiveTab("personal")}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Înapoi
                        </button>

                        <button
                            className="px-6 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                            onClick={() => {
                            if (validateAddressInfo()) {
                                setActiveTab("professional");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                toast.success("Date de domiciliu valide!");
                                console.log("Form pana acum: ", formData)
                            }
                            else {toast.error("Date de domiciliu invalide!");}
                            }}
                        >
                            Continuă
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>



                </div>
                )}

                {/* Informatii profesionale */}
                {activeTab === "professional" && (
                <div className="space-y-5 mt-4">

                    {/* Profesie */}
                    <div className='mt-4'>
                        <label className="block text-sm font-medium mb-0 ml-1">Status profesional *</label>
                        <CustomSelect
                            name="profession"
                            options={selectOptions.professionalStatus}
                            value={formData.occupation.profession}
                            onChange={(value) => {
                                setFormData(prev => ({
                                ...prev,
                                occupation: { ...prev.occupation, profession: value }
                                }));
                                setErrors(prev => ({ ...prev, profession: "" }));
                            }}
                            placeholder="Selectează statusul profesional"
                            />
                       {errors.profession && <p className="text-red-500 text-xs mt-0">{errors.profession}</p>}
                    </div>

                     {/* daca e Angajat */}
                    {formData.occupation.profession === "angajat" && (
                        <>
                            <div className="mt-4">
                            <label className="block text-sm font-medium mb-0 ml-1">Locul de muncă *</label>
                            <input
                                type="text"
                                name="workplace"
                                value={formData.occupation.workplace}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.workplace ? "border-red-500" : "border" }
                                    `}
                            />
                            {errors.workplace && (
                                <p className="text-red-500 text-xs mt-0">{errors.workplace}</p>
                            )}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-0 ml-1">Domeniul de activitate *</label>
                                
                                <CustomSelect
                                    name="field"
                                    options={selectOptions.professionalFields}
                                    value={formData.occupation.domain}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev,  occupation: {...prev.occupation, domain: value}}));
                                        setErrors(prev => ({ ...prev, domain: "" }));
                                    }}
                                    placeholder="Selectează domeniul"
                                />
                                {errors.domain && (
                                <p className="text-red-500 text-xs mt-0">{errors.domain}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* daca e Student sau Elev */}
                    {(formData.occupation.profession === "student" || formData.occupation.profession === "elev") && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-0 ml-1">Instituția de învățământ *</label>
                            <input
                                type="text"
                                name="institution"
                                value={formData.occupation.institution}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.institution ? "border-red-500" : "border" }
                                    `}
                            />
                            {errors.institution && (
                            <p className="text-red-500 text-xs mt-0">{errors.institution}</p>
                            )}
                        </div>
                    )}

                    {/* daca e Altul */}
                    {formData.occupation.profession === "altul" && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-0 ml-1">Alte detalii *</label>
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
                        </div>
                    )}

                    {/*Butoane */}
                    <div className="mt-6 flex flex-row justify-between gap-4">
                        <button
                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                            onClick={() => setActiveTab("address")}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Înapoi
                        </button>

                        <button
                            className="px-6 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                            onClick={() => {
                            if (validateProfessionalInfo()) {
                                setActiveTab("medical");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                toast.success("Date profesionale valide!");
                                console.log("Form pana acum: ", formData)
                            }
                            else {toast.error("Date profesionale invalide!");}
                            }}
                        >
                            Continuă
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                
                </div>
                )}

                {/* Informatii medicale */}
                {activeTab === "medical" && (
                <div className="space-y-5 mt-4">

                    {/* Grupa sange si Rh */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Grupă sanguină *</label>
                                <CustomSelect
                                    options={selectOptions.bloodTypes}
                                    value={formData.bloodGroup}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, bloodGroup: value }));
                                        setErrors(prev => ({ ...prev, bloodGroup: "" }));
                                    }}
                                    placeholder="Selectează grupa sanguină"
                                    />
                                {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Grupă Rh *</label>
                                <CustomSelect
                                    options={selectOptions.bloodTypesRH}
                                    value={formData.rh}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, rh: value }));
                                        setErrors(prev => ({ ...prev, rh: "" }));
                                    }}
                                    placeholder="Selectează Rh"
                                    />
                                {errors.rh && <p className="text-red-500 text-xs mt-1">{errors.rh}</p>}
                        </div>

                    </div>

                    {/* Asigurare si Medic familie*/}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Asigurare *</label>
                                <CustomSelect
                                    options={selectOptions.insurance}
                                    value={formData.insurance}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, insurance: value }));
                                        setErrors(prev => ({ ...prev, insurance: "" }));
                                    }}
                                    placeholder="Selectează tipul asigurări "
                                    />
                                {errors.insurance && <p className="text-red-500 text-xs mt-1">{errors.insurance}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Medic de familie </label>
                            <input
                                type="text"
                                name="familyDoctor"
                                value={formData.familyDoctor}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.familyDoctor ? "border-red-500" : "border" }
                                    `}
                                placeholder='ex: Popa Camelia'
                            />
                            {errors.familyDoctor && (
                                <p className="text-red-500 text-xs mt-0">{errors.familyDoctor}</p>
                            )}
                            
                        </div>

                    </div>

                        {/* Persoana de contact*/}
                   <div className="text-base font-semibold mb-0 ml-1 text-gray-800">
                        Persoană de contact
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                         <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Nume </label>
                            <input
                                type="text"
                                name="emergencyContact_fullName"
                                value={formData.emergencyContact.fullName}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.emergencyContact_fullName ? "border-red-500" : "border" }
                                    `}
                                placeholder='ex: Popa Camelia'
                            />
                            {errors.emergencyContact_fullName && (
                                <p className="text-red-500 text-xs mt-0">{errors.emergencyContact_fullName}</p>
                            )}
                            
                        </div>

                         <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Relație</label>
                            <input
                                type="text"
                                name="emergencyContact_relation"
                                value={formData.emergencyContact.relation}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.emergencyContact_relation ? "border-red-500" : "border" }
                                    `}
                                placeholder='ex: fiică, mamă, verișor, prieten ...'
                            />
                            {errors.emergencyContact_relation && (
                                <p className="text-red-500 text-xs mt-0">{errors.emergencyContact_relation}</p>
                            )}
                            
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-0 ml-1">Telefon</label>
                            <input
                                type="text"
                                name="emergencyContact_phone"
                                value={formData.emergencyContact.phone}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2
                                    ${
                                        errors.emergencyContact_phone ? "border-red-500" : "border" }
                                    `}
                                placeholder='ex: 07xxxxxxxx'
                            />
                            {errors.emergencyContact_phone && (
                                <p className="text-red-500 text-xs mt-0">{errors.emergencyContact_phone}</p>
                            )}
                            
                        </div>

                    </div>

                    {/* Alergii */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alergii</label>
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
                                x
                                </button>
                            </div>
                            ))}

                            {errors.allergies && (
                            <p className="text-red-500 text-sm mt-1">{errors.allergies}</p>
                            )}
                        </div>
                    </div>

                    {/*Butoane */}
                    <div className="mt-6 flex flex-row justify-between gap-4">
                        <button
                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                            onClick={() => setActiveTab("professional")}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Înapoi
                        </button>

                        <button
                            className="px-6 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                            onClick={() => {
                                if (validateMedicalInfo()) {
                                handleFinalSubmit();
                                } else {
                                toast.error("Date medicale invalide!");
                                }
                            }}
                            >
                            Finalizează
                            </button>
                    </div>
                </div>
                )}
            </div>
        </div>



        {loading && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-xl shadow-lg flex flex-col items-center gap-3 animate-fade-in">
                <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-700 font-medium">{loadingMessage}</p>
            </div>
          </div>
        )}
    </div>
  )
}

export default FinishRegistration