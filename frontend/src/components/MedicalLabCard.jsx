import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask, faDownload } from "@fortawesome/free-solid-svg-icons";

export default function MedicalLabCard({ data }) {
  return (
    <div className="relative ml-4 border-l-2 border-gray-200 pl-6 pb-6">
      {/* Icon in cerc */}
      <div className="absolute -left-4 top-2 bg-blue-100 text-blue-600 rounded-full p-2">
        <FontAwesomeIcon icon={faFlask} className="w-4 h-4" />
      </div>

       {/* Card */}
       <div className="bg-white shadow-md rounded-md border border-gray-200 overflow-hidden mb-6">

        {/* Header */}
        <div className="bg-indigo-50 px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{data.investigatie}</h3>
            <p className="md:text-base text-sm  text-gray-700">{data.locatie}</p>
          </div>

          <div className="flex items-center mt-2 sm:mt-0">
            <p className="md:text-base text-sm text-gray-700">
                {data.data} - {data.ora}
            </p>
          </div>
        </div>

         {/* Continut istoric */}
         <div className="px-4 py-1 mb-5">
            {/* Tabel rezultate */}
            <p className="font-medium text-gray-800 mb-2 mt-2">Rezultate:</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2 font-medium">Test</th>
                  <th className="p-2 font-medium">Rezultat</th>
                  <th className="p-2 font-medium">Valori normale</th>
                  <th className="p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.rezultate.map((r, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 font-medium">{r.test}</td>
                    <td className="p-2">{r.rezultat}</td>
                    <td className="p-2">{r.valori}</td>
                    <td className="p-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-md font-medium ${
                          r.status === "Normal"
                            ? "bg-green-100 text-green-700"
                            : r.status === "Crescut"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

        {/* Observatii */}
        {data.observatii && (
          <div className="mt-4">
            <p className="font-medium text-gray-800 mb-1">Observații:</p>
            <p className="text-sm text-gray-700">{data.observatii}</p>
          </div>
        )}

        {/* PDF */}
        <button className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 border rounded-md hover:bg-gray-50">
          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          Descarcă PDF
        </button>
      </div>
    </div>
    </div>
  );
}
