import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faEdit, faEnvelope, faEye, faHospital,
  faMapMarkerAlt, faStethoscope, faTimesCircle, faTools, faTrashAlt,
  faMagnifyingGlass,
  faUserDoctor,
  faClinicMedical,
  faStar,
  faSuitcaseMedical,
  faBook,
  faBell,
  faClipboardCheck,
  faSpinner,
  faCircleInfo,
  faUser,
  faCalendarAlt,
  faClose,
  faCalendarCheck,
  faUserMd,
  faClock,
  faCommentDots
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '../../../context/AppContex';
import axios from 'axios';
import { statusConfig } from '../../../utils/DoctorStatusConfig';
import { assets } from '../../../assets/assets';
import { ziuaCorecta } from '../../../utils/ziProgram';
import { formatStatus } from '../../../utils/formatStatus';
import { formatDateRo } from '../../../utils/formatDataRO';
import { formatAppointmentStatus } from '../../../utils/formatAppointmentStatus';

const calcEndDate = (startDate, durata) => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + parseInt(durata));
  return end.toLocaleDateString();
};


const DisplayPatientsTable = ({ patients }) => {
    

    const navigate = useNavigate();
    
    const {backendUrl} = useContext(AppContext)
    const { adminID } = useParams();

    const [showMedicalSheet, setShowMedicalSheet] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [showAppointments, setShowAppointments] = useState(false)
    const [showUpdateStatus, setShowUpdateStatus] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleStatusToggle = async (patientID) => {
        try {
            const newStatus =
            selectedPatient.status?.toLowerCase() === "suspendat" ? "activ" : "suspendat";

            const res = await axios.patch(`${backendUrl}/api/admin/update-patient-status`, {
            patientID,
            status: newStatus,
            });

            if (res.status === 200 && res.data.success) {
            //toast.success(`Statusul a fost actualizat în "${newStatus}".`);
            setShowUpdateStatus(false);
           
            } else {
            toast.error(res.data.message || "Eroare la actualizarea statusului.");
            }
        } catch (err) {
            console.error("Eroare status update:", err);
            toast.error("A apărut o eroare.");
        }
        };

        return (
    <div> 
        <div className="overflow-x-auto shadow-md rounded-xl shadow-md bg-white mt-5">
            <table className="min-w-[1100px] w-full text-sm text-left text-gray-700">
                <thead className="bg-purple-100 text-purple-900">
                    <tr> 
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faUser} className="mr-2 text-purple-700" />Pacient</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faSpinner} className="mr-2 text-purple-700" />Status</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faBook} className="mr-2 text-purple-700" />Fișe medicale</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faStar} className="mr-2 text-purple-700" />Recenzi</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-700" />Programări</th>
                    <th className="px-6 py-3 text-center"><FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" />Acțiuni</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {patients.length === 0 ? (
                        <tr>
                        <td colSpan="8" className="py-6 text-center font-semibold text-gray-500 italic">
                            Nu există pacienți înregistrati momentan.
                        </td>
                        </tr>
                    ) : (
                        patients.map(pa => (
                            <tr key={pa._id} className="hover:bg-purple-50 transition-colors">

                                {/*  Pacients */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                        src={pa.profileImage || assets.user_default}
                                        alt="Profil medic"
                                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                                        />
                                        <div>
                                        <div className="font-medium text-gray-800">{pa.lastName} {pa.firstName}</div>
                                        <div className="text-sm text-gray-600">ID: {pa.patientID}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    {(() => {
                                    const { label, icon, color, bgColor } = formatStatus(pa.status);
                                    return (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${color} ${bgColor}`}>
                                        <FontAwesomeIcon icon={icon} className="mr-2" />
                                        {label}
                                        </span>
                                    );
                                    })()}
                                </td>
                                
                                {/* Fise */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => {
                                        setSelectedPatient(pa);  
                                        setShowMedicalSheet(true);
                                        }}
                                        className="text-purple-700 hover:text-purple-900 cursor-pointer text-lg"
                                        title="Vezi fișe medicale"
                                    >
                                        <FontAwesomeIcon icon={faBook} className='text-green-700'/> 
                                    </button>
                                </td>

                                {/* Recenzi */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => {
                                        setSelectedPatient(pa); 
                                        setShowFeedback(true);
                                        }}
                                        className="text-purple-700 hover:text-purple-900 cursor-pointer text-lg"
                                        title="Vezi recenzile"
                                    >
                                        <FontAwesomeIcon icon={faStar} className='text-yellow-500'/> 
                                    </button>
                                </td>

                                {/* Programari */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => {
                                        setSelectedPatient(pa);  
                                        setShowAppointments(true);
                                        }}
                                        className="text-purple-700 hover:text-purple-900 cursor-pointer text-lg"
                                        title="Vezi programările"
                                    >
                                        <FontAwesomeIcon icon={faCalendarCheck} className='text-purple-600'/> 
                                    </button>
                                </td>

                                {/* Actiuni */}
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => {
                                        setSelectedPatient(pa);  
                                        setShowDetails(true);
                                        }}
                                        className="text-purple-700 hover:text-purple-900 cursor-pointer text-lg"
                                        title="Vezi detalii personale"
                                    >
                                        <FontAwesomeIcon icon={faEye} className='text-purple-600'/> 
                                    </button>

                                    {pa.status !== "in asteptare" && (
                                        <button
                                            onClick={() => {
                                            setSelectedPatient(pa);  
                                            setShowUpdateStatus(true);
                                            }}
                                            className="text-purple-700 hover:text-purple-900 cursor-pointer text-lg"
                                            title="Modifică statusul"
                                        >
                                            <FontAwesomeIcon icon={faSpinner} className='text-red-600 text-xl ml-5'/> 
                                        </button>
                                    )}
                                </td>
                            </tr>

                            ))
                    )}
                </tbody>
            </table>
        </div>

        {showMedicalSheet && selectedPatient && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
                <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90%] overflow-y-auto relative">
                    <button
                        onClick={() => setShowMedicalSheet(false)}
                        className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center hover:cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </button>
            
                    <div className="w-20 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
            
                    <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                        Fișe medicale - {selectedPatient.lastName} {selectedPatient.firstName}
                    </h2>
                

                    {selectedPatient.appointments?.filter(app => app.medicalSheet).length > 0 ? (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedPatient.appointments.map((appointment, idx) => (
                                appointment.medicalSheet && (
                                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition">
                                    
                                    {/* Header card */}
                                    <div className="mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                        Consultație: {appointment.appointmentID} - {appointment.investigationName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Data: <strong>{formatDateRo(appointment.date)}</strong> | Ora: <strong>{appointment.startTime} - {appointment.endTime}</strong>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Locația: <strong>{appointment.locationName}</strong> 
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Medicul: <strong>{appointment.doctorName}</strong>
                                    </p>
                                    </div>

                                    {/* Diagnostic si recomandari */}
                                    <div className="mb-3 text-sm space-y-2">
                                    <p><strong>Diagnostic:</strong> {appointment.medicalSheet.diagnostic}</p>
                                    <p><strong>Descriere:</strong> {appointment.medicalSheet.rezumat}</p>
                                    <p><strong>Recomandări:</strong> {appointment.medicalSheet.recomandari}</p>
                                    <p><strong>Trimitere:</strong> {appointment.medicalSheet.trimiteri}</p>
                                    </div>

                                    {/* Tratamente */}
                                    <div className="mb-3 text-sm space-y-2">
                                    <p className="font-semibold text-purple-600 mb-2">Tratamente:</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {appointment.medicalSheet.treatments?.map((t, i) => {
                                        const endDate = calcEndDate(t.startDate, t.durata);
                                        const isActive = new Date() < new Date(endDate);

                                        return (
                                            <div
                                            key={i}
                                            className={`border-l-4 rounded-md p-3 shadow-sm ${
                                                isActive
                                                ? 'border-orange-400 bg-orange-50'
                                                : 'border-green-500 bg-green-50'
                                            }`}
                                            >
                                            <p><strong>Medicament:</strong> {t.medicament}</p>
                                            <p><strong>Observații:</strong> {t.observatii}</p>
                                            <p><strong>Dozaj:</strong> {t.dozaj}</p>
                                            <p><strong>Perioadă:</strong> {t.startDate} – {endDate}</p>
                                            <p><strong>Durata:</strong> {t.durata} zile</p>
                                            <p><strong>Observații:</strong> {t.observatii}</p>
                                        </div>
                                        );
                                        })}
                                    </div>
                                    </div>

                                    {/* Atasamente */}
                                    <div className="text-sm">
                                    <p className="font-semibold text-purple-600 mb-1">Atașamente:</p>
                                    {appointment.medicalSheet.atasamente?.map((url, i) => (
                                        <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline text-sm block"
                                        >
                                        Atașament {i + 1}
                                        </a>
                                    ))}
                                    </div>
                                </div>
                                )
                            ))}
                            </div>
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => setShowMedicalSheet(false)}
                                    className="btn-outline-red flex items-end gap-2 px-5 py-2 rounded hover:cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faClose} />
                                    Închide
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 italic">Nu există fișe medicale pentru acest pacient.</p>
                    )}
                </div>
            </div>
        )}

        {showFeedback && selectedPatient && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
                <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90%] overflow-y-auto relative">
                
                {/* Buton inchidere */}
                <button
                    onClick={() => setShowFeedback(false)}
                    className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center hover:cursor-pointer"
                >
                    <FontAwesomeIcon icon={faClose} />
                </button>

                <div className="w-20 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>

                {/* Titlu */}
                <h2 className="text-2xl font-bold text-center mb-5 text-gray-800">
                    Recenzii – {selectedPatient.lastName} {selectedPatient.firstName}
                </h2>

                {selectedPatient.appointments?.filter(app => app.feedback).length > 0 ? (
                    <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedPatient.appointments.map((appointment, idx) =>
                        appointment.feedback ? (
                            <div
                            key={idx}
                            className="bg-gray-50 p-4 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition"
                            >
                            {/* Header recenzie */}
                            <div className="mb-3 space-y-1 text-sm text-gray-700">
                                <p>
                                <strong>Appointment ID:</strong> {appointment.appointmentID}
                                </p>
                                <p>
                                <strong>Investigație ID:</strong> {appointment.investigationName}
                                </p>
                                <p>
                                <strong>Data:</strong> {formatDateRo(appointment.date)}
                                </p>
                                <p>
                                <strong>Interval:</strong> {appointment.startTime} – {appointment.endTime}
                                </p>
                                <p>
                                <strong>Investigație:</strong> {appointment.investigationName}
                                </p>
                                <p>
                                <strong>Medic:</strong> {appointment.doctorName}
                                </p>
                            </div>

                            {/* Stele & rating */}
                            <div className="flex items-center gap-2 mt-2 mb-1">
                                {[...Array(appointment.feedback.rating)].map((_, i) => (
                                <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />
                                ))}
                                <span className="text-sm text-gray-600">
                                ({appointment.feedback.rating}/5)
                                </span>
                            </div>

                            {/* Comentariu */}
                            {appointment.feedback.comment && (
                                <div className="border rounded p-3 text-gray-800 text-sm bg-white shadow-inner">
                                <em>„{appointment.feedback.comment}”</em>
                                </div>
                            )}

                            {/* Data recenzie */}
                            <p className="text-xs text-right text-gray-400 italic mt-2">
                                {formatDateRo(appointment.feedback.createdAt)}
                            </p>
                            </div>
                        ) : null
                        )}
                    </div>

                    {/* Buton inchidere */}
                    <div className="flex justify-center mt-6">
                        <button
                        onClick={() => setShowFeedback(false)}
                        className="btn-outline-red flex items-end gap-2 px-5 py-2 rounded hover:cursor-pointer"
                        >
                        <FontAwesomeIcon icon={faClose} />
                        Închide
                        </button>
                    </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 italic">Nu există recenzii pentru acest medic.</p>
                )}
                </div>
            </div>
        )}

        {showAppointments && selectedPatient && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
                <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-5xl max-h-[90%] overflow-y-auto relative">
                
                {/* Buton inchidere */}
                <button
                    onClick={() => setShowAppointments(false)}
                    className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center hover:cursor-pointer"
                >
                    <FontAwesomeIcon icon={faClose} />
                </button>

                <div className="w-20 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>

                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Programări pacient – {selectedPatient.lastName} {selectedPatient.firstName}
                </h2>

                <div className="space-y-4">
                    
                
                 {selectedPatient.appointments?.length > 0 ? (
                   <div className="space-y-4">
                        {selectedPatient.appointments?.map((app, i) => {
                            const { label: statusLabel, color, bg, icon } = formatAppointmentStatus(app.status);
                            return (
                            <div className={`flex justify-between items-center border-l-4 ${color} ${bg} rounded-xl p-4 shadow hover:shadow-md transition-all duration-200`}>

                    <div className="flex flex-col gap-1 text-sm text-gray-800">
                        <h3 className="text-lg font-semibold">{app.investigationName}</h3>
                        <p><FontAwesomeIcon icon={faUserMd} className="mr-2 text-purple-600" /> {app.doctorName} – {app.specialityName}</p>
                        <p><FontAwesomeIcon icon={faHospital} className="mr-2 text-purple-600" /> {app.locationName}</p>
                        <p><FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-600" /> {formatDateRo(app.date)}</p>
                        <p><FontAwesomeIcon icon={faClock} className="mr-2 text-purple-600" /> {app.startTime} – {app.endTime}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full ${color} bg-white`}>
                        <FontAwesomeIcon icon={icon} />
                        {statusLabel}
                        </span>

                    
                    </div>
                    </div>

                            );
                            })}
                            <div className="flex justify-center mt-6">
                    <button
                    onClick={() => setShowAppointments(false)}
                    className="btn-outline-red flex items-center gap-2 px-5 py-2 rounded hover:cursor-pointer"
                    >
                    <FontAwesomeIcon icon={faClose} />
                    Închide
                    </button>
                </div>
                    </div>
                 ) : (
                    <p className="text-center text-gray-500 italic">Nu există recenzii pentru acest medic.</p>
                )}
                </div>

                
                </div>
            </div>
        )}

        {showDetails && selectedPatient && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto relative border border-purple-100">

                    {/* Buton inchidere */}
                    <button
                        onClick={() => setShowDetails(false)}
                        className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center hover:cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-1 bg-purple-600 rounded-full mx-auto mb-3" />
                        <h2 className="text-3xl font-bold text-gray-800">
                        Profil pacient – {selectedPatient.lastName} {selectedPatient.firstName}
                        </h2>
                        <p className="text-sm text-gray-500">ID: {selectedPatient.patientID}</p>
                    </div>

                    {/* Info pers + medicale */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Col 1 – Info de baza */}
                        <div className="space-y-3 text-sm text-gray-800">
                        <h3 className="text-lg font-semibold text-purple-600 border-b pb-1 mb-2">Informații generale</h3>
                        <p><strong>Email:</strong> {selectedPatient.email || '–'}</p>
                        <p><strong>Telefon:</strong> {selectedPatient.phone || '–'}</p>
                        <p><strong>CNP:</strong> {selectedPatient.cnp || '–'}</p>
                        <p><strong>Data nașterii:</strong> {selectedPatient.birthDate || '–'}</p>
                        <p><strong>Vârstă:</strong> {selectedPatient.age || '–'}</p>
                        <p><strong>Sex:</strong> {selectedPatient.gender || '–'}</p>
                        <p><strong>Status:</strong> <span className="italic">{selectedPatient.status || '–'}</span></p>
                        </div>

                        {/* Col 2 – Medicale */}
                        <div className="space-y-3 text-sm text-gray-800">
                        <h3 className="text-lg font-semibold text-purple-600 border-b pb-1 mb-2">Informații medicale</h3>
                        {/* Medic de familie – doar daca este completat */}
                            {selectedPatient.familyDoctor?.trim() !== "" && (
                                <p><strong>Medic de familie:</strong> {selectedPatient.familyDoctor}</p>
                            )}
                        <p><strong>Grupa sanguină:</strong> {selectedPatient.bloodGroup || '–'}</p>
                        <p><strong>RH:</strong> {selectedPatient.rh || '–'}</p>
                        <p><strong>Asigurare:</strong> {selectedPatient.insurance || '–'}</p>
                        </div>
                    </div>

                    {/* Alergi + adresa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                        {/* Alergii */}
                        <div className="space-y-3 text-sm text-gray-800">
                            <h3 className="text-lg font-semibold text-purple-600 border-b pb-1 mb-2">Alergii</h3>
                            {selectedPatient.allergies?.length > 0 ? (
                            <ul className="list-disc list-inside text-gray-700">
                                {selectedPatient.allergies.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                            ) : (
                            <p className="italic text-gray-500">Nu sunt înregistrate alergii</p>
                            )}
                        </div>

                        {/* Adresa */}
                        <div className="space-y-3 text-sm text-gray-800">
                            <h3 className="text-lg font-semibold text-purple-600 border-b pb-1 mb-2">Adresă</h3>
                            <p>
                            {selectedPatient.address?.address_details || 'Strada necunoscută'},  {selectedPatient.address?.postalCode || ''},<br />
                            {selectedPatient.address?.city || 'Oraș necunoscut'}, {selectedPatient.address?.county || 'Județ necunoscut'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                        {/* Contact de urgenta – doar daca exista info */}
                        {selectedPatient.emergencyContact &&
                            Object.values(selectedPatient.emergencyContact).some(v => v?.trim() !== "") && (
                                <div className="space-y-3 text-sm text-gray-800">
                                    <h3 className="text-lg font-semibold text-purple-600 border-b pb-1 mb-2">Contact de urgență</h3>
                                    {selectedPatient.emergencyContact.name?.trim() && (
                                        <p><strong>Nume:</strong> {selectedPatient.emergencyContact.name}</p>
                                    )}
                                    {selectedPatient.emergencyContact.phone?.trim() && (
                                        <p><strong>Telefon:</strong> {selectedPatient.emergencyContact.phone}</p>
                                    )}
                                    {selectedPatient.emergencyContact.relation?.trim() && (
                                        <p><strong>Relație:</strong> {selectedPatient.emergencyContact.relation}</p>
                                    )}
                                </div>
                        )}

                        {/* Ocupatie */}
                        {selectedPatient.occupation?.profession?.trim() !== "" && (
                        <div className="space-y-3 text-sm text-gray-800">
                            <h3 className="text-lg font-semibold text-purple-600 border-b pb-1 mb-2">Ocupație</h3>
                            <p><strong>Profesie:</strong> {selectedPatient.occupation.profession}</p>

                            {["student", "elev"].includes(selectedPatient.occupation.profession.toLowerCase()) &&
                            selectedPatient.occupation.institution?.trim() !== "" && (
                                <p><strong>Instituție:</strong> {selectedPatient.occupation.institution}</p>
                            )}

                            {selectedPatient.occupation.profession.toLowerCase() === "angajat" && (
                            <>
                                {selectedPatient.occupation.domain?.trim() !== "" && (
                                <p><strong>Domeniu:</strong> {selectedPatient.occupation.domain}</p>
                                )}
                                {selectedPatient.occupation.workPlace?.trim() !== "" && (
                                <p><strong>Loc de muncă:</strong> {selectedPatient.occupation.workPlace}</p>
                                )}
                            </>
                            )}

                            {["altul", "casnic", "pensionar", "somer"].includes(selectedPatient.occupation.profession.toLowerCase()) &&
                            selectedPatient.occupation.otherDetails?.trim() !== "" && (
                                <p><strong>Detalii suplimentare:</strong> {selectedPatient.occupation.otherDetails}</p>
                            )}
                        </div>
                        )}
                    </div>

                    <div className="text-xs text-center text-gray-400 mt-6 italic">
                        Pacient înregistrat la: {formatDateRo(selectedPatient.createdAt)}
                    </div>
                </div>
            </div>
        )}

        {showUpdateStatus && selectedPatient && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-[95%] max-w-lg max-h-[90vh] overflow-y-auto relative border border-purple-100">
                  <div className="w-20 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
            
                    <h2 className="text-2xl font-bold text-center mb-2 text-gray-800"> 
                        {selectedPatient.status?.toLowerCase() === "suspendat"
                            ? "Reactivare pacient"
                            : "Suspendare pacient"}
                    </h2>

     
                    {/* Mesaj */}
                    <p className="text-gray-600 text-center mb-6">
                        Pacientul are statusul <strong className="capitalize">{selectedPatient.status}</strong>. <br />
                        Dorești să {selectedPatient.status?.toLowerCase() === "suspendat" ? "îl reactivezi" : "îl suspenzi"}?
                    </p>

                    {/* Butoane */}
                    <div className="flex justify-center gap-4">
                        <button
                        onClick={() => handleStatusToggle(selectedPatient.patientID)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition cursor-pointer"
                        >
                        Confirmă
                        </button>
                        <button
                        onClick={() => setShowUpdateStatus(false)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition cursor-pointer"
                        >
                        Anulează
                        </button>
                    </div>
                    </div>
                </div>
        )}
    </div>
    
  )
}

export default DisplayPatientsTable