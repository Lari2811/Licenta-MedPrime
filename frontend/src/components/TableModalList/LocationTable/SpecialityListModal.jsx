import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faStethoscope } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../Loader';

const SpecialityListModal = ({ isOpen, onClose, locationID, clinicName, county }) => {
    const { backendUrl } = useContext(AppContext);
    const [specialities, setSpecialities] = useState([]);

    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")

    const fetchSpecialities = async () => {
      let loadingTimer
        try {
          loadingTimer = setTimeout(() => {
            setLoading(true);
            setLoadingMessage("Se încarcă specialitățiile...")
          }, 100)
            const response = await axios.post(`${backendUrl}/api/admin/get-specialities-by-location`, { locationID });
            setSpecialities(response.data.data);
        } catch (error) {
        console.error('Eroare la fetch:', error);
        setSpecialities([]);
        } finally{
            clearTimeout(loadingTimer);
            setLoading(false)
            setLoadingMessage("")
        }
    };

    useEffect(() => {
        if (isOpen && locationID) {
        fetchSpecialities();
        }
    }, [isOpen, locationID]);

    if (!isOpen) return null;

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
          Specialitățile din locația
        </h2>
        <p className="text-lg text-center text-purple-700 font-semibold mb-4">
          ~ {clinicName} - {county} ({locationID}) ~
        </p>
        <p className='border-b-1 mb-5'></p>

        {/* Lista specialități */}
        {specialities.length > 0 ? (
          <ul className="space-y-4">
            {specialities.map((spec, index) => (
              <li
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg shadow-sm transition hover:shadow-md ${
                  spec.isSpecialityActive ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                }`}
              >
                <FontAwesomeIcon icon={faStethoscope} className="text-purple-600 text-xl" />
                <div>
                  <p className="font-semibold text-gray-800">
                    {spec.name} ({spec.specialityID})
                  </p>
                  <p className={`text-xs font-bold ${
                    spec.isSpecialityActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {spec.isSpecialityActive ? 'Activă' : 'Inactivă'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-center">Nu există specialități în această locație.</p>
        )}

       <p className='border-b-1 mb-5 mt-5'></p>
       
              

        <div className="flex justify-center mt-6 gap-3 items-center">
            <button 
                onClick={ () => onClose()
                } 
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

export default SpecialityListModal;
