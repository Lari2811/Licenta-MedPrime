import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faCheckToSlot, faClose, faTrashAlt, faUserDoctor, faUserMd } from '@fortawesome/free-solid-svg-icons';

const DoctorListModal = ({ isOpen, onClose, locationID, clinicName, county }) => {
    const { backendUrl } = useContext(AppContext);
    const { adminID } = useParams();

    const [doctors, setDoctors] = useState([]);

    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState("")

    const fetchDoctors = async () => {

      let loadingTimer;

        try {
            loadingTimer = setTimeout(() => {
                setLoading(true);
                setLoadingMessage("Se încarcă medici...")
            }, 100);
              
          const response = await axios.post(`${backendUrl}/api/admin/get-doctors-by-location-with-info`, { locationID });
          setDoctors(response.data.data);
      } catch (error) {
        console.error('Eroare la fetch:', error);
        setDoctors([]);
      } finally
        {   clearTimeout(loadingTimer);
            setLoading(false)
            setLoadingMessage("")
        }
    };

    useEffect(() => {
      if (isOpen && locationID) {
        fetchDoctors();
      }
    }, [isOpen, locationID]);

    if (!isOpen) return null;

    const getStatusStyles = (status) => {
    switch (status) {
      case 'activ':
        return { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-600', label: 'Activ' };
      case 'in concediu':
        return { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', label: 'În concediu' };
      case 'in asteptare':
        return { border: 'border-l-orange-400', bg: 'bg-orange-50', text: 'text-orange-600', label: 'În așteptare' };
      case 'blocat':
        return { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-600', label: 'Blocat' };
      case 'suspendat':
        return { border: 'border-l-neutral-700', bg: 'bg-neutral-200', text: 'text-black', label: 'Suspendat' };
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

         <button
          onClick={onClose}
          className="absolute top-4 left-4 bg-green-200 text-green-700 px-4 py-2 rounded-lg hover:bg-green-300 hover:text-green-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center hover:cursor-pointer"
          title="Adaugă medici"
          >
          <FontAwesomeIcon icon={faAdd} className='mr-1' /><FontAwesomeIcon icon={faUserDoctor} />
        </button>

        
        <button
          title="Ștergere locație"
          className='text-purple-500 hover:text-purple-600 hover:cursor-pointer'
        
      >
          <FontAwesomeIcon icon={faTrashAlt} className='hover:text-red-900  hover:cursor-pointer' />
      </button>
      

        <div className="w-18 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-center mb-1 text-gray-800">
          Medicii din locația
        </h2>

        <p className="text-lg text-center text-purple-700 font-semibold mb-4">
          ~ {clinicName} - {county} ({locationID}) ~
        </p>

        <p className='border-b-1 mb-5'></p>

        {/* Lista doctori */}
        {doctors.length > 0 ? (
          <ul className="space-y-5">
       {doctors.map((doctor) => {
            const { border, bg, text, label } = getStatusStyles(doctor.status);

            return (
                <li
                key={doctor.doctorID}
                className={`flex items-start gap-3 p-4 rounded-lg shadow-sm transition-all duration-200 hover:scale-103 hover:shadow-md border-l-4 ${border} ${bg}`}
                >
                    <div className="flex flex-col items-center mt-3 mr-1">
                        <FontAwesomeIcon icon={faUserMd} className="text-purple-600 text-2xl mt-1" />
                        <p className="text-xs text-gray-700 font-bold mt-1">{doctor.doctorID}</p>
                    </div>

                    <div>
                    <p className="font-semibold text-gray-800 text-base">
                    Dr. {doctor.lastName} {doctor.firstName} ({doctor.doctorID})
                    </p>
                    <p className="text-sm text-gray-600 italic font-medum"> Medic {doctor.type}</p>
                    <p className="text-sm text-gray-600">
                    <span className="font-medium text-purple-700">Specialități:</span> <span className='font-medium'>{doctor.specialities.join(', ')} </span>
                    </p>
                    <p className={`text-xs font-bold mt-1 ${text}`}>
                    Status: {label}
                    </p>
                </div>
                </li>
            );
            })}




          </ul>
        ) : (
          <p className="text-gray-500 italic text-center">
            Nu există medici activi în această locație.
          </p>
        )}

        <p className='border-b-1 mb-5 mt-5'></p>

         <div className="flex justify-center mt-6 gap-3 items-center">
            <button 
                onClick={ () => onClose()
                } 
                className="btn-outline-green flex items-center gap-2 px-5 py-2 rounded hover:cursor-pointer"
            >
                <FontAwesomeIcon icon={faClose} />
                Închide
            </button>
        </div>

      </div>
    </div>
  );
};

export default DoctorListModal;
