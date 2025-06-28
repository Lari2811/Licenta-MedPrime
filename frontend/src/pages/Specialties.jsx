import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContex'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faMagnifyingGlass, faNotesMedical } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { toast } from 'react-toastify'
import CustomSelect from '../components/customSelect'
import { assets } from '../assets/assets'
import { normalizeLocationName } from '../utils/normalizeLocationName'

import socket from '../socket'

const Specialities = () => {

  const { specialityData } = useContext(AppContext)

  const { backendUrl } = useContext(AppContext)
    
  const navigate = useNavigate()

  // ----------------------------------  PRELUARE DATE SPECIALITATI + FORMARE  OPTIONS  CUSTOMM  SELECT ----------------------------------
  const [specialitiesData, setSpecialitiesData] = useState([])

  const [loadingSpecialities , setLoadingSpecialities ] = useState()

 useEffect(() => {
  const fetchSpecialitati = async () => {
    try {
      setLoadingSpecialities(true);

      const res = await axios.get(`${backendUrl}/api/main/get-specialities-with-data`);
      const allSpecilaities = res.data.data;

      //console.log(' Specialitati:', allSpecilaities);
      setSpecialitiesData(allSpecilaities);

      //  INVESTIGATII UNICE DIN investigationSpeciality
      const allInvestigations = allSpecilaities.flatMap(spec => spec.investigationSpeciality || []);

      const uniqueInvestigations = Array.from(
        new Map(
          allInvestigations.map(inv => [inv.investigationID, inv])
        ).values()
      );

      const investigationOpts = [
        { value: '', label: 'Toate investigațiile' },
        ...uniqueInvestigations.map(inv => ({
          value: inv.investigationID,
          label: inv.name || inv.investigationName || 'Fără nume'
        }))
      ];
      setInvestigationsOptions(investigationOpts);
      console.log("Investigații:", investigationOpts);

      //  Locatii DIN investigationAvailability
      const allAvailabilities = allSpecilaities.flatMap(spec => spec.investigationAvailability || []);
      const locMap = new Map();

      allAvailabilities.forEach(item => {
        if (item.locationID && item.clinicName) {
          locMap.set(item.locationID, item.clinicName);
        }
      });

      const locationOpts = [
        { value: '', label: 'Toate locațiile' },
        ...Array.from(locMap.entries()).map(([id, name]) => ({
          value: id,
          label: name
        }))
      ];
      setLocationsOptions(locationOpts);
      console.log("Locații investigații:", locationOpts);

    } catch (error) {
      console.error('Eroare la fetch specialitati:', error);
      toast.error('Eroare la preluarea specialităților. Te rugăm să încerci mai târziu.');
    } finally {
      setLoadingSpecialities(false);
    }
  };

  fetchSpecialitati();

   socket.on('LOCATION_DELETED', () => {
      console.log('Locațiile s-au actualizat (ștergere)!');
      toast.info('Date actualizate');
      fetchSpecialitati();
    });
  
    socket.on('locationAdded', () => {
      console.log('Locațiile s-au actualizat (adăugare)!');
      toast.info('Date actualizate');
      fetchSpecialitati();
    });
  
    return () => {
      socket.off('locationAdded');
      socket.off('LOCATION_DELETED');
    };

}, []);

   // ---------------------  FILTRE  ----------------------

   const [searchSpeciality, setSearchSpeciality] = useState('');
  
    const [investigationsOptions, setInvestigationsOptions] = useState([]);
    const [selectedInvestigation, setSelectedInvestigation] = useState('');

    const [locationsOptions, setLocationsOptions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');

    const sortSpecialityOption = [
      { value: 'Nume A-Z', label: 'Nume A-Z' },
      { value: 'Nume Z-A', label: 'Nume Z-A' },
  
    ];
    const [selectedSortSpecialityOpion, setSelectedSortSpecialityOption] = useState(null);
    
    // === Filtrare ===
    const filteredSpecialities = specialitiesData
      .filter((spec) => {
        const matchSearch =
          !searchSpeciality ||
          `${spec.specialityName}`.toLowerCase().includes(searchSpeciality.toLowerCase());

        const matchLocation =
          !selectedLocation || selectedLocation === 'Toate locațiile' ||
          spec.investigationAvailability?.some((inv) => inv.locationID === selectedLocation);

        const matchInvestigation =
          !selectedInvestigation || selectedInvestigation === 'Toate investigațiile' ||
          spec.investigationAvailability?.some((inv) => inv.investigationID === selectedInvestigation);

        return matchSearch && matchLocation && matchInvestigation;
      })
      .sort((a, b) => {
        if (!selectedSortSpecialityOpion || !selectedSortSpecialityOpion.value) return 0;

        switch (selectedSortSpecialityOpion.value) {
          case 'Nume A-Z':
            return a.specialityName.localeCompare(b.specialityName);
          case 'Nume Z-A':
            return b.specialityName.localeCompare(a.specialityName);
          default:
            return 0;
        }
      });

  return (
    <div className=''>

       {loadingSpecialities ? (
         <div className="p-6 text-center text-red-600">
            Se încarcă specialitățile...
          </div>
        ) : !specialitiesData ? (
          <div className="p-6 text-center text-red-600">
            Specialitatea {specialityName} nu a fost găsită.</div>
        ) : (
          <>

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
        <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
            <FontAwesomeIcon icon={faHouse} />
            <span className="ml-1">Acasă</span>
        </Link>
        <span className="text-gray-400">{'>'}</span>
        <span className="text-purple-600 underline font-medium">
          <FontAwesomeIcon icon={faNotesMedical}/>
          <span className="ml-1">Specialități</span>
        </span>
      </nav>

      {/* Titlu pagina */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-5 py-5 flex flex-col items-center gap-3 text-gray-900">

      <h1 className="title text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-medium text-center mb-2 mt-1">
          Specialități medicale
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs text-center sm:text-lef">
            Caută o specialitate potrivită și află ce medici și investigații sunt disponibile în locațiile noastre.
        </p>
      </div>

      {/* FILTRE - container separat stilizat */}
      <div className="bg-white border border-gray-300 relative rounded-2xl shadow-xl px-6 py-6 mb-10 mx-4 sm:mx-10 my-4">
        
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
          <h2 className="text-base sm:text-lg md:text-xl font-medium text-gray-800">Filtrează căutarea</h2>
        </div>

        {/* Filtre */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Caută o specialitate..."
              value={searchSpeciality}
              onChange={(e) => setSearchSpeciality(e.target.value)}
              className="border border-gray-700 p-2.5 rounded w-full lg:w-full text-sm"
            />
             <CustomSelect
              options={locationsOptions}
              value={selectedLocation}
              onChange={(selected) => setSelectedLocation(selected)}
              placeholder="Locația..."
              className="w-full lg:w-full text-sm"
            />
            <CustomSelect
              options={investigationsOptions}
              value={selectedInvestigation}
              onChange={(selected) => setSelectedInvestigation(selected)}
              placeholder="Investigația..."
              className="w-full lg:w-full text-sm"
            />

            <CustomSelect
              options={sortSpecialityOption}
              value={selectedSortSpecialityOpion}
              onChange={(selected) => setSelectedSortSpecialityOption(selected)}
              placeholder="Ordinea..."
              className="w-full lg:w-full text-sm"
            />

            <button
                onClick={() => {
                  setSearchSpeciality('');
                  setSelectedInvestigation(null);
                  setSelectedLocation('');
                  setSelectedSortSpecialityOption(null);
                }}
                className="bg-purple-100 hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
              >
              Resetează
            </button>

        </div>
      </div>

      
      {/* Carduri Specialitati */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-6 py-5 flex flex-col items-center gap-6 text-gray-900">
        <div className="w-full px-4 sm:px-5 my-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredSpecialities.length === 0 ? (
              <p className="text-gray-700 text-center col-span-full text-lg font-medium">
                Nu am găsit nicio specialitate care să corespundă criteriilor selectate.
              </p>
            ) : (
              filteredSpecialities.map((spec, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-300 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <img
                    src={spec.profileImage || assets.speciality_default}
                    alt={spec.specialityName}
                    className="h-30 sm:h-30 md:h-40 w-full object-cover"
                  />

                  <div className="p-5">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">
                      {spec.name}
                    </h2>

                    {/* Butoane navigare */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() =>
                          navigate(`/specialitati/${spec.specialityID}/${normalizeLocationName(spec.name)}/despre`)
                        }
                        className="bg-gray-300 text-xs sm:text-sm px-3 py-1 rounded hover:bg-purple-300 transition"
                      >
                        Despre
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/specialitati/${spec.specialityID}/${normalizeLocationName(spec.name)}/intrebari`)
                        }
                        className="bg-gray-300 text-xs sm:text-sm px-3 py-1 rounded hover:bg-purple-300 transition"
                      >
                        Întrebări
                      </button>


                      <button
                        onClick={() =>
                          navigate(`/specialitati/${spec.specialityID}/${normalizeLocationName(spec.name)}/echipa-medicala`)
                        }
                        className="bg-gray-300 text-xs sm:text-sm px-3 py-1 rounded hover:bg-purple-300 transition"
                      >
                        Medici
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/specialitati/${spec.specialityID}/${normalizeLocationName(spec.name)}/investigatii`)
                        }
                        className="bg-gray-300 text-xs sm:text-sm px-3 py-1 rounded hover:bg-purple-300 transition"
                      >
                        Investigații
                      </button>
                    </div>
                  </div>
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

export default Specialities
