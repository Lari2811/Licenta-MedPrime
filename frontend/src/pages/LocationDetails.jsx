import React, { useContext, useState, useEffect  } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContex'
import classNames from 'classnames';
import DoctorsList from '../components/DoctorsList'
import Slider from "react-slick";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookMedical, faCalendarDays, faCheckCircle, faCircleInfo, faEnvelope, faFlask, 
  faHospital, faHouse, faImage, faImages, faInfoCircle, faLocationDot, 
  faMapLocationDot, faMicroscope, faPhone, faStethoscope, faTools, faUserDoctor 
} from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import { locationStatusBadge } from '../utils/LocationStatusConfig';
import { assets } from '../assets/assets';
import LocationMap from '../components/LocationMap';
import CustomSelect from '../components/customSelect';
import { normalizeLocationName } from '../utils/normalizeLocationName';

import socket from '../socket';
  const zileSaptamana = [
    "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"
  ];

const LocationDetails = () => {

    const navigate = useNavigate();

    const { backendUrl } = useContext(AppContext); 

    const { locationID, sectiune, clinicNameUrl } = useParams();
    
    const [locationsData, setLocationsData] = useState([]);

    const fetchLocations = async () => {
        try {
          const locRes = await axios.get(`${backendUrl}/api/admin/get-all-locations`);
          setLocationsData(locRes.data.locations);
        } catch (err) {
          console.error("Eroare la aducerea datelor:", err);
        }
      };

    useEffect(() => {
      fetchLocations();
    }, []);

    const currentLocation = locationsData.find(
        (location) => location.locationID === locationID
    )

    // --------------------------------- SERCIVI ---------------------------------
    // === Preluarea de date ===
    const [servicesData, setServicesData] = useState([]);
    const [loadingServices , setLoadingServices ] = useState()

    useEffect(() => {
      const fetchServices = async () => {
        if (!currentLocation) return;

        try {
          setLoadingServices(true);
          const res = await axios.post(`${backendUrl}/api/main/get-investigations-and-specialities-by-location`, {
            locationID: currentLocation.locationID
          });
          setServicesData(res.data);
        } catch (err) {
          console.error("Eroare la preluarea serviciilor:", err);
        } finally {
          setLoadingServices(false);
        }
      };

      fetchServices();
    }, [currentLocation]);
    

    // === Filtrare ===
    const [searchInv, setSearchInv] = useState('');

    const specialityOptions = [
        { value: '', label: 'Toate specialitățile' },
        ...servicesData.map(spec => ({
          value: spec.specialityName,
          label: spec.specialityName
        }))
      ];

    const [selectedSpeciality, setSelectedSpeciality] = useState('Toate specialitățile');

    const filteredServices = servicesData.filter((spec) => {
      const matchesSpeciality = !selectedSpeciality || spec.specialityName === selectedSpeciality || selectedSpeciality === 'Toate specialitățile';
      const matchesSearch = spec.investigations.some((inv) =>
        inv.name.toLowerCase().includes(searchInv.toLowerCase())
      );
      return matchesSpeciality && matchesSearch;
    });


    // ---------------------------------  MEDICI  ---------------------------------
    // === Preluarea de date ===
    const [doctorData, setDoctorData] = useState([]);
    const [loadingDoctors , setLoadingDoctors ] = useState()

    useEffect(() => {
      const fetchDoctors = async () => {
        if (!currentLocation) return;

        try {
          setLoadingDoctors(true);

          const res = await axios.get(`${backendUrl}/api/main/get-all-active-doctors-with-data`);
          const allDoctors = res.data.data;
          setDoctorData(allDoctors);

          console.log("doctori:", allDoctors);           

          const doctorsInLocation = allDoctors.filter(doc =>
            doc.locations?.some(loc => loc.locationID === currentLocation.locationID)
          );
          
          // Specialitati disponibile
          const specialityOptions = [
            { value: '', label: 'Toate specialitățile' },
            ...Array.from(
              new Set(
                doctorsInLocation.flatMap(doc =>
                  doc.locations
                    ?.filter(loc => loc.locationID === currentLocation.locationID)
                    .map(loc => loc.specialityName)
                )
              )
            )
              .filter(Boolean) 
              .map(name => ({ value: name, label: name }))
              .sort((a, b) => a.label.localeCompare(b.label))
          ];
          setSpecialityDoctorsOptions(specialityOptions);

          // Tipuri de doctori 
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

    return () => {
      socket.off("DOCTOR_DELETED");
      socket.off("DOCTOR_ADDED");
    };
    }, [currentLocation]);



    // === Filtrare ===
    const [searchDoctor, setSearchDoctor] = useState('');

    const [specialityDoctorsOptions, setSpecialityDoctorsOptions] = useState([]);
    const [doctorTypesOptions, setDoctorTypesOptions] = useState([]);

    const [selectedSpecialityDoctor, setSelectedSpecialityDoctor] = useState('');
    const [selectedTypeDoctor, setSelectedTypeDoctor] = useState('');
    
    const sortOptionDoctor = [
      { value: 'Nume A-Z', label: 'Nume A-Z' },
      { value: 'Nume Z-A', label: 'Nume Z-A' },
      { value: 'Rating crescător', label: 'Rating crescător' },
      { value: 'Rating descrescător', label: 'Rating descrescător' },
    ];

    const [selectedSortDoctorOption, setSelectedSortDoctorOption] = useState(null);

    // === Filtrare ===
    const doctorsInLocation = doctorData.filter(doc =>
        doc.locations?.some(loc => loc.locationID === currentLocation.locationID)
      );

    const filteredDoctors = doctorsInLocation
      .filter(doc => {
        const matchSearch = `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(searchDoctor.toLowerCase());

        const matchSpeciality = !selectedSpecialityDoctor || selectedSpecialityDoctor === '' ||
          doc.locations?.some(loc =>
            loc.locationID === currentLocation.locationID &&
            loc.specialityName === selectedSpecialityDoctor
          );

         const matchType = !selectedTypeDoctor || selectedTypeDoctor === '' ||
          doc.type === selectedTypeDoctor
      

        return matchSearch && matchSpeciality && matchType;
      })
      .sort((a, b) => {
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
            return a.lastName.localeCompare(b.lastName);
        }
      });

    if (!currentLocation) {
      return (
        <div className="p-6 text-center text-red-600">
          Locaţia „{clinicNameUrl}” nu a fost găsită.
          <br />
          <Link to="/locatii" className="text-blue-600 underline">Înapoi la locații</Link>
        </div>
      )
    }

    const sections = [
        { id: 'despre-locatie', label: 'Despre locaţie', icon: faInfoCircle },
        { id: 'servicii', label: 'Servicii', icon: faStethoscope },
        { id: 'echipa-medicala', label: 'Echipa medicală', icon: faUserDoctor },
        { id: 'galerie-foto', label: 'Galerie foto', icon: faImages },
        ];


    const renderContent = () => {
      if (!currentLocation) return null;

       const programMap = {};
        currentLocation.schedule?.forEach(entry => {
          if (entry?.day) {
            programMap[entry.day.toLowerCase()] = entry;
          }
        });


      const lat = parseFloat(currentLocation?.address?.latitude);
      const lng = parseFloat(currentLocation?.address?.longitude);
      const isValidCoords = !isNaN(lat) && !isNaN(lng);

      switch(sectiune)
      {
          case 'despre-locatie':
              return (
              <div className="flex flex-col lg:flex-row gap-8 p-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                {/* Informatii locatie */}
                <div className="flex-1 flex flex-col gap-6">
                  
                  {/*  */}
                  <div>
                    <FontAwesomeIcon icon={faCircleInfo} className="text-purple-600 mt-1 mr-2" />
                    <strong className="sm:text-xl text-lg">Informaţii:</strong>
                    <p className="mt-1">{currentLocation.infoProfile}</p>
                  </div>

                  {/* Alte info */}
                  {currentLocation.otherInformations?.length > 0 && (
                    <div>
                      <FontAwesomeIcon icon={faCircleInfo} className="text-purple-600 mt-1 mr-2" />
                      <strong className="sm:text-xl text-lg">
                        
                        Alte informații:</strong>
                      <ul className="list-disc ml-4 mt-1">
                        {currentLocation.otherInformations.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Adresa */}
                  <div>
                    <FontAwesomeIcon icon={faMapLocationDot} className="text-purple-600 mt-1 mr-2" />
                    <strong className="sm:text-xl text-lg">Adresă:</strong>{" "}
                    {`${currentLocation.address.address_details}, ${currentLocation.address.city}, ${currentLocation.address.county}`}
                    {currentLocation.address.postalCode && `, ${currentLocation.address.postalCode}`}
                  </div>


                  {/* Program */}
                  <div>
                    <FontAwesomeIcon icon={faCalendarDays} className="text-purple-600 mt-1 mr-2" />
                    <strong className="sm:text-xl text-lg">Program:</strong>
                    <ul className="ml-4 list-disc mt-1">
                      {zileSaptamana.map((zi) => {
                        const ziKey = zi.toLowerCase(); 
                        const entry = programMap[ziKey];
                        return (
                          <li key={zi}>
                            {zi}: {entry ? (entry.closed ? "Închis" : `${entry.startTime} - ${entry.endTime}`) : "Închis"}
                          </li>
                        );
                      })}
                    </ul>
                  </div>


                  {/* Contact */}
                  {currentLocation.phone && (
                    <div>
                      <FontAwesomeIcon icon={faPhone} className="text-purple-600 mt-1 mr-2" />
                      <strong className="sm:text-xl text-lg">Telefon:</strong> {currentLocation.phone}
                    </div>
                  )}
                  {currentLocation.email && (
                    <div>
                      <FontAwesomeIcon icon={faEnvelope} className="text-purple-600 mt-1 mr-2" />
                      <strong className="sm:text-xl text-lg">Email:</strong> {currentLocation.email}
                    </div>
                  )}

                  {/* Facilitati */}
                  {currentLocation.facilities?.length > 0 && (
                    <div>
                      <FontAwesomeIcon icon={faTools} className="text-purple-600 mt-1 mr-2" />
                      <strong className="sm:text-xl text-lg">Facilități:</strong>
                      <ul className="ml-4 list-disc mt-1">
                        {currentLocation.facilities.map((facility, idx) => (
                          <li key={idx}>{facility}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

                {/* Imagine profil + harta */}
                <div className="flex-1 flex flex-col gap-1">

                  {/* Imagine */}
                  <div>
                  <div className="flex items-center gap-2 text-gray-800 self-start">
                    <FontAwesomeIcon icon={faImage} className="text-purple-600" />
                    <strong className="text-lg sm:text-xl">Imagine profil</strong>
                  </div>

                  <img
                    src={currentLocation.images.profileImage || assets.location_default}
                    alt={`Clinica ${currentLocation.clinicName}`}
                    className="rounded-2xl shadow-lg object-cover max-h-[400px] w-full"
                  />
                  </div>

                  {/* Harta */}
                  {currentLocation.address.latitude && currentLocation.address.longitude && (
                    <div className="mt-6 w-full">
                      <FontAwesomeIcon icon={faMapLocationDot} className="text-purple-600 mr-2" />
                      <strong className="sm:text-xl text-lg">Locație:</strong>
                      
                      {/* Buton deschidere */}
                      {isValidCoords ? (
                        <>
                          <LocationMap lat={lat} lng={lng} label={currentLocation.clinicName} />
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-purple-600 underline hover:text-purple-800 transition btn-outline-green"
                          >
                            Vezi în Google Maps
                          </a>
                        </>
                      ) : (
                        <p className="italic text-gray-500">Coordonatele nu sunt disponibile.</p>
                      )}

                    </div>
                  )}
                </div>
              </div>

            );

          case 'servicii':
          return (
            <div className="w-full flex flex-col gap-6">
              <h2 className="text-lg text-center sm:text-left sm:text-xl font-bold text-gray-900">
                <FontAwesomeIcon icon={faHospital} className="text-purple-600 mt-1 mr-2" />
                Specialități și investigații disponibile
              </h2>

              {/* Filtre */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Caută o investigație..."
                    value={searchInv}
                    onChange={(e) => setSearchInv(e.target.value)}
                    className="border border-gray-700 p-2.5 rounded w-full lg:w-1/2 text-sm"
                  />
                  <CustomSelect
                    options={specialityOptions}
                    value={selectedSpeciality}
                    onChange={(selected) => setSelectedSpeciality(selected)}
                    placeholder="Selectează specialitatea"
                    className="w-full lg:w-1/2 text-sm"
                  />
                  <button
                      onClick={() => {
                        setSearchInv('');
                        setSelectedSpeciality(null);
                      
                      }}
                      className="bg-purple-100 cursor-pointer hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
                    >
                    Resetează
                  </button>

              </div>

              {/* Linie separatoare */}
              <hr className="border-t-2 border-gray-300" />

              {loadingServices ? (
                <p className="text-gray-500 text-sm">Se încarcă...</p>
              ) : servicesData.length > 0 ? (
                filteredServices.map((spec, index) => (
                  <div key={index} className="flex flex-col gap-2 border border-gray-200 rounded-xl p-4 shadow-sm">
                    {/* Numele specialității */}
                    <div className="flex items-center justify-between">
                      <div className="text-base sm:text-xl font-semibold text-purple-700 text-center">
                        <FontAwesomeIcon icon={faBookMedical} className="mt-1 mr-2 ml-3" />
                        {spec.specialityName}
                      </div>
                      <button
                        onClick={() => navigate(`/specialitati/${spec.specialityID}/${normalizeLocationName(spec.specialityName)}/despre`)}
                        className="px-4 py-2 cursor-pointer text-xs sm:text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                      >
                        Vezi specialitatea
                      </button>
                    </div>

                    {/* Investigatii */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                        <FontAwesomeIcon icon={faFlask} className="text-purple-600 ml-1" />
                        Investigații disponibile
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/specialitati/${spec.specialityID}/${normalizeLocationName(spec.specialityName)}/investigatii`, {
                            state: { preselectedLocation: currentLocation.address.city }
                          })
                        }
                        className="px-3 py-2 cursor-pointer text-xs sm:text-sm bg-purple-500 text-white rounded-xl hover:bg-purple-700 transition"
                      >
                        Vezi investigații
                      </button>
                    </div>

                    {spec.investigations.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {spec.investigations.map((inv, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-white shadow-sm flex flex-col gap-1 items-start border border-gray-100 rounded-md"
                          >
                            <div className="flex items-center gap-2 text-gray-800 font-medium">
                              <FontAwesomeIcon icon={faMicroscope} className="text-purple-600 text-lg" />
                              <span>{inv.name}</span>
                            </div>
                            <div className="text-sm text-gray-500 ml-6">
                              {inv.price} {inv.currency}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm ml-5">
                        Nu există investigații active pentru această specialitate în această locație.
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Momentan nu există specialități disponibile în această locație.</p>
              )}
            </div>
          );

          case 'echipa-medicala':
            return (
              <div className="w-full flex flex-col gap-6">
                <h2 className="text-lg text-center sm:text-left sm:text-xl font-bold text-gray-900">
                  <FontAwesomeIcon icon={faUserDoctor} className="text-purple-600 mt-1 mr-2" />
                  Medici disponibili
                </h2>

                  {/* Filtre */}
                  <div className="flex flex-col lg:flex-row gap-4 items-center">
                      <input
                        type="text"
                        name="searchDoctor"
                        placeholder="Caută un medic..."
                        value={searchDoctor}
                        onChange={(e) => setSearchDoctor(e.target.value)}
                        className="border border-gray-700 p-2.5 rounded w-full lg:w-full text-sm"
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
                          }}
                          className="bg-purple-100  cursor-pointer hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
                        >
                        Resetează
                      </button>

                  </div>

                  {/* Linie separatoare */}
                  <hr className="border-t-2 border-gray-300" />

                  {/* Lista medicilor */}
                  <DoctorsList
                    doctors={filteredDoctors}
                    onAppointmentClick={(doc) => {
                      console.log("Programare la:", doc.name);
                    }}
                  />
                </div>
                        );    

          case 'galerie-foto':
              const images = currentLocation.images.gallery || [];

              const settings = {
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                pauseOnHover: true,
                arrows: false,
              
              }

                return (
                  <div className="w-full flex flex-col gap-6 ">

                    <h2 className="text-lg text-center sm:text-center sm:ml- sm:text-xl font-bold text-gray-900">
                      <FontAwesomeIcon icon="fa-solid fa-images" className="text-purple-600 mt-1 mr-2" size="md" />
                      Galerie foto
                      </h2>
              
                    {images.length > 0 ? (
                      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl p-5 w-full mb-5">
                      <Slider {...settings}>
                        {images.map((img, idx) => (
                          <div key={idx} className="flex justify-center">
                            <img
                              src={img}
                              alt={`Imagine ${idx + 1}`}
                              className="rounded-xl max-h-[500px] object-cover mx-auto pb3 hover:cursor-pointer"
                            />
                          </div>
                        ))}
                        
                      </Slider>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500">Nu există imagini pentru această locație.</p>
                    )}
                  </div>
                );
      
          default:
            return <div>Locaţie nu s-a găsit</div>;
      }
    };

    

    const currentSection = sections.find(sec => sec.id === sectiune);

  return (
    <div className=''>
    
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
            <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
                <FontAwesomeIcon icon={faHouse} />
                <span className="ml-1">Acasă</span>
            </Link>
            
            <span className="text-gray-400">{'>'}</span>
    
            <Link to="/locatii" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
                <FontAwesomeIcon icon={faLocationDot} />
                <span className="ml-1">Locaţii</span>
            </Link>

            <span className="text-gray-400">{'>'}</span>
           
           <Link 
           to={`/locatii/${locationID}/${clinicNameUrl}/despre-locatie`} 
           className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
            {currentLocation.clinicName}
            </Link> 

            <span className="text-gray-400">{'>'}</span>
            
            
            <span className="text-purple-600  underline font-medium">
                {currentSection ? currentSection.label : ''}
            </span>
        </nav>

        {/* Titlu specialitate */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-5 py-5 flex flex-col items-center text-gray-900">
            <div className="flex items-center justify-center gap-4">
                <h1 className="title text-2xl sm:text-3xl md:text-4xl font-semibold text-center mt-1 mb-2">
                {currentLocation.clinicName}
                </h1>
            </div>
            {/* Status */}
            <div className="flex items-center gap-2">
              {locationStatusBadge(currentLocation.status)}
            </div>
        </div>

         {/* Layout 2 coloane */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 sm:px-6 lg:px-10 my-5">

            {/* Meniu stanga */}
            <div className="lg:w-1/4 w-full self-start bg-white border border-gray-300 rounded-2xl shadow-xl my-3 px-4 sm:px-6 py-5 flex flex-col items-center gap-2 text-gray-900">
    
                {sections.map(sec => (
                <button
                    key={sec.id}
                     onClick={() =>
                        navigate(`/locatii/${locationID}/${clinicNameUrl}/${sec.id}`)
                      }className={classNames(
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

            {/* Continut dreapta */}
            <div className="lg:w-3/4 w-full self-start bg-white border border-gray-300 rounded-2xl shadow-xl  lg:mx-0 my-3 px-4 sm:px-6 py-5 flex flex-col items-center gap-1 text-gray-900">
                {renderContent()}
            </div>

        </div>


    </div>
  )
}

export default LocationDetails