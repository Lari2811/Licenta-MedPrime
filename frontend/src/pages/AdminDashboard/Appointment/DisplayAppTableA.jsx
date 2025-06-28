import React, { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook, faCalendarAlt, faClock, faCommentDots, faEdit, faEye,
  faHashtag, faL, faLocationDot, faSquarePlus, faTools, faTrashAlt,
  faUser,
  faUserDoctor
} from '@fortawesome/free-solid-svg-icons';

import { formatAppointmentStatus } from '../../../utils/formatAppointmentStatus';
import { formatStatusApp } from '../../../utils/formatStatusApp';

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


const DisplayAppTableM = ({appointments }) => {


    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null)

  return (
    <div>
        <div className="overflow-x-auto shadow-md rounded-xl bg-white mt-5">
        <table className="table-fixed min-w-full text-left text-gray-700">
            <thead className="bg-purple-100 text-purple-900 text-base">
            <tr>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faHashtag} className="mr-2" />ID</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faUser} className="mr-2" />Pacient</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faUserDoctor} className="mr-2" />Medic</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faBook} className="mr-2" />Investigație</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faLocationDot} className="mr-2" />Locație</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />Data și ora</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faEdit} className="mr-2" />Status</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faTools} className="mr-2" />Acțiuni</th>
            </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200 font-semibold">
                        {appointments.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-6 text-center text-gray-500 italic">
                              Nu există programări care să corespundă filtrului aplicat.
                            </td>
                          </tr>
                        ) : (
                          appointments.map(app => {
                            const { label, color, icon } = formatAppointmentStatus(app.status);
                            return (
                              <tr key={app._id} className="hover:bg-purple-50 transition-colors text-sm">
                                <td className="px-4 py-4">#{app.appointmentID}</td>
                                <td className="px-4 py-4">
                                <div className="flex flex-col">
                                    <span className="text-gray-700">#{app.patientID}</span>
                                    <span className="text-gray-500">{app.patientName}</span>
                                </div>
                               
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="text-gray-700">#{app.doctorID}</span>
                                        <p>
                                            {app.doctorName
                                                ? app.doctorName
                                                : app.doctorID
                                               }
                                        </p>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                  {app.investigationName || (
                                    <span className="italic text-gray-500">{app.investigationID}</span>
                                  )}
                                </td>

                                <td className="px-4 py-4">
                                    <p>
                                        {app.locationName
                                            ? app.locationName
                                            : app.locationID
                                            }
                                    </p>
                                </td>
                                 <div className="flex flex-col">
                                    <span className="text-gray-700">{formatDate(app.date)}</span>
                                    <span className="text-gray-500">{app.startTime} - {app.endTime}</span>
                                </div>
                                
                                <td className="px-4 py-4">
                                  <span className={`flex items-center gap-1 ${color}`}>
                                    <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                                    <span className="text-sm font-medium">{label}</span>
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center text-purple-600 text-lg flex gap-4 justify-start">
                                    {/* Vezi detalii - mereu */}
                                    <button
                                        title="Vezi detalii"
                                        onClick={() => {
                                        setSelectedAppointment(app);
                                        setShowDetailsModal(true);
                                        }}
                                        className="hover:text-purple-800 cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>
                                 </td>

            
                              </tr>
                            );
                          })
                        )}
            </tbody>

            </table>
        </div>


   
        {/* Modal Detalii */}
        {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
            <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Detalii programare</h2>

            <div className="text-md text-gray-700 text-left space-y-2">
                <p><strong>ID:</strong> #{selectedAppointment.appointmentID}</p>
                <p><strong>Investigație:</strong> {selectedAppointment.investigationName || selectedAppointment.investigationID}</p>
                <p><strong>Specialitate:</strong> {selectedAppointment.specialityName || selectedAppointment.specialityID}</p>
                <p><strong>Locație:</strong> {selectedAppointment.locationName || selectedAppointment.locationID}</p>

                <p><strong>Pacient:</strong> {selectedAppointment.patientName}</p>
                <p>
                    <strong>Medic:</strong>{" "}
                    {selectedAppointment.doctorName
                        ? selectedAppointment.doctorName
                        : selectedAppointment.doctorID
                        ? "Medicul nu mai face parte din echipa noastră"
                        : "–"}
                </p>

                <p><strong>Dată:</strong> {formatDate(selectedAppointment.date)}</p>
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
                className="mt-6 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-semibold transition cursor-pointer"
            >
                Închide
            </button>
            </div>
        </div>
        )}
          
    </div>
  )
}

export default DisplayAppTableM