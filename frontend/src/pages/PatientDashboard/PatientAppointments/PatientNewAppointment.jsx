import React, { useContext, useEffect, useState } from 'react'
import { useCheckPatientAccess } from '../../../accessControl/useCheckPatientAccess';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faEdit, faHouse, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatStatus } from '../../../utils/formatStatus';
import { AppContext } from '../../../context/AppContex';
import { assets } from '../../../assets/assets';
import Loader from '../../../components/Loader';
import axios from 'axios';
import { toast } from 'react-toastify';
import CustomSelect_2 from '../../../components/customSelect_2';
import DatePicker from 'react-datepicker';
import { format, parse, isBefore, addMinutes } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";;

const PatientNewAppointment = () => {

    useCheckPatientAccess();

    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const { patientID } = useParams();

    const [patientData, setPatientData] = useState([])
    
    const { label, color, icon } = formatStatus(patientData?.status);
  
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [loadingPatients, setLoadingPatient] = useState(false)

    const [userNotes, setUserNotes] = useState("");

    const [investigationsList, setInvestigationsList] = useState([]);
    const [selectedInvestigation, setSelectedInvestigation] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedSpeciality, setSelectedSpeciality] = useState(null);

    const [options, setOptions] = useState({
        validDoctors: [],
        validSpecialities: [],
        validLocations: [],
    });

    const [selectedDate, setSelectedDate] = useState(null);
    const [dailySlots, setDailySlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [doctorSchedule, setDoctorSchedule] = useState([]);



    // ------------------------- Preluare date pacient  -------------------------
  
    const fetchPatientData = async () => {

        try {
            setLoadingPatient(true);
            setLoadingMessage("Se încarcă datele pacientului...");
        const response = await axios.get(`${backendUrl}/api/patient/get-patient-by-ID/${patientID}`);

        if (response.status === 200 && response.data.success) {
            console.log("Pacient:", response.data.data);
            setPatientData(response.data.data);
            
        } else {
            toast.error(response.data.message || 'Pacientul nu a fost găsit.');
        }
        } catch (error) {
        console.error('Eroare API pacient:', error);
        toast.error('Eroare la încărcarea datelor pacientului.');
        } finally {
        setLoadingPatient(false);
        }
    };

    useEffect(() => {
      fetchPatientData();
    }, []);

     // ------------------------- Preluare date investigatie  -------------------------
    useEffect(() => {
        const fetchInvestigations = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/admin/get-all-investigations`);
            const sorted = res.data.data.sort((a, b) => a.name.localeCompare(b.name));
            setInvestigationsList(sorted);
        } catch (err) {
            console.error("Eroare la încărcare investigații", err);
        }
        };
        fetchInvestigations();
    }, []);

    // --------------------------------- SELECT ---------------------------------
    const handleInvestigationChange = async (newInvestigation) => {
        setSelectedInvestigation(newInvestigation);
        setSelectedDoctor(null);
        setSelectedLocation(null);
        setSelectedSpeciality(null);
        setSelectedDate(null);
        setDailySlots([]);
        setSelectedSlot(null);

        if (!newInvestigation) {
        setOptions({ validDoctors: [], validSpecialities: [], validLocations: [] });
        return;
        }

        try {
        const res = await axios.get(`${backendUrl}/api/main/appointment-options`, {
            params: { investigationID: newInvestigation.investigationID },
        });
        setOptions({ validDoctors: [], validSpecialities: res.data.validSpecialities || [], validLocations: [] });
        } catch (err) {
        console.error("Eroare la specialități", err);
        }
    };

    const handleSpecialityChange = async (newSpeciality) => {
        setSelectedSpeciality(newSpeciality);
        setSelectedDoctor(null);
        setSelectedLocation(null);
        setSelectedDate(null);
        setDailySlots([]);
        setSelectedSlot(null);

        if (!newSpeciality || !selectedInvestigation) return;

        try {
        const res = await axios.get(`${backendUrl}/api/main/appointment-options`, {
            params: {
            investigationID: selectedInvestigation.investigationID,
            specialityID: newSpeciality.specialityID,
            },
        });
        setOptions((prev) => ({ ...prev, validDoctors: res.data.validDoctors || [], validLocations: [] }));
        } catch (err) {
        console.error("Eroare la doctori", err);
        }
    };

    const handleDoctorChange = async (newDoctor) => {
        setSelectedDoctor(newDoctor);
        setSelectedLocation(null);
        setSelectedDate(null);
        setDailySlots([]);
        setSelectedSlot(null);

        if (!newDoctor || !selectedSpeciality || !selectedInvestigation) return;

        try {
        const res = await axios.get(`${backendUrl}/api/main/appointment-options`, {
            params: {
            investigationID: selectedInvestigation.investigationID,
            specialityID: selectedSpeciality.specialityID,
            doctorID: newDoctor.doctorID,
            },
        });
        setOptions((prev) => ({ ...prev, validLocations: res.data.validLocations || [] }));
        } catch (err) {
        console.error("Eroare la locații", err);
        }
    };

     // --------------------------------- PROGRAM ---------------------------------

    const handleSearchSchedule = async () => {
        if (!selectedDoctor || !selectedLocation || !selectedSpeciality || !selectedInvestigation || !selectedDate) return;

        const requestBody = {
        doctorID: selectedDoctor.doctorID,
        locationID: selectedLocation.locationID,
        specialityID: selectedSpeciality.specialityID,
        investigationID: selectedInvestigation.investigationID,
        durationMinutes: selectedInvestigation.duration,
        date: format(selectedDate, "yyyy-MM-dd"),
        };

        try {
        const res = await axios.post(`${backendUrl}/api/main/get-available-slots`, requestBody);
        setDailySlots(res.data.slots || []);
        setSelectedSlot(null);
        } catch (err) {
        if (err.response) {
            const status = err.response.status;
            if (status === 401) {
            toast.error("Medicul nu are program definit în acea locație.");
            } else if (status === 402) {
            toast.error("Medicul nu lucrează în ziua selectată.");
            } else if (status === 403) {
            toast.error("Investigația selectată nu este validă.");
            } else if (status === 404) {
            toast.error("Nu mai există sloturi libere pentru acea zi.");
            } else {
            toast.error("Eroare necunoscută.");
            }
        } else {
            toast.error("Eroare de rețea.");
        }
        }
    };

    const fetchDoctorSchedule = async () => {
        if (!selectedDoctor || !selectedLocation || !selectedSpeciality) return;
        try {
        const res = await axios.get(`${backendUrl}/api/main/get-doctor-schedule`, {
            params: {
            doctorID: selectedDoctor.doctorID,
            locationID: selectedLocation.locationID,
            specialityID: selectedSpeciality.specialityID,
            },
        });
        setDoctorSchedule(res.data.schedule || []);
        } catch (err) {
        setDoctorSchedule([]);
        console.error("Eroare la program:", err);
        }
    };

    useEffect(() => {
        if (!selectedDoctor || !selectedLocation || !selectedSpeciality) {
        setDoctorSchedule([]);
        return;
        }
        fetchDoctorSchedule();
    }, [selectedDoctor, selectedLocation, selectedSpeciality]);


  // --------------------------------- PROGRAMARE ---------------------------------

    const handleConfirmAppointment = async () => {
        if (!selectedSlot) {
        toast.error("Selectează un slot înainte de a confirma!");
        return;
        }

        if (!patientID) {
        toast.error("Utilizatorul nu este autentificat sau nu este pacient.");
        return;
        }

        try {

        setLoading(true);
        setLoadingMessage("Se salvează programarea...");


        const payload = {
            patientID: patientID,
            doctorID: selectedDoctor.doctorID,
            locationID: selectedLocation.locationID,
            specialityID: selectedSpeciality.specialityID,
            investigationID: selectedInvestigation.investigationID,

            date: format(selectedDate, "yyyy-MM-dd"),
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            notes: userNotes?.trim() || "",
        };

        await axios.post(`${backendUrl}/api/main/create-appointment`, payload);
        toast.success("Programare realizată cu succes!");

        setSelectedSlot(null);
        setDailySlots([]);
        setUserNotes("");
        setSelectedInvestigation(null);
        setSelectedDoctor(null);
        setSelectedLocation(null);
        setSelectedSpeciality(null);
        setSelectedDate(null);

        navigate(`/profil-pacient/${patientID}/programarile-mele/`)


        } catch (err) {
        toast.error("Eroare la salvarea programării.");
        } finally {
        setLoading(false);
        setLoadingMessage("")
        }
    };


  return (
    <div>
        {loading && <Loader message={loadingMessage} />}

        {patientData && (
            <>
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
                        <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
                        <FontAwesomeIcon icon={faHouse} />
                        <span className="ml-1">Acasă</span>
                    </Link>
                    <span className="text-gray-400">{'>'}</span>
                    <Link to={`/profil-pacient/${patientID}/programarile-mele`} className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
                        <FontAwesomeIcon icon={faClipboardCheck} />
                        <span className="ml-1">Programările mele</span>
                    </Link>
                    <span className="text-gray-400">{'>'}</span>
                    <span className="text-purple-600 underline font-medium">
                        <FontAwesomeIcon icon={faEdit} />
                        <span className="ml-1">Creează programare</span>
                    </span>
                </nav>

                {/* Info */}
                <div className="border bg-gray-50 border-gray-200 border-2 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 flex flex-col text-gray-900">
            
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-purple-200 to-pink-100 border border-gray-200 rounded-t-2xl shadow-md p-3 mb-3 flex flex-col sm:flex-row items-center gap-6">
                        {/* poza de profil + input */}
                        <div className="relative">
                            <img
                            src={patientData.profileImage || assets.user_default}
                            alt="Profil"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <span className="absolute bottom-2 right-0  bg-blue-300 text-white rounded-full p-2 px-3 shadow-md">
                            <FontAwesomeIcon icon={faUser} />
                            </span>
                        </div>
            
                        {/* Info pacient */}
                        <div className="flex-1 flex flex-col items-center sm:items-start">
                            <h2 className="md:text-3xl text-2xl font-extrabold text-purple-700 mb-1">
                            {patientData ? `${patientData.lastName} ${patientData.firstName}` : 'Nume Prenume'}
                            </h2>
                            <div className="flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full text-sm font-bold">
                            <span className="text-purple-700">
                                Pacient MedPrime: 
                            </span>
                            {patientData?.createdAt && (
                                <span className="text-gray-800 font-semibold">
                                din {new Date(patientData.createdAt).getFullYear()}
                                </span>
                            )}
                            </div>
                            <div className="flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full text-sm font-bold">
                                <span className="text-purple-700">
                                    Status: 
                                </span>
                                <span className={`flex items-center gap-1 ${color}`}>
                                    <FontAwesomeIcon icon={icon} className="w-4 h-4 ml-1" />
                                    <span className="font-semibold text-sm">{label}</span>
                                </span> 
                            </div>
                        </div>
                    </div>

                    {/* Programare */}
                    <div className="px-6 py-3">
                        <div className=" mb-4 bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4">   
                            <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">Programează-te</h1>

                            <p className="text-center text-sm sm:text-base text-gray-600 mb-8 max-w-2xl mx-auto">
                            Selectează investigația și specialitatea, apoi medicul și locația. Vei putea alege ziua și ora disponibile.
                            </p>

                             {/* Selecturi */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <CustomSelect_2 label="Alege investigația" options={investigationsList} value={selectedInvestigation} onChange={handleInvestigationChange} getOptionLabel={(inv) => inv.name} getOptionValue={(inv) => inv.investigationID} />
                                <CustomSelect_2 label="Alege specialitatea" options={options.validSpecialities} value={selectedSpeciality} onChange={handleSpecialityChange} getOptionLabel={(spec) => spec.name} getOptionValue={(spec) => spec.specialityID} />
                                <CustomSelect_2 label="Alege medicul" options={options.validDoctors} value={selectedDoctor} onChange={handleDoctorChange} getOptionLabel={(doc) => `${doc.lastName} ${doc.firstName}`} getOptionValue={(doc) => doc.doctorID} />
                                <CustomSelect_2 label="Alege locația" options={options.validLocations} value={selectedLocation} onChange={setSelectedLocation} getOptionLabel={(loc) => loc.clinicName} getOptionValue={(loc) => loc.locationID} />
                            </div>

                            {/* Calendar si program */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-6">
                    
                            {/* Program medic */}
                            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-4 flex flex-col justify-center items-center text-center min-h-[180px]">
                                <h3 className="text-md font-semibold mb-3">Programul medicului în locația selectată</h3>
                                
                                {doctorSchedule.length > 0 ? (
                                <ul className="space-y-2">
                                    {doctorSchedule.map((entry, idx) => (
                                    <li key={idx} className="text-sm">
                                        <span className="font-medium capitalize">{entry.day}:</span> {entry.startTime} – {entry.endTime}
                                    </li>
                                    ))}
                                </ul>
                                ) : (
                                <p className="text-sm text-gray-500">Selectează medic, locație și specialitate pentru a vedea programul.</p>
                                )}
                            </div>
                    
                                {/* Calendar */}
                            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                <h3 className="text-md font-semibold mb-4">Alege data dorită</h3>
                                
                                <DatePicker
                                selected={selectedDate}
                                onChange={(date) => {
                                    setSelectedDate(date);
                                    setDailySlots([]);
                                    setSelectedSlot(null);
                                }}
                                minDate={new Date()}
                                inline
                                locale="ro"
                                />
                    
                                <div className="mt-4 flex justify-center">
                                <button
                                    onClick={handleSearchSchedule}
                                    disabled={
                                    !selectedDate ||
                                    !selectedDoctor ||
                                    !selectedLocation ||
                                    !selectedSpeciality ||
                                    !selectedInvestigation
                                    }
                                    className={`px-6 py-2 font-semibold rounded-xl shadow-md transition-all duration-300 ${
                                    !selectedDate ||
                                    !selectedDoctor ||
                                    !selectedLocation ||
                                    !selectedSpeciality ||
                                    !selectedInvestigation
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                                    }`}
                                >
                                    Caută sloturi disponibile
                                </button>
                                </div>
                            </div>
                    
                            </div>

                            {/* Sloturi afisare */}
                            {dailySlots.length > 0 && (
                                <div className="mt-8 bg-gray-50 border border-gray-300 rounded-2xl p-6 shadow-md mb-4">
                                <h4 className="text-lg sm:text-xl font-bold mb-5 text-center text-gray-800">
                                    Sloturi disponibile în {selectedDate.toLocaleDateString("ro-RO")}
                                </h4>

                                {/* Sloturi */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                    {dailySlots.map((slot, idx) => {
                                    const isSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;
                                    return (
                                        <button
                                        key={idx}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`px-4 py-2 rounded-xl border shadow-sm text-md font-semibold transition-all text-center cursor-pointer
                                            ${isSelected
                                            ? "bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300"
                                            : "bg-violet-100 hover:bg-violet-200 border-violet-300 text-gray-800"
                                            }`}
                                        >
                                        {slot.startTime} - {slot.endTime}
                                        </button>
                                    );
                                    })}
                                </div>

                                {/* Notite */}
                                <div className="mt-4 mb-4">
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                    Detalii relevante pentru medic (opțional)
                                    </label>
                                    <textarea
                                    id="notes"
                                    rows={3}
                                    placeholder="Ex: simptome, afecțiuni preexistente, alergii..."
                                    value={userNotes}
                                    onChange={(e) => setUserNotes(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                    />
                                </div>

                                {/* Buton confirmare */}
                                <div className="flex justify-center">
                                    <button
                                    onClick={handleConfirmAppointment}
                                    disabled={!selectedSlot}
                                    className={`px-6 py-2 cursor-pointer rounded-xl font-semibold shadow-md transition-all duration-300 
                                        ${selectedSlot
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                    >
                                    Confirmă programarea
                                    </button>
                                </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </> 
            )}
    </div>
  )
}

export default PatientNewAppointment