import React, { useState, useEffect, useContext } from 'react';

import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '../../../context/AppContex';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faBell, faCalendarAlt, faCheckCircle, faComments, faExclamationCircle, faEye, faFileAlt, faHashtag, faHourglassHalf, faSyncAlt, faTools, faTrashAlt, faUser, faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import Loader from '../../../components/Loader';


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

const DisplayBacklogTable = ({requests, fetchRequests}) => {

    const { backendUrl } = useContext(AppContext);
    const { adminID } = useParams();

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    console.log("Admin ID:", adminID);

    //actiuni
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAssignRequest, setSelectedAssignRequest] = useState(null);

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

    const handleAssignRequest = async (requestID) => {
        try {
            setLoading(true);
            setLoadingMessage("Se asignează solicitarea...");

            const updatedData = {
             
                adminID,
                status: "ASIGNAT",
            };


            const res = await axios.patch(`${backendUrl}/api/doctor/update-request/${requestID}`, updatedData);

            if (res.data.success) {

            toast.success(`Cererea ${requestID} a fost asignată cu succes!`);
            setShowAssignModal(false);
            fetchRequests(); 
            } else {
            toast.error(res.data.message || "Eroare la asignare.");
            }
        } catch (err) {
            console.error("Eroare la asignare:", err);
            toast.error("Eroare la asignare. Încearcă din nou.");
        } finally {
            setLoading(false);
            }
        };




  return (
    <div>
        <div className="overflow-x-auto shadow-md rounded-xl shadow-md bg-white mt-5">
           <table className="min-w-full table-fixed text-sm text-left text-gray-700">
              <colgroup>
                <col className="w-24" /> {/* ID Request */}
                <col className="w-24" /> {/* ID Medic */}
                <col className="w-32" /> {/* Prioritate */}
                <col className="w-40" /> {/* Tip */}
                <col className="w-40" /> {/* Creat la */}
                <col className="w-20" /> {/* Acțiuni */}
              </colgroup>
                <thead className="bg-purple-100 text-purple-900">
                    <tr>
                        <th className="px-6 py-3 text-left">
                        <FontAwesomeIcon icon={faHashtag} className="mr-2 text-purple-700" /> ID Request
                        </th>
                        <th className="px-6 py-3 text-left">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-purple-700" /> ID User
                        </th>
                        <th className="px-6 py-3 text-left">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 text-purple-700" /> Prioritate
                        </th>
                        <th className="px-6 py-3 text-left">
                        <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-purple-700" /> Tip
                        </th>
                        <th className="px-6 py-3 text-left">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-700" /> Creat la
                        </th>
                        <th className="px-6 py-3 text-center">
                        <FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" /> Acțiuni
                        </th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                    <tr>
                    <td colSpan="6" className="py-6 text-center font-semibold text-gray-500 italic">
                        Nu există cereri neasignate.
                    </td>
                    </tr>
                ) : (
                    requests.map((request) => (
                    <tr key={request._id} className="hover:bg-purple-50 transition-colors duration-200">
                        <td className="px-6 py-4 font-mono text-gray-700">#{request.requestID}</td>
                        <td className="px-6 py-4 font-mono text-gray-700">{request.userID}</td>

                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              request.prioritate === "URGENT" ? "bg-red-100 text-red-700" :
                              request.prioritate === "INFORMATIV" ? "bg-yellow-100 text-yellow-700" :
                              request.prioritate === "NORMAL" ? "bg-green-100 text-green-700" : ""
                          }`}>
                              {formatText(request.prioritate)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-800">{formatText(request.tipSolicitare)}</td>

                        <td className="px-6 py-4">
                        <div className="flex flex-col leading-tight">
                            <span>{formatDate(request.createdAt)}</span>
                            <span>{formatTime(request.createdAt)}</span>
                        </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3 text-lg text-purple-500">
                            {/* Afișează detalii */}
                           <button
                                title="Vezi detalii"
                                onClick={() => handleViewDetails(request)}
                                className="text-purple-500 hover:text-purple-700"
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </button>

                            {/* Asigneaza-mi mie */}
                          <button
                                onClick={() => {
                                    setSelectedAssignRequest(request); 
                                    setShowAssignModal(true);
                                }}
                                title="Asignează-mi cererea"
                                className="text-green-600 hover:text-green-800"
                                >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                        </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>

            </table>
            </div>

    {/* Afisare Detali */}
    {showDetailsModal && selectedRequest && (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-lg text-left">
        <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-3"></div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Detalii solicitare</h2>

        <div className="space-y-2 text-sm text-gray-700">
            <p><strong>ID Request:</strong> #{selectedRequest.requestID}</p>
            <p><strong>ID Medic:</strong> {selectedRequest.userID}</p>
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

    {/* Asignare cerere */}
    {showAssignModal && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
      <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto mb-3"></div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Asignează-ți cererea?</h2>
      <p className="text-gray-600 mb-4">
        Ești sigură că vrei să îți asignezi această cerere? (#{selectedAssignRequest?.requestID})
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowAssignModal(false)}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
        >
          Nu
        </button>
       <button
            onClick={() => handleAssignRequest(selectedAssignRequest.requestID)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
            Da
            </button>
      </div>
    </div>
  </div>
    )}

       {loading && <Loader message={loadingMessage} />}




    </div>
  )
}

export default DisplayBacklogTable