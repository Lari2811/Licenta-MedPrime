import { faCalendar, faCalendarDays, faClock, faCommentDots, faEye, faHourglassHalf, faMapLocationDot, faTrashAlt, faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {useContext, useState} from 'react'
import FeedbackForm from './FeedbackForm';

import {
    HiCheckCircle,
    HiClock,
    HiXCircle,
    HiCheckBadge,
    HiPhoneArrowUpRight
  } from "react-icons/hi2";
import { AppContext } from '../context/AppContex';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatStatusApp } from '../utils/formatStatusApp';
import PatientFeedbackModal from '../pages/PatientDashboard/PatientAppointments/PatientFeedbackModal';
import axios from 'axios';

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


const statusStyles = {
    confirmata: "bg-blue-100 text-blue-700",
    finalizata: "bg-green-100 text-green-700",
    "in asteptare": "bg-yellow-100 text-yellow-700",
    "in desfasurare" : "bg-purple-100 text-purple-700",
    anulata: "bg-red-100 text-red-700",
};

  const borderColors = {
    confirmata: "border-l-7 border-blue-500",
    finalizata: "border-l-7 border-green-500",
    "in asteptare": "border-l-7 border-yellow-500",
    "in desfasurare" : "border-l-7 border-purple-500",
    anulata: "border-l-7 border-red-500",
  };
  

  const statusIcons = {
    confirmata: <HiCheckCircle className="text-blue-600" />,
    finalizata: <HiCheckBadge className="text-green-600" />,
    "in asteptare": <HiClock className="text-yellow-600" />,
    "in desfasurare": <FontAwesomeIcon icon={faHourglassHalf} className="text-purple-600" />,
    anulata: <HiXCircle className="text-red-600" />,
  };

  const getDayOfWeek = (isoDate) => {
    const date = new Date(isoDate);
    const days = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
    return days[date.getDay()];
  };
  
  
