import React, { useState, useEffect, useRef, useContext } from "react";

import axios from "axios";

import { useNavigate, useParams } from "react-router-dom";
import { FaUserMd, FaGraduationCap, FaFileAlt, FaLock, FaHandshake, FaTools } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faBriefcase, faCheckCircle, faEye, faEyeSlash, faHandshake, faIdBadge, faSave, faTasks, faTools, faUser, faUserDoctor } from "@fortawesome/free-solid-svg-icons";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContex";

import {  addItem, removeItem, addFaq, removeFaq } from '../../utils/formUtils';


import { validateCNP, extractBirthDateAndAge } from "../../utils/validateCNP";

import CustomSelect from "../../components/customSelect";

import { toast } from "react-toastify";
import { useCheckDoctorAccess } from "../../accessControl/useCheckDoctorAccess ";

const CompletareProfil = () => {
  

  useCheckDoctorAccess();

  const { doctorID } = useParams();


  const { backendUrl } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("personal");

  const [doctorData, setDoctorData] = useState({});
  const [profileData, setProfileData] = useState({});
  const [doctorLocationData, setDoctorLocationData] = useState({})


  const [profileImageFile, setProfileImageFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);

   const [mainImagePreview, setMainImagePreview] = useState(null); 
  

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  

  const navigate = useNavigate();

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setDoctorDataForm((prev) => ({
      ...prev,
      profileImage: file
    }));

      setErrors((prev) => ({ ...prev, mainImage: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
          setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      }
    };

  const fetchData = async () => {
   
      try {
        setLoading(true);
        setLoadingMessage("Se încarcă datele medicului...");

        const res = await axios.get(`${backendUrl}/api/doctor/get-all-doctor-infos/${doctorID}`);
        setDoctorData(res.data.doctor);
        setProfileData(res.data.profile || {});
        setDoctorLocationData(res.data.locations);

        console.log("Res complet:", res.data);

      } catch (err) {
        toast.error("Eroare încărcarea datelor.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {

    if (!doctorID) return; 
   
    fetchData();
  }, [doctorID]);

  const genderOptions = [
    { value: 'masculin', label: 'Masculin' },
    { value: 'feminin', label: 'Feminin' },
    { value: 'altul', label: 'Altul' },
  ];

  const [newExperience, setNewExperience] = useState("");
  const [newStudy, setNewStudy] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const [newAbout, setNewAbout] = useState("");
  const [newExpertise, setNewExpertise] = useState("");
  const [newApproach, setNewApproach] = useState("");
  const [newRoleInClinic, setNewRoleInClinic] = useState("");

  // ------------------------------------------------------------

  // Resetare parola --------------------------------------------
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordStrength = (password) => {
    let strength = 0;
    if (password.length > 6) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);

    if (strength >= 2) {
      setErrors((prev) => ({ ...prev, newPassword: "" }));
    }
  };


  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "Slabă";
    if (passwordStrength === 1) return "Ok";
    if (passwordStrength === 2) return "Bună";
    if (passwordStrength === 3) return "Puternică";
    return "Foarte Puternică";
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-red-500";
    if (passwordStrength === 1) return "bg-orange-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-green-500";
    return "bg-green-600";
  };

  // ------------------------------------------------------------


  const [doctorDataForm, setDoctorDataForm] = useState({
    doctorID: doctorData.doctorID,
    firstName: doctorData.firstName,
    lastName: doctorData.lastName,
    profileImage: "",
    address: "",
    type: doctorData.type,
    gender: "",
    cnp: "",
    birthDate: "",
    age: "",
    specialities: [],        
    certifications: [],       
    studies: [],              
    experience: [],         
    languagesSpoken: [],    
    parafaCode: "",
    status: "activ"  
  });

  const [doctorDataProfileForm, setDoctorProfileDataForm] = useState( {
      about: [],
      expertise: [],
      approach: [],
      roleInClinic: [],
      cvLink: ""
  });

  const [errors, setErrors] = useState({});

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  

   const handleChange = (e) => {
        const { name, value } = e.target;
        let error = "";
      
        if (name === "cnp") {
          const errorMsg = validateCNP(
            value);
          error = errorMsg;

          if (!errorMsg && value.length === 13) {
            const { birthDate, age } = extractBirthDateAndAge(value);

            setDoctorDataForm((prev) => ({
              ...prev,
              cnp: value,
              birthDate: birthDate || "",
              age: age || "",
            }));
          } else {
            setDoctorDataForm((prev) => ({
              ...prev,
              cnp: value,
              birthDate: "",
              age: "",
            }));
          }

        }
        setDoctorDataForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    const validatePersonalInfo = () => {
        const newErrors = {};
      
        if (!doctorDataForm.cnp || doctorDataForm.cnp.length !== 13) {
          newErrors.cnp = "CNP-ul trebuie să aibă 13 cifre";
        }
      
        if (!doctorDataForm.gender) {
          newErrors.gender = "Genul este obligatoriu";
        }
      
        if (!doctorDataForm.address) {
          newErrors.address = "Adresa este obligatorie";
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validateProfessionaInfo = () => {
      const newErrors = {};

      if (!/^\d{6}$/.test(doctorDataForm.parafaCode)) {
        newErrors.parafaCode = "Parafa trebuie să conțină exact 6 cifre.";
      }

      if (!doctorDataForm.experience || doctorDataForm.experience.length === 0) {
        newErrors.experience = "Trebuie să adaugi cel puțin o experiență.";
      }

      if (!doctorDataForm.studies || doctorDataForm.studies.length === 0) {
        newErrors.studies = "Trebuie să adaugi cel puțin un studiu.";
      }

      if (!doctorDataForm.certifications || doctorDataForm.certifications.length === 0) {
        newErrors.certifications = "Trebuie să adaugi cel puțin o certificare.";
      }

      if (!doctorDataForm.languagesSpoken || doctorDataForm.languagesSpoken.length === 0) {
        newErrors.languagesSpoken = "Trebuie să adaugi cel puțin o limbă vorbită.";
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));
      return Object.keys(newErrors).length === 0;
    };

    const validateDoctorProfileForm = () => {
      const newErrors = {};

      if (!doctorDataProfileForm.about || doctorDataProfileForm.about.length === 0) {
        newErrors.about = "Trebuie să adaugi cel puțin o informație la 'Despre medic'.";
      }

      if (!doctorDataProfileForm.expertise || doctorDataProfileForm.expertise.length === 0) {
        newErrors.expertise = "Trebuie să adaugi cel puțin o expertiză.";
      }

      if (!doctorDataProfileForm.approach || doctorDataProfileForm.approach.length === 0) {
        newErrors.approach = "Trebuie să adaugi cel puțin o abordare.";
      }

      if (!doctorDataProfileForm.roleInClinic || doctorDataProfileForm.roleInClinic.length === 0) {
        newErrors.roleInClinic = "Trebuie să adaugi cel puțin un rol în clinică.";
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));
      return Object.keys(newErrors).length === 0;
    };

    const validateSettings = () => {
      const newErrors = {};

      if (!newPassword) {
        newErrors.newPassword = "Introduceți o parolă nouă.";
      } else {
        if (newPassword !== confirmNewPassword) {
          newErrors.confirmNewPassword = "Parolele nu coincid.";
        }
        if (passwordStrength < 2) {
          newErrors.newPassword = "Parola este prea slabă.";
        }
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));

      if (Object.keys(newErrors).length === 0) {
        setErrors((prev) => ({
          ...prev,
          newPassword: "",
          confirmNewPassword: ""
        }));
      }

      return Object.keys(newErrors).length === 0;
    };

    const handleFinalSubmit = async () => {
      
      const isPersonalValid = validatePersonalInfo();
      const isProfessionalValid = validateProfessionaInfo();
      const isProfileValid = validateDoctorProfileForm();
      const isSettingsValid = validateSettings();

      if (!isPersonalValid || !isProfessionalValid || !isProfileValid || !isSettingsValid) {
        toast.error("Te rugăm să corectezi erorile înainte de a trimite.");
        return;
      }

      const formData = new FormData();

      if (doctorDataForm.profileImage instanceof File) {
        formData.append("profileImage", doctorDataForm.profileImage);
      }

      formData.append("doctorDataForm", JSON.stringify(doctorDataForm));
      formData.append("doctorDataProfileForm", JSON.stringify(doctorDataProfileForm));
      formData.append("newPassword", newPassword);

       try {
        const res = await axios.put(
          `${backendUrl}/api/doctor/update-all-doctor-profile/${doctorID}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.status === 200) {
          toast.success("Profilul a fost actualizat cu succes!");
          navigate(`/profil-medic/${doctorID}/informatii-personale`); 
        }

      } catch (error) {
        console.error("Eroare la trimiterea formularului:", error);
        toast.error("Eroare la actualizare.");
      }
    }

  if (!doctorID) return <p>Se verifică accesul...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center relative">
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
              
              {/* Intro */}
              <h2 className="md:text-2xl text-xl text-center text-purple-900 font-extrabold mb-10">
                  <FontAwesomeIcon icon={faHandshake} className="mr-2" />
                  Bine ai venit Dr. {doctorData.lastName} {doctorData.firstName}
                  <p className="md:text-xl text-lg"> 
                    <FontAwesomeIcon icon={faIdBadge} className="mr-2" />
                    Medic {doctorData.type} 
                  </p>
                  <p className="text-lg"> ~ Vă rugăm să completați profilul dumneavostră ~ </p>
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
                      <FontAwesomeIcon icon={faUserDoctor}  className='mr-2'/>
                      <span className="hidden md:inline">Personale</span>
                </button>

                <button
                className={`w-1/4 p-2 flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer  
                ${
                    activeTab === "profile"
                    ? "bg-white text-purple-700 shadow-lg"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                >
                      <FontAwesomeIcon icon={faUserDoctor} className='mr-2'/>
                      <span className="hidden md:inline"> Despre medic </span>
                </button>
                  
                <button
                
                className={`w-1/4 p-2 flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer  
                    ${
                    activeTab === "professional"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                >
                      <FontAwesomeIcon icon={faBriefcase} className='mr-2'/>
                    <span className="hidden md:inline" > Profesionale </span>
                </button>        

                <button
                
                className={`w-1/4 p-2 flex items-center justify-center rounded-xl font-medium transition-all duration-300 cursor-pointer  
                ${
                    activeTab === "setting"
                    ? "bg-white text-purple-700 shadow-lg"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                >
                      <FontAwesomeIcon icon={faTools} className='mr-2'/>
                    <span className="hidden md:inline" > Setări</span>
                </button>
              </div>

              {/* Informatii personale */}
              {activeTab === "personal" && (
                <div className="space-y-5 mt-4">

                  {/* Imagine profil */}
                  <div>
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
                        {errors.mainImage && <p className="text-red-500 text-xs mt-1">{errors.mainImage}</p>}

                        <div>
                        <input
                            type="file"
                            accept="image/*"
                            id="mainImageInput"
                            className="hidden"
                            onChange={handleMainImageChange}
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById('mainImageInput').click()}
                            className="btn-outline-purple-little-little"
                        >
                            + Adaugă imagine
                        </button>
                        </div>
                    </div>
                  </div>

                   {/* Gen */}
                  <div className="mt-4">
                      <label className="block text-sm font-medium mb-0 ml-1">Gen *</label>
                       <CustomSelect
                          options={genderOptions}
                          value={doctorDataForm.gender}
                          onChange={(value) => {
                            setDoctorDataForm(prev => ({ ...prev, gender: value }));
                            setErrors(prev => ({ ...prev, gender: "" }));
                          }}
                          placeholder="Selectează genul"
                        />
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>

                  {/* Adresa */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-0 ml-1">Adresă*</label>
                    <input
                        type="text"
                        name="address"
                        placeholder="str. X nr. y"
                        value={doctorDataForm.address}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2
                        ${
                            errors.address ? "border-red-500" : "border" }
                        `}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                  {/* CNP */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-0 ml-1">CNP *</label>
                    <input
                    
                        type="text"
                        name="cnp"
                        value={doctorDataForm.cnp}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2
                        ${
                            errors.cnp ? "border-red-500" : "border" }
                        `}
                    />
                    {errors.cnp && <p className="text-red-500 text-sm mt-1">{errors.cnp}</p>}
                  </div>

                  {/* Data nasteri */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-0 ml-1">Data nașterii</label>
                    <input
                      type="text"
                      name="birthDate"
                      value={doctorDataForm.birthDate}
                      readOnly
                      disabled
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* varsta */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-0 ml-1">Vârstă</label>
                    <input
                      type="text"
                      name="age"
                      value={doctorDataForm.age}
                      readOnly
                      disabled
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Butoane */}
                  <div className="mt-6 flex justify-end flex-row">
                      <button
                        className="px-6 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                        onClick={() => {
                        if (validatePersonalInfo()) {
                            setActiveTab("profile");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            console.log("ok")
                        }
                        else { console.log("not ok")}
                        }}
                      >
                          Continuă
                          <FontAwesomeIcon icon={faArrowRight} />
                      </button>
                  </div>


                </div> 
              )}

              {/* Despre medic */}
              {activeTab === "profile" && (
                <div className="space-y-5 mt-4">
                  
                  {/* Despre */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Despre medic</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAbout}
                        onChange={(e) => setNewAbout(e.target.value)}
                        className="border p-2 rounded text-sm flex-1"
                        placeholder="ex. Sunt un medic dedicat pacientului..."
                      />
                      <button
                        type="button"
                        className="btn-outline-purple-little-little"
                        onClick={() => {
                          addItem(newAbout, setNewAbout, doctorDataProfileForm.about, (value) =>
                            setDoctorProfileDataForm(prev => ({ ...prev, about: value }))
                          );
                          setErrors(prev => ({ ...prev, about: "" }));
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorDataProfileForm.about.map((item, index) => (
                        <div key={index} className="bg-gray-200 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                          {item}
                          <button onClick={() => removeItem(index, doctorDataProfileForm.about, (value) =>
                            setDoctorProfileDataForm(prev => ({ ...prev, about: value }))
                          )} className="text-gray-800 font-medium text-sm hover:text-red-600">×</button>
                        </div>
                      ))}
                    </div>
                    {errors.about && <p className="text-red-500 text-sm mt-1">{errors.about}</p>}
                  </div>

                  {/* Expertiza */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expertiză</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        className="border p-2 rounded text-sm flex-1"
                        placeholder="ex. Cardiologie intervențională"
                      />
                      <button
                        type="button"
                        className="btn-outline-purple-little-little"
                        onClick={() => {
                          addItem(newExpertise, setNewExpertise, doctorDataProfileForm.expertise, (value) =>
                            setDoctorProfileDataForm(prev => ({ ...prev, expertise: value }))
                          );
                          setErrors(prev => ({ ...prev, expertise: "" }));
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorDataProfileForm.expertise.map((item, index) => (
                        <div key={index} className="bg-gray-200 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                          {item}
                          <button onClick={() => removeItem(index, doctorDataProfileForm.expertise, (value) =>
                            setDoctorProfileDataForm(prev => ({ ...prev, expertise: value }))
                          )} className="text-gray-800 font-medium text-sm hover:text-red-600">×</button>
                        </div>
                      ))}
                    </div>
                    {errors.expertise && <p className="text-red-500 text-sm mt-1">{errors.expertise}</p>}
                  </div>

                  {/* Abordare */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abordare</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newApproach}
                        onChange={(e) => setNewApproach(e.target.value)}
                        className="border p-2 rounded text-sm flex-1"
                        placeholder="ex. Abordare empatică, centrată pe pacient"
                      />
                      <button
                        type="button"
                        className="btn-outline-purple-little-little"
                        onClick={() => {
                          addItem(newApproach, setNewApproach, doctorDataProfileForm.approach, (value) =>
                            setDoctorProfileDataForm(prev => ({ ...prev, approach: value }))
                          );
                          setErrors(prev => ({ ...prev, approach: "" }));
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorDataProfileForm.approach.map((item, index) => (
                        <div key={index} className="bg-gray-200 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                          {item}
                          <button onClick={() => removeItem(index, doctorDataProfileForm.approach, (value) =>
                            setDoctorProfileDataForm(prev => ({ ...prev, approach: value }))
                          )} className="text-gray-800 font-medium text-sm hover:text-red-600">×</button>
                        </div>
                      ))}
                    </div>
                    {errors.approach && <p className="text-red-500 text-sm mt-1">{errors.approach}</p>}
                  </div>

                  {/* Rol in clinia */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol în clinică</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newRoleInClinic}
                        onChange={(e) => setNewRoleInClinic(e.target.value)}
                        className="border p-2 rounded text-sm flex-1"
                        placeholder="ex. Coordonator departament cardiologie"
                      />
                      <button
                        type="button"
                        className="btn-outline-purple-little-little"
                        onClick={() => {
                          addItem(newRoleInClinic, setNewRoleInClinic, doctorDataProfileForm.roleInClinic, (value) =>
                            setDoctorProfileDataForm(prev => ({ ...prev, roleInClinic: value }))
                          );
                          setErrors(prev => ({ ...prev, roleInClinic: "" }));
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorDataProfileForm.roleInClinic.map((item, index) => (
                        <div key={index} className="bg-gray-200 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                          {item}
                          <button onClick={() => removeItem(index, doctorDataProfileForm.roleInClinic, (value) =>
                            setDoctorProfileDataForm(prev => ({ ...prev, roleInClinic: value }))
                          )} className="text-gray-800 hover:text-red-600">×</button>
                        </div>
                      ))}
                    </div>
                    {errors.roleInClinic && <p className="text-red-500 text-sm mt-1">{errors.roleInClinic}</p>}
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
                        if (validateDoctorProfileForm()) {
                          setActiveTab("professional");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                    >
                      Continuă
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
              </div>
              ) }
              
              {/* Profesionale */}
              {activeTab === "professional" &&  (
                <div className="space-y-5 mt-4"> 
                  {/* parafa (6 cifre) */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cod parafă *</label>
                    <input
                      type="text"
                      value={doctorDataForm.parafaCode}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{6}$/.test(value)) {
                          setDoctorDataForm(prev => ({ ...prev, parafaCode: value }));
                          setErrors(prev => ({ ...prev, parafaCode: "" }));
                        } else {
                          setDoctorDataForm(prev => ({ ...prev, parafaCode: value }));
                        }
                      }}
                      className="border p-2 rounded text-sm w-full"
                      placeholder="ex. 123456"
                    />
                    {errors.parafaCode && <p className="text-red-500 text-sm mt-1">{errors.parafaCode}</p>}
                  </div>

                  {/* Experienta */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experiență</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newExperience}
                        onChange={(e) => setNewExperience(e.target.value)}
                        className="border p-2 rounded text-sm flex-1"
                        placeholder="ex. 5 ani în chirurgie"
                      />
                      <button
                        type="button"
                        className="btn-outline-purple-little-little"
                        onClick={() => {
                        addItem(
                          newExperience,
                          setNewExperience,
                          doctorDataForm.experience,
                          (value) => setDoctorDataForm(prev => ({ ...prev, experience: value }))
                        );

                        setErrors(prev => ({ ...prev, experience: "" }));
                      }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorDataForm.experience.map((exp, index) => (
                        <div key={index} className="bg-gray-200 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                          {exp}
                          <button onClick={() => removeItem(index, doctorDataForm.experience, (value) =>
                            setDoctorDataForm(prev => ({ ...prev, experience: value }))
                          )} className="text-gray-800 hover:text-red-600">×</button>
                        </div>
                      ))}
                      {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                    </div>
                  </div>

                  {/* Studii */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Studii</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newStudy}
                        onChange={(e) => setNewStudy(e.target.value)}
                        className="border p-2 rounded text-sm flex-1"
                        placeholder="ex. UMF Carol Davila"
                      />
                      <button
                        type="button"
                        className="btn-outline-purple-little-little"
                        onClick={() => {
                          addItem(
                            newStudy,
                            setNewStudy,
                            doctorDataForm.studies,
                            (value) => setDoctorDataForm(prev => ({ ...prev, studies: value }))
                          );

                          setErrors(prev => ({ ...prev, studies: "" }));
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorDataForm.studies.map((item, index) => (
                        <div key={index} className="bg-gray-200 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                          {item}
                          <button onClick={() => removeItem(index, doctorDataForm.studies, (value) =>
                            setDoctorDataForm(prev => ({ ...prev, studies: value }))
                          )} className="text-gray-800 hover:text-red-600">×</button>
                        </div>
                      ))}
                      {errors.studies && <p className="text-red-500 text-sm mt-1">{errors.studies}</p>}
                    </div>
                  </div>

                  {/* certificari */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificări</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        className="border p-2 rounded text-sm flex-1"
                        placeholder="ex. ATLS, ACLS, PALS"
                      />
                      <button
                        type="button"
                        className="btn-outline-purple-little-little"
                        onClick={() => {
                          addItem(
                            newCertification,
                            setNewCertification,
                            doctorDataForm.certifications,
                            (value) => setDoctorDataForm(prev => ({ ...prev, certifications: value }))
                          );

                          setErrors(prev => ({ ...prev, certifications: "" }));
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorDataForm.certifications.map((item, index) => (
                        <div key={index} className="bg-gray-200 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                          {item}
                          <button onClick={() => removeItem(index, doctorDataForm.certifications, (value) =>
                            setDoctorDataForm(prev => ({ ...prev, certifications: value }))
                          )} className="text-gray-800 hover:text-red-600">×</button>
                        </div>
                      ))}
                      {errors.certifications && <p className="text-red-500 text-sm mt-1">{errors.certifications}</p>}
                    </div>
                  </div>

                  {/* Limbi Vorbite */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Limbi vorbite</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        className="border p-2 rounded text-sm flex-1"
                        placeholder="ex. Română, Engleză"
                      />
                      <button
                        type="button"
                        className="btn-outline-purple-little-little"
                        onClick={() => {
                          addItem(
                            newLanguage,
                            setNewLanguage,
                            doctorDataForm.languagesSpoken,
                            (value) => setDoctorDataForm(prev => ({ ...prev, languagesSpoken: value }))
                          );

                          setErrors(prev => ({ ...prev, languagesSpoken: "" }));
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorDataForm.languagesSpoken.map((item, index) => (
                        <div key={index} className="bg-gray-200 text-gray-800 font-medium px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                          {item}
                          <button onClick={() => removeItem(index, doctorDataForm.languagesSpoken, (value) =>
                            setDoctorDataForm(prev => ({ ...prev, languagesSpoken: value }))
                          )} className="text-gray-800 hover:text-red-600">×</button>
                        </div>
                      ))}
                      {errors.languagesSpoken && <p className="text-red-500 text-sm mt-1">{errors.languagesSpoken}</p>}
                    </div>
                  </div>

                  {/* Butoane */}
                  <div className="mt-6 flex flex-row justify-between gap-4">
                    <button
                      className="px-6 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                      onClick={() => setActiveTab("profile")}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} />
                      Înapoi
                    </button>

                    <button
                      className="px-6 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                      onClick={() => {
                        if (validateProfessionaInfo()) {
                          setActiveTab("setting");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                    >
                      Continuă
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </div>

              )}

              {/* Settings */}
              {activeTab === "setting" && (
                <div className="space-y-5 mt-4">
                  {/* Email (readonly) */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={doctorData.email || " "}
                      disabled
                      readOnly
                      className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Parola noua */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parolă nouă</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          handlePasswordStrength(e.target.value); // 👈 vezi funcția mai jos
                        }}
                        className={`w-full border rounded px-3 py-2 ${errors.newPassword ? "border-red-500" : "border"}`}
                        placeholder="Introdu o parolă nouă"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                          className="text-gray-400"
                        />
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                  </div>

                  {/* Confirmare parola nouă */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmă parola</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={`w-full border rounded px-3 py-2 ${errors.confirmNewPassword ? "border-red-500" : "border"}`}
                        placeholder="Confirmă parola nouă"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      >
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEye : faEyeSlash}
                          className="text-gray-400"
                        />
                      </button>
                    </div>
                    {errors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>}
                  </div>

                  {/* Puterea parolei */}
                  {newPassword && (
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between">
                        <div className="text-xs text-gray-500">Puterea parolei:</div>
                        <div
                          className={`text-xs font-medium ${
                            passwordStrength <= 1
                              ? "text-red-500"
                              : passwordStrength === 2
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {getStrengthLabel()}
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStrengthColor()} transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Folosiți peste 8 caractere cu un amestec de litere, numere și simboluri
                      </div>
                    </div>
                  )}

                  {/* Butoane */}
                  <div className="mt-6 flex flex flex-row justify-between gap-4">
                      {/* Inapoi */}
                      <button
                          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition w-40 sm:w-44 md:w-48 flex items-center justify-center gap-2"
                          onClick={() => {
                          setActiveTab("professional");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                      >
                          <FontAwesomeIcon icon={faArrowLeft} />
                          Înapoi
                      </button>

                      {/* Finalizare */}
                      <button
                        className="px-6 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition w-44 flex items-center justify-center gap-2"
                          onClick={handleFinalSubmit}
                      >
                          Finalizează 
                          <FontAwesomeIcon icon={faCheckCircle} />
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

export default CompletareProfil