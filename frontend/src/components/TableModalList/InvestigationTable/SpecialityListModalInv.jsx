import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faMicroscope, faStopwatch, faStar, faStethoscope } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../Loader';

const SpecialityListModalInv = ({ isOpen, onClose, investigationID, investigationName }) => {
  const { backendUrl } = useContext(AppContext);
  const { adminID } = useParams();
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const fetchInvestigations = async () => {
    let loadingTimer;

    try {
      loadingTimer = setTimeout(() => {
        setLoading(true);
        setLoadingMessage("Se încarcă investigațiile...");
      }, 100);

      const response = await axios.post(`${backendUrl}/api/admin/get-specialities-by-investigation`, {
        investigationID,
      });
      setInvestigations(response.data.data);
    } catch (error) {
      console.error('Eroare la fetch:', error);
      setInvestigations([]);
    } finally {
      clearTimeout(loadingTimer);
      setLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    if (isOpen && investigationID) {
      fetchInvestigations();
    }
  }, [isOpen, investigationID]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90%] overflow-y-auto relative">

        {/* Buton închidere */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center cursor-pointer"
          title="Închide"
        >
          <FontAwesomeIcon icon={faClose} />
        </button>

        <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-800">
          Specialiățile de care aparține Investigația
        </h2>

        <p className="text-lg text-center text-purple-700 font-semibold mb-4">
          ~ {investigationName} ({investigationID}) ~
        </p>

        <p className='border-b-1 mb-5'></p>

        {/* Lista investigații */}
        {investigations.length > 0 ? (
          <ul className="space-y-5">
            {investigations.map((inv) => (
              <li
                key={inv.investigationID}
                className="flex items-center gap-4 p-4 rounded-lg shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md border-l-4 bg-pink-50 border-pink-600"
                >
                <div className="flex flex-col items-center justify-center min-w-[60px]">
                    <FontAwesomeIcon icon={faStethoscope} className="text-purple-700 text-2xl" />
                    <p className="text-xs text-gray-700 font-bold mt-1">{investigationID}</p>
                </div>

                <div>
                    <p className="font-semibold text-gray-800 text-lg">{inv.name} ({inv.specialityID}) </p>
                </div>
            </li>

            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-center">
            Nu există investigații pentru această specialitate.
          </p>
        )}

        <p className="border-b-1 mb-5 mt-5"></p>

        {/* Buton Închide */}
        <div className="flex justify-center mt-6 gap-3 items-center">
          <button
            onClick={onClose}
            className="btn-outline-green flex items-center gap-2 px-5 py-2 rounded cursor-pointer"
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

export default SpecialityListModalInv