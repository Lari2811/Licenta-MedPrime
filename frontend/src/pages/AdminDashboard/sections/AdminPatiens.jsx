import React, { useState, useEffect, useContext } from 'react';

import { AppContext } from '../../../context/AppContex';
import axios from 'axios';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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

const AdminPatiens = () => {

  useCheckAdminAccess();

  const { backendUrl } = useContext(AppContext);

  //contorizare
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  

  //datas from DB
  const [patientsData, setPatientsData] = useState([]);

  //actions
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  
   //Filtre
  // stare pentru fiecare filtru
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [patientStatusOptions, setPatientStatusOptions] = useState([]);
  const [selectedStatusPatient, setSelectedStatusPatient] = useState(null);

  const fetchPatients = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Se încarcă pacienții...");

        const res = await fetch(`${backendUrl}/api/admin/get-all-patients`);
        const data = await res.json();

        if (data.success) {
          console.log("Patients: ",  data.data)
          setPatientsData(data.data);
        } else {
          console.error("Eroare API:", data.message);
        }
      } catch (error) {
        console.error("Eroare rețea:", error);
      } finally{
        setLoading(false);
        setLoadingMessage("");
      }
    };
       
    useEffect(() => {
      fetchPatients();

       socket.on('PATIENT_STATUS_UPDATE', () => {
        fetchPatients(); 
        toast.info("Date actualizate!")
        //toast.info('Medicul a fost șters!');
      });


      return () => {
        socket.off('PATIENT_STATUS_UPDATE');
      };
    }, []);

    const statusOptions = [
      { value: '', label: 'Toate statusurile' },
      { value: 'activ', label: 'Activ' },
      { value: 'in asteptare', label: 'În așteptare' },
      { value: 'suspendat', label: 'Suspendat' }
    ];

    const filteredPatients = patientsData
      .filter((patient) => {
        const fullName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
        const matchSearch = !searchPatient || fullName.includes(searchPatient.toLowerCase());
       const matchStatus = !selectedStatusPatient || patient.status === selectedStatusPatient.value;
        return matchSearch && matchStatus;
      });

     //statistica
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const paginatedPatients = filteredPatients.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  return (
    <div className="">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 mb-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  <FontAwesomeIcon icon={faUserDoctor} className='mr-2 text-purple-600' /> Gestionare pacienți
                </h1>
                <p className="text-sm text-gray-500">Administrează pacienții din clinică</p>
              </div>      
      </div>

      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
      ) : (
        <>

       {/* Afisare */}
      <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-1">
        
        {/* Filtre */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
            <h2 className="text-base sm:text-lg md:text-lg font-medium text-gray-800">Filtrează pacienți</h2>
            </div>

          {/* Optiuni filtre */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Caută pacient..."
              className="border border-gray-700 p-2.5 rounded w-full lg:w-full text-sm"
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
            />

           <CustomSelect
              options={statusOptions}
              value={selectedStatusPatient?.value || ''}  
              onChange={(val) => {
                const found = statusOptions.find(opt => opt.value === val);
                setSelectedStatusPatient(found || null);
              }}
              placeholder="Status pacient..."
              className="w-full lg:w-full text-sm"
            />

            {/* Resetare */}
            <button
            onClick={() => {
              setSearchPatient('');
              setSelectedStatusPatient(null);
            
            }}
            className="bg-purple-100 hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
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
              Numărul pacienților: <strong>{filteredPatients.length}</strong>
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
              <span>pacienți</span>
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
        
        <DisplayPatientsTable
          patients = {paginatedPatients}
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

export default AdminPatiens