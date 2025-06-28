import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faCalendarAlt,
  faStethoscope,
  faFileMedical,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from '../../../utils/formatStatus';

const PatientCard = ({ patient, onView }) => {

    const { label, color, icon, bgColor } = formatStatus(patient?.status);

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ">
      {/* Header: nume + status */}
      <div className="px-4 py-2 border-b-3 border-gray-100 text-xl flex justify-between items-center">
        <h3 className="font-semibold text-purple-800">
          {patient.lastName} {patient.firstName}
        </h3>
        <span className={`flex items-center gap-2 mb-2 mt-1 px-3 py-1 rounded-full text-sm font-bold w-fit ${bgColor}`}>
            <FontAwesomeIcon icon={icon} className={`${color} w-4 h-4`} />
            <span className={`${color} font-semibold text-sm`}>{label}</span>
        </span>
      </div>


      {/* Info */}
      <div className="p-4 text-lg">
        <div className="flex items-center mb-2">
          <FontAwesomeIcon icon={faIdCard} className="text-gray-400 w-5" />
          <span className="text-sm ml-2">CNP: {patient.cnp}</span>
        </div>
        <div className="flex items-center mb-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 w-5" />
          <span className="text-sm ml-2">
            Ultima vizită:{" "}
            {patient.lastVisit
              ? new Date(patient.lastVisit).toLocaleDateString("ro-RO")
              : "—"}
          </span>
        </div>
        <div className="flex items-center">
          <FontAwesomeIcon icon={faFileMedical} className="text-gray-400 w-5" />
          <span className="text-sm ml-2">
            Documente: {patient.documentCount || 0}
          </span>
        </div>
      </div>

      {/* Buton Vizualizare */}
      <div className="bg-gray-50 p-3 flex justify-end">
        <button
          onClick={() => onView(patient.patientID)}
          className="text-purple-600 hover:text-purple-800 hover:underline mx-1 cursor-pointer whitespace-nowrap inline-flex items-center"
        >
          <FontAwesomeIcon icon={faEye} className="mr-1" />
          Vizualizare
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
