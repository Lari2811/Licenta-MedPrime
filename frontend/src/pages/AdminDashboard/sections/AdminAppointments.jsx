import React, { useState, useEffect, useContext } from 'react';

import { AppContext } from '../../../context/AppContex';
import axios from 'axios';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faCalendarAlt,
  faCalendarCheck,
  faCheckCircle, faClipboard, faEdit, faEnvelope, faEye, faHospital,
  faMagnifyingGlass, faMapMarkerAlt, faStethoscope,
  faTimesCircle, faTools, faTrashAlt,
  faUserDoctor
} from '@fortawesome/free-solid-svg-icons';

import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';
import CustomSelect from '../../../components/customSelect';
import Loader from '../../../components/Loader';
import DisplayPatientsTable from '../PatientSection/DisplayPatientsTable';

import socket from '../../../socket';
import DisplayAppTableA from '../Appointment/DisplayAppTableA';

const AdminAppointments = () => {

    useCheckAdminAccess();

    const { backendUrl } = useContext(AppContext);
    
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [appointmentsData, setAppointmentsData] = useState([])

    const fetchAllAppointments = async () => {
      try {
          setLoading(true);
          setLoadingMessage("Se încarcă programările...");

        const res = await axios.get(`${backendUrl}/api/admin/get-all-appointments`);

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
          //console.log(" Statusuri unice:", uniqueStatuses);
          setStatusOptions([{ value: "", label: "Toate statusurile" }, ...uniqueStatuses]);

          //  pacienti (ID + nume)
          const uniquePatients = Array.from(
            new Map(
              appointments
                .filter(app => app.patientID && app.patientName)
                .map(app => [app.patientID, { value: app.patientID, label: app.patientName }])
            ).values()
          );
          //console.log(" Pacienți unici:", uniquePatients);
          setPatientOptions([{ value: "", label: "Toți pacineții" }, ...uniquePatients]);

          //  doctori (ID + nume)
          const uniqueDoctors = Array.from(
            new Map(
              appointments
                .filter(app => app.doctorID && app.doctorName)
                .map(app => [app.doctorID, { value: app.doctorID, label: app.doctorName }])
            ).values()
          );
          //console.log(" Medici unici:", uniqueDoctors);
          setDoctortOptions([{ value: "", label: "Toți medici" }, ...uniqueDoctors]);

          // Investigatii (ID + nume)
          const uniqueInvestigations = Array.from(
            new Map(
              appointments
                .filter(app => app.investigationID && app.investigationName)
                .map(app => [app.investigationID, { value: app.investigationID, label: app.investigationName }])
            ).values()
          );
          //console.log(" Investigații unice:", uniqueInvestigations);
          setInvestigationOptions([{ value: "", label: "Toate investigațiile" }, ...uniqueInvestigations]);

          // Specialitati (ID + nume)
          const uniqueSpecialities = Array.from(
            new Map(
              appointments
                .filter(app => app.specialityID && app.specialityName)
                .map(app => [app.specialityID, { value: app.specialityID, label: app.specialityName }])
            ).values()
          );
          //console.log(" Specialități unice:", uniqueSpecialities);
          setSpecialityOptions([{ value: "", label: "Toate specialitățile" }, ...uniqueSpecialities]);

          //  Locatii (ID + nume)
          const uniqueLocations = Array.from(
            new Map(
              appointments
                .filter(app => app.locationID && app.locationName)
                .map(app => [app.locationID, { value: app.locationID, label: app.locationName }])
            ).values()
          );
          //console.log("Locații unice:", uniqueLocations);
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
    fetchAllAppointments(); 

    socket.on("appointmentUpdated", (data) => {
      //console.log("Actualizare primită prin socket:", data);
      toast.info('Programările au fost actualizate!');
      fetchAllAppointments(); 
    });

    socket.on("appointmentAdded", (data) => {
      //console.log("Creare programare - primită prin socket:", data);
      toast.info('Programare adăugată!');
      fetchAllAppointments(); 
    });

    socket.on('INVESTIGATION_DELETED', () => {
      console.log(' Investigaatiile s-au actualizat!');
      fetchDoctors(); // Actualizează locațiile la eveniment
      fetchAllAppointments
      toast.info('Date actualizate');
    });

    socket.on('SPECIALITY_DELETED', () => {
      console.log(' Specialitatile s-au actualizat!');
      fetchDoctors(); // Actualizează locațiile la eveniment
      fetchAllAppointments
      toast.info('Date actualizate');
    });

    return () => {
      socket.off("appointmentUpdated");
      socket.off("appointmentAdded");
      socket.off("INVESTIGATION_DELETED");
      socket.off("SPECIALITY_DELETED");
    };
  }, []);

  // ------------------------- FILTRARE -------------------------
    
      const [ search, setSearch ] = useState('')
    
      const [patientOptions, setPatientOptions ] = useState([])
      const [selectedPatient, setSelectedPatient] = useState('')

      const [doctorOptions, setDoctortOptions ] = useState([])
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
          { value: 'Data Crescător', label: (<> <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> <span> Data </span> </>)},
          { value: 'Data Descrescător', label: (<> <FontAwesomeIcon icon={faArrowDown}className="mr-1" /> <span> Data </span> </>)},
        ];
      const [selectedSorOption, setSelectedSortOption] = useState(null);
    
      // === Filtrare ===
      const filteredAppointments = appointmentsData
      .filter(app => {
        const matchesSearch =
          !search || search.trim() === '' ||
          app.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
          app.investigationName?.toLowerCase().includes(search.toLowerCase()) ||
          app.locationName?.toLowerCase().includes(search.toLowerCase()) ||
          app.patientName?.toLowerCase().includes(search.toLowerCase());
    
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 mb-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  <FontAwesomeIcon icon={faCalendarAlt} className='mr-2 text-purple-600' /> Vizualizează programările
                </h1>
                <p className="text-sm text-gray-500">Vizualizează toate programările din cadrul clinicilor</p>
              </div>
      </div>

      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
      ) : (
        <>

          {/* Afisare */}
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
                options={doctorOptions}
                value={selectedDoctor}
                onChange={(selected) => setSelectedDoctor(selected)}
                placeholder="Medicul..."
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
                    setSelectedDoctor(null)
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
                  
                  {/* Select nr. pe pagină */}
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

          <DisplayAppTableA
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
        </>
      )}



    </div>
  )
}

export default AdminAppointments