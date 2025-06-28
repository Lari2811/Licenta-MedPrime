import React, { useContext, useEffect, useState  } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContex'
import classNames from 'classnames';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMd, faStethoscope, faMapMarkerAlt, faClock, faInfoCircle, faGraduationCap,
  faBriefcase, faStar, faHeart, faHospitalUser, faMoneyBillWave, faPhone, faEnvelope, faCheckCircle,
  faLocationDot, faMagnifyingGlass, faHouse, faUserDoctor, 
  faCircleInfo,
  faLanguage,
  faMapLocation,
  faMapLocationDot
} from '@fortawesome/free-solid-svg-icons';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { normalizeLocationName } from '../utils/normalizeLocationName';
import CustomSelect from '../components/customSelect';

import socket from '../socket';


const DoctorProfiles = () => 
  {
    const navigate = useNavigate();
    const {backendUrl} = useContext(AppContext);

    const { doctorID, doctorName, sectiune } = useParams();
    //console.log(doctorID, doctorName, sectiune);

    // --------------------- PRELUARE DATE DOCTORI + FORMARE  OPTIONS  CUSTOMM  SELECT ---------------------
  const [doctorsData, setDoctorsData] = useState([])

  const [loadingDoctors , setLoadingDoctors ] = useState()
  	
	
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);

        const res = await axios.get(`${backendUrl}/api/main/get-all-active-doctors-with-data`);
        
        const allDoctors = res.data.data;
        console.log("Toți doctorii:", allDoctors);
        setDoctorsData(allDoctors);

        // ================= Locatii =================
        const locationMap = new Map();

        allDoctors.forEach(doc => {
          doc.locations?.forEach(loc => {
            if (loc.locationID && loc.locationName &&
              doc.doctorID === doctorID 
            ) {
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
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();

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

      socket.on('SPECIALITY_DELETED', () => {
        console.log('Specialitatile s-au actualizat (stergere)!');
        toast.info('Date actualizate');
        fetchDoctors();
      });

      socket.on('INVESTIGATION_DELETED', () => {
        console.log('Investigatiile s-au actualizat (stergere)!');
        toast.info('Date actualizate');
        fetchDoctors();
      });

      return () => {
        socket.off('locationAdded');
        socket.off('LOCATION_DELETED');
        socket.off('SPECIALITY_DELETED');
        socket.off('INVESTIGATION_DELETED');
      };
  
  }, []);


  const selectedDoctor = !loadingDoctors && doctorsData.length > 0
    ? doctorsData.find(doc => doc.doctorID === doctorID)
    : null;

  console.log("Selected doctor:", selectedDoctor);
  //console.log("Doctors data:", doctorsData);

  // === Filtrare pentru program ===
  const [locationDoctorOptions, setLocationDoctorOptions] = useState([]);
  const [selectedLocationDoctor, setSelectedLocationDoctor] = useState('');

      const sections = [
      { id: 'profil-medic', label: 'Profil medical', icon: faUserMd },
      { id: 'locatie', label: 'Locație', icon: faMapMarkerAlt },
      { id: 'program', label: 'Program', icon: faClock },
    ];;

    

    const renderContent = () => {
      switch (sectiune) {
        case 'profil-medic':
          return (

            <div className="space-y-5 text-gray-800 w-full">

              {/* Header: imagine + nume + specialitati */}
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full border-b-2 border-gray-300 pb-6">
                <img 
                  src={selectedDoctor.profileImage || assets.doctor_default} 
                  alt={selectedDoctor.firstName} 
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full shadow-lg ring-2 ring-purple-400"
                />
                <div className="text-center sm:text-left space-y-2">
                  <h2 className="text-2xl font-bold text-purple-800">Dr. {selectedDoctor.lastName} {selectedDoctor.firstName}</h2>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 justify-center sm:justify-start">
                    {selectedDoctor?.specialities?.length > 0
                      ? selectedDoctor.specialities.map((spec, idx) => (
                          <span key={idx} className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full border-purple-300 w-fit">
                            {spec.specialityName}
                          </span>
                        ))
                      : <span className="text-sm text-gray-400 italic">Fără specialitate</span>}
                  </div>
                </div>
              </div>

              {/* Sectiuni Despre, Expertiza, Abordare etc. */}
              {[
                { icon: faCircleInfo, label: 'Despre mine', data: selectedDoctor.profile?.about },
                { icon: faUserMd, label: 'Expertiză și activitate', data: selectedDoctor.profile?.expertise },
                { icon: faHeart, label: 'Abordare față de pacienți', data: selectedDoctor.profile?.approach },
                { icon: faHospitalUser, label: 'Rol în clinică', data: selectedDoctor.profile?.roleInClinic },
                { icon: faGraduationCap, label: 'Studii', data: selectedDoctor.studies },
                { icon: faBriefcase, label: 'Experiență', data: selectedDoctor.experience },
                { icon: faLanguage, label: 'Limbi vorbite', data: selectedDoctor.languagesSpoken },
              ].map((section, idx) => (
                section.data?.length > 0 && (
                  <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <FontAwesomeIcon icon={section.icon} className="text-purple-600 text-lg" />
                      <h3 className="text-lg sm:text-xl font-semibold">{section.label}</h3>
                    </div>
                    <ul className="list-disc ml-6 text-sm sm:text-base space-y-1 text-gray-700">
                      {section.data.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}

              {/* Locatii */}
              {selectedDoctor.locations?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FontAwesomeIcon icon={faLocationDot} className="text-purple-600 text-lg" />
                    <h3 className="text-lg sm:text-xl font-semibold">Locații</h3>
                  </div>
                  <ul className="list-disc ml-6 text-sm sm:text-base space-y-1 text-gray-700">
                    {selectedDoctor.locations.map((loc, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{loc.locationName}</span> – ({loc.address.city}, {loc.address.county})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

          );

        case 'locatie':
          return (
            <div className="space-y-6 text-gray-800 w-full">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="text-purple-600 text-lg" />
                <h2 className="text-xl font-semibold">Locații disponibile</h2>
              </div>

              {selectedDoctor.locations?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {selectedDoctor.locations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 rounded-xl p-5 bg-gray-50 shadow-sm h-full flex flex-col justify-between"
                    >
                      {/* Nume si adresa */}
                      <div>
                        <h3 className="text-lg font-bold text-purple-700">
                          <FontAwesomeIcon icon={faMapLocationDot}  className='mr-2'/>
                          {loc.locationName}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {loc.address?.address_details}, {loc.address?.city}, {loc.address?.county}
                        </p>

                        {/* Program */}
                        {loc.schedule?.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium text-sm text-gray-800 mb-1">Program:</p>
                            <ul className="list-disc ml-5 text-sm text-gray-700">
                              {loc.schedule.map((day, sIdx) => (
                                <li key={sIdx}>
                                  {day.day.charAt(0).toUpperCase() + day.day.slice(1)}: {day.startTime} - {day.endTime}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Buton */}
                      <div className="">
                          <button
                            onClick={() => {
                              if (loc?.locationName && loc?.locationID) {
                                navigate(`/locatii/${loc.locationID}/${normalizeLocationName(loc.locationName)}/despre-locatie`);
                              }
                            }}
                            className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow transition"
                          >
                            Vezi detalii locație
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Acest medic nu are locații asociate momentan.</p>
              )}
            </div>
          );

        case 'program':
         return (
            <div className="space-y-7 w-full">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="text-purple-600 text-lg" />
                <h2 className="text-xl font-semibold">Program de muncă în locația</h2>
              </div>

              <CustomSelect
                options={locationDoctorOptions}
                value={selectedLocationDoctor}
                onChange={(selected) => setSelectedLocationDoctor(selected)}
                placeholder="Locația..."
                className="w-full lg:w-full text-sm"
              />

              {/* Linie de separare */}
              <hr className="border-t-2 border-gray-300 " />
              

              {/* Filtrare locatie */}
              {(
                selectedLocationDoctor
                  ? selectedDoctor.locations?.filter(loc => loc.locationID === selectedLocationDoctor)
                  : selectedDoctor.locations
              )?.map((loc, index) => {
                const daysOfWeek = ['luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata', 'duminica'];
                const scheduleMap = {};

                daysOfWeek.forEach(day => {
                  const match = loc.schedule?.find(sch => sch.day.toLowerCase() === day);
                  scheduleMap[day] = match ? `${match.startTime} - ${match.endTime}` : null;
                });

                return (
                  <div key={index} className="border border-gray-200 rounded-xl shadow-md p-4">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 text-purple-700 flex items-center gap-2">
                      <FontAwesomeIcon icon={faLocationDot} className="text-purple-500" />
                      {loc.locationName} ({loc.address?.city}, {loc.address?.county})
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {daysOfWeek.map(day => (
                        <div
                          key={day}
                          className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md
                            ${scheduleMap[day] ? 'bg-green-50 hover:brightness-105' : 'bg-gray-100 opacity-70'}
                            text-center transition duration-300`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold capitalize text-gray-700 text-sm sm:text-base">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </span>
                            {scheduleMap[day] && (
                              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xs sm:text-sm" />
                            )}
                          </div>
                          <span className={`mt-1 text-xs sm:text-sm ${scheduleMap[day] ? 'text-green-700' : 'text-gray-400'}`}>
                            {scheduleMap[day] || 'Indisponibil'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
      }
    };

    return (
      <div className=''>

        {loadingDoctors ? (
         <div className="p-6 text-center text-red-600">
            Se încarcă datele medicului...
          </div>
        ) : !selectedDoctor ? (
          <div className="p-6 text-center text-red-600">
            Medicul {doctorName} nu a fost găsit.</div>
        ) : (
          <>
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
              <Link to="/" className="hover:text-purple-600 hover:underline transition">
                <FontAwesomeIcon icon={faHouse} />
                <span className="ml-1">Acasă</span>
              </Link>
              
              <span className="text-gray-400">{'>'}</span>
              <Link to="/medici" className="hover:text-purple-600 hover:underline transition">
              <FontAwesomeIcon icon={faUserDoctor} />
                <span className="ml-1">Medici</span>
              </Link>
              <span className="text-gray-400">{'>'}</span>
              <span className="hover:text-purple-600 hover:underline transition" >{selectedDoctor.lastName} {selectedDoctor.firstName}</span>
              <span className="text-gray-400">{'>'}</span>
              <span className="text-purple-600 underline font-medium capitalize">
                {sections.find(sec => sec.id === sectiune)?.label || sectiune}
              </span>
            </nav>
            
            {/* Titlu pagina */}
            <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-5 py-5 flex flex-col items-center text-gray-900">
              <div className="flex items-center justify-center gap-4">
                <h1 className="title text-2xl sm:text-3xl md:text-4xl font-semibold text-center mt-1 mb-2">
                   Dr.{selectedDoctor.lastName} {selectedDoctor.firstName}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  {selectedDoctor?.specialities?.map(spec => spec.specialityName).join(', ') || 'Fără specialitate'} 
                </p> 
              </div>
              </div>

            {/* Continut paginii */}
            <div className="flex flex-col lg:flex-row gap-4 px-4 sm:px-6 lg:px-10 my-5">
              
              {/* Meniu stanga */}
              <div className="lg:w-1/4 self-start w-full bg-white border border-gray-300 rounded-2xl shadow-xl px-4 py-5 flex flex-col gap-2 text-gray-900">
                {sections.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => navigate(`/medici/${doctorID}/${doctorName}/${sec.id}`)}
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

              {/* Continut dreapta */}
              <div className="lg:w-3/4 w-full self-start bg-white border border-gray-300 rounded-2xl shadow-xl px-4 py-5">
                {renderContent()}
              </div>
            </div>
          </>
        )}


      </div>
    );
};

export default DoctorProfiles;
