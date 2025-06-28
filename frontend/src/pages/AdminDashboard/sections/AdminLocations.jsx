import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContex';
import axios from 'axios';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faEdit, faEnvelope, faEye, faHospital,
  faMagnifyingGlass, faMapMarkerAlt, faStethoscope,
  faTimesCircle, faTools, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';

import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Addlocation from '../LocationSection/AddLocation';
import DisplayTable from '../LocationSection/DisplayTable';
import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';
import CustomSelect from '../../../components/customSelect';

import socket from '../../../socket';

import AddLocation_Specialities from '../LocationSection/AddLocation_Specialities';

const AdminLocations = () => {

  useCheckAdminAccess();

  const { adminID } = useParams();

  const navigate = useNavigate();
  
  const { backendUrl } = useContext(AppContext);

  const [locationsData, setLocationsData] = useState([]);

  const [loading, setLoading] = useState(false)
  
  //Filtre
  const [search, setSearch] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('Toate județele');
  const [selectedStatus, setSelectedStatus] = useState('Toate');
  const [sortOption, setSortOption] = useState('Ordonare');
  const [countyOptions, setCountyOptions] = useState([]);
  

  // ------------------------ Modal Add on section ------------------------
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showModalAddSpecialities, setShowModalAddSpecialities] = useState(false)
  const [showModalAddInvestigations, setShowModalAddInvestigations] = useState(false)

  const [selectedLocationData, setSelectedLocationData] = useState(null);
  //------------------------------------------------------------------------

  const [selectedSpeciality, setSelectedSpeciality] = useState('Toate specialitățile');
  const [specialityOptions, setSpecialityOptions] = useState([]);



  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-specialities`);
        const options = res.data.data.map(spec => ({
          label: spec.name,
          value: spec.specialityID
        }));
        setSpecialityOptions([
          { label: 'Toate specialitățile', value: 'Toate specialitățile' },
          ...options
        ]);
      } catch (err) {
        console.error('Eroare la preluarea specialităților:', err);
      }
    };

    fetchSpecialities();
  }, []);



  const [ extendedLocations, setExtendedLocaions] = useState([])

  useEffect(() => {
    const fetchExtendedLocations = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-extended-locations`);
        setExtendedLocaions(res.data.data);
        console.log("LOC EXT:", res.data.data);
      } catch (err) {
        console.error('Eroare la preluarea locațiilor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExtendedLocations();
  }, []);

  

  const fetchLocations = async () => {
    try {
      const locRes = await axios.get(`${backendUrl}/api/admin/get-all-locations`);
      const countiesRes = await axios.get(`${backendUrl}/api/admin/get-counties`);
      setLocationsData(locRes.data.locations);
      setCountyOptions(['Toate județele', ...countiesRes.data.counties]);
    } catch (err) {
      console.error("Eroare la aducerea datelor:", err);
    }
  };

  useEffect(() => {
  fetchLocations(); 

  socket.on('locationAdded', () => {
    console.log('Locațiile s-au actualizat (adăugare)!');
    toast.info('Date actualizate');
    fetchLocations();
  });

  socket.on('LOCATION_DELETED', () => {
    console.log('Locațiile s-au actualizat (ștergere)!');
    toast.info('Date actualizate');
    fetchLocations();
  });

  socket.on('locationUpdated', () => {
    console.log('Locațiile s-au actualizat (modificare)!');
    toast.info('Date actualizate');
    fetchLocations();
  });

  return () => {
    socket.off('locationAdded');
    socket.off('LOCATION_DELETED');
    socket.off('locationUpdated');
  };
}, []);


const filteredLocations = extendedLocations
  .filter(loc =>
    ((loc.clinicName.toLowerCase().includes(search.toLowerCase())) ||
      loc.locationID.toLowerCase().includes(search.toLowerCase())) &&
    (selectedCounty === 'Toate județele' || loc.address.county === selectedCounty) &&
    (selectedStatus === 'Toate' || loc.status.toLowerCase() === selectedStatus.toLowerCase()) &&
    (selectedSpeciality === 'Toate specialitățile' ||
      loc.specialities?.some(spec => spec.specialityID === selectedSpeciality))
        )
    .sort((a, b) => {
      switch (sortOption) {
        case 'Ordonare':
          return a.clinicName.localeCompare(b.clinicName);
        case 'Nume A-Z':
          return a.clinicName.localeCompare(b.clinicName);
        case 'Nume Z-A':
          return b.clinicName.localeCompare(a.clinicName);
        default:
          return 0;
      }
    });


  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
 
  return (
    <div className="">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            <FontAwesomeIcon icon={faTools} className='mr-2 text-purple-600' />Gestionare locații
          </h1>
          <p className="text-sm text-gray-500">Administrează locațiile clinicii: detalii, contacte și disponibilitate</p>
        </div>
        <button
          onClick={() => setShowModalAdd(true)}
          className="btn-outline-purple-little-little hover:cursor-pointer"
        >
          + Locație nouă
        </button>
      </div>

      {showModalAdd && 
        <Addlocation 
          onCloseSaveLocation={(locationData) => {
            console.log("Am primit datele:", locationData);
            setShowModalAdd(false);
            setSelectedLocationData(locationData);

            if (locationData.status === 'inchis temporar') {
              toast.warn(`Locația ${locationData.clinicName} a fost adăugată, dar este ${locationData.status}. Nu poți adăuga specialități și investigații până nu este deschisă.`);
             } 

             if (locationData.status === 'inchis definitiv') {
              toast.warn(`Locația ${locationData.clinicName} a fost adăugată, dar este ${locationData.status}. Nu poți adăuga specialități și investigații.`,);
             }
            
             if (locationData.status === 'deschis') {
              toast.info("Acum trebuie să asociezi specialități!")
              setShowModalAddSpecialities(true);
             } 
          }} 
          onClose={() => { 
            setShowModalAdd(false);
            toast.info("Adăugarea locației s-a anulat!");
          }}
          
        />
        }

        {showModalAddSpecialities && 
          <AddLocation_Specialities 
            locationData = {selectedLocationData}
            onCloseSaveSpecialities={() => {
              setShowModalAddSpecialities(false);
            }} 
            onClose={() => 
              {
                setShowModalAddSpecialities(false) 
                toast.info("Adăugarea specialităților s-a anulat!");
              }
            }
            onCloseFinish = { () => 
            {   
              setShowModalAddSpecialities(false);
              toast.success("Adăugarea locației s-a finalizat cu succes!");
            }
          }
          />
        }

        
        {/* Afisare */}
      <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-1">

        {/* Filtre */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
            <h2 className="text-base sm:text-lg md:text-lg font-medium text-gray-800">Filtrează locațiile</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative w-full lg:w-1/3"> 
              <input
                type="text"
                placeholder="Locația..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-700 p-2.5 rounded w-full text-sm pl-10"
              />
            <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>

            <CustomSelect
              options={countyOptions.map(c => ({ value: c, label: c }))}
              value={selectedCounty}
              onChange={(selected) => setSelectedCounty(selected)}
              className="w-full lg:w-1/3 text-sm"
              placeholder="Județul..."
            />

            <CustomSelect
              options={specialityOptions}
              value={selectedSpeciality} 
              onChange={(selected) => setSelectedSpeciality(selected)}
              className="w-full lg:w-1/3 text-sm"
              placeholder="Specialitatea..."
            />

           <CustomSelect
              options={[
                { value: 'Toate', label: 'Toate statusurile' },
                { value: 'deschis', label: 'Deschis' },
                { value: 'inchis temporar', label: 'Închis Temporar' },
                { value: 'inchis definitiv', label: 'Închis Definitiv' },
              ]}
              value={selectedStatus}   // doar valoarea simplă
              onChange={(selected) => setSelectedStatus(selected)}
              className="w-full lg:w-1/3 text-sm"
              placeholder="Statusul..."
            />


            <CustomSelect
              options={[
                { value: 'Ordonare', label: 'Ordonare' },
                { value: 'Nume A-Z', label: 'Nume A-Z' },
                { value: 'Nume Z-A', label: 'Nume Z-A' },
              ]}
              value={sortOption}
              onChange={(selected) => setSortOption(selected)}
              className="w-full lg:w-1/3 text-sm"
              placeholder="Ordinea..."
            />

          <button
            onClick={() => {
              setSearch('');
              setSelectedCounty('Toate județele');
              setSortOption('Ordonare');
              setSelectedStatus('Toate');
              setSelectedSpeciality({ label: 'Toate specialitățile', value: 'Toate specialitățile' });

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
              Numărul locațiilor: <strong>{filteredLocations.length}</strong>
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
              <span>locații</span>
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


        {/* Tabel */}
        <DisplayTable
          location={paginatedLocations}
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
  );
};

export default AdminLocations;