const MyProfile_AppointmentCard = ({ appointment }) => {


    const {backendUrl} = useContext(AppContext);
    const { patienID } = useParams();


    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    console.log("App primita:", appointment)

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

    return (
        <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className={`bg-white border-l-7 p-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between ${borderColors[appointment.status]}`}>
                <div className="flex-1">
                    <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-2xl">
                        {statusIcons[appointment.status]}
                        </span>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                        {appointment.investigationName || (
                            <span className="italic text-gray-500">{appointment.investigationID}</span>
                        )}
                        </h3>
                        <div className="mt-2 text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center sm:gap-6">
                        <span className="font-medium text-gray-900 flex items-center mb-1 sm:mb-0">
                            <FontAwesomeIcon icon={faUserDoctor} className="mr-2" />
                            {appointment.doctorName || (
                            <span className="italic text-gray-500">{appointment.doctorID}</span>
                            )}{" "}
                            -{" "}
                            {appointment.specialityName || (
                            <span className="italic text-gray-500">{appointment.specialityID}</span>
                            )}
                        </span>
                        <span className="font-medium text-gray-900 flex items-center">
                            <FontAwesomeIcon icon={faMapLocationDot} className="mr-2" />
                            {appointment.locationName || (
                            <span className="italic text-gray-500">{appointment.locationID}</span>
                            )}
                        </span>
                        </div>
                    </div>
                    </div>


                    <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-start sm:items-center sm:gap-6">
                        <div className="mt-2 flex items-center text-base text-gray-500 sm:mt-0">
                                <FontAwesomeIcon icon={faCalendarDays} className='mr-2' />
                                <p>{getDayOfWeek(appointment.date)}, {formatDate(appointment.date)}</p>
                        </div>
                        <div className="mt-2 flex items-center text-base text-gray-500 sm:mt-0 sm:ml-6">
                                <FontAwesomeIcon icon={faClock} className='mr-2' />
                                {appointment.startTime} - {appointment.endTime}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span className={`inline-flex items-center font-semibold gap-1 text-sm px-2 py-1 rounded-full mt-2 ${statusStyles[appointment.status]}`} >
                            {statusIcons[appointment.status]}
                            {formatStatusApp(appointment.status)}
                        </span>
                        </div>
                    </div>
                </div>
                    
                {/* Butoane */}
                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-start sm:items-center">
                    
                    {/* Vezi detalii - mereu */}
                    <button
                        title="Vezi detalii"
                        onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetailsModal(true);
                        }}
                        className="btn-outline-purple-little-little cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faEye} />
                        Vezi detalii
                    </button>

                    {(appointment.status === "in asteptare" || appointment.status === "confirmata") && (
                        <>
                         <button
                            title="Anulează"
                            onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowCancelModal(true);
                            }}
                            className="btn-outline-red-little-little cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faTrashAlt} />
                            Anulează
                        </button>
                        
                        </>
                    )}
                  

                    {appointment.status === "finalizata" && (
                    appointment.patientFeedbackGiven ? (
                        <button 
                        className="btn-outline-blue-little-little cursor-pointer "
                        onClick={() => setShowFeedbackExistsModal(true)}
                        
                        
                        >
                            <FontAwesomeIcon icon={faCommentDots} />
                            Feedback oferit
                        </button>
                    ) : (
                        <button
                        className="btn-outline-green-little-little cursor-pointer "
                        onClick={() => {
                            setShowFeedbackModal(true)
                             setSelectedAppointment(appointment);
                        }}
                        >
                        <FontAwesomeIcon icon={faCommentDots} />
                        Oferă feedback
                        </button>
                    )
                    )}

                    {showFeedbackForm && (
                    <FeedbackForm
                        appointment={appointment}
                        onClose={() => setShowFeedbackForm(false)}
                    />
                    )}

                </div>


                {showCancelConfirm && (
                    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
                        <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmare anulare</h3>
                        <p className="text-gray-600 mb-6">
                            Ești sigur că vrei să anulezi această programare?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md cursor-pointer"
                            onClick={() => setShowCancelConfirm(false)}
                            >
                            Nu
                            </button>
                            <button
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md cursor-pointer"
                            onClick={() => {
                                console.log("Programarea a fost anulată.");
                                setShowCancelConfirm(false);
                            }}
                            >
                            Da
                            </button>
                        </div>
                        </div>
                    </div>
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
                            className="px-5 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition"
                        >
                            Da, anulează
                        </button>
                        <button
                            onClick={() => {
                            setShowCancelModal(false);
                            setCancelReason("");
                            }}
                            className="px-5 py-2.5 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-semibold transition"
                        >
                            Renunță
                        </button>
                        </div>
                    </div>
                    </div>
                )}

                {/* Modal Detalii */}
                {showDetailsModal && selectedAppointment && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
                        <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Detalii programare</h2>

                        <div className="text-md text-gray-700 text-left space-y-2">
                        <p><strong>ID:</strong> #{selectedAppointment.appointmentID}</p>
                        <p>
                            <strong>Investigație:</strong>{" "}
                            {selectedAppointment.investigationName || (
                                <span className="italic text-gray-500">{selectedAppointment.investigationID}</span>
                            )}
                            </p>

                            <p>
                            <strong>Specialitate:</strong>{" "}
                            {selectedAppointment.specialityName || (
                                <span className="italic text-gray-500">{selectedAppointment.specialityID}</span>
                            )}
                            </p>

                            <p>
                            <strong>Locație:</strong>{" "}
                            {selectedAppointment.locationName || (
                                <span className="italic text-gray-500">{selectedAppointment.locationID}</span>
                            )}
                            </p>

                            <p>
                            <strong>Medic:</strong>{" "}
                            {selectedAppointment.doctorName || (
                                <span className="italic text-gray-500">{selectedAppointment.doctorID}</span>
                            )}
                            </p>

                        <p><strong>Dată:</strong> {selectedAppointment.date}</p>
                        <p><strong>Interval:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                        <p><strong>Status:</strong> {formatStatusApp(selectedAppointment.status)}</p>
                        {selectedAppointment.status === "anulata" && (
                                <div>
                                    <p><strong>Motiv anulare:</strong> {selectedAppointment.canceledReason}</p>
                                    {selectedAppointment.canceledBy && selectedAppointment.canceledBy !== "" && (
                                    <p><strong>Anulată de:</strong> {selectedAppointment.canceledBy}</p>
                                    )}
                                </div>
                            )}
                        <p><strong>Creat la:</strong> {formatDate(selectedAppointment.createdAt)} {formatTime(selectedAppointment.createdAt)}</p>
                        <p><strong>Actualizat la:</strong> {formatDate(selectedAppointment.updatedAt)} {formatTime(selectedAppointment.updatedAt)}</p>
                        
                        </div>

                        <button
                        onClick={() => setShowDetailsModal(false)}
                        className="mt-6 cursor-pointer px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-semibold transition"
                        >
                        Închide
                        </button>
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
                            className="px-4 py-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                        >
                            Închide
                        </button>
                        </div>
                    </div>
                    </div>
                )}


            </div>
        </div>
    );
  };

export default MyProfile_AppointmentCard