import React, { useState, useEffect, useContext } from 'react';

import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '../../../context/AppContex';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faBell, faCalendarAlt, faComments, faExclamationCircle, faEye, faFileAlt, faHashtag, faHourglassHalf, faSyncAlt, faTools, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

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



const DisplayRequestsTable = ({requests}) => {

    const navigate = useNavigate();
    const { backendUrl } = useContext(AppContext);
    const { adminID } = useParams();

    const [showModal, setShowModal] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDeleteRequestID, setSelectedDeleteRequestID] = useState(null);

    const handleViewResponse = (request) => {
        setSelectedResponse(request.adminResponse || "Niciun răspuns încă.");
        setShowModal(true);
    };

    const handleDeleteRequest = (requestID) => {
        setSelectedDeleteRequestID(requestID);
        setShowDeleteModal(true);
    };


  return (
    <div>
        <div className="overflow-x-auto shadow-md rounded-xl bg-white mt-5">
        <table className="table-fixed min-w-full text-left text-gray-700">
          <thead className="bg-purple-100 text-purple-900 text-base">
            <tr>
                <th className="px-6 py-3 text-left"> <FontAwesomeIcon icon={faHashtag} className="mr-2 text-purple-700" /> ID </th>
                <th className="px-6 py-3 text-left"> <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-purple-700" /> Tip </th>
                <th className="px-6 py-3 text-left"> <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 text-purple-700" /> Prioritate </th>
                <th className="px-6 py-3 text-left"> <FontAwesomeIcon icon={faHourglassHalf} className="mr-2 text-purple-700" /> Status </th>
                <th className="px-6 py-3 text-left"> <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-700" /> Creată la </th>
                <th className="px-6 py-3 text-left"> <FontAwesomeIcon icon={faSyncAlt} className="mr-2 text-purple-700" /> Ultima actualizare </th>
                <th className="px-6 py-3 text-center"> <FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" /> Acțiuni </th>
            </tr>
          </thead>

           <tbody className="bg-white divide-y divide-gray-200 font-semibold">
                {requests.length === 0 ? (
                    <tr>
                        <td colSpan="8" className="py-6 text-center text-gray-500 italic">
                            Nu există cereri înregistrati momentan.
                        </td>
                    </tr>
                    ) : (
                    requests.map((request) => (
                        <tr key={request._id} className="hover:bg-purple-50 transition-colors duration-200">
                            <td className="px-6 py-4 font-mono text-gray-700">#{request.requestID}</td>
                            <td className="px-6 py-4 text-gray-800 ">{formatText(request.tipSolicitare)}</td>
                            
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    request.prioritate === "URGENT" ? "bg-red-100 text-red-700" :
                                    request.prioritate === "INFORMATIV" ? "bg-yellow-100 text-yellow-700" :
                                    request.prioritate === "NORMAL" ? "bg-green-100 text-green-700" : ""
                                }`}>
                                    {formatText(request.prioritate)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-800 text-center">{formatText(request.status)}</td>
                            
                            <td className="px-6 py-4 text-gray-800 text-center">
                                <div className="flex flex-col leading-tight">
                                    <span>{formatDate(request.createdAt)}</span>
                                    <span className="">{formatTime(request.createdAt)}</span>
                                </div>
                            </td>

                            <td className="px-6 py-4 text-gray-800 text-center">
                                <div className="flex flex-col leading-tight">
                                    <span>{formatDate(request.updatedAt)}</span>
                                    <span className="">{formatTime(request.updatedAt)}</span>
                                </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-center">
                                <div className="flex justify-center gap-3 text-lg text-purple-500">
                                    {/* Vezi raspuns admin */}
                                   <button
                                        title="Vezi răspuns admin"
                                        onClick={() => handleViewResponse(request)}
                                    >
                                    <FontAwesomeIcon icon={faEye} className="hover:text-purple-900" />
                                    </button>

                                    {/* sterge cererea - doar daca e neasignată */}
                                    {request.status === "NEASIGNAT" && (
                                    <button
                                        title="Șterge solicitarea"
                                        onClick={() => handleDeleteRequest(request.requestID)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                    )}

                                </div>
                            </td>

                        </tr>
                        ))
                )}

            </tbody>

        </table>
        </div>       

        {showModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl w-[50%] max-w-md text-center">
                    <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-3"></div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Răspuns admin</h2>
                        <p className="text-gray-600 mb-4"> {selectedResponse} </p>
                
                <div className="flex justify-center gap-4">
                    <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                >
                    Închide
                </button>
                </div>
                </div>
            </div>
        )}

   
        {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[50%] max-w-md text-center">
            <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-3"></div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmare ștergere</h2>
            <p className="text-gray-600 mb-4">
                Ești sigură că vrei să ștergi această solicitare? (#{selectedDeleteRequestID})
            </p>

            <div className="flex justify-center gap-4">

                <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                >
                Nu
                </button>

                <button
                    onClick={async () => {
                        try {
                        const res = await axios.delete(`${backendUrl}/api/doctor/delete-doctor-request/${selectedDeleteRequestID}`);
                        if (res.data.success) {
                            toast.success(res.data.message);
                            setShowDeleteModal(false);
                        } else {
                            toast.error(res.data.message || "Eroare la ștergere.");
                        }
                        } catch (error) {
                        console.error("Eroare la ștergere:", error);
                        toast.error("Eroare la ștergere. Încearcă din nou.");
                        }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    >
                    Da
                </button>
                
            </div>
            </div>
        </div>
        )} 


    </div>
  )
}

export default DisplayRequestsTable