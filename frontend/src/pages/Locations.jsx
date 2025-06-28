import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContex'
import axios from 'axios';
import { useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faLocationDot, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import CustomSelect from '../components/customSelect';
import { assets } from '../assets/assets';
import { normalizeLocationName } from '../utils/normalizeLocationName';

import socket from '../socket';

const Locations = () => {

  const { backendUrl } = useContext(AppContext); 
  const [locationsData, setLocationsData] = useState([]);
  const navigate = useNavigate();

  const [loadingLocations, setLoadingLocations] = useState();

  const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const locRes = await axios.get(`${backendUrl}/api/admin/get-all-locations`);
        const countiesRes = await axios.get(`${backendUrl}/api/admin/get-counties`);
        setLocationsData(locRes.data.locations);
        setCountyOptions(['Toate județele', ...countiesRes.data.counties]);
      } catch (err) {
        console.error("Eroare la aducerea datelor:", err);
      } finally{
        setLoadingLocations(false);
      }
    };

    useEffect(() => {
      fetchLocations();
    
      socket.on('LOCATION_DELETED', () => {
        console.log('Locațiile s-au actualizat (ștergere)!');
        toast.info('Date actualizate');
        fetchLocations();
      });

      socket.on('locationAdded', () => {
      console.log('Locațiile s-au actualizat (adăugare)!');
      toast.info('Date actualizate');
      fetchLocations();
    });

    return () => {
      socket.off('locationAdded');
      socket.off('LOCATION_DELETED');
    };
}, []);
      



  // -------------------------- FILTRARE --------------------------
  const [search, setSearch] = useState('');

  const statusOptions = [
    { label: "Toate statusurile", value: "Toate statusurile" },
    { label: "Deschis", value: "deschis" },
    { label: "Închis temporar", value: "inchis temporar" },
    { label: "Închis definitiv", value: "inchis definitiv" },
  ];
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [countyOptions, setCountyOptions] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null); 

  const sortOption = [
    { value: 'Nume A-Z', label: 'Nume A-Z' },
    { value: 'Nume Z-A', label: 'Nume Z-A' },
  ];

  const [selectedSortOption, setSelectedSortOption] = useState(null);
 
  const filteredLocations = locationsData
    .filter(loc =>
      loc.clinicName.toLowerCase().includes(search.toLowerCase()) &&
      (!selectedCounty || selectedCounty === 'Toate județele' || loc.address.county === selectedCounty) &&
      (!selectedStatus || selectedStatus === 'Toate statusurile' || loc.status === selectedStatus)

    )
    .sort((a, b) => {
      switch (selectedSortOption) {
        case 'Nume A-Z':
          return a.clinicName.localeCompare(b.clinicName);
        case 'Nume Z-A':
          return b.clinicName.localeCompare(a.clinicName);
        default:
          return 0;
      }
    });
  return (
    <div className="">

      {loadingLocations ? (
        <div className="p-6 text-center text-red-600">  
          Se încarcă locațiile...
        </div>
      ) : locationsData.length === 0 ? (
        <div className="p-6 text-center text-red-600">
          Nu am găsit nicio locație.
        </div>
      ) : (
          <>
      
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
            <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
              <FontAwesomeIcon icon={faHouse}  />
              <span className="ml-1">Acasă</span>
            </Link>
            <span className="text-gray-400">{'>'}</span>
            <span className="text-purple-600 underline font-medium">
              <FontAwesomeIcon icon={faLocationDot}  />
              <span className="ml-1">Locaţii</span>
            </span>
          </nav>

          {/* Titlu pagina */}
          <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-5 py-5 flex flex-col items-center gap-3 text-gray-900">

          <h1 className="title text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-medium text-center mb-2 mt-1">
              Locații
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs text-center sm:text-lef">
              Descoperă locațiile MedPrime din întreaga țară.
            </p>
          </div>

          {/* FILTRE - container separat stilizat */}
          <div className="bg-white border border-gray-300 relative rounded-2xl shadow-xl px-6 py-6 mb-10 mx-4 sm:mx-10 my-4">
            
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
              <h2 className="text-base sm:text-lg md:text-xl font-medium  text-gray-800">Filtrează căutarea</h2>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              
              <input
                type="text"
                placeholder="Caută după denumire..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-700 p-2.5 rounded w-full lg:w-1/3 text-sm"
              />

              <CustomSelect
                  options={countyOptions.map(c => ({ value: c, label: c }))}
                  value={selectedCounty}
                  onChange={(selected) => setSelectedCounty(selected)}
                  className="w-full lg:w-1/3 text-sm"
                  placeholder="Județul..."
                />

                <CustomSelect
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(selected) => setSelectedStatus(selected)}
                  className="w-full lg:w-1/3 text-sm"
                  placeholder="Statusul..."
                />

              <CustomSelect
                options={sortOption}
                value={selectedSortOption}
                onChange={(selected) => setSelectedSortOption(selected)}
                className="w-full lg:w-1/3 text-sm"
                placeholder="Ordinea..."
              />
              
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCounty(null);
                  setSelectedStatus(null);
                  setSelectedSortOption(null);
                }}
                className="bg-purple-100 cursor-pointer hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
              >
                Resetează
              </button>
            </div>
          </div>

          {/* Lista locatii */}
          <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-6 py-5 flex flex-col items-center gap-6 text-gray-900">
            <div className="w-full px-4 sm:px-5 my-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">

                { filteredLocations.length === 0 ? (
                  <p className="text-gray-700 text-center col-span-full text-lg font-medium ">
                  Nu am găsit nicio specialitate care să corespundă criteriilor selectate.
                </p>
                ) : (
              
                  
                  filteredLocations.map((loc) => (
                  <div key={loc.locationID} className="border border-gray-300 rounded-lg shadow p-3 flex flex-col items-center text-center">
                    <img 
                      src={loc.images.profileImage || assets.location_default} 
                      alt={`Imagine ${loc.city}`} 
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                    <h2 className="text-xl font-bold">{loc.clinicName}</h2>
                    <p className="text-gray-600">{loc.address.county}</p>
                    <Link
                        to={`/locatii/${loc.locationID}/${normalizeLocationName(loc.clinicName)}/despre-locatie`}
                        
                      >
                      <button className="mt-2 cursor-pointer px-4 py-2 bg-purple-400 text-white rounded-2xl hover:bg-purple-800 transition">
                        Vezi detalii
                      </button>
                    </Link>
                    
                  </div>
                ))
              )}
              </div>
            </div>
          </div>

        </>)}
    </div>
  )
}

export default Locations