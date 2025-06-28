import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faCheck, faCircleCheck, faClipboardCheck, faHouse, faMagnifyingGlass, faPenToSquare, faTimes, faTimesCircle, faUser, faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import { assets } from '../../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../../../context/AppContex';
import { useCheckDoctorAccess } from '../../../accessControl/useCheckDoctorAccess '
import socket from '../../../socket';
import Loader from '../../../components/Loader';
import CustomSelect from '../../../components/customSelect';
import DisplayAppTableM from '../Appointment/DisplayAppTableM';


const DoctorAppointments = () => {
    useCheckDoctorAccess();

    const { backendUrl } = useContext(AppContext);
    
    const navigate = useNavigate();

    const { doctorID } = useParams();
    

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [appointmentsData, setAppointmentsData] = useState([])

    // ------------------------- Preluare date  -------------------------

    const fetchAppointmentsByID = async () => {
      try {
          setLoading(true);
          setLoadingMessage("Se încarcă programările...");

        const res = await axios.post(`${backendUrl}/api/main/get-appointments-by-id`, {
          id: doctorID,
          role: "doctor",
        });

        if (res.data.success) {
          const appointments = res.data.data;
          console.log("Programări:", appointments);
          setAppointmentsData(appointments);

          const uniqueStatuses = Array.from(
            new Set(appointments.map(app => app.status))
          ).map(status => ({
            value: status,
            label: status.charAt(0).toUpperCase() + status.slice(1)
          }));
          console.log(" Statusuri unice:", uniqueStatuses);
          setStatusOptions([{ value: "", label: "Toate statusurile" }, ...uniqueStatuses]);

          const uniquePatients = Array.from(
            new Map(
              appointments
                .filter(app => app.patientID && app.patientName)
                .map(app => [app.patientID, { value: app.patientID, label: app.patientName }])
            ).values()
          );
          console.log(" Pacienți unici:", uniquePatients);
          setPatientOptions([{ value: "", label: "Toți pacineții" }, ...uniquePatients]);

          const uniqueInvestigations = Array.from(
            new Map(
              appointments
                .filter(app => app.investigationID && app.investigationName)
                .map(app => [app.investigationID, { value: app.investigationID, label: app.investigationName }])
            ).values()
          );
          console.log(" Investigații unice:", uniqueInvestigations);
          setInvestigationOptions([{ value: "", label: "Toate investigațiile" }, ...uniqueInvestigations]);

          const uniqueSpecialities = Array.from(
            new Map(
              appointments
                .filter(app => app.specialityID && app.specialityName)
                .map(app => [app.specialityID, { value: app.specialityID, label: app.specialityName }])
            ).values()
          );
          console.log(" Specialități unice:", uniqueSpecialities);
          setSpecialityOptions([{ value: "", label: "Toate specialitățile" }, ...uniqueSpecialities]);

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
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchAppointmentsByID(); 

    socket.on("appointmentUpdated", (data) => {
      console.log("Actualizare primită prin socket:", data);
      toast.info('Programările au fost actualizate!');
      fetchAppointmentsByID(); 
    });

    socket.on("appointmentAdded", (data) => {
      console.log("Creare programare - primită prin socket:", data);
      toast.info('Programare adăugată!');
      fetchAppointmentsByID(); 
    });

    socket.on("appointmentDeleted", (data) => {
      console.log("Creare programare - primită prin socket:", data);
      toast.info('Programare adăugată!');
      fetchAppointmentsByID(); 
    });

     socket.on('LOCATION_DELETED', () => {
        console.log('Locațiile s-au actualizat (ștergere)!');
		    toast.info('Date actualizate');
        fetchAppointmentsByID();
      });

      socket.on('locationAdded', () => {
        console.log('Locațiile s-au actualizat (adăugare)!');
        toast.info('Date actualizate');
        fetchAppointmentsByID();
      });

      socket.on('INVESTIGATION_DELETED', () => {
        console.log('Locațiile s-au actualizat (adăugare)!');
        toast.info('Date actualizate');
        fetchAppointmentsByID();
      });

      socket.on('SPECIALITY_DELETED', () => {
        console.log('Locațiile s-au actualizat (adăugare)!');
        toast.info('Date actualizate');
        fetchAppointmentsByID();
      });

    return () => {
      socket.off("appointmentUpdated");
      socket.off("appointmentAdded");
      socket.off("appointmentAdded");

      socket.off('locationAdded');
      socket.off('LOCATION_DELETED');

      socket.off('INVESTIGATION_DELETED');
      
      socket.off('SPECIALITY_DELETED');

    };
  }, []);

  // ------------------------- FILTRARE -------------------------
  
    const [ search, setSearch ] = useState('')
  
    const [patientOptions, setPatientOptions ] = useState([])
    const [selectedPatient, setSelectedPatient] = useState('')
  
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
  
      const matchesPatient =
        !selectedPatient || !selectedPatient || app.patientID === selectedPatient;
  
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
        matchesPatient &&
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

  // ------------------------- CONTORIZARE -------------------------
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
  
    //statistica
      const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
      const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
      
    
  return (
    <div>
      {/* Intro */}
      <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center border-b-1 border-gray-200 p-3">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
              {/* Icon */}
              <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="text-purple-600 md:text-3xl text-3xl sm:mb-0 ml-5"
              />
              {/* Text */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                  Programările Mele
                  <p className="text-gray-600 text-sm font-semibold">
                      Vizualizează, editează sau anulează consultațiile tale medicale
                  </p>
              </h2>
          </div>
      </div>

      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
      ) : (
        <>
          

          {/* Afisare */}
          <div className="px-6 py-3">
            <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4">   

              {/* Filtre */}
              <div>
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
                    className="border border-gray-700 p-2.5 rounded w-full lg:w-1/2 text-sm  mb-2"
                  />

                  <CustomSelect
                    options={locationOptions}
                    value={selectedLocation}
                    onChange={(selected) => setSelectedLocation(selected)}
                    placeholder="Locația..."
                    className="w-full lg:w-1/2 text-sm mb-2"
                  />

                  <CustomSelect
                    options={patientOptions}
                    value={selectedPatient}
                    onChange={(selected) => setSelectedPatient(selected)}
                    placeholder="Pacientul..."
                    className="w-full lg:w-1/2 text-sm mb-2"
                  />

                  <CustomSelect
                    options={investigationOptions}
                    value={selectedInvestigation}
                    onChange={(selected) => setSelectedInvestigation(selected)}
                    placeholder="Investigația..."
                    className="w-full lg:w-1/2 text-sm mb-2"
                  />

                  <CustomSelect
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={(selected) => setSelectedStatus(selected)}
                    placeholder="Statusul..."
                    className="w-full lg:w-1/2 text-sm mb-2"
                  />

                  <CustomSelect
                    options={sortOption}
                    value={selectedSorOption}
                    onChange={(selected) => setSelectedSortOption(selected)}
                    placeholder="Ordinea..."
                    className="w-full lg:w-1/2 text-sm mb-2"
                  />


                  <button
                      onClick={() => {
                        setSearch('');
                        setSelectedPatient(null)
                        setSelectedInvestigation(null)
                        setSelectedLocation(null)
                        setSelectedSpeciality(null)
                        setSelectedStatus(null)
                        setSelectedSortOption(null)
                      
                      }}
                      className="bg-purple-100 mb-2   hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
                    >
                    Resetează
                  </button>
                </div>

              </div>

              {/* Navigare pagini */}
              <div>
                  {/* Primul rand */}
                  <div className="flex items-center justify-center relative my-2 mt-10">
                      <div className="flex-grow border-t border-gray-300 mr-3"></div>
                      <span className="text-gray-700 md:text-base text-sm font-medium whitespace-nowrap">
                      Numărul programărilor: <strong>{filteredAppointments.length}</strong>
                      </span>
                      <div className="flex-grow border-t border-gray-300 ml-3"></div>
                  </div>

                  {/* Al doilea rand */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-3 text-sm text-gray-700">
                      
                      {/* Select nr. pe pagina */}
                      <div className="flex items-center gap-2">
                      <span>Arată pe pagină:</span>
                      {[5, 25, 50, 100].map(number => (
                          <button
                          key={number}
                          onClick={() => {
                              setItemsPerPage(number);
                              setCurrentPage(1);
                          }}
                          className={`px-2 py-1 rounded ${
                              itemsPerPage === number
                              ? 'font-bold text-purple-700 underline'
                              : 'hover:text-purple-600'
                          }`}
                          >
                          {number}
                          </button>
                      ))}
                      <span>programări</span>
                      </div>

                      {/* Navigare pagini */}
                      <div className="flex items-center gap-3">
                      <button
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                      >
                      
                          ← Anterior
                      </button>
                      <span>{currentPage} din {totalPages}</span>
                      <button
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                      >
                          Următor →
                      </button>
                      </div>
                  </div>
              </div>


              <DisplayAppTableM
                appointments = {paginatedAppointments}
              />

              {/* Navigare pagini */}
              <div className="flex justify-end items-center gap-3 mt-4 text-sm">
                  <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                  >
              
                  ← Anterior
                  </button>
                  <span>{currentPage} din {totalPages}</span>
                  <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                  >
                  Următor →
                  </button>
              </div>
            </div>
          </div> 
        </>
      )}
    </div>
  )
}

export default DoctorAppointments