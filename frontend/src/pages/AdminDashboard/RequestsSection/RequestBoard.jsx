import React, { useState, useEffect, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AppContext } from "../../../context/AppContex";
import axios from "axios";
import { toast } from "react-toastify";
import { faEnvelopeOpenText, faTable } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../../../components/Loader";
import { useParams } from "react-router-dom";

const columns = {
  ASIGNAT: { name: "Asignat", color: "bg-blue-50 border-blue-300" },
  IN_PROGRES: { name: "În progres", color: "bg-yellow-50 border-yellow-300" },
  FINALIZAT: { name: "Finalizat", color: "bg-green-50 border-green-300" },
  RESPINS: { name: "Respins", color: "bg-red-50 border-red-300" },
};

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

const now = Date.now();
const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000; // 5 zile în milisecunde


const RequestBoard = ({ isBoardExpanded }) => {

  const { backendUrl } = useContext(AppContext);
  const [requests, setRequests] = useState([]);
  const  { adminID } = useParams();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectRequestID, setSelectedRejectRequestID] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedFinishRequestID, setSelectedFinishRequestID] = useState(null);
  const [finishNotes, setFinihNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [lastArchivedFinalized, setLastArchivedFinalized] = useState(null);
  const [lastArchivedRejected, setLastArchivedRejected] = useState(null);

 const fetchRequests = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Încărcare cereri...");

      const res = await axios.get(`${backendUrl}/api/doctor/get-all-requests`);
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error("Eroare la fetch:", err);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const handleViewDetails = (request) => {
      setSelectedRequest(request);
      setShowDetailsModal(true);
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        const from = source.droppableId;
        const to = destination.droppableId;

        if (from === "ASIGNAT" && to === "FINALIZAT") {
            toast.error("Nu poți muta direct în Finalizat!");
            return;
        }
        if (from === "ASIGNAT" && to === "ASIGNAT") {
            toast.error("Nu poți muta in aceasi stare!");
            return;
        }

        if (from === "IN_PROGRES" && to === "IN_PROGRES") {
            toast.error("Nu poți muta in aceasi stare!");
            return;
        }

        if (from === "IN_PROGRES" && to === "ASIGNAT") {
            toast.error("Nu poți muta înapoi în Asignat!");
            return;
        }

        if (["FINALIZAT", "RESPINS"].includes(from)) {
            toast.error("Nu poți muta din Finalizat sau Respins!");
            return;
        }

        // Daca e mutare in RESPINS, deschide modal
        if (to === "RESPINS") {
            setSelectedRejectRequestID(draggableId);
            setShowRejectModal(true);
        return;
        }

         // Daca e mutare in RESPINS, deschide modal
        if (to === "FINALIZAT") {
            setSelectedFinishRequestID(draggableId);
            setShowFinishModal(true);
        return;
        }

        try {
            const res = await axios.patch
              (`${backendUrl}/api/doctor/update-request/${draggableId}`, {
                status: to,
                adminID,
            });

            if (res.data.success) {
                toast.success("Status actualizat!");
                fetchRequests();
            }
        } catch (err) {
        toast.error("Eroare la actualizare status!");
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) {
            toast.error("Introdu un motiv pentru respingere!");
            return;
        }

        try {
            const res = await axios.patch(`${backendUrl}/api/doctor/update-request/${selectedRejectRequestID}`, {
                status: "RESPINS",
                adminID,
                raspunsAdmin: rejectReason,
            });

        if (res.data.success) {
            toast.success("Cererea a fost respinsă!");
            fetchRequests();
            setShowRejectModal(false);
            setRejectReason("");
        }
        } catch (err) {
        toast.error("Eroare la respingere!");
        }
    };

    const handleFinishConfirm  = async () => {
        try {
           const res = await axios.patch(`${backendUrl}/api/doctor/update-request/${selectedFinishRequestID}`, {
                status: "FINALIZAT",
                adminID,
                raspunsAdmin: finishNotes,
            });

        if (res.data.success) {
            toast.success("Cererea a fost finalizată!");
            fetchRequests();
            setShowFinishModal(false);
            setFinihNotes("");
        }
        } catch (err) {
        toast.error("Eroare la finaliare!");
        }
    };


  return (
    <div
  className={`transition-all duration-1000 ease-in-out overflow-hidden ${
    isBoardExpanded ? "max-h-[1000px]" : "max-h-16"
  }`}
>
      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-1">
        <div className="text-2xl font-bold text-gray-800 text-center mb-7">
              <FontAwesomeIcon icon={faTable} className='mr-2 text-purple-600' /> 
              Board Cereri
              <FontAwesomeIcon icon={faTable} className='ml-2 text-purple-600' /> 
          </div>
  
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
            {Object.entries(columns).map(([status, { name, color }]) => (
              
                <Droppable
                  droppableId={status}
                  key={status}
                  isDropDisabled={false}
                  isCombineEnabled={false} 
                  ignoreContainerClipping={false}
              >
                {(provided) => (
                  <div
                      className={`${color} border rounded-lg p-3 min-h-[300px] shadow-sm`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2 className="text-center font-bold border-b mb-5 text-lg text-gray-700 mb-3">{name} </h2>
                    
                    {requests
                      .filter((req) => {
                        const isFinalOrRejected = status === "FINALIZAT" || status === "RESPINS";
                        const isInLast5Days = now - new Date(req.updatedAt).getTime() <= fiveDaysInMs;

                        if (isFinalOrRejected) {
                          return req.status === status && isInLast5Days;
                        }

                        return req.status === status;
                      })
                      .map((req, index) => (
                        <Draggable key={req._id} draggableId={req.requestID} index={index}>
                          {(provided) => (
                          <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 mb-5 rounded-xl shadow-md border border-gray-300  
                              hover:shadow-lg transition-transform transform hover:scale-105 cursor-grab"
                              >
                              <div className="flex items-center justify-between mb-2">
                                  <div className="flex flex-col text-sm text-gray-600">
                                  <p className="font-mono text-xs">#{req.requestID}</p>
                                  <p className="font-mono text-xs">#{req.userID}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  req.prioritate === "URGENT" ? "bg-red-100 text-red-700" :
                                  req.prioritate === "INFORMATIV" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-green-100 text-green-700"
                                  }`}>{req.prioritate}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-800">{formatText(req.tipSolicitare)}</p>

                              <button
                                  onClick={() => handleViewDetails(req)}
                                  className="block mx-auto mt-3 text-xs text-purple-600 hover:text-purple-800 
                                  font-semibold border px-2 py-1 rounded hover:bg-purple-100 transition"
                              >
                                  Vezi detalii
                              </button>
                              </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
        
      {showDetailsModal && selectedRequest && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-lg text-left">
          <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-3"></div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Detalii solicitare</h2>
  
          <div className="space-y-2 text-sm text-gray-700">
              <p><strong>ID Request:</strong> #{selectedRequest.requestID}</p>
              <p><strong>ID Medic:</strong> {selectedRequest.doctorID}</p>
              <p><strong>Prioritate:</strong> {formatText(selectedRequest.prioritate)}</p>
              <p><strong>Tip solicitare:</strong> {formatText(selectedRequest.tipSolicitare)}</p>
              <p><strong>Status:</strong> {formatText(selectedRequest.status)}</p>
              <p><strong>Răspuns Admin:</strong> {selectedRequest.raspunsAdmin || ""}</p>
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
  
      {/* Modal Reaspingere */}
      {showRejectModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
                <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-5">Respinge cererea</h2>
                  
                  <textarea
                  placeholder="Introdu motivul respingerii..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2 border rounded-md mb-4"
                  />
                  <div className="flex justify-end gap-3">
                  <button
                      onClick={() => setShowRejectModal(false)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                  >
                      Anulează
                  </button>
                  <button
                      onClick={handleRejectConfirm}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                      Confirmă respingerea
                  </button>
                  </div>
              </div>
              </div>
      )}

       {/* Modal Finalizare */}
      {showFinishModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
                <div className="w-12 h-1 bg-green-600 rounded-full mx-auto mb-4"></div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-5">Cerere finalizată</h2>
                  
                  <textarea
                  placeholder="Introdu detalii..."
                  value={finishNotes}
                  onChange={(e) => setFinihNotes(e.target.value)}
                  className="w-full p-2 border rounded-md mb-4"
                  />
                  <div className="flex justify-end gap-3">
                  <button
                      onClick={handleFinishConfirm}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                      Salvează
                  </button>
                  </div>
              </div>
              </div>
      )}

        {loading && <Loader message={loadingMessage} />}
   

    </div>
  )
}

export default RequestBoard