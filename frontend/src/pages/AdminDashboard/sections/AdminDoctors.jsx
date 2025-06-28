import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContex';
import axios from 'axios';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faCheckCircle, faClipboard, faEdit, faEnvelope, faEye, faHospital,
  faMagnifyingGlass, faMapMarkerAlt, faStar, faStethoscope,
  faTimesCircle, faTools, faTrashAlt,
  faUserDoctor
} from '@fortawesome/free-solid-svg-icons';

import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddDoctos from '../DoctorsSection/AddDoctos';
import DisplayTableDoctors from '../DoctorsSection/DisplayTableDoctors';
import DeleteDoctor  from '../DoctorsSection/DeleteDoctor';
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';
import AddDoctor_Info from '../DoctorsSection/AddDoctor_Info';
import Loader from '../../../components/Loader';
import CustomSelect from '../../../components/customSelect';

import socket from '../../../socket';


const AdminDoctors = () => {
  useCheckAdminAccess();
  
    const { backendUrl } = useContext(AppContext);

    const [doctorsData, setDoctorsData] = useState([])

    const [showModalAdd, setShowModalAdd] = useState(false);
    const [showModalAddInfo, setShowModalAddInfo]= useState(false);
    const [selectedDoctorData, setSelectedDoctorData] = useState(null);

    //contorizare
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Se încarcă informațiile...")

        const res = await axios.get(`${backendUrl}/api/main/get-all-active-doctors-with-data`);
        const allDoctors = res.data.data;
        setDoctorsData(allDoctors);

        console.log("doctori:", allDoctors);

        // ================= Specialitati =================
        const specialityOptions = [
          { value: '', label: 'Toate specialitățile' },
          ...Array.from(
            new Set(
              allDoctors.flatMap(doc =>
                doc.specialities?.map(spec => spec.specialityName)
              )
            )
          )
            .filter(Boolean)
            .map(specialityName => ({ value: specialityName, label: specialityName }))
            .sort((a, b) => a.label.localeCompare(b.label))
        ];
        setSpecialityDoctorsOptions(specialityOptions);

        //console.log("Specialități:", specialityOptions);

        // ================= Tipuri doctori =================
        const typeOptions = [
          { value: '', label: 'Toate tipurile' },
          ...Array.from(
            new Set(
              allDoctors.flatMap(doc => doc.type ? [doc.type.toLowerCase()] : [])
            )
          ).map(type => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1)
          }))
        ];
        setDoctorTypesOptions(typeOptions);

        //console.log("Tipuri doctori:", typeOptions);

        // ================= Locatiii =================
        const locationMap = new Map();

        allDoctors.forEach(doc => {
          doc.locations?.forEach(loc => {
            if (loc.locationID && loc.locationName) {
              locationMap.set(loc.locationID, loc.locationName);
            }
          });
        });

        const locationOptions = [
          { value: '', label: 'Toate locațiile' },
          ...Array.from(locationMap.entries()).map(([id, name]) => ({
            value: id,
            label: name
          }))
        ];
        setLocationDoctorOptions(locationOptions);


      } catch (err) {
        toast.error("Eroare server la doctori");
      } finally {
        setLoading(false);
        setLoadingMessage("")
      }
    };

    useEffect(() => {
      fetchDoctors(); 

      socket.on('DOCTOR_DELETED', () => {
        console.log(' Medici s-au actualizat!');
        fetchDoctors(); 
        toast.info('Date actualizate');
      });

      socket.on('DOCTOR_ADDED', () => {
        console.log(' Medici s-au actualizat!');
        fetchDoctors();
        toast.info('Date actualizate');
      });

      socket.on('SPECIALITY_DELETED', () => {
        console.log(' Medici s-au actualizat!');
        fetchDoctors(); 
        toast.info('Date actualizate');
      });

      return () => {
        socket.off('DOCTOR_DELETED');
        socket.off('DOCTOR_ADDED');
        socket.off('SPECIALITY_DELETED');
      };
    }, []);
   

  // ---------------------  FILTRE  ----------------------
 
  const [searchDoctor, setSearchDoctor] = useState('');

  const [specialityDoctorsOptions, setSpecialityDoctorsOptions] = useState([]);
  const [selectedSpecialityDoctor, setSelectedSpecialityDoctor] = useState('');

  const [locationDoctorOptions, setLocationDoctorOptions] = useState([]);
  const [selectedLocationDoctor, setSelectedLocationDoctor] = useState('');

  const [doctorTypesOptions, setDoctorTypesOptions] = useState([]);
  const [selectedTypeDoctor, setSelectedTypeDoctor] = useState('');
  
  const sortOptionDoctor = [
    { value: 'Nume A-Z', label:  (<> <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> <span> Nume </span> </>)},
    { value: 'Nume Z-A', label:  (<> <FontAwesomeIcon icon={faArrowDown} className="mr-1" /> <span> Nume </span> </>)},
    { value: 'Rating crescător', label: (<> <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> <span> Rating </span>  <FontAwesomeIcon icon={faStar} className="ml-1 text-yellow-500" /> </>) },
    { value: 'Rating descrescător', label: (<> <FontAwesomeIcon icon={faArrowDown} className="mr-1"/> <span> Rating </span> <FontAwesomeIcon icon={faStar} className="ml-1 text-yellow-500" /></>) },
  ];
  const [selectedSortDoctorOption, setSelectedSortDoctorOption] = useState(null);

  // === Filtrare ===
   const filteredDoctors = doctorsData
    .filter((doc) => {
      const matchSearch =
        !searchDoctor ||
        `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(searchDoctor.toLowerCase());

      const matchLocation =
        !selectedLocationDoctor ||
        doc.locations?.some(loc => loc.locationID === selectedLocationDoctor);

      const matchSpeciality =
        !selectedSpecialityDoctor ||
        doc.specialities?.some(spec => spec.specialityName === selectedSpecialityDoctor);

      const matchType =
        !selectedTypeDoctor ||
        doc.type?.toLowerCase() === selectedTypeDoctor.toLowerCase();

      return matchSearch && matchLocation && matchSpeciality && matchType;
    })
    //  Sortare
    .sort((a, b) => {
      if (!selectedSortDoctorOption || !selectedSortDoctorOption) return 0;

      switch (selectedSortDoctorOption) {
        case 'Nume A-Z':
          return a.lastName.localeCompare(b.lastName);
        case 'Nume Z-A':
          return b.lastName.localeCompare(a.lastName);
        case 'Rating crescător':
          return a.rating - b.rating;
        case 'Rating descrescător':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    // -------------------------------------------------------------------
  

   //statistica
    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    const paginatedDoctors = filteredDoctors.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  
  return (
    <div className="">
      
      {/* Intro */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            <FontAwesomeIcon icon={faUserDoctor} className='mr-2 text-purple-600' /> Gestionare medici
          </h1>
          <p className="text-sm text-gray-500">Administrează medicii disponibili în clinici</p>
        </div>
        <button
          onClick={() => setShowModalAdd(true)}
          className="mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition"
        >
          + Medic nou
        </button>
      </div>

      {showModalAdd && 
        <AddDoctos 
          onCloseSave={(doctorData) => {
            
            setShowModalAdd(false)
            setSelectedDoctorData(doctorData)
            console.log("Din primul modal:", doctorData)

            setShowModalAddInfo(true)
          }
        } 
        
          onClose= { () =>{
            setShowModalAdd(false)
            toast.info("Adăugarea medicul s-a anulat!")
          }}
        />
      }

      {showModalAddInfo && 
        <AddDoctor_Info
          doctorData = {selectedDoctorData}
          onCloseSave={ () => {
            setShowModalAddInfo(false)
          }}
          onCloseFinish = { () => 
            {   
              setShowModalAddInfo(false);
              toast.success("Adăugarea medicului s-a finalizat cu succes!");
            }
          }
        />
      }

      {loading ? (
        <div>
           {loading && <Loader message={loadingMessage} />}
        </div>
      ) : (
        <>

         {/* Afisare */}
      <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-1">

        {/* FILTRE - container separat stilizat */}
      <div>
       
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
          <h2 className="text-base sm:text-lg md:text-xl font-medium  text-gray-800">Filtrează căutarea</h2>
        </div>

        {/* Filtre */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Caută un medic..."
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              className="border border-gray-700 p-2.5 rounded w-full lg:w-full text-sm"
            />
             <CustomSelect
              options={locationDoctorOptions}
              value={selectedLocationDoctor}
              onChange={(selected) => setSelectedLocationDoctor(selected)}
              placeholder="Locația..."
              className="w-full lg:w-full text-sm"
            />
            <CustomSelect
              options={specialityDoctorsOptions}
              value={selectedSpecialityDoctor}
              onChange={(selected) => setSelectedSpecialityDoctor(selected)}
              placeholder="Specialitatea..."
              className="w-full lg:w-full text-sm"
            />
              <CustomSelect
              options={doctorTypesOptions}
              value={selectedTypeDoctor}
              onChange={(selected) => setSelectedTypeDoctor(selected)}
              placeholder="Tipul..."
              className="w-full lg:w-full text-sm"
            />
            <CustomSelect
              options={sortOptionDoctor}
              value={selectedSortDoctorOption}
              onChange={(selected) => setSelectedSortDoctorOption(selected)}
              placeholder="Ordinea..."
              className="w-full lg:w-full text-sm"
            />

            <button
                onClick={() => {
                  setSearchDoctor('');
                  setSelectedSpecialityDoctor(null);
                  setSelectedTypeDoctor(null);
                  setSelectedSortDoctorOption(null);
                  setSelectedLocationDoctor(null);
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
              Numărul medicilor: <strong>{filteredDoctors.length}</strong>
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
              <span>specialități</span>
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


        <DisplayTableDoctors
          doctors = {paginatedDoctors}
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

export default AdminDoctors