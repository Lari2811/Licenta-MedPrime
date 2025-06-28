import React, { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook, faCalendarAlt, faClipboardList, faClock, faCommentDots, faEdit, faEye,
  faHashtag, faL, faSquarePlus, faTools, faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../../../context/AppContex';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatAppointmentStatus } from '../../../utils/formatAppointmentStatus';
import axios from 'axios';
import { formatStatusApp } from '../../../utils/formatStatusApp';
import PatientFeedbackModal from './pATIENTfEEDBACKmODAL.JSX';
import MyProfile_AppointmentCard from '../../../components/MyProfile_AppointmentCard';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const DisplayAppTableP = ({ appointments }) => {
  const { backendUrl } = useContext(AppContext);
  const { patientID } = useParams();

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showFeedbackExistsModal, setShowFeedbackExistsModal] = useState(false)

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      await axios.post(`${backendUrl}/api/patient/create-appointment-feedback`, feedbackData);
      toast.success("Feedback trimis cu succes!");
    } catch (err) {
      toast.error("Eroare la trimiterea feedback-ului.");
      console.error(err);
    }
  };

  const [activeTab, setActiveTab] = useState("toate");

  console.log("App: ", appointments)

      const filterAppointments = () => {
      
        switch (activeTab) {
          case "confirmata":
            return appointments.filter((a) => a.status === "confirmata");
          case "in asteptare":
            return appointments.filter((a) => a.status === "in asteptare");
          case "in desfasurare":
            return appointments.filter((a) => a.status === "in desfasurare");
          case "finalizata":
            return appointments.filter((a) => a.status === "finalizata");
          case "anulata":
            return appointments.filter((a) => a.status === "anulata");
          case "toate":
          default:
            return appointments;
        }
      };

      const filteredAppointments = filterAppointments();

        const tabList = [
          { key: "toate", label: "Toate" },
          { key: "confirmata", label: "Confirmate" },
          { key: "in asteptare", label: "În așteptare" },
          { key: "in desfasurare", label: "În desfășurare" },
          { key: "finalizata", label: "Finalizate" },
          { key: "anulata", label: "Anulate" },
        ];

  return (
    <div>
      {/* Tab-uri */}
        <div className="overflow-x-auto">
            <div className="flex gap-6 border-b border-gray-200 text-sm min-w-max px-1">
                {tabList.map((tab) => {
                const count = appointments.filter((a) => {
                    if (tab.key === "toate") return true;
                    if (tab.key === "confirmata") return a.status === "confirmata";
                    if (tab.key === "in asteptare") return a.status === "in asteptare";
                    if (tab.key === "in desfasurare") return a.status === "in desfasurare";
                    if (tab.key === "finalizata") return a.status === "finalizata";
                    if (tab.key === "anulata") return a.status === "anulata";
                    return a.status === tab.key;
                }).length;

                return (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-2 ml-5 text-base border-b-2 whitespace-nowrap cursor-pointer ${
                            activeTab === tab.key
                            ? "border-purple-600 text-purple-600 font-bold"
                            : "border-transparent text-gray-500"
                        }`}
                    >
                    {tab.label} ({count})
                    </button>
                );
                })}
            </div>
        </div>

        {filteredAppointments.length > 0 ? (
            <div className="grid gap-4 p-4">
            {filteredAppointments.map((appt) => (
                <MyProfile_AppointmentCard
                  appointment={appt}
                />
            ))}
            </div>
        ) : (
            <p className="text-gray-500 italic text-lg text-center flex items-center justify-center h-full mt-5 mb-3">
              Nu există programări pentru această categorie.
            </p>

        )}


      {/* Modal Anulare */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
            <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">Anulare programare</h2>
            <p className="text-gray-600 mb-4">
              Sigur vrei să anulezi programarea #{selectedAppointment.appointmentID}? Adaugă motivul mai jos:
            </p>
            <textarea
              rows="4"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex: Nu mai pot ajunge..."
              className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  if (!cancelReason.trim()) return toast.error("Te rugăm să completezi motivul.");

                  try {
                    await axios.post(`${backendUrl}/api/main/cancel-appointment`, {
                      appointmentID: selectedAppointment.appointmentID,
                      cancelReason,
                      canceledBy: "patient",
                    });
                    toast.success("Programarea a fost anulată.");
                    setShowCancelModal(false);
                    setCancelReason("");
                  } catch (error) {
                    toast.error("Eroare la anulare.");
                    console.error(error);
                  }
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition"
              >
                Da, anulează
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-semibold transition"
              >
                Renunță
              </button>
            </div>
          </div>
        </div>
      )}


      {showFeedbackModal && selectedAppointment && (
        <PatientFeedbackModal
          appointment={selectedAppointment}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {showFeedbackExistsModal && (
         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
            <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Feedback deja oferit</h2>

            <p className="text-gray-600 mb-4">
              Ai oferit deja un feedback pentru această programare. Mulțumim!
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={() => setShowFeedbackExistsModal(false)}
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

export default DisplayAppTableP;
