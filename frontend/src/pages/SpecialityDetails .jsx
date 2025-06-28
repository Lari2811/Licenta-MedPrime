import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContex'
import { useLocation } from 'react-router-dom';
import classNames from 'classnames'
import DoctorsList from '../components/DoctorsList';
import Select from 'react-select';
import { Disclosure } from '@headlessui/react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faNotesMedical, faHeartbeat, faCheckCircle, faMagnifyingGlass,
  faStethoscope, faClock, faMoneyBillWave, faLocationDot, faAngleRight, faHouse, 
  faMicroscope, faUserDoctor,
  faMapMarkerAlt,
  faCircleInfo,
  faCircleQuestion,
  faQuestionCircle,
  faSignalPerfect,
  faClose
} from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../assets/assets';
import { normalizeLocationName } from '../utils/normalizeLocationName';
import CustomSelect from '../components/customSelect';

import socket from '../socket';
import ModalPacient from '../components/ModalPatient';
import { checkIfPatientLoggedIn } from '../accessControl/checkIfPatientLoggedIn';

const SpecialityDetails  = () => {

   const navigate = useNavigate()

  const { backendUrl } = useContext(AppContext);

  const [showAuthModal, setShowAuthModal] = useState(false);
  


  const sections = [
    { id: 'despre', label: 'Despre', icon: faInfoCircle },
    { id: 'intrebari', label: 'Întrebări frecvente', icon: faQuestionCircle },
    { id: 'investigatii', label: 'Investigații', icon: faMicroscope },
    { id: 'echipa-medicala', label: 'Echipa medicală', icon: faUserDoctor },
  ];

  const {specialityID, specialityName, sectiune} = useParams();

 // console.log("SpecialityDetails params:", specialityID, specialityName, sectiune);


  const [specialitiesData, setSpecialitiesData] = useState([])

  const [loadingSpecialities , setLoadingSpecialities ] = useState()

  useEffect(() => {
    const fetchSpecialitati = async () => {
      try {
        setLoadingSpecialities(true);

        const res = await axios.get(`${backendUrl}/api/main/get-specialities-with-data`);
        const allSpecilaities = res.data.data;

        console.log('Specialități:', allSpecilaities);
        setSpecialitiesData(allSpecilaities);

        //  Locatii din investigationAvailability
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
        setLocationsOptions_INV(locationOpts);

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

  const selectedSpeciality = !loadingSpecialities && specialitiesData.length > 0
    ? specialitiesData.find(spec => spec.specialityID === specialityID)
    : null;


   // ---------------------  FILTRE  INVESTIGATII   ----------------------

  const [searchInvestigation, setSearchInvestigation] = useState('');

  const [locationsOptions_INV, setLocationsOptions_INV] = useState([]);
  const [selectedLocation_INV, setSelectedLocation_INV] = useState('');

  const sortOption_INV = [
    { value: 'Nume A-Z', label: 'Nume A-Z' },
    { value: 'Nume Z-A', label: 'Nume Z-A' },
    { value: 'Preț crescător', label: 'Preț crescător' },
    { value: 'Preț descrescător', label: 'Preț descrescător' },
    { value: 'Durată crescător', label: 'Durată crescător' },
    { value: 'Durată descrescător', label: 'Durată descrescător' },
  ]
  const [selectedSortOption_INV, setSelectedSortOption_INV] = useState(null);

  // === Filtrare ===

  const filteredInvestigations = selectedSpeciality?.investigationSpeciality
    ?.filter((inv) => {
      const matchesSearch =
        !searchInvestigation ||
        inv.name.toLowerCase().includes(searchInvestigation.toLowerCase());

      const availability = selectedSpeciality.investigationAvailability.filter(
        (a) => a.investigationID === inv.investigationID
      );

      const matchesLocation =
        !selectedLocation_INV || selectedLocation_INV === 'Toate locațiile' ||
        availability.some((a) =>
          a.locationID === selectedLocation_INV
        );

      return matchesSearch && matchesLocation;
    })
    ?.sort((a, b) => {
      if (!selectedSortOption_INV || !selectedSortOption_INV) return 0;

      const availabilityA = selectedSpeciality.investigationAvailability.find(
        (av) => av.investigationID === a.investigationID
      );
      const availabilityB = selectedSpeciality.investigationAvailability.find(
        (av) => av.investigationID === b.investigationID
      );

      const priceA = availabilityA?.price ?? 0;
      const priceB = availabilityB?.price ?? 0;
      const durationA = a.duration ?? 0;
      const durationB = b.duration ?? 0;

      switch (selectedSortOption_INV) {
        case 'Nume A-Z':
          return a.name.localeCompare(b.name);
        case 'Nume Z-A':
          return b.name.localeCompare(a.name);
        case 'Preț crescător':
          return priceA - priceB;
        case 'Preț descrescător':
          return priceB - priceA;
        case 'Durată crescător':
          return durationA - durationB;
        case 'Durată descrescător':
          return durationB - durationA;
        default:
          return 0;
      }
    });

    const [selectedInvestigationModal, setSelectedInvestigationModal] = useState(null);

    // -------------------------------------------------------------------

    // ---------------------  Sectiunea medici  ----------------------
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

    const selectedDoctors = !loadingDoctors && doctorsData.length > 0 && selectedSpeciality
          ? doctorsData.filter(doc =>
            doc.specialities?.some(spec => spec.specialityID === selectedSpeciality.specialityID)
          )
          : [];

    console.log("selectedDoctors:", selectedDoctors);

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
    const filteredDoctors = selectedDoctors
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


    const [showAllFaq, setShowAllFaq] = useState(false);
    const displayedFaq = selectedSpeciality?.faq
      ? showAllFaq
        ? selectedSpeciality.faq
        : selectedSpeciality.faq.slice(0, 5)
      : [];

  const renderContent = () => {
      if (!selectedSpeciality) return null;

      switch (sectiune) {

        case 'despre':
          return (
            <div className="space-y-5 text-gray-800 w-full">

              {/* Descriere extinsa */}
              {selectedSpeciality.otherInfo?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FontAwesomeIcon icon={faCircleInfo} className="text-purple-600 text-lg" />
                    <h3 className="text-lg sm:text-xl font-semibold">Despre specialitate</h3>
                  </div>
                  <ul className="list-disc ml-6 text-sm sm:text-base space-y-1 text-gray-700">
                    {selectedSpeciality.otherInfo.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Simptome*/}
              {selectedSpeciality.reasonsToConsult?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FontAwesomeIcon icon={faHeartbeat} className="text-purple-600 text-lg" />
                    <h3 className="text-lg sm:text-xl font-semibold">Când să consulți un specialist</h3>
                  </div>
                  <ul className="list-disc ml-6 text-sm sm:text-base space-y-1 text-gray-700">
                    {selectedSpeciality.reasonsToConsult.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Beneficii  */}
              {selectedSpeciality.consultationBenefits?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-lg" />
                    <h3 className="text-lg sm:text-xl font-semibold">Beneficiile consultației</h3>
                  </div>
                  <ul className="list-disc ml-6 text-sm sm:text-base space-y-1 text-gray-700">
                    {selectedSpeciality.consultationBenefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Locatii */}
              {selectedSpeciality.locations?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FontAwesomeIcon icon={faLocationDot} className="text-purple-600 text-lg" />
                    <h3 className="text-lg sm:text-xl font-semibold">Locații disponibile</h3>
                  </div>
                  <ul className="list-disc ml-6 text-sm sm:text-base space-y-1 text-gray-700">
                    {selectedSpeciality.locations.map((loc, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{loc.clinicName}</span> – ({loc.address.city}, {loc.address.county})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );

        case 'intrebari':
          return (
            <div className="space-y-6 text-gray-800 w-full">
              {selectedSpeciality?.faq?.length > 0 ? (
                <>
                  {/* Titlu și numar intrebari */}
                  <div className="flex items-center justify-between ">
                      <h2 className="text-lg text-center sm:text-left sm:text-xl font-bold text-gray-900">
                        <FontAwesomeIcon icon={faQuestionCircle} className="text-purple-600 mt-1 mr-2" />
                        Întrebări frecvente
                      </h2>
                    <span className="text-sm sm:text-base text-gray-500">
                      {selectedSpeciality.faq.length} întrebări
                    </span>
                  </div>

                   {/* Linie de separare */}
                  <hr className="border-t-2 border-gray-300 " />

                  {/* afisare intrebari */}
                  <div className="space-y-4">
                    {(showAllFaq
                      ? selectedSpeciality.faq
                      : selectedSpeciality.faq.slice(0, 5)
                    ).map((item, index) => (
                      <details key={index} className="group mb-4 border border-gray-300 rounded-md overflow-hidden transition-all">
                        <summary className="cursor-pointer px-4 py-3 bg-purple-200 text-purple-900 font-medium text-sm sm:text-base group-open:rounded-t-md group-open:rounded-b-none">
                          {item.question}
                        </summary>
                        <div className="bg-white px-4 py-3 text-sm sm:text-base text-gray-700 border-t border-gray-200">
                          {item.answer}
                        </div>
                      </details>
                    ))}
                  </div>

                  {/* Buton afisare mai multe */}
                  {selectedSpeciality.faq.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setShowAllFaq((prev) => !prev)}
                        className="text-purple-700 font-medium hover:underline text-sm sm:text-base"
                      >
                        {showAllFaq ? 'Ascunde întrebările' : 'Vezi toate întrebările'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic text-sm sm:text-base">
                  Nu există întrebări frecvente disponibile pentru această specialitate.
                </p>
              )}
            </div>
          );

        case 'investigatii':  
          return (
            <div className="w-full flex flex-col gap-6">
              <h2 className="text-lg text-center sm:text-left sm:text-xl font-bold text-gray-900">
                <FontAwesomeIcon icon={faMicroscope} className="text-purple-600 mt-1 mr-2" />
                Investigații disponibile
              </h2>

              {/* Filtre */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Caută o investigație..."
                    value={searchInvestigation}
                    onChange={(e) => setSearchInvestigation(e.target.value)}
                    className="border border-gray-700 p-2.5 rounded w-full text-sm"
                  />
        
                  <CustomSelect
                    options={locationsOptions_INV}
                    value={selectedLocation_INV}
                    onChange={(selected) => setSelectedLocation_INV(selected)}
                    placeholder="Locația..."
                    className="w-full text-sm"
                  />

                  <CustomSelect
                    options={sortOption_INV}
                    value={selectedSortOption_INV}
                    onChange={(selected) => setSelectedSortOption_INV(selected)}
                    placeholder="Ordinea..."
                    className="w-full text-sm"
                  />
                  
                  <button
                      onClick={() => {
                        setSearchInvestigation('');
                        setSelectedLocation_INV(null);
                        setSelectedSortOption_INV(null);
                      }}
                      className="bg-purple-100 hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
                    >
                    Resetează
                  </button>
              </div>

              {/* Linie de separare */}
              <hr className="border-t-2 border-gray-300 " />

              {/* Lista investigati */}
                {filteredInvestigations?.length > 0 ? (
                  filteredInvestigations.map((inv, i) => {
                    const availabilityForInv = selectedSpeciality.investigationAvailability.filter(
                      (a) => a.investigationID === inv.investigationID
                    );
                    const locationsList = availabilityForInv.map((a) => a.clinicName);
                    const minPrice = Math.min(...availabilityForInv.map((a) => a.price));
                    const currency = availabilityForInv[0]?.currency || 'RON';

                    return (
                      <div
                        key={i}
                        className="bg-white border border-gray-300 rounded-xl shadow-md p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex flex-col gap-2 text-gray-800">
                          <h3 className="text-base sm:text-lg font-semibold text-purple-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faStethoscope} className="text-purple-700" />
                            {inv.name}
                          </h3>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faClock} className="text-purple-700" />
                              {inv.duration} min
                            </div>
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faMoneyBillWave} className="text-purple-700" />
                              {minPrice} {currency}
                            </div>
                          </div>
                        </div>

                        {/* Actiuni */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              const decoded = checkIfPatientLoggedIn();
              
                              console.log("decoded", decoded)
              
                              if (!decoded) {
                                setShowAuthModal(true);
                                return;
                              }
              
                              const patientID = decoded.linkedID;
              
                              navigate(`/profil-pacient/${patientID}/programarile-mele/creeaza-programare`)
                            }}
                            className="px-4 py-2 text-xs cursor-pointer font-semibold sm:text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                          >
                            Programează-te
                          </button>

                          <button
                            onClick={() => setSelectedInvestigationModal(inv)} // setezi investigația curentă pt modal
                            className="px-4 py-2 bg-gray-200 text-purple-700 rounded-lg text-sm hover:bg-gray-300 transition"
                            title="Vezi detalii"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-600 italic">Nicio investigație disponibilă momentan.</p>
                )}
            </div>
          );

        case 'echipa-medicala':
          return (
            <div className="w-full flex flex-col gap-6">

              {/* Bara de filtrare */}
              <div className="w-full flex flex-col gap-1"> 
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
                  <h2 className="text-base sm:text-lg font-medium text-gray-800">Filtrează căutarea</h2>
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

                 {/* Linie de separare */}
                <hr className="border-t-2 border-gray-300" />

                {/* Lista medici */}
                <DoctorsList
                  doctors={filteredDoctors}
                  onAppointmentClick={(doc) => handleAppointmentClick(doc)}
                />
            </div>
          )
      }
  }












  return (
    <div className=''>

      {loadingSpecialities ? (
         <div className="p-6 text-center text-red-600">
            Se încarcă specialitățile...
          </div>
        ) : !selectedSpeciality ? (
          <div className="p-6 text-center text-red-600">
            Specialitatea {specialityName} nu a fost găsită.</div>
        ) : (
          <>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
            <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
              <FontAwesomeIcon icon={faHouse}/>
              <span className="ml-1">Acasă</span>
            </Link>
                    
            <span className="text-gray-400">{'>'}</span>

            <Link to="/specialitati" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
              <FontAwesomeIcon icon={faNotesMedical}/>
              <span className="ml-1">Specialități</span>
            </Link> 

            <span className="text-gray-400">{'>'}</span>

            <Link to={`/specialitati/${selectedSpeciality.specialityID}/${selectedSpeciality.name}/despre`} className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
              {selectedSpeciality.name}
            </Link> 

            <span className="text-gray-400">{'>'}</span>
            
            <span className="text-purple-600  underline font-medium capitalize">{sectiune}</span>
          </nav>

          {/* Titlu specialitate */}
          <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-5 py-5 flex flex-col items-center text-gray-900">
            <div className="flex items-center justify-center gap-4">
              <img
                src={selectedSpeciality.profileImage || assets.speciality_default}
                alt={selectedSpeciality.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-purple-100 p-1"
              />
              <h1 className="title text-2xl sm:text-3xl md:text-4xl font-semibold text-center mt-1">
                {selectedSpeciality.name}
              </h1>
            </div>
            {/* Scopul general */}
              <div className="flex items-start gap-3">
                  <p className="text-sm sm:text-base text-center text-gray-700">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-purple-500 mt-1" /> {' '}
                    {selectedSpeciality.shortDescription}</p>
              </div>
          </div>

          {/* Layout 2 coloane */}
          <div className="flex flex-col lg:flex-row gap-4 px-4 sm:px-6 lg:px-10 my-5">

            {/* Meniu stânga */}
            <div className="lg:w-1/4 w-full self-start bg-white border border-gray-300 rounded-2xl shadow-xl my-3 px-4 sm:px-6 py-5 flex flex-col items-center gap-2 text-gray-900">

              {sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => navigate(`/specialitati/${specialityID}/${normalizeLocationName(specialityName)}/${sec.id}`)}
                  className={classNames(
                    'w-full text-left px-4 py-2 rounded-2xl shadow-sm mb-2 border text-sm sm:text-base',
                    {
                      'bg-purple-400 text-black border-black-900': sectiune === sec.id,
                      'bg-white hover:bg-purple-100': sectiune !== sec.id
                    }
                  )}
                >
                  <FontAwesomeIcon icon={sec.icon} className="mr-2" />
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Conținut dreapta */}
            <div className="lg:w-3/4 w-full self-start bg-white border border-gray-300 rounded-2xl shadow-xl  lg:mx-0 my-3 px-4 sm:px-6 py-5 flex flex-col items-center gap-1 text-gray-900">

              {renderContent()}
            </div>
          
          
          </div>



      </>)}



        {selectedInvestigationModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90%] overflow-y-auto relative">
            <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
                <p className="text-2xl font-semibold text-gray-800 text-center mb-1">
                  Detalii investigație
                </p>
                <p className="text-xl font-semibold text-gray-700 text-center mb-4">
                ~ {selectedInvestigationModal.name} ~
                </p>

                <button
                          onClick={() => setSelectedInvestigationModal(null)}
                          className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center hover:cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faClose} />
                        </button>

              <p className='border-b-1 mb-5'></p>

              {/* Informatii */}
              {/* 🔹 Descriere generală */}
              
              {selectedInvestigationModal.shortDescription?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-green-700">Descriere</h3>
                  <ul className="list-disc ml-5 text-md text-gray-700">
                    {selectedInvestigationModal.shortDescription.map((desc, idx) => (
                      <li key={idx}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 🔹 Etapele consultației */}
              {selectedInvestigationModal.consultationSteps?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-green-700">Etapele consultației</h3>
                  <ul className="list-none ml-3 text-md text-gray-700">
                    {selectedInvestigationModal.consultationSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 🔹 Sfaturi de pregătire */}
              {selectedInvestigationModal.preparationTips?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-green-700">Sfaturi de pregătire</h3>
                  <ul className="list-none ml-3 text-md text-gray-700">
                    {selectedInvestigationModal.preparationTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
             
        </div>
        )}

        {showAuthModal && (
        <ModalPacient
          onClose={() => setShowAuthModal(false)}
          onLogin={() => {
            setShowAuthModal(false);
            localStorage.setItem("redirectAfterLoginApp", "true");
            navigate('/autentificare');
          }}
        />
      )}
    </div>
        
  )
}

export default SpecialityDetails 