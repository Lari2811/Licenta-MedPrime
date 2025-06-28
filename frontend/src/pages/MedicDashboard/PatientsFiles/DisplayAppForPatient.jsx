import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faEye, 
  faTools, faTrashAlt,
  faUserDoctor,
  faSquarePlus,
  faClinicMedical,
  faClipboardCheck,
  faBook,
  faClock
} from '@fortawesome/free-solid-svg-icons';

import { formatAppointmentStatus } from '../../../utils/formatAppointmentStatus';
import { formatStatusApp } from '../../../utils/formatStatusApp';

const formatLocalDate = (isoDate) => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  const zi = String(date.getDate()).padStart(2, "0");
  const luna = String(date.getMonth() + 1).padStart(2, "0");
  const an = date.getFullYear();
  return `${zi}.${luna}.${an}`;
};

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



const DisplayAppForPatient = (appointments) => {
    
    const appointmentsArray = appointments.appointments || [];
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [showMedicalSheetModal, setMedicalSheetModal] = useState(false);

  return (
    <div>
        {/* Tabel locatii */}
        <div className="overflow-x-auto shadow-md rounded-xl shadow-md bg-white mt-5">
            <table className="table-fixed min-w-[1100px] w-full text-left text-gray-700">
                <thead className="bg-purple-100 text-purple-900 text-base">
                    <tr>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faClock} className="mr-2 text-purple-700" />Data și ora</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faEdit} className="mr-2 text-purple-700" />Status</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faBook} className="mr-2 text-purple-700" />Investigație</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 text-purple-700" />Diagnostic</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faUserDoctor} className="mr-2 text-purple-700" />Medic</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faClinicMedical} className="mr-2 text-purple-700" />Locație</th>
                        <th className="px-6 py-3 text-center"><FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" />Acțiuni</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200 font-semibold">
                    {appointments.length === 0 ? (
                        <tr>
                        <td colSpan="6" className="py-6 text-center text-gray-500 italic">
                            Nu există programări.
                        </td>
                        </tr>
                    ) : (
                        appointmentsArray.map(app => {
                        const { label, color, icon } = formatAppointmentStatus(app.status);
                        return (
                            <tr key={app._id} className="hover:bg-purple-50 transition-colors">
                            
                            <td className="px-4 py-4">
                                <div className=" font-medium text-gray-900">{formatLocalDate(app.date)}</div>
                                <div className=" font-medium text-gray-500">{app.startTime} - {app.endTime}</div>
                            </td>
                             <td className="px-4 py-4">
                                <span className={`flex items-center gap-1 ${color}`}>
                                <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                                <span className="text-sm font-medium">{label} </span>
                                </span>
                            </td>

                            <td className="px-4 py-4">{app.investigationName}</td>
                            <td className="px-4 py-4">
                                {app.medicalSheet?.diagnostic?.trim()
                                    ? app.medicalSheet.diagnostic
                                    : "—"}
                            </td>
                            
                           

                            <td className="px-4 py-4">Dr. {app.doctorName}</td>

                            <td className="px-4 py-4">{app.locationName}</td>
                            
                           
                           
                            <td className="px-4 py-4  text-purple-600 text-lg flex gap-4 justify-center">
                                {/* Vezi detalii - mereu */}
                                <button
                                    title="Vezi detalii programare"
                                    onClick={() => {
                                    setSelectedAppointment(app);
                                    setShowDetailsModal(true);
                                    }}
                                    className="hover:text-purple-800 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>

                                 {app.status === "finalizata" && (
                                    <button
                                    title="Vezi fișa medicală"
                                    onClick={() => {
                                        setSelectedAppointment(app);
                                        setMedicalSheetModal(true);
                                    }}
                                    className="text-green-600 hover:text-green-800 cursor-pointer"
                                    >
                                    <FontAwesomeIcon icon={faBook} />
                                    </button>
                                )}
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
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-lg text-center">
            <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Detalii programare</h2>

            <div className="text-md text-gray-700 text-left space-y-2">
                <p><strong>ID:</strong> #{selectedAppointment.appointmentID}</p>
                <p><strong>Investigație:</strong> {selectedAppointment.investigationName}</p>
                
                <p><strong>Locație:</strong> Dr. {selectedAppointment.locationName}</p>
                <p><strong>Medic:</strong> Dr. {selectedAppointment.doctorName}</p>
                <p><strong>Dată:</strong> {formatDate(selectedAppointment.date)}</p>
                <p><strong>Interval:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                <p><strong>Status:</strong> {formatStatusApp(selectedAppointment.status)}</p>
                {selectedAppointment.status === "anulata" && (
                <p><strong>Motiv anulare:</strong> {selectedAppointment.cancelReason}</p>
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

        {/* Fisa medicala detalii */}
        {showMedicalSheetModal && selectedAppointment && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-2xl text-center">
                    <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Fișă Medicală</h2>

                    <div className="text-md text-gray-700 text-left space-y-2">
                        <p><strong>Rezumat:</strong> {selectedAppointment.medicalSheet.rezumat || "–"}</p>
                        <p><strong>Diagnostic:</strong> {selectedAppointment.medicalSheet.diagnostic || "–"}</p>
                        <p><strong>Recomandări:</strong> {selectedAppointment.medicalSheet.recomandari || "–"}</p>

                        {/* Tratamente */}
                        {selectedAppointment.medicalSheet.treatments?.length > 0 && (
                            <div>
                            <p className="font-semibold">Tratamente prescrise:</p>
                            <ul className="list-disc list-inside ml-2 mt-1">
                                {selectedAppointment.medicalSheet.treatments.map((treat, index) => {
                                const start = new Date(treat.startDate);
                                const end = new Date(start);
                                end.setDate(start.getDate() + Number(treat.durata));
                                const format = (d) => d.toLocaleDateString("ro-RO");

                                return (
                                    <li key={index} className="text-sm">
                                    {treat.medicament} – {treat.dozaj} | {format(start)} → {format(end)}
                                    </li>
                                );
                                })}
                            </ul>
                            </div>
                        )}

                        {/* Trimiteri */}
                        <p><strong>Trimiteri:</strong> {selectedAppointment.medicalSheet.trimiteri || "–"}</p>

                        {/* Atasamente */}
                        {selectedAppointment.medicalSheet.atasamente?.length > 0 && (
                            <div className="mt-3">
                            <p className="font-semibold">Fișiere atașate:</p>
                            <ul className="list-disc list-inside ml-2 mt-1">
                                {selectedAppointment.medicalSheet.atasamente.map((url, idx) => (
                                <li key={idx}>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
                                    Fișier {idx + 1}
                                    </a>
                                </li>
                                ))}
                            </ul>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setMedicalSheetModal(false)}
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

export default DisplayAppForPatient