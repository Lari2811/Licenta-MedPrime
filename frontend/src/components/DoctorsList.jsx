import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faMapMarkerAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import { assets } from '../assets/assets';
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { checkIfPatientLoggedIn } from '../accessControl/checkIfPatientLoggedIn';
import ModalPacient from './ModalPatient';

const DoctorsList = ({ doctors }) => {
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);



  if (!doctors || doctors.length === 0) {
    return (
      <p className="text-gray-700 text-center col-span-full text-lg font-medium">
        Nu am găsit niciun medic care să corespundă criteriilor selectate.
      </p>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {doctors.map((doc) => {
        const locations = doc.locations || [];
        const locationNames = locations.map(loc => loc.locationName);
        const specialities = doc.specialities?.map(spec => spec.name).join(', ') || 'Nespecificat';

        return (
          <div
            key={doc._id}
            className="bg-white border border-gray-300 rounded-xl shadow-md p-5 w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 items-center"
          >
            {/* Stanga: Info medic */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:text-center">
              <img
                src={doc.profileImage || assets.doctor_default}
                alt={`${doc.firstName} ${doc.lastName}`}
                className="w-22 h-22 rounded-full object-cover border-2 border-purple-300"
              />

              <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-purple-700">
                  Dr. {doc.lastName} {doc.firstName}
                </h3>
                <ul className="text-xs sm:text-sm text-purple-600 capitalize">
                  {doc.specialities?.map((s, idx) => (
                    <li key={idx}>Medic {doc.type} – {s.specialityName}</li>
                  ))}
                </ul>
                

                <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-700 justify-center sm:justify-start">
                  {locationNames.map((loc, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-purple-500" />
                      {loc}
                    </div>
                  ))}
                </div>

                 <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-700 justify-center sm:justify-start">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                  {(doc.rating || 0).toFixed(1)} / 5.0
                </div>
                  
              </div>
            </div>

            {/* Dreapta: Butoane */}
            <div className="flex flex-col items-center sm:items-end w-full sm:w-auto gap-2">
              <button
                onClick={() => {
                  const doctorName = `Dr.${doc.lastName}-${doc.firstName}`;
                  navigate(`/medici/${doc.doctorID}/${doctorName}/profil-medic`)
                }}
                className="px-4 py-2 cursor-pointer font-semibold text-xs sm:text-sm bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
              >
                Vezi profil
              </button>

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

              {selectedDoctor?._id === doc._id && locations.length > 1 && (
                <div className="flex flex-col gap-2 mt-2 w-full sm:w-auto">
                  <select
                    className="border border-gray-300 rounded px-3 py-1 text-xs sm:text-sm"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">Selectează locația</option>
                    {locations.map((loc, idx) => (
                      <option key={idx} value={loc.locationName}>
                        {loc.locationName}
                      </option>
                    ))}
                  </select>

                  <button
                    disabled={!selectedLocation}
                    onClick={() => {
                      navigate('/programare/', {
                        state: {
                          medic: doc.doctorID,
                          specialitate: specialities,
                          locatie: selectedLocation,
                        }
                      });
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white text-xs sm:text-sm px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuă
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}



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
  );
};

export default DoctorsList;
