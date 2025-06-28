import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../context/AppContex';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag, faUserDoctor, faExclamationCircle, faClock, faCalendarAlt, faEye, faLayerGroup, faAlignLeft, faFileAlt, faHourglassHalf, faSyncAlt, faTools, faUser } from '@fortawesome/free-solid-svg-icons';

const formatText = (text) => {
  if (!text) return "-";
  return text
    .toLowerCase()
    .split("_")
    .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(" ");
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};


const DisplayRequestsTableAdmin = ({requests, fetchRequests}) => {
 
  //actiuni
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);


  const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-xl bg-white mt-5">
      <table className="w-full table-fixed text-sm text-left text-gray-700">
        <colgroup>
          <col className="w-24" /> {/* ID Request */}
          <col className="w-24" /> {/* ID Medic */}
          <col className="w-40" /> {/* Tip */}
          <col className="w-28" /> {/* Status */}
          <col className="w-28" /> {/* Prioritate */}
          <col className="w-32" /> {/* Creat la */}
          <col className="w-32" /> {/* Ultima actualizare */}
          <col className="w-20" /> {/* Acțiuni */}
        </colgroup>
        <thead className="bg-purple-100 text-purple-900">
          <tr>
            <th className="px-6 py-3">
              <FontAwesomeIcon icon={faHashtag} className="mr-2 text-purple-700" /> ID Request </th>
            <th className="px-6 py-3"><FontAwesomeIcon icon={faUser} className="mr-2 text-purple-700" /> ID User</th>
            <th className="px-6 py-3 text-left"> <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-purple-700" /> Tip </th>
            <th className="px-6 py-3"><FontAwesomeIcon icon={faHourglassHalf} className="mr-2 text-purple-700" /> Status </th>
            <th className="px-6 py-3"> <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 text-purple-700" /> Prioritate </th>
            <th className="px-6 py-3"> <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-700" /> Creat la </th>
            <th className="px-6 py-3"><FontAwesomeIcon icon={faSyncAlt} className="mr-2 text-purple-700" /> Ultima actualizare </th>
            <th className="px-6 py-3 text-center"> <FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" /> Acțiuni </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {requests.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-6 text-center text-gray-500 italic">
                Nu există cereri disponibile.
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr key={request._id} className="hover:bg-purple-50 transition-colors duration-200">
                <td className="px-6 py-4 font-mono text-gray-700">#{request.requestID}</td>
                <td className="px-6 py-4 font-mono text-gray-700">{request.userID}</td>
                <td className="px-6 py-4 text-gray-800">{formatText(request.tipSolicitare)}</td>
                <td className="px-6 py-4 text-gray-800">{formatText(request.status)}</td>
                
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      request.prioritate === "URGENT" ? "bg-red-100 text-red-700" :
                      request.prioritate === "INFORMATIV" ? "bg-yellow-100 text-yellow-700" :
                      request.prioritate === "NORMAL" ? "bg-green-100 text-green-700" : ""
                  }`}>
                      {formatText(request.prioritate)}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col leading-tight">
                      <span>{formatDate(request.createdAt)}</span>
                      <span>{formatTime(request.createdAt)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-800 text-center">
                    <div className="flex flex-col leading-tight">
                        <span>{formatDate(request.updatedAt)}</span>
                        <span className="">{formatTime(request.updatedAt)}</span>
                    </div>
                </td>
                <td className="px-5 py-4 text-sm text-center">
                  {/* Vezi răspuns admin */}
                  <button
                    title="Vezi detalii"
                    onClick={() => handleViewDetails(request)}
                    className="text-purple-500 hover:text-purple-700"
                >
                    <FontAwesomeIcon icon={faEye} />
                </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

     {/* Afisare Detali */}
    {showDetailsModal && selectedRequest && (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-lg text-left">
        <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-3"></div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Detalii solicitare</h2>

        <div className="space-y-2 text-sm text-gray-700">
            <p><strong>ID Request:</strong> #{selectedRequest.requestID}</p>
            <p><strong>ID User:</strong> {selectedRequest.userID}</p>
            <p><strong>Prioritate:</strong> {formatText(selectedRequest.prioritate)}</p>
            <p><strong>Tip solicitare:</strong> {formatText(selectedRequest.tipSolicitare)}</p>
            <div>
                <strong>Descriere:</strong>
                <pre className="bg-gray-100 rounded-md p-2 text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(selectedRequest.descriere, null, 2)}
                </pre>
            </div>
            <div>
                <strong>Detalii:</strong>
                <pre className="bg-gray-100 rounded-md p-2 text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(selectedRequest.detalii, null, 2)}
                </pre>
            </div>
            <p><strong>Creat la:</strong> {formatDate(selectedRequest.createdAt)} {formatTime(selectedRequest.createdAt)}</p>
            <p><strong>Ultima actualizare:</strong> {formatDate(selectedRequest.updatedAt)} {formatTime(selectedRequest.updatedAt)}</p>
            <p><strong>Raspuns admin:</strong> {selectedRequest.raspunsAdmin}</p>
        </div>

        <div className="flex justify-center gap-4 mt-4">
            <button
            onClick={() => setShowDetailsModal(false)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
            >
            Închide
            </button>
        </div>
        </div>
    </div>
    )}

    </div>
  );
};

export default DisplayRequestsTableAdmin;
