import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../Loader';
import { getStatusLabel } from '../../../utils/getStatusLabel';

const LocationModalListInv = ({ isOpen, onClose, investigationID, investigationName }) => {
  const { backendUrl } = useContext(AppContext);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const fetchLocations = async () => {
    let timer;

    try {
      timer = setTimeout(() => {
        setLoading(true);
        setLoadingMessage("Se încarcă locațiile...");
      }, 100);

      const response = await axios.post(`${backendUrl}/api/admin/get-locations-by-investigation`, {
        investigationID,
      });

      setLocations(response.data.data);
    } catch (error) {
      console.error("Eroare la fetch locații:", error);
      setLocations([]);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    if (isOpen && investigationID) {
      fetchLocations();
    }
  }, [isOpen, investigationID]);

  if (!isOpen) return null;

  const getStatusStyle = (isActive) => {
    return isActive ? 'border-l-green-500 bg-green-50 text-green-700' : 'border-l-red-500 bg-red-50 text-red-700';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90%] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center hover:cursor-pointer"
        >
          <FontAwesomeIcon icon={faClose} />
        </button>

        <div className="w-20 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>

        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Locațiile pentru investigația
        </h2>

        <p className="text-lg text-center text-purple-700 font-semibold mb-4">
          ~ {investigationName} ({investigationID}) ~
        </p>

        <p className='border-b-1 mb-5'></p>

        {locations.length > 0 ? (
          <ul className="space-y-5">
            {locations.map((loc, index) => (
              <li
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg shadow-sm transition-all duration-200 hover:scale-103 hover:shadow-md border-l-4 ${getStatusStyle(loc.isInvestigationActive)}`}
              >
                <div className="flex flex-col items-center mt-3 mr-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-purple-600 text-2xl mt-1" />
                  <p className="text-xs text-gray-700 font-bold mt-1">{loc.locationID}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 text-base"> {loc.county} - {loc.clinicName}</p>
                  <p className="text-sm text-gray-600 italic">
                    Specialitate: <span className="text-purple-700 font-medium">{loc.specialityName}</span>
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    Preț: <span className="font-semibold">{loc.price} RON</span>
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    Status locație: <span className="font-semibold"> {getStatusLabel(loc.locationStatus)}</span>
                  </p>
                  <p className="text-xs font-bold mt-1">
                    Status investigație:{" "}
                    <span className={loc.isInvestigationActive ? "text-green-600" : "text-red-600"}>
                      {loc.isInvestigationActive ? "Activă" : "Inactivă"}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-center">
            Nu există locații în care investigația este disponibilă.
          </p>
        )}

        <p className="border-b-1 mb-5 mt-5"></p>

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="btn-outline-green flex items-center gap-2 px-5 py-2 rounded hover:cursor-pointer"
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

export default LocationModalListInv