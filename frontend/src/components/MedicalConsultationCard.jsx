import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStethoscope, faDownload, faCapsules } from "@fortawesome/free-solid-svg-icons";

export default function MedicalConsultationCard({ data }) {
  return (
    <div className="relative ml-4 border-l-2 border-gray-200 pl-6 pb-6">
      {/* Icon stanga */}
      <div className="absolute -left-6 top-2 bg-purple-100 text-purple-600 rounded-full p-2">
        <FontAwesomeIcon icon={faStethoscope} className="w-4 h-4" />
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-md border border-gray-200 overflow-hidden mb-6">

        {/* Header */}
        <div className="bg-indigo-50 px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{data.investigatie}</h3>
            <p className="md:text-base text-sm  text-gray-700">
              {data.medic} - {data.specialitate} 
            </p>
          </div>
          
          <div className="flex items-center mt-2 sm:mt-0">
          <p className="md:text-base text-sm text-gray-700">
              {data.data} - {data.ora}
            </p>
          </div>
        </div>

      {/* Continut istoric */}
      <div className="px-4 py-1 mb-5">
        

        <p className="font-medium text-gray-800 mt-2">Diagnostic:</p>
        <p className="text-sm text-gray-700 mb-3">{data.diagnostic}</p>

        <p className="font-medium text-gray-800">Recomandări:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 mb-3">
          {data.recomandari.map((r, idx) => <li key={idx}>{r}</li>)}
        </ul>

        <p className="font-medium text-gray-800">Medicație prescrisă:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
          {data.medicatie.map((m, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCapsules} className="text-green-500 mt-1 w-4 h-4" />
              <span>{m}</span>
            </li>
          ))}
        </ul>

        <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border rounded-md hover:bg-gray-50">
          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          Descarcă PDF
        </button>
      </div>
      </div>
    </div>
  );
}
