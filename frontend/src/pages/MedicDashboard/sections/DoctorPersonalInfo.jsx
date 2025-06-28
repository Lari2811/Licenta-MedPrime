import React, { useState, useEffect, useRef, useContext } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faBriefcase,  faClock,  faHospital, faMapMarkerAlt, faPenToSquare, faStethoscope,  faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";
import { useCheckDoctorAccess } from '../../../accessControl/useCheckDoctorAccess '

import CustomSelect from "../../../components/customSelect";
import { selectOptions } from "../../../utils/selectOptions";
import { ziuaCorecta } from "../../../utils/ziProgram";
import { assets } from "../../../assets/assets";

const DoctorPersonalInfo = () => {

  
  useCheckDoctorAccess();

  const { backendUrl } = useContext(AppContext);

  const { doctorID } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  


  const [doctorData, setDoctorData] = useState({});
  const [doctorProfileData, setDoctorProfileData] = useState({});
  const [doctorLocationData, setDoctorLocationData] = useState({})
  const [specialitiesDoctorData, setSpecialitiesDoctorData] = useState({})

  const [initialDoctorData, setInitialDoctorData] = useState({});
  const [initialDoctorProfileData, setInitialDoctorProfileData] = useState({});
  
  useEffect(() => {

    if (!doctorID) return; 

    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Se încarcă datele medicului...");

        const res = await axios.get(`${backendUrl}/api/doctor/get-all-doctor-infos/${doctorID}`);
        setDoctorData(res.data.doctor);
        setDoctorProfileData(res.data.profile || {});
        setDoctorLocationData(res.data.locations);
        setSpecialitiesDoctorData(res.data.specialities)
        setInitialDoctorData(res.data.doctor);
        setInitialDoctorProfileData(res.data.profile);

        console.log("Res complet:", res.data);

      } catch (err) {
        toast.error("Eroare la încărcarea datelor.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctorID]);

  

  //editari =====================================================
  const isEditing = (section) => editingSection === section;
  const [editingSection, setEditingSection] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const typeOptions = [
    { value: "rezident", label: "Medic rezident" },
    { value: "specialist", label: "Medic specialist" },
    { value: "primar", label: "Medic primar" },
  ];

  const genderOptions = [
    { value: "masculin", label: "Masculin" },
    { value: "feminin", label: "Feminin" },
    { value: "altul", label: "Altul" },
  ];
    // Inputuri temporare pentru array-uri ------------------------
  const [newExperience, setNewExperience] = useState("");
  const [newStudy, setNewStudy] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const [newAbout, setNewAbout] = useState("");
  const [newExpertise, setNewExpertise] = useState("");
  const [newApproach, setNewApproach] = useState("");
  const [newRoleInClinic, setNewRoleInClinic] = useState("");

  // ------------------------------------------------------------


  //validari pt editare ==============================
  const [formErrors, setFormErrors] = useState({});

  const validatePersonalInfo = () => {
    const errors = {};

    if (!doctorData.type || doctorData.type.trim() === "") {
      errors.type = "Selectează tipul de medic.";
    }

    if (!doctorData.gender || doctorData.gender.trim() === "") {
      errors.gender = "Selectează genul.";
    }

    if (!doctorData.address || doctorData.address.trim().length < 5) {
      errors.address = "Introdu o adresă validă (minim 5 caractere).";
    }

    return errors;
  };

  const validateProfessionalInfo = () => {
    const newErrors = {};

    if (!doctorData.studies || doctorData.studies.length === 0) {
      newErrors.studies = "Adaugă cel puțin un studiu.";
      toast.error("Adaugă cel puțin un studiu.");
    }

    if (!doctorData.certifications || doctorData.certifications.length === 0) {
      newErrors.certifications = "Adaugă cel puțin o certificare.";
      toast.error("Adaugă cel puțin o certificare.");
    }

    if (!doctorData.experience || doctorData.experience.length === 0) {
      newErrors.experience = "Adaugă cel puțin o experiență.";
      toast.error("Adaugă cel puțin o experiență.");
    }

    if (!doctorData.languagesSpoken || doctorData.languagesSpoken.length === 0) {
      newErrors.languagesSpoken = "Adaugă cel puțin o limbă.";
      toast.error("Adaugă cel puțin o limbă.");
    } else if (!doctorData.languagesSpoken.some(lang => lang.toLowerCase().includes("română"))) {
      newErrors.languagesSpoken = "Limba 'Română' este obligatorie.";
      toast.error("Limba 'Română' este obligatorie.");
    }

    return Object.keys(newErrors).length === 0;
  };

  const validateDoctorProfileInfo = () => {
  const newErrors = {};

  if (!doctorProfileData.about || doctorProfileData.about.length === 0) {
    newErrors.about = "Adaugă cel puțin o informație la 'Despre medic'.";
    toast.error("Adaugă cel puțin o informație la 'Despre medic'.");
  }

  if (!doctorProfileData.expertise || doctorProfileData.expertise.length === 0) {
    newErrors.expertise = "Adaugă cel puțin o expertiză.";
    toast.error("Adaugă cel puțin o expertiză.");
  }

  if (!doctorProfileData.approach || doctorProfileData.approach.length === 0) {
    newErrors.approach = "Adaugă cel puțin o abordare.";
    toast.error("Adaugă cel puțin o abordare.");
  }

  if (!doctorProfileData.roleInClinic || doctorProfileData.roleInClinic.length === 0) {
    newErrors.roleInClinic = "Adaugă cel puțin un rol în clinică.";
    toast.error("Adaugă cel puțin un rol în clinică.");
  }

  return Object.keys(newErrors).length === 0;
};


  //salvare ======================================


  const handleSavePersonalInfo = async () => {
    const validationErrors = validatePersonalInfo();

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((msg) => toast.error(msg));
      setFormErrors(validationErrors);
      return;
    } else {
      setFormErrors({});
    }

    try {
      setLoading(true);
      setLoadingMessage("Se salvează informațiile personale...");

      const formData = new FormData();
      formData.append("type", doctorData.type);
      formData.append("gender", doctorData.gender);
      formData.append("address", doctorData.address);
      formData.append("oldProfileImage", doctorData.profileImage || "");

      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      await axios.put(`${backendUrl}/api/doctor/update-doctor-personal-info/${doctorID}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Datele au fost salvate cu succes!");

      setSelectedFile(null);
      setEditingSection(null);

    } catch (err) {
      toast.error("Eroare la salvarea datelor!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfessionalInfo = async () => {
      const isValid = validateProfessionalInfo();
      if (!isValid) return;

      try {
        setLoading(true);
        setLoadingMessage("Se salvează informațiile profesionale...");

        const res = await axios.put(`${backendUrl}/api/doctor/update-doctor-professional-info/${doctorID}`, {
          certifications: doctorData.certifications,
          studies: doctorData.studies,
          experience: doctorData.experience,
          languagesSpoken: doctorData.languagesSpoken,
        });

        toast.success("Datele profesionale au fost salvate!");
        setEditingSection(null);
      } catch (error) {
        console.error("Eroare:", error);
        toast.error("Eroare la salvarea datelor profesionale.");
      } finally {
        setLoading(false);
      }
    };

  const handleSaveDoctorProfileInfo = async () => {
    const isValid = validateDoctorProfileInfo();
    if (!isValid) return;

    try {
      setLoading(true);
      setLoadingMessage("Se salvează informațiile despre profilul medicului...");

      const res = await axios.put(`${backendUrl}/api/doctor/update-doctor-profile-info/${doctorID}`, {
        about: doctorProfileData.about,
        expertise: doctorProfileData.expertise,
        approach: doctorProfileData.approach,
        roleInClinic: doctorProfileData.roleInClinic,
      });

      toast.success("Datele despre profilul medicului au fost salvate!");
      setEditingSection(null);

    } catch (error) {
      console.error("Eroare:", error);
      toast.error("Eroare la salvarea datelor despre profilul medicului.");
    } finally {
      setLoading(false);
    }
  };

  // =============================================================


  return (
     <div className=''>

      {/* Intro */}
      <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center border-b-1 border-gray-200 p-3">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
              {/* Icon */}
              <FontAwesomeIcon
                  icon={faUserDoctor}
                  className="text-purple-600 md:text-3xl text-3xl sm:mb-0 ml-5"
              />
              {/* Text */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                  Profilul Medicului
                  <p className="text-gray-600 text-sm font-semibold">
                      Informațiile personale și detalii profesionale
                  </p>
              </h2>
          </div>
      </div>

       <div className="p-6">

        {/* Personal Info */}
        <div className="mb-10 shadow-xl rounded-2xl bg-white/95">

          <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl ">
            <h3 className="text-lg font-bold text-purple-800">
                <FontAwesomeIcon icon={faUserDoctor} className='mr-2' />
                Informații Personale
            </h3>
            {!isEditing("personal") && (
            <button
                onClick={() => setEditingSection("personal")}
                className="text-purple-800 text-medium hover:underline flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faPenToSquare} />
                <span className="hidden md:inline text-medium mt-1"> Editează </span>
            </button>
            )}
          </div>

           {/* Personal Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 md:gap-6 gap-1 border-purple-100 border-b-10 rounded-b-2xl border-l-7 border-r-7 p-5">

            <div>
              {/* Imagine */}
              <div className="mb-5">
                <p className="font-semibold">Poză de profil:</p>
                <div className="h-32 w-32 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  {previewImage || doctorData.profileImage ? (
                   <img
                      src={previewImage || doctorData.profileImage}
                      alt="Profil"
                      className="h-full w-full object-cover"
                    />
                    ) : (
                      <img
                      src={assets.doctor_default}
                      alt="Profil"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                  {isEditing("personal") && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPreviewImage(reader.result); // Doar pentru preview
                          };
                          reader.readAsDataURL(file);
                        }
                      }}

                    />

                  )}
                  {imageError && <p className="text-red-600 text-sm mt-1">{imageError}</p>}
              </div>


              {/* ID */}
              <div className="mb-5">
                <p className="font-semibold ml-6">ID: {doctorData.doctorID}</p>
                
              </div>
            </div>

            <div>
              {/* Nume */}
              <div className="mb-5">
                <p className="font-semibold">Nume și Prenume:</p>
                <p className="text-gray-800 text-base">Dr. {doctorData.lastName} {doctorData.firstName}</p>
              </div>

              {/* Email */}
              <div className="mb-5">
                <p className="font-semibold">Email:</p>
                <p className="text-gray-800 text-base">{doctorData.email}</p>
              </div>

              {/* Tip */}
              <div className="mb-5">
                <p className="font-semibold">Tip:</p>
                {isEditing("personal") ? (
                  <CustomSelect
                    options={typeOptions}
                    value={doctorData.type}
                    onChange={(selectedOption) =>
                      setDoctorData((prev) => ({ ...prev, type: selectedOption }))
                    }
                    placeholder="Selectează tipul de medic"
                    className="md:w-60 lg:w-50 w-60"
                  />
                ) : (
                  <p className="text-gray-800 text-base">Medic {doctorData.type}</p>
                )}
              </div>

            </div>

            <div>
              {/* CNP */}
              <div className="mb-5">
                <p className="font-semibold">CNP:</p>
                <p className="text-gray-800 text-base">{doctorData.cnp}</p>
              </div>

              {/* Data Nașterii */}
              <div className="mb-5">
                <p className="font-semibold">Data Nașterii:</p>
                <p className="text-gray-800 text-base">{doctorData.birthDate}</p>
              </div>

              {/* Varsta */}
              <div className="mb-5">
                <p className="font-semibold">Vârsta:</p>
                <p className="text-gray-800 text-base">{doctorData.age} ani</p>
              </div>
            </div>

            <div>
              {/* Telefon */}
              <div className="mb-5">
                <p className="font-semibold">Telefon:</p>
                <p className="text-gray-800 text-base">{doctorData.phone}</p>
              </div>

              {/* Gen */}
              <div className="mb-5">
                <p className="font-semibold">Gen:</p>
                {isEditing("personal") ? (
                  <CustomSelect
                    options={selectOptions.genderOptions}
                    value={doctorData.gender}
                    onChange={(selectedOption) =>
                      setDoctorData((prev) => ({ ...prev, gender: selectedOption }))
                    }
                    placeholder="Selectează genul"
                    className="md:w-60 lg:w-50 w-60"
                  />
                ) : (
                  <p className="text-gray-800 text-base">{doctorData.gender}</p>
                )}
              </div>

              {/* Adresa */}
              <div className="mb-5">
                <p className="font-semibold">Adresa:</p>
                {isEditing("personal") ? (
                  <input
                    type="text"
                    value={doctorData.address || ""}
                    onChange={(e) =>
                      setDoctorData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="border rounded px-2 py-1 md:w-60 lg:w-50 w-60 text-medium"
                    
                  />
                ) : (
                  <p className="text-gray-800 text-base">{doctorData.address}</p>
                )}
              </div>
            </div>

            {isEditing("personal") && (
              <div className="col-span-full flex justify-end gap-4 mt-4">
                <button
                  onClick={() => {
                    setDoctorData(initialDoctorData); 
                    setPreviewImage(initialDoctorData.profileImage); 
                    setImageError(null); 
                    setEditingSection(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSavePersonalInfo}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Salvează
                </button>
              </div>
            )}

          </div>
        </div>


        {/* Professional Info */}
        <div className="mb-10 shadow-xl rounded-2xl bg-white/95">

          <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl ">
            <h3 className="text-lg font-bold text-purple-800">
              <FontAwesomeIcon icon={faBriefcase} className='mr-2' />
              Informații Profesionale
            </h3>
            {!isEditing("professional") && (
              <button
                onClick={() => setEditingSection("professional")}
                className="text-purple-800 text-medium hover:underline flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                <span className="hidden md:inline text-medium mt-1">Editează</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-1 border-purple-100 border-b-10 rounded-b-2xl border-l-7 border-r-7 p-5">
            <div > 
             

              {/* Certificari */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold">Certificări:</p>
                {isEditing("professional") ? (
                  <>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="ex. ATLS, ACLS"
                        className="border p-2 rounded text-sm flex-1"
                      />
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          if (newCertification.trim()) {
                            setDoctorData((prev) => ({
                              ...prev,
                              certifications: [...(prev.certifications || []), newCertification.trim()],
                            }));
                            setNewCertification("");
                            //toast.success("Certificare adăugată!");
                          } else {
                            toast.error("Introdu o certificare validă!");
                          }
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorData.certifications?.map((item, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                          {item}
                          <button
                            onClick={() => {
                              const updated = doctorData.certifications.filter((_, i) => i !== index);
                              setDoctorData((prev) => ({ ...prev, certifications: updated }));
                            }}
                            className="text-blue-600 hover:text-red-600"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctorData.certifications?.length > 0 ? doctorData.certifications.map((item, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm">
                        {item}
                      </div>
                    )) : <p className="text-gray-600 text-sm">—</p>}
                  </div>
                )}
              </div>

              {/* Studii */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold">Studii:</p>
                {isEditing("professional") ? (
                  <>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newStudy}
                        onChange={(e) => setNewStudy(e.target.value)}
                        placeholder="ex. UMF Carol Davila"
                        className="border p-2 rounded text-sm flex-1"
                      />
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          if (newStudy.trim()) {
                            setDoctorData((prev) => ({
                              ...prev,
                              studies: [...(prev.studies || []), newStudy.trim()],
                            }));
                            setNewStudy("");
                            //toast.success("Studiu adăugat!");
                          } else {
                            toast.error("Introdu un studiu valid!");
                          }
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorData.studies?.map((item, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                          {item}
                          <button
                            onClick={() => {
                              const updated = doctorData.studies.filter((_, i) => i !== index);
                              setDoctorData((prev) => ({ ...prev, studies: updated }));
                            }}
                            className="text-blue-600 hover:text-red-600"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctorData.studies?.length > 0 ? doctorData.studies.map((item, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm">
                        {item}
                      </div>
                    )) : <p className="text-gray-600 text-sm">—</p>}
                  </div>
                )}
              </div>

               {/* Parafa - doar afisata */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold">Cod Parafă:</p>
                <p className="text-gray-800 text-base">{doctorData.parafaCode || "—"}</p>
              </div>
            </div>

            <div>
              {/* experienta */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold">Experiență:</p>
                {isEditing("professional") ? (
                  <>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newExperience}
                        onChange={(e) => setNewExperience(e.target.value)}
                        placeholder="ex. 5 ani în cardiologie"
                        className="border p-2 rounded text-sm flex-1"
                      />
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          if (newExperience.trim()) {
                            setDoctorData((prev) => ({
                              ...prev,
                              experience: [...(prev.experience || []), newExperience.trim()],
                            }));
                            setNewExperience("");
                            //toast.success("Experiență adăugată!");
                          } else {
                            toast.error("Introdu o experiență validă!");
                          }
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorData.experience?.map((item, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                          {item}
                          <button
                            onClick={() => {
                              const updated = doctorData.experience.filter((_, i) => i !== index);
                              setDoctorData((prev) => ({ ...prev, experience: updated }));
                            }}
                            className="text-blue-600 hover:text-red-600"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctorData.experience?.length > 0 ? doctorData.experience.map((item, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm">
                        {item}
                      </div>
                    )) : <p className="text-gray-600 text-sm">—</p>}
                  </div>
                )}
              </div>

              {/* Limbi Vorbite */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold">Limbi Vorbite:</p>
                {isEditing("professional") ? (
                  <>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="ex. Română, Engleză"
                        className="border p-2 rounded text-sm flex-1"
                      />
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          if (newLanguage.trim()) {
                            setDoctorData((prev) => ({
                              ...prev,
                              languagesSpoken: [...(prev.languagesSpoken || []), newLanguage.trim()],
                            }));
                            setNewLanguage("");
                            //toast.success("Limbă adăugată!");
                          } else {
                            toast.error("Introdu o limbă validă!");
                          }
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorData.languagesSpoken?.map((item, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                          {item}
                          <button
                            onClick={() => {
                              const updated = doctorData.languagesSpoken.filter((_, i) => i !== index);
                              setDoctorData((prev) => ({ ...prev, languagesSpoken: updated }));
                            }}
                            className="text-blue-600 hover:text-red-600"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctorData.languagesSpoken?.length > 0 ? doctorData.languagesSpoken.map((item, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xl text-sm">
                        {item}
                      </div>
                    )) : <p className="text-gray-600 text-sm">—</p>}
                  </div>
                )}
              </div>

              {/* Specialitati */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold"> Specialități:</p>
                
                {specialitiesDoctorData.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-800 space-y-1 ml-2">
                      {specialitiesDoctorData.map((spec, idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{spec.id}</span> – {spec.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-gray-500">Nu există specialități asociate acestui medic.</p>
                  )}
              </div>


            </div>

            {isEditing("professional") && (
             <div className="col-span-full flex justify-end gap-4 mt-4">
              <button
                onClick={() => {
                  setEditingSection(null)
                  setDoctorData(initialDoctorData);
                }
                }
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Anulează
              </button>
              <button
                  onClick={() => {
                    if (validateProfessionalInfo()) {
                      handleSaveProfessionalInfo();
                    }
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Salvează
                </button>
            </div>
            )}
          </div>
        </div>


        {/* Doctor Profile Section */}
        <div className="mb-10 shadow-xl rounded-2xl bg-white/95">
          <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
            <h3 className="text-lg font-bold text-purple-800">
              <FontAwesomeIcon icon={faUserDoctor} className='mr-2' />
              Despre medic
            </h3>
            {!isEditing("profile") && (
              <button
                onClick={() => setEditingSection("profile")}
                className="text-purple-800 text-medium hover:underline flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                <span className="hidden md:inline text-medium mt-1"> Editează </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-1 border-purple-100 border-b-10 rounded-b-2xl border-l-7 border-r-7 p-5">
            <div >
              {/* About */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold">Despre medic:</p>
                {isEditing("profile") ? (
                  <>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newAbout}
                        onChange={(e) => setNewAbout(e.target.value)}
                        placeholder="ex. Sunt un medic dedicat pacienților..."
                        className="border p-2 rounded text-sm flex-1"
                      />
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          if (newAbout.trim()) {
                            setDoctorProfileData((prev) => ({
                              ...prev,
                              about: [...(prev.about || []), newAbout.trim()],
                            }));
                            setNewAbout("");
                          } else {
                            toast.error("Introdu o informație validă!");
                          }
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorProfileData.about?.map((item, index) => (
                        <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                          {item}
                          <button
                            onClick={() => {
                              const updated = doctorProfileData.about.filter((_, i) => i !== index);
                              setDoctorProfileData((prev) => ({ ...prev, about: updated }));
                            }}
                            className="text-purple-600 hover:text-red-600"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctorProfileData.about?.length > 0 ? doctorProfileData.about.map((item, index) => (
                      <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm">
                        {item}
                      </div>
                    )) : <p className="text-gray-600 text-sm">—</p>}
                  </div>
                )}
              </div>

             {/* Expertise */}
            <div className="md:mb-6 mb-3">
              <p className="font-semibold">Expertiză:</p>
              {isEditing("profile") ? (
                <>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      placeholder="ex. Cardiologie intervențională"
                      className="border p-2 rounded text-sm flex-1"
                    />
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => {
                        if (newExpertise.trim()) {
                          setDoctorProfileData((prev) => ({
                            ...prev,
                            expertise: [...(prev.expertise || []), newExpertise.trim()],
                          }));
                          setNewExpertise("");
                        } else {
                          toast.error("Introdu o expertiză validă!");
                        }
                      }}
                    >
                      + Adaugă
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctorProfileData.expertise?.map((item, index) => (
                      <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                        {item}
                        <button
                          onClick={() => {
                            const updated = doctorProfileData.expertise.filter((_, i) => i !== index);
                            setDoctorProfileData((prev) => ({ ...prev, expertise: updated }));
                          }}
                          className="text-purple-600 hover:text-red-600"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {doctorProfileData.expertise?.length > 0 ? doctorProfileData.expertise.map((item, index) => (
                    <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm">
                      {item}
                    </div>
                  )) : <p className="text-gray-600 text-sm">—</p>}
                </div>
              )}
            </div>
              
            </div>

            <div >
             {/* Approach */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold">Abordare:</p>
                {isEditing("profile") ? (
                  <>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newApproach}
                        onChange={(e) => setNewApproach(e.target.value)}
                        placeholder="ex. Abordare empatică, centrată pe pacient"
                        className="border p-2 rounded text-sm flex-1"
                      />
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          if (newApproach.trim()) {
                            setDoctorProfileData((prev) => ({
                              ...prev,
                              approach: [...(prev.approach || []), newApproach.trim()],
                            }));
                            setNewApproach("");
                          } else {
                            toast.error("Introdu o abordare validă!");
                          }
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorProfileData.approach?.map((item, index) => (
                        <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                          {item}
                          <button
                            onClick={() => {
                              const updated = doctorProfileData.approach.filter((_, i) => i !== index);
                              setDoctorProfileData((prev) => ({ ...prev, approach: updated }));
                            }}
                            className="text-purple-600 hover:text-red-600"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctorProfileData.approach?.length > 0 ? doctorProfileData.approach.map((item, index) => (
                      <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm">
                        {item}
                      </div>
                    )) : <p className="text-gray-600 text-sm">—</p>}
                  </div>
                )}
              </div>

              {/* Rol în clinica */}
              <div className="md:mb-6 mb-3">
                <p className="font-semibold">Rol în clinică:</p>
                {isEditing("profile") ? (
                  <>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newRoleInClinic}
                        onChange={(e) => setNewRoleInClinic(e.target.value)}
                        placeholder="ex. Coordonator departament cardiologie"
                        className="border p-2 rounded text-sm flex-1"
                      />
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          if (newRoleInClinic.trim()) {
                            setDoctorProfileData((prev) => ({
                              ...prev,
                              roleInClinic: [...(prev.roleInClinic || []), newRoleInClinic.trim()],
                            }));
                            setNewRoleInClinic("");
                          } else {
                            toast.error("Introdu un rol valid!");
                          }
                        }}
                      >
                        + Adaugă
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctorProfileData.roleInClinic?.map((item, index) => (
                        <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm flex items-center gap-2">
                          {item}
                          <button
                            onClick={() => {
                              const updated = doctorProfileData.roleInClinic.filter((_, i) => i !== index);
                              setDoctorProfileData((prev) => ({ ...prev, roleInClinic: updated }));
                            }}
                            className="text-purple-600 hover:text-red-600"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doctorProfileData.roleInClinic?.length > 0 ? doctorProfileData.roleInClinic.map((item, index) => (
                      <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-xl text-sm">
                        {item}
                      </div>
                    )) : <p className="text-gray-600 text-sm">—</p>}
                  </div>
                )}
              </div>

            </div>

            {isEditing("profile") && (
              <div className="col-span-full flex justify-end gap-4 mt-4">
                <button
                  onClick={() => {
                    setDoctorProfileData(initialDoctorProfileData);
                    setEditingSection(null);
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveDoctorProfileInfo }
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Salvează
                </button>
              </div>
            )}

          
          </div>
        </div>

        {/* Location & Program Info */}
        <div className="mb-10 shadow-xl rounded-2xl bg-white/95">
          <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
            <h3 className="text-lg font-bold text-purple-800">
              <FontAwesomeIcon icon={faHospital} className='mr-2' />
              Locații și Program
            </h3>
          </div>

          <div className="border-purple-100 border-b-10 rounded-b-2xl border-l-7 border-r-7 p-5">
            {doctorLocationData && doctorLocationData.length > 0 ? (
              <div className="grid md:grid-cols-3 md:gap-10 gap-5">
                {doctorLocationData.map((locatie, index) => (
                  <div key={index} className="border-2 border-green-300 rounded-xl p-4 shadow-md bg-white">
                    <h4 className="text-lg font-bold text-green-800 mb-1 flex items-center gap-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {locatie.locationID} - {locatie.locationName}
                    </h4>

                    <p className="text-base ml-7 text-green-700 font-medium flex items-center gap-2 mb-2">
                      <FontAwesomeIcon icon={faStethoscope} />
                      {locatie.specialityName || "Specialitate necunoscută"}
                    </p>

                    <div>
                      <p className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} />
                        Program:
                      </p>

                      {locatie.schedule && locatie.schedule.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-green-900 ml-2">
                          {locatie.schedule.map((day, idx) => (
                            <li key={idx}>
                              {ziuaCorecta(day.day)}: {day.startTime} - {day.endTime}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 italic ml-2">Program indisponibil.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mt-3">Nu există locații asociate.</p>
            )}
          </div>
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

export default DoctorPersonalInfo