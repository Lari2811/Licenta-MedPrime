import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faClosedCaptioning, faFlask } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../Loader';

const InvestigationListModal = ({ isOpen, onClose, locationID, clinicName, county }) => {
    const { backendUrl } = useContext(AppContext);

    const [investigations, setInvestigations] = useState([]);

    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")

    const fetchInvestigations = async () => {
        let loadingTimer;

        try {
            loadingTimer = setTimeout(() => {
                setLoading(true);
                setLoadingMessage("Se încarcă investigațiile...")
            }, 100);
          const response = await axios.post(`${backendUrl}/api/admin/get-investigations-by-location`, { locationID });
          setInvestigations(response.data.data);
      } catch (error) {
        console.error('Eroare la fetch:', error);
        setInvestigations([]);
      } finally
        {   clearTimeout(loadingTimer);
            setLoading(false)
            setLoadingMessage("")
        }
    };

    useEffect(() => {
      if (isOpen && locationID) {
        fetchInvestigations();
      }
    }, [isOpen, locationID]);

    if (!isOpen) return null;

  const getStatusStyle = (isActive) => {
    return isActive ? 'border-l-green-500 bg-green-50 text-green-700' : 'border-l-red-500 bg-red-50 text-red-700';
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
  
        <div className="w-18 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
        
        
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-800">
          Investigațiile disponibile în locația
        </h2>

        <p className="text-lg text-center text-purple-700 font-semibold mb-4">
          ~ {clinicName} - {county} ({locationID}) ~
        </p>

        <p className='border-b-1 mb-5'></p>

        {investigations.length > 0 ? (
          <ul className="space-y-5">
            {investigations.map((inv) => (
              <li
                key={inv.investigationID}
                className={`flex items-start gap-3 p-4 rounded-lg shadow-sm transition-all duration-200 hover:scale-103 hover:shadow-md border-l-4 ${getStatusStyle(inv.isInvestigationActive)}`}
              >
                <div className="flex flex-col items-center mt-3 mr-1">
                  <FontAwesomeIcon icon={faFlask} className="text-purple-600 text-2xl mt-1" />
                  <p className="text-xs text-gray-700 font-bold mt-1">{inv.investigationID}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 text-base">{inv.name}</p>
                 
                  <p className="text-sm text-gray-600 italic">
                    Preț: <span className="font-semibold">{inv.price} {inv.currency}</span>
                  </p>
                  <p className="text-sm text-gray-600 italic">
                      Durată: <span className="font-semibold">{inv.duration} min</span>
                    </p>
                     <p className="text-sm text-gray-600 italic">
                    Specialitate: <span className="font-medium text-purple-700">{inv.specialityName}</span>
                  </p>
                  <p className="text-xs font-bold mt-1">
                    Status: <span className={inv.isInvestigationActive ? 'text-green-600' : 'text-red-600'}>
                      {inv.isInvestigationActive ? 'Activă' : 'Inactivă'}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-center">
            Nu există investigații disponibile în această locație.
          </p>
        )}

        <p className='border-b-1 mb-5 mt-5'></p>

        <div className="flex justify-center mt-6 gap-3 items-center">
          <button
            onClick={onClose}
            className="btn-outline-green flex items-center gap-2 px-5 py-2 rounded"
          >
            Închide
          </button>
        </div>
      </div>

      {loading && <Loader message={loadingMessage} />}
    </div>
  );
};

export default InvestigationListModal;
