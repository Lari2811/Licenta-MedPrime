import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContex'
import Select from 'react-select'
import DoctorsList from '../components/DoctorsList'


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faMagnifyingGlass, faUserDoctor } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { toast } from 'react-toastify'
import CustomSelect from '../components/customSelect'

import socket from '../socket';


const Doctors = () => {

  const { backendUrl } = useContext(AppContext)

  // --------------------- PRELUARE DATE DOCTORI + FORMARE  OPTIONS  CUSTOMM  SELECT ---------------------
  const [doctorsData, setDoctorsData] = useState([])

  const [loadingDoctors , setLoadingDoctors ] = useState()
	
	
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);

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

        console.log("Specialități:", specialityOptions);

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

        console.log("Tipuri doctori:", typeOptions);

        // ================= Locatii =================
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

        console.log("Locații:", locationOptions);

      } catch (err) {
        toast.error("Eroare server la doctori");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();

    socket.on('DOCTOR_DELETED', () => {
        //console.log(' Medici s-au actualizat!');
        fetchDoctors();
        toast.info('Date actualizate');
      });

      socket.on('DOCTOR_ADDED', () => {
        //console.log(' Medici s-au actualizat!');
        fetchDoctors(); 
        toast.info('Date actualizate');
      });

      socket.on('LOCATION_DELETED', () => {
        console.log('Locațiile s-au actualizat (ștergere)!');
        toast.info('Date actualizate');
        fetchDoctors();
      });

      socket.on('locationAdded', () => {
        console.log('Locațiile s-au actualizat (adăugare)!');
        toast.info('Date actualizate');
        fetchDoctors();
      });
     

    return () => {
      socket.off("DOCTOR_DELETED");
      socket.off("DOCTOR_ADDED");

      socket.off('locationAdded');
      socket.off('LOCATION_DELETED');
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
    { value: 'Nume A-Z', label: 'Nume A-Z' },
    { value: 'Nume Z-A', label: 'Nume Z-A' },
    { value: 'Rating crescător', label: 'Rating crescător' },
    { value: 'Rating descrescător', label: 'Rating descrescător' },
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

  return (
    <div className="">

      {loadingDoctors ? (
        <div className="p-6 text-center text-red-600">
          Se încarcă doctorii...
        </div>
      ) : doctorsData.length === 0 ? (
        <div className="p-6 text-center text-red-600">
          Nu au fost găsiți doctori.
        </div>
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
          <FontAwesomeIcon icon={faUserDoctor}  />
          <span className="ml-1">Medici</span>
        </span>
      </nav>

      {/* Titlu pagina */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-5 py-5 flex flex-col items-center gap-3 text-gray-900">
      <h1 className="title text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-medium text-center mb-2 mt-1">
          Medici
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs text-center sm:text-lef">
          Consultați profilurile medicilor noștri și expertiza lor.
        </p>
      </div>

      {/* FILTRE + info*/}
      <div className="bg-white border border-gray-300 relative rounded-2xl shadow-xl px-6 py-6 mb-10 mx-4 sm:mx-10 my-4">
       
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

      {/* Lista doctori */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-6 py-5 flex flex-col items-center gap-6 text-gray-900">
        <DoctorsList
            doctors={filteredDoctors}
          />  
      </div>
      

      </>)}
  </div> 
  )
}

export default Doctors