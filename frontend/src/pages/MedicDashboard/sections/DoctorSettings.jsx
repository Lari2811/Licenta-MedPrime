import React, { useState, useEffect, useRef, useContext } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faAdd, faBriefcase,  faCheckCircle,  faClock,  faEnvelopeOpenText,  faEye,  faEyeSlash,  faFloppyDisk,  faHospital, faLock, faMapMarkerAlt, faPaperPlane, faPenToSquare, faSave, faStethoscope,  faTimesCircle,  faTools,  faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";
import { useCheckDoctorAccess } from '../../../accessControl/useCheckDoctorAccess '

import CustomSelect from "../../../components/customSelect";
import { selectOptions } from "../../../utils/selectOptions";
import { ziuaCorecta } from "../../../utils/ziProgram";
import { getStatusLabel } from "../../../utils/getStatusLabel";

const DoctorSettings = () => {

  useCheckDoctorAccess();
  
  const { backendUrl } = useContext(AppContext);

  const { doctorID } = useParams();

  const [doctorData, setDoctorData] = useState({});
  const [userData, setUserData] = useState({})
  const [doctorLocationData, setDoctorLocationData] = useState({})
  const [specialitiesDoctorData, setSpecialititesDoctorData] = useState([])

  const [initialDoctorData, setInitialDoctorData] = useState({});
  const [initialUserData, setInitialUserData] = useState({});

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});

  //preluare date =================================
   useEffect(() => {

      if (!doctorID) return;

      const fetchData = async () => {
        try {
           setLoading(true);
           setLoadingMessage("Se încarcă datele medicului...");

          const res = await axios.get(`${backendUrl}/api/doctor/get-all-doctor-infos/${doctorID}`);
          setDoctorData(res.data.doctor);
          setDoctorLocationData(res.data.locations);
          setSpecialititesDoctorData(res.data.specialities)

          setInitialDoctorData(res.data.doctor);
          console.log("Res complet:", res.data);
          console.log("doctor", res.data.doctor)
          console.log("Spec", res.data.specialities)
          console.log("locatii: ",res.data.locations)


        } catch (err) {
          toast.error("Eroare la încărcarea datelor.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
  }, [doctorID]);

  //functia pentru puterea parolei =====================
    const handlePasswordStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    };

    const getStrengthLabel = () => {
      if (passwordStrength <= 1) return "Slabă";
      if (passwordStrength === 2) return "Mediocră";
      return "Puternică";
    };

    const getStrengthColor = () => {
      if (passwordStrength <= 1) return "bg-red-500";
      if (passwordStrength === 2) return "bg-yellow-500";
      return "bg-green-500";
    };
//========================================

// request ==============================
const [descriere, setDescriere] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);

  // State pentru modificari
  const [modificariLista, setModificariLista] = useState([]);
  
  const [numeNou, setNumeNou] = useState("");
  const [telefonNou, setTelefonNou] = useState("");

  const [editNume, setEditNume] = useState(false);
  const [editTelefon, setEditTelefon] = useState(false);

    //specialitate -------------------------
    const [specialitiesData, setSpecialitiesData] = useState([])
    const [ locationsData, setLocationsData] = useState([]) 
    const [specialitiesLocationsData, setSpecialitiesLocationsData] = useState([]) 

    //asta trimit mai departe
    const [specialityLocationInput, setSpecialityLocationInput] = useState("");
    const [specialityLocationList, setSpecialityLocationList] = useState([]);


    const handleAddSpecialityLocation = () => {
      const trimmed = specialityLocationInput.trim().toUpperCase();

      if (!trimmed) {
        toast.error("Introdu o pereche specialitate-locație!");
        return;
      }

      // Verificare format
      const regex = /^(SP\d{3}):(L\d{3})$/;
      const match = trimmed.match(regex);
      if (!match) {
        toast.error("Format invalid! Exemplu corect: SP003:L006");
        return;
      }

      const [_, specID, locID] = match;

        // Verificare dacă există deja în doctorLocationData (cele din backend)
        const dejaExistaInDB = doctorLocationData.some(
          (item) => item.specialityID === specID && item.locationID === locID
        );

        if (dejaExistaInDB) {
          toast.error(`Perechea ${specID}:${locID} există deja în datele tale (DB)!`);
          return;
        }


      // Verificare daca exista in specialitatiDisponibile
      const specialitate = specialitatiDisponibile.find((item) => item.id === specID);
      if (!specialitate) {
        toast.error(`Specialitatea ${specID} nu există!`);
        return;
      }

      const locatieGasita = locationsData.find(loc => loc.locationID === locID);
      if (!locatieGasita) {
        toast.error(`Locația ${locID} nu există!`);
        return;
      }

      const legaturaValida = specialitiesLocationsData.some(link => link.specialityID === specID && link.locationID === locID && link.isActive);
      if (!legaturaValida) {
        toast.error(`Perechea ${specID} și ${locID} nu este validă!`);
        return;
      }

      // Verificare duplicat
      if (specialityLocationList.includes(trimmed)) {
        toast.error("Această pereche este deja adăugată!");
        return;
      }

      // adauga
      setSpecialityLocationList(prev => [...prev, trimmed]);
      setSpecialityLocationInput("");
      toast.success("Perechea a fost adăugată cu succes!");
    };


   //API -get all specialities
    const fetchSpecialities = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-specialities`);
        if (res.data.success) {
          setSpecialitiesData(res.data.data); 
           console.log("Specialități din backend:", res.data.data);
        } else {  
          toast.error(res.data.message || "Eroare la încărcarea specialităților");
        }
      } catch (err) {  
        toast.error("Eroare server la specialități");
      }
    };

     //API -get all locations
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-locations`);
        if (res.data.success) {
          setLocationsData(res.data.locations); 
          console.log("Locații din backend:", res.data.locations);

        } else {
          toast.error(res.data.message || "Eroare la încărcarea locațiilor");
        }
      } catch (err) {
        toast.error("Eroare server la locații");
      }
    };

    //API - get specialities locations
    const fetchSpecialitiesLocations = async() => {
        try {
            const res = await axios.get(`${backendUrl}/api/admin/get-speciality-locations`)
            if (res.data.success) {
                setSpecialitiesLocationsData(res.data.data); 
                console.log("Legaturi spec - loc  din backend:", res.data.data);

            } else {
            toast.error(res.data.message || "Eroare la încărcarea legaturilor intre specialitati si locatii");
        }
      } catch (err) {
        toast.error("Eroare server la specialitati-locatii");
      }
    };

    useEffect(() => {
        fetchSpecialities();
        fetchLocations();
        fetchSpecialitiesLocations();
    }, []);


    const specialitatiDisponibile = specialitiesData.map((spec) => {
      const linkedLocationIDs = specialitiesLocationsData
        .filter(link => link.specialityID === spec.specialityID && link.isActive)
        .map(link => link.locationID);

      const linkedLocationNames = locationsData
        .filter(loc => linkedLocationIDs.includes(loc.locationID))
        .map(loc => `${loc.clinicName} (${loc.locationID})`)
        .join(", ");

      return {
        id: spec.specialityID,
        nume: spec.name,
        locatii: linkedLocationNames || "—"
      };
    });

    //------------------------

    // State pentru locație, zi și interval orar
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedDay, setSelectedDay] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [programNou, setProgramNou] = useState([]);

   
    //alte solicitari
    const [mesajAlteSolicitari, setMesajAlteSolicitari] = useState("");


   const handleTrimiteCerere = async () => {
    if (!selectedRequest) {
      toast.error("Selectează tipul de solicitare!");
      return;
    }

    if (!selectedPriority) {
      toast.error("Selectează prioritatea!");
      return;
    }

    let detalii = {};

    if (selectedRequest === "MODIFICARE_DATE_PERSONALE") {
      if (modificariLista.length === 0) {
        toast.error("Adaugă cel puțin o modificare pentru datele personale!");
        return;
      }
      detalii = { modificari: modificariLista };
    }
    else if (selectedRequest === "MODIFICARE_SPECIALITATE") {
      if (!mesajAlteSolicitari.trim()) {
        toast.error("Te rugăm să completezi detaliile solicitării!");
        return;
      }

      detalii = { mesaj: mesajAlteSolicitari.trim() };
    }

    
     else if (selectedRequest === "MODIFICARE_LOCATII_SI_PROGRAM") {
      if (!mesajAlteSolicitari.trim()) {
        toast.error("Te rugăm să completezi detaliile solicitării!");
        return;
      }

      detalii = { mesaj: mesajAlteSolicitari.trim() };
    }
    
    
    else if (selectedRequest === "ALTE_SOLICITARI") {
      if (!mesajAlteSolicitari.trim()) {
        toast.error("Te rugăm să completezi detaliile solicitării!");
        return;
      }

      detalii = { mesaj: mesajAlteSolicitari.trim() };
    }

    const payload = {
      userID: doctorID,
      tipSolicitare: selectedRequest,
      prioritate: selectedPriority,
      detalii,
      descriere,
    };

    try {
      setLoading(true);
      setLoadingMessage("Trimiterea solicitării...");

      const res = await axios.post(`${backendUrl}/api/main/create-request`, payload);

      if (res.data.success) {
        toast.success("Solicitarea a fost trimisă cu succes!");
        setSelectedRequest(null);
        setSelectedPriority(null);
        setModificariLista([]);
        setNumeNou("");
        setTelefonNou("");
        setEditNume(false);
        setEditTelefon(false);

        setSpecialityLocationList([]); 
        setSpecialityLocationInput(""); 

        setProgramNou([]); 
        setSelectedDay(null);
        setStartTime("");
        setEndTime("");
        setSelectedLocation("");

        setMesajAlteSolicitari("");
        setDescriere("");

      } else {
        toast.error(res.data.message || "Eroare la trimiterea solicitării.");
      }
    } catch (error) {
      console.error("Eroare la trimiterea cererii:", error);
      toast.error("A apărut o eroare la trimiterea solicitării.");
    } finally {
      setLoading(false);
    }
  };
//================================================

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword) {
      toast.error("Introdu parola actuală!");
      return;
    }

    try {
      setLoading(false);
      setLoadingMessage("Verificăm parola actuală...");

      const res = await axios.post(`${backendUrl}/api/main/verify-user-password`, {
        userID: doctorID,
        currentPassword,
      });
    
        setIsCurrentPasswordVerified(true);
        toast.success("Parola actuală este corectă. Poți continua.");
     
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Parola actuală este incorectă!");
        setIsCurrentPasswordVerified(false);
      } else
      if (error.response && error.response.status === 404) {
        toast.error(error.response.data.message || "Medicul nu a fost găsit!");
        setIsCurrentPasswordVerified(false);

      }
       else {
        toast.error("Eroare la verificarea parolei!");
        setIsCurrentPasswordVerified(false);
      }
    }
     finally {
          setLoading(false);
        }
  };

  const handleSaveNewPassword = async () => {
  if (!newPassword || !confirmNewPassword) {
    toast.error("Completează ambele câmpuri pentru parolă!");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    toast.error("Parolele nu coincid!");
    return;
  }

  if (newPassword === currentPassword && confirmNewPassword === currentPassword) {
    toast.error("Parola nouă nu poate fi aceeași cu parola actuală!");
    return;
  }

  if (passwordStrength < 2) {
    toast.error("Parola este prea slabă!");
    return;
  }

  try {
    setLoading(true);
    setLoadingMessage("Actualizăm parola...");

    const res = await axios.put(`${backendUrl}/api/main/update-user-password`, {
      userID: doctorID,
      newPassword,
    });


    if (res.status === 200) {
      toast.success(res.data.message || "Parola a fost actualizată cu succes!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsCurrentPasswordVerified(false);
    }
  } catch (error) {
    console.error("Eroare la actualizare parolă:", error);

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || "A apărut o eroare necunoscută.";

      if (status === 400) {
        toast.error(msg);
      } else if (status === 404) {
        toast.error(msg);
      } else if (status === 500) {
        toast.error("Eroare internă a serverului. Încearcă din nou mai târziu!");
      } else {
        toast.error("Eroare la actualizarea parolei.");
      }
    } else {
      toast.error("Eroare la actualizarea parolei. Verifică conexiunea la internet.");
    }
  } finally {
    setLoading(false);
  }
  };


  return (
    <div className=''>

      {/* Intro - setari */}
      <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center border-b-1 border-gray-200 p-3">
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
          {/* Icon */}
          <FontAwesomeIcon
            icon={faTools}
            className="text-purple-600 md:text-3xl text-3xl sm:mb-0 ml-5"
          />
          {/* Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
            Setări cont medic
            <p className="text-gray-600 text-sm font-semibold">
              Modifică parola și trimite solicitări către administrator.
            </p>
          </h2>
        </div>
      </div>

      {/* setari */}
      <div className=" space-y-6 p-6">

        {/* Modificare parola */}
          <div className="mb-10 shadow-xl rounded-3xl bg-white/95 w-full border-l-7 border-r-7 border-b-10 border-purple-100">
               <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
                   <h3 className="text-lg font-bold text-purple-800">
                       <FontAwesomeIcon icon={faLock} className="mr-2"/> Modificare parolă
                   </h3>
               </div>
       
               {/* Continut */}
               <div className='p-5'>
                   <div className="flex flex-col gap-2">
                       {/* Parola actuala */}
                       <label className="font-semibold ">Parola actuală</label>
                       <div className="relative w-full">
                           <input
                           type={showCurrentPassword ? "text" : "password"}
                           placeholder="Introdu parola actuală"
                           value={currentPassword}
                           onChange={(e) => setCurrentPassword(e.target.value)}
                           className="border p-2 rounded text-sm w-full pr-10"
                           />
                           <button
                           type="button"
                           onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                           className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                           >
                           <FontAwesomeIcon icon={showCurrentPassword ? faEye : faEyeSlash} />
                           </button>
                       </div>
       
                       <button
                           className="btn-outline-purple w-fit self-start mt-2"
                           onClick={handleVerifyCurrentPassword}
                       >
                           <FontAwesomeIcon icon={faCheckCircle} />
                           Verifică parola
                       </button>
                   </div>
       
               
                   {/* daca parola e verificată */}
                   {isCurrentPasswordVerified && (
                   <div className="flex flex-col gap-4 mt-6">
                       {/* Parola noua + Confirmare  */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Parola noua */}
                       <div>
                           <label className="block font-semibold text-gray-700 mb-1">Parolă nouă</label>
                           <div className="relative">
                           <input
                               type={showNewPassword ? "text" : "password"}
                               placeholder="Introdu parola nouă"
                               value={newPassword}
                               onChange={(e) => {
                               setNewPassword(e.target.value);
                               handlePasswordStrength(e.target.value);
                               }}
                               className={`w-full border rounded px-3 py-2 ${errors.newPassword ? "border-red-500" : "border"}`}
                           />
                           <button
                               type="button"
                               onClick={() => setShowNewPassword(!showNewPassword)}
                               className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                           >
                               <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} className="text-gray-400" />
                           </button>
                           </div>
                       </div>
       
                       {/* Confirmare */}
                       <div>
                           <label className="block font-semibold text-gray-700 mb-1">Confirmă parola nouă</label>
                           <div className="relative">
                           <input
                               type={showConfirmPassword ? "text" : "password"}
                               placeholder="Confirmă parola nouă"
                               value={confirmNewPassword}
                               onChange={(e) => setConfirmNewPassword(e.target.value)}
                               className={`w-full border rounded px-3 py-2 ${errors.confirmNewPassword ? "border-red-500" : "border"}`}
                           />
                           <button
                               type="button"
                               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                               className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                           >
                               <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="text-gray-400" />
                           </button>
                           </div>
                       </div>
                       </div>
       
                       {/* Puterea parolei */}
                       {newPassword && (
                       <div className="space-y-1">
                           <div className="flex justify-between">
                           <div className="text-xs text-gray-500">Puterea parolei:</div>
                           <div
                               className={`text-xs font-semibold ${
                               passwordStrength <= 1 ? "text-red-500" : passwordStrength === 2 ? "text-yellow-500" : "text-green-500"
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
                       <div className="flex justify-end gap-2">
                       <button
                           className="btn-outline-red "
                           onClick={() => {
                            setIsCurrentPasswordVerified(false);
                            setNewPassword("");
                            setConfirmNewPassword("");
                            setPasswordStrength(0);
                            setCurrentPassword("")
                           }}
                       >
                           <FontAwesomeIcon icon={faTimesCircle} />
                           Anulează
                       </button>
       
                       <button
                           className="btn-outline-green text-green-600 border-green-600 hover:bg-green-600 hover:text-white flex items-center gap-1 px-4 py-2 rounded"
                           onClick={handleSaveNewPassword}
                       >
                           <FontAwesomeIcon icon={faFloppyDisk} />
                           Salvează parola
                       </button>
                       </div>
                   </div>
                   )}
       
               </div>
       
               
       
           </div>
       

        {/* Solicitare catre Admin */}
        <div className="mb-10 shadow-xl rounded-2xl bg-white/95">
            
          <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl ">
            <h3 className="text-lg font-bold text-purple-800">
                <FontAwesomeIcon icon={faPaperPlane} className='mr-2' />
                Trimite o solicitare către Admin
            </h3>
          </div>

            {/* Continut */}
          <div className="border-purple-100 border-b-10 rounded-b-2xl border-l-7 border-r-7">
            
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-1  px-5 py-5">
             <div className="mb-4">
              <label className="block font-medium mb-1">Tip solicitare:</label>
              <CustomSelect
                options={selectOptions.requestOptions}
                value={selectedRequest}
                 onChange={(value) => {
                  setSelectedRequest(value);
                }}
                placeholder="Selectează tipul de solicitare"
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">Prioritate:</label>
              <CustomSelect
                options={selectOptions.priorityOptions}
                value={selectedPriority}
                onChange={setSelectedPriority}
                placeholder="Selectează prioritatea"
              />
            </div>
            </div>


            {/* selectedRequest - date personale*/}
            {selectedRequest === "MODIFICARE_DATE_PERSONALE" && (
              <div className="border-t-2 border-b-2 border-purple-100 px-5 py-5">

                <h4 className="font-semibold text-lg text-purple-800 mb-1">Datele tale actuale:</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <p><span className="font-semibold">Nume:</span> {doctorData.lastName} {doctorData.firstName}</p>
                  <p><span className="font-semibold">Telefon:</span> {doctorData.phone}</p>
                  
                </div>

             
                <div className="space-y-5">
                  <h4 className="font-semibold text-lg text-purple-800 mt-5">Detaliază modificările dorite:</h4>
                
                  {/* Nume / Prenume */}
                  <div className="flex flex-col">
                    <label className=" font-semibold text-purple-800">Nume / Prenume</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={numeNou}
                        onChange={(e) => setNumeNou(e.target.value)}
                        placeholder="Nume / Prenume"
                        disabled={!editNume}
                        className={`border p-2 rounded w-full text-sm ${editNume ? "bg-white border-purple-500" : "bg-gray-100 cursor-not-allowed"}`}
                      />
                      {editNume ? (
                        <>
                          <button
                            onClick={() => {
                              if (numeNou.trim() === "") {
                                toast.error("Introdu un nume valid!");
                                return;
                              }
                              setModificariLista((prev) => [...prev.filter((item) => item.camp !== "nume"), { camp: "nume", label: "Nume / Prenume", valoare: numeNou }]);
                              setEditNume(false);
                              toast.success("Modificarea pentru nume a fost adăugată!");
                            }}
                            className="btn-outline-green-little"
                          >
                            <FontAwesomeIcon icon={faSave} />
                            Salvează
                          </button>
                          <button
                            onClick={() => {
                              setEditNume(false);
                              setNumeNou("");
                            }}
                               className="btn-outline-red-little"
                          >
                            <FontAwesomeIcon icon={faTimesCircle} />
                            
                            Anulează
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditNume(true)}
                          className="btn-outline-purple-little"
                         >
                          <FontAwesomeIcon icon={faAdd} />
                            Modifică
                        </button>
                      )}
                    </div>
                    {editNume && numeNou.trim() === "" && (
                      <p className="text-xs text-red-600">Numele nu poate fi gol!</p>
                    )}
                  </div>
                  

                    {/* Telefon */}
                    <div className="flex flex-col ">
                      <label className="text- font-semibold text-purple-800">Telefon</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={telefonNou}
                          onChange={(e) => setTelefonNou(e.target.value)}
                          placeholder="Telefon"
                          disabled={!editTelefon}
                          className={`border p-2 rounded w-full text-sm ${editTelefon ? "bg-white border-purple-500" : "bg-gray-100 cursor-not-allowed"}`}
                        />
                        {editTelefon ? (
                          <>
                            <button
                              onClick={() => {
                                if (!/^0(2|3|7)\d{8}$/.test(telefonNou)) {
                                  toast.error("Număr de telefon invalid! Trebuie să înceapă cu 02, 03 sau 07 și să aibă 10 cifre.");
                                  return;
                                }
                                setModificariLista((prev) => [...prev.filter((item) => item.camp !== "telefon"), { camp: "telefon", label: "Telefon", valoare: telefonNou }]);
                                setEditTelefon(false);
                                toast.success("Modificarea pentru telefon a fost adăugată!");
                              }}
                               className="btn-outline-green-little"
                          >
                            <FontAwesomeIcon icon={faSave} />
                            Salvează
                            </button>
                            <button
                              onClick={() => {
                                setEditTelefon(false);
                                setTelefonNou("");
                              }}
                               className="btn-outline-red-little"
                          >
                            <FontAwesomeIcon icon={faTimesCircle} />
                            
                            Anulează
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditTelefon(true)}
                            className="btn-outline-purple-little"
                         >
                          <FontAwesomeIcon icon={faAdd} />
                            Modifică
                          </button>
                        )}
                      </div>
                      {editTelefon && telefonNou.trim() === "" && (
                        <p className="text-xs text-red-600">Telefonul nu poate fi gol!</p>
                      )}
                      {editTelefon && !/^0(2|3|7)\d{8}$/.test(telefonNou) && telefonNou !== "" && (
                        <p className="text-xs text-red-600">Număr invalid: trebuie să înceapă cu 02, 03 sau 07 și să aibă 10 cifre.</p>
                      )}
                    </div>

                    {/* Lista de modificări */}
                    {modificariLista.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="font-semibold text-purple-800 mb-2">Modificările tale:</h4>
                        {modificariLista.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                            <span><strong>{item.label}:</strong> {item.valoare}</span>
                            <button
                              onClick={() => {
                                setModificariLista((prev) => prev.filter((mod) => mod.camp !== item.camp));
                                if (item.camp === "nume") {
                                  setNumeNou("");
                                  setEditNume(false);
                                }
                                if (item.camp === "telefon") {
                                  setTelefonNou("");
                                  setEditTelefon(false);
                                }
                              }}
                              className="text-red-600 font-bold text-lg"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                </div>
              </div>
            )}

            {/* Specialitate */}
            {selectedRequest === "MODIFICARE_SPECIALITATE" && (
              <div className="border-t-2 border-b-2 border-purple-100 px-5 py-5">

                
                {/* Specialitati */}
                <div>
                  <h3 className="text-xl font-bold text-purple-800 mb-3">
                    <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-purple-500" />
                    Specialitățile medicului
                  </h3>

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

                <div className="mt-10">
                <h3 className="text-xl font-bold text-purple-800 mb-4">
                  <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-purple-500" />
                  Specialități disponibile
                </h3>

                {specialitiesData && specialitiesData.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-800 ml-2">
                    {specialitiesData.map((spec, index) => (
                      <li key={index}>
                        <span className="font-semibold">{spec.specialityID}</span> – {spec.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm italic text-gray-500">Nu există specialități disponibile.</p>
                )}
                </div>

                <div className="mt-10">
                  <label className="font-semibold text-lg text-purple-800">
                    Detaliază solicitarea ta
                  </label>
                  <textarea
                    value={mesajAlteSolicitari}
                    onChange={(e) => setMesajAlteSolicitari(e.target.value)}
                    placeholder="Ex: Aș dori să adaug o nouă specialitate..."
                    rows={4}
                    className="w-full border rounded p-2 text-sm mt-2"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Locatii si program */}
            {selectedRequest === "MODIFICARE_LOCATII_SI_PROGRAM" && (
               <div className="border-t-2 border-b-2 border-purple-100 px-5 py-5">

                <div>
                  <h3 className="text-xl font-bold text-purple-800 mb-3">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-purple-500" />
                    Locații unde profesează
                  </h3>

                  {doctorLocationData.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-5">
                      {doctorLocationData.map((loc, idx) => (
                        <div key={idx} className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100">
                          <p className="font-semibold text-purple-700 text-lg">{loc.locationName} ({loc.locationID})</p>
                          <p className="text-sm text-gray-600 mb-2">
                            Specialitate: <span className="font-medium">{loc.specialityName} ({loc.specialityID})</span>
                          </p>

                          <p className="font-medium text-sm text-purple-800 mb-1">Program:</p>
                          {loc.schedule && loc.schedule.length > 0 ? (
                            <ul className="list-disc list-inside ml-2 text-sm text-gray-700">
                              {loc.schedule.map((day, i) => (
                                <li key={i}>{ziuaCorecta(day.day)}: {day.startTime} - {day.endTime}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Nu există program setat pentru această locație.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-500">Acest medic nu are locații active asociate.</p>
                  )}
                </div>

                <div className="mt-10">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">
                    <FontAwesomeIcon icon={faHospital} className="mr-2 text-purple-500" />
                    Locații disponibile
                  </h3>

                  {locationsData && locationsData.length > 0 ? (
                    <ul className="space-y-4">
                      {locationsData.map((loc, index) => (
                        <li
                          key={index}
                          className="bg-gray-50 border-l-4 border-purple-300 p-4 rounded shadow-md"
                        >
                          <p className="text-lg font-semibold text-purple-700">
                            {loc.locationID} – {loc.clinicName}
                          </p>
                          <p className="text-gray-700 text-sm">
                            <strong>Adresă:</strong>{" "}
                            {loc.address?.street}, {loc.address?.city}, {loc.address?.county}
                          </p>
                          <p className="text-sm font-medium text-gray-600">
                            <strong>Status:</strong>{" "}
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-white text-xs font-bold ${
                                loc.status === "deschis"
                                  ? "bg-green-500"
                                  : loc.status === "inchis temporar"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            >
                              {getStatusLabel(loc.status)}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-gray-500">Nu există locații disponibile.</p>
                  )}
                </div>



                <div className="mt-10">
                  <label className="font-semibold text-lg text-purple-800">
                    Detaliază solicitarea ta
                  </label>
                  <textarea
                    value={mesajAlteSolicitari}
                    onChange={(e) => setMesajAlteSolicitari(e.target.value)}
                    placeholder="Ex: Aș dori să adaug o nouă locație..."
                    rows={4}
                    className="w-full border rounded p-2 text-sm mt-2"
                  ></textarea>
                </div>
                </div>
            )}

            {/* Alte solicitari */}
            {selectedRequest === "ALTE_SOLICITARI" && (
              <div className="border-t-2 border-b-2 border-purple-100 px-5 py-5">
              <div className="">
                <label className="font-semibold text-lg text-purple-800">
                  Detaliază solicitarea ta
                </label>
                <textarea
                  value={mesajAlteSolicitari}
                  onChange={(e) => setMesajAlteSolicitari(e.target.value)}
                  placeholder="Ex: Aș dori să schimb poza de profil..."
                  rows={4}
                  className="w-full border rounded p-2 text-sm mt-2"
                ></textarea>
              </div>
              </div>
            )}

            <div className="border-t-2 border-b-2 border-purple-100 px-5 py-5">
              <label className="block font-medium text-gray-700">Descriere (opțional)</label>
                <textarea
                  value={descriere}
                  onChange={(e) => setDescriere(e.target.value)}
                  placeholder="Adaugă detalii suplimentare..."
                  className="border border-gray-300 rounded-md p-2 w-full mt-1"
                  rows={3}
                />
              </div>

            <div className="flex justify-center p-4">
              <button
                onClick={handleTrimiteCerere}
                className="btn-outline-purple"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                Trimite cerere către admin
              </button>
            </div>
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

export default DoctorSettings