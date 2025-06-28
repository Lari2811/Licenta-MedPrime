import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHospital, faMapMarkerAlt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../Loader';

const LocationListModalS = ({ isOpen, onClose, specialityID, specialityName }) => {
    const { backendUrl } = useContext(AppContext);
    const { adminID } = useParams();
    const [locations, setLocations] = useState([]);

    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")

    const fetchLocations = async () => {
        let loadingTimer;
        try {
            loadingTimer = setTimeout(() => {
                setLoading(true);
                setLoadingMessage("Se încarcă locațiile...")
            }, 100);
                
            const response = await axios.post(`${backendUrl}/api/admin/get-locations-by-speciality`, { specialityID });
            setLocations(response.data.data);
        } catch (error) {
        console.error('Eroare la fetch:', error);
        setLocations([]);
        } finally
        {
            clearTimeout(loadingTimer);
            setLoading(false)
            setLoadingMessage("")
        }
    };

    useEffect(() => {
        if (isOpen && specialityID) {
        fetchLocations();
        }
    }, [isOpen, specialityID]);

    if (!isOpen) return null;

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'deschis':
        return { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-600', label: 'Deschis' };
      case 'inchis definitic':
        return { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-600', label: 'Închis definitiv' };
      case 'inchis temporar':
        return { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Închis temporar' };
      default:
        return { border: 'border-l-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', label: status || 'Necunoscut' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90%] overflow-y-auto relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center hover:cursor-pointer"
          title="Închide"
        >
          <FontAwesomeIcon icon={faClose} />
        </button>

        <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-800">
          Locațiile pentru Specialitatea
        </h2>

        <p className="text-lg text-center text-purple-700 font-semibold mb-4">
          ~ {specialityName} ({specialityID}) ~
        </p>

        <p className='border-b-1 mb-5'></p>

        {/* Lista locații */}
        {locations.length > 0 ? (
          <ul className="space-y-5">
            {locations.map((loc) => {
              const { border, bg, text, label } = getStatusStyles(loc.status);

              return (
                <li
                  key={loc.locationID}
                  className={`flex items-start gap-3 p-4 rounded-lg shadow-sm transition-all duration-200 hover:scale-103 hover:shadow-md border-l-4 ${border} ${bg}`}
                >
                  <div className="flex flex-col items-center mt-3 mr-1">
                    <FontAwesomeIcon icon={faHospital} className="text-purple-600 text-2xl mt-1" />
                    <p className="text-xs text-gray-700 font-bold mt-1">{loc.locationID}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800 text-base">
                      {loc.clinicName} ({loc.locationID})
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      Județ: {loc.county}
                    </p>
                    <p className={`text-xs font-bold mt-1 ${text}`}>
                      Status: {label}
                    </p>
                    <p className="text-xs font-bold mt-1">
                      <FontAwesomeIcon icon={faCheckCircle} className={`mr-1 ${loc.isSpecialityActive ? 'text-green-600' : 'text-red-600'}`} />
                      {loc.isSpecialityActive ? 'Specialitate Activă' : 'Specialitate Inactivă'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-center">
            Nu există locații pentru această specialitate.
          </p>
        )}

        <p className='border-b-1 mb-5 mt-5'></p>

        <div className="flex justify-center mt-6 gap-3 items-center">
          <button
            onClick={onClose}
            className="btn-outline-green flex items-center gap-2 px-5 py-2 rounded"
          >
            <FontAwesomeIcon icon={faClose} />
            Închide
          </button>
        </div>

      </div>
        {loading && <Loader message={loadingMessage} />}
    </div>
  );
};

export default LocationListModalS;
