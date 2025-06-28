import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faCalendarDays, faCheck, faCircleCheck, faClipboardCheck, faClipboardList, faCommentDots, faHouse, faMagnifyingGlass, faPenToSquare, faTimes, faTimesCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { assets } from '../../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../../../context/AppContex';

import Loader from '../../../components/lOADER.JSX';
import { useCheckPatientAccess } from '../../../accessControl/useCheckPatientAccess';
import { formatStatus } from '../../../utils/formatStatus';
import CustomSelect from '../../../components/customSelect';
import DisplayAppTableP from './DisplayAppTableP';
import socket from '../../../socket';

const PatientAppSection = () => {

    useCheckPatientAccess();


    const { backendUrl } = useContext(AppContext);
    
    const navigate = useNavigate();

    const { patientID } = useParams();

    
    const [patientData, setPatientData] = useState([])
    const [appointmentsData, setAppointmentsData] = useState([])

    
    const { label, color, icon } = formatStatus(patientData?.status);
  
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [loadingPatients, setLoadingPatient] = useState(false)
    const [loadingAppointments, setLoadingAppointments] = useState(false)


// ------------------------- Preluare date  -------------------------
  
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

  const fetchAppointmentsByID = async () => {
    

    try {
        setLoadingAppointments(true);
        setLoadingMessage("Se încarcă programările...");

      const res = await axios.post(`${backendUrl}/api/main/get-appointments-by-id`, {
        id: patientData?.patientID || patientID || '',
        role: "patient",
      });

      if (res.data.success) {
        const appointments = res.data.data;
        console.log("Programări:", appointments);
        setAppointmentsData(appointments);

        //preluare date pt select
        //  Statusuri distincte
        const uniqueStatuses = Array.from(
          new Set(appointments.map(app => app.status))
        ).map(status => ({
          value: status,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        }));
        console.log(" Statusuri unice:", uniqueStatuses);
        setStatusOptions([{ value: "", label: "Toate statusurile" }, ...uniqueStatuses]);

        // Doctori (ID + nume)
        const uniqueDoctors = Array.from(
          new Map(
            appointments
              .filter(app => app.doctorID && app.doctorName)
              .map(app => [app.doctorID, { value: app.doctorID, label: app.doctorName }])
          ).values()
        );
        console.log(" Doctori unici:", uniqueDoctors);
        setDoctorOptions([{ value: "", label: "Toți doctorii" }, ...uniqueDoctors]);

        //  Investigații (ID + nume)
        const uniqueInvestigations = Array.from(
          new Map(
            appointments
              .filter(app => app.investigationID && app.investigationName)
              .map(app => [app.investigationID, { value: app.investigationID, label: app.investigationName }])
          ).values()
        );
        console.log(" Investigații unice:", uniqueInvestigations);
        setInvestigationOptions([{ value: "", label: "Toate investigațiile" }, ...uniqueInvestigations]);

        // Specialitati (ID + nume)
        const uniqueSpecialities = Array.from(
          new Map(
            appointments
              .filter(app => app.specialityID && app.specialityName)
              .map(app => [app.specialityID, { value: app.specialityID, label: app.specialityName }])
          ).values()
        );
        console.log(" Specialități unice:", uniqueSpecialities);
        setSpecialityOptions([{ value: "", label: "Toate specialitățile" }, ...uniqueSpecialities]);

        // Locatii (ID + nume)
        const uniqueLocations = Array.from(
          new Map(
            appointments
              .filter(app => app.locationID && app.locationName)
              .map(app => [app.locationID, { value: app.locationID, label: app.locationName }])
          ).values()
        );
        console.log("Locații unice:", uniqueLocations);
        setLocationOptions([{ value: "", label: "Toate locațiile" }, ...uniqueLocations]); 
      

      } else {
        toast.error(res.data.message || "Eroare la încărcarea programărilor.");
      }
    } catch (error) {
      console.error("Eroare la fetchAppointmentsByID:", error);
      toast.error("Eroare server la încărcarea programărilor.");
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
    fetchAppointmentsByID();
  }, []);

  useEffect(() => {
    fetchAppointmentsByID(); 

    socket.on("appointmentUpdated", (data) => {
      if (data.patientID === patientID) {
        console.log("Actualizare programare pacient:", data);
        toast.info('Programarea dumneavoastră a fost actualizată!');
        fetchAppointmentsByID();
      }
    });

    socket.on("appointmentAdded", (data) => {
       if (data.patientID === patientID) {
          console.log("Creare programare - primită prin socket:", data);
          toast.info('Programare adăugată!');
          fetchAppointmentsByID();
       } 
    });

    socket.on('DOCTOR_DELETED', () => {
        fetchAppointmentsByID(); 
        toast.info('Date actualizate');
      });

      socket.on('LOCATION_DELETED', () => {
      //console.log('Locațiile s-au actualizat (ștergere)!');
      toast.info('Date actualizate');
      fetchAppointmentsByID();
    });

    socket.on('locationAdded', () => {
      //console.log('Locațiile s-au actualizat (adăugare)!');
      toast.info('Date actualizate');
      fetchAppointmentsByID();
    });

    socket.on('INVESTIGATION_DELETED', () => {
      //console.log('Investigatiile s-au actualizat (adăugare)!');
      toast.info('Date actualizate');
      fetchAppointmentsByID();
    });

    socket.on('SPECIALITY_DELETED', () => {
      console.log('Specialitatile s-au actualizat (adăugare)!');
      toast.info('Date actualizate');
      fetchAppointmentsByID();
    });
  
    return () => {
      socket.off("appointmentUpdated");
      socket.off("appointmentAdded");
      socket.off("DOCTOR_DELETED");

      socket.off('locationAdded');
      socket.off('LOCATION_DELETED');

      socket.off('INVESTIGATION_DELETED');

      socket.off('SPECIALITY_DELETED');
    };

    
  }, []);
// --------------------------------------------------

// ------------------------- FILTRARE -------------------------

  const [ search, setSearch ] = useState('')

  const [doctorOptions, setDoctorOptions ] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')

  const [investigationOptions, setInvestigationOptions] = useState([])
  const [selectedInvestigation, setSelectedInvestigation] = useState('')

  const [locationOptions, setLocationOptions ] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')

  const [specialityOptions, setSpecialityOptions] = useState([])
  const [selectedSpeciality, setSelectedSpeciality ] = useState('')

  const [statusOptions, setStatusOptions] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')

  const sortOption = [
      { value: 'Data Crescător', label: 'Data Crescător' },
      { value: 'Data Descrescător', label: 'Data Descrescător' },
    ];
  const [selectedSorOption, setSelectedSortOption] = useState(null);

  // === Filtrare ===
  const filteredAppointments = appointmentsData
  .filter(app => {
    const matchesSearch =
      !search || search.trim() === '' ||
      app.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      app.investigationName?.toLowerCase().includes(search.toLowerCase()) ||
      app.locationName?.toLowerCase().includes(search.toLowerCase());

    const matchesDoctor =
      !selectedDoctor || !selectedDoctor || app.doctorID === selectedDoctor;

    const matchesInvestigation =
      !selectedInvestigation || !selectedInvestigation || app.investigationID === selectedInvestigation;

    const matchesLocation =
      !selectedLocation || !selectedLocation || app.locationID === selectedLocation;

    const matchesSpeciality =
      !selectedSpeciality || !selectedSpeciality|| app.specialityID === selectedSpeciality;

    const matchesStatus =
      !selectedStatus || !selectedStatus || app.status === selectedStatus;

    return (
      matchesSearch &&
      matchesDoctor &&
      matchesInvestigation &&
      matchesLocation &&
      matchesSpeciality &&
      matchesStatus
    );
  })
  .sort((a, b) => {
    switch (selectedSorOption) {
      case 'Data Crescător':
        return new Date(a.date) - new Date(b.date);
      case 'Data Descrescător':
        return new Date(b.date) - new Date(a.date);
      default:
        return 0;
    }
  });


  return (
    <div>
        {loading && <Loader message={loadingMessage} />}

        {appointmentsData && (
            <>
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
                  <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
                    <FontAwesomeIcon icon={faHouse} />
                    <span className="ml-1">Acasă</span>
                  </Link>
                  <span className="text-gray-400">{'>'}</span>
                  <span className="text-purple-600 underline font-medium">
                    <FontAwesomeIcon icon={faClipboardCheck} />
                    <span className="ml-1">Programările mele</span>
                  </span>
                </nav>

                 {/* Info */}
                <div className="border bg-gray-50 border-gray-200 border-2 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 flex flex-col text-gray-900">
                
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-200 to-pink-100 border border-gray-200 rounded-t-2xl shadow-md p-3  flex flex-col sm:flex-row items-center gap-6">

                  {/* Buton adaugare programare */}
                  <div className="absolute right-6 top-6">
                    <button
                      onClick={() => navigate(`/profil-pacient/${patientID}/programarile-mele/creeaza-programare`)}
                      className="btn-outline-purple cursor-pointer"
                    >
                      + Programează-te
                    </button>
                  </div>

                  {/* poza de profil + input */}
                  <div className="relative">
                    <img
                       src={patientData.profileImage || assets.user_default}
                      alt="Profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <span className="absolute bottom-2 right-0 bg-blue-300 text-white rounded-full p-2 px-3 shadow-md">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                  </div>

                  {/* Info pacient */}
                  <div className="flex-1 flex flex-col items-center sm:items-start">
                    <h2 className="md:text-3xl text-2xl font-extrabold text-purple-700 mb-1">
                      {patientData ? `${patientData.lastName} ${patientData.firstName}` : 'Nume Prenume'}
                    </h2>
                    <div className="flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full text-sm font-bold">
                      <span className="text-purple-700">Pacient MedPrime:</span>
                      {patientData?.createdAt && (
                        <span className="text-gray-800 font-semibold">
                          din {new Date(patientData.createdAt).getFullYear()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full text-sm font-bold">
                      <span className="text-purple-700">Status:</span>
                      <span className={`flex items-center gap-1 ${color}`}>
                        <FontAwesomeIcon icon={icon} className="w-4 h-4 ml-1" />
                        <span className="font-semibold text-sm">{label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-1">
                {/* Header */}
                  <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border-b-1 border-gray-300 p-5">
                      <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
                          {/* Icon */}
                          <FontAwesomeIcon
                              icon={faCalendarCheck}
                              className="text-purple-600 md:text-3xl text-3xl sm:mb-0"
                          />
                          {/* Text */}
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                              Gestionează toate programările tale medicale
                          </h2>
                      </div>
                      
                  </div>

                </div>

                <div className="px-6">
                  <div className=" px-2  mb-5 mt-4">   
                    {/* Filtre */}
                    <div className='border-b-1 border-gray-300 mt-3 mb-3'>
                      <div className="flex items-center gap-2 mb-4">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
                        <h2 className="text-base sm:text-lg md:text-lg font-medium text-gray-800">Filtrează programările</h2>
                      </div>
                  
                      {/* Optiuni filtre */}
                      <div className="flex flex-col lg:flex-row gap-4 items-center">
                      
                        <input
                          type="text"
                          placeholder="Caută..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="border border-gray-700 p-2.5 rounded w-full lg:w-1/2 text-sm  mb-7"
                        />

                        <CustomSelect
                          options={specialityOptions}
                          value={selectedSpeciality}
                          onChange={(selected) => setSelectedSpeciality(selected)}
                          placeholder="Specialitatea..."
                          className="w-full lg:w-1/2 text-sm mb-7"
                        />

                        <CustomSelect
                          options={locationOptions}
                          value={selectedLocation}
                          onChange={(selected) => setSelectedLocation(selected)}
                          placeholder="Locația..."
                          className="w-full lg:w-1/2 text-sm mb-7"
                        />

                        <CustomSelect
                          options={doctorOptions}
                          value={selectedDoctor}
                          onChange={(selected) => setSelectedDoctor(selected)}
                          placeholder="Medicul..."
                          className="w-full lg:w-1/2 text-sm mb-7"
                        />

                        <CustomSelect
                          options={investigationOptions}
                          value={selectedInvestigation}
                          onChange={(selected) => setSelectedInvestigation(selected)}
                          placeholder="Investigația..."
                          className="w-full lg:w-1/2 text-sm mb-7"
                        />

                        <CustomSelect
                          options={sortOption}
                          value={selectedSorOption}
                          onChange={(selected) => setSelectedSortOption(selected)}
                          placeholder="Ordinea..."
                          className="w-full lg:w-1/2 text-sm mb-7"
                        />


                        <button
                            onClick={() => {
                              setSearch('');
                              setSelectedDoctor(null)
                              setSelectedInvestigation(null)
                              setSelectedLocation(null)
                              setSelectedSpeciality(null)
                              setSelectedSortOption(null)
                            
                            }}
                            className="bg-purple-100 mb-7 cursor-pointer hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
                          >
                          Resetează
                        </button>
                      </div>

                    </div>
  
                  
                    <DisplayAppTableP
                        appointments = {filteredAppointments}
                    />

                  </div>
                </div>
                          
                
                
                </div>
            </>
          )
        } 



    </div>
  )
}

export default PatientAppSection