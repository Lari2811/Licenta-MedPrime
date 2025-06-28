import React, { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook, faCalendarAlt, faClock, faCommentDots, faEdit, faEye,
  faHashtag, faL, faSquarePlus, faTools, faTrashAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../../../context/AppContex';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatAppointmentStatus } from '../../../utils/formatAppointmentStatus';
import axios from 'axios';
import { formatStatusApp } from '../../../utils/formatStatusApp';
import Loader from '../../../components/Loader';

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

    const { backendUrl } = useContext(AppContext);

    const navigate = useNavigate();

    const {doctorID} = useParams();

    const [showCancelModal, setShowCancelModal] = useState(false);

    const [cancelReason, setCancelReason] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [showActionConfirmModal, setShowActionConfirmModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null); 

    const [ showMedicalSheetModal, setShowMedicalSheetModal] = useState(false)

    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");


    const [diagnostic, setDiagnostic] = useState("");
    const [rezumat, setRezumat ] = useState("")
    const [recomandari, setRecomandari] = useState("");
    const [trimiteri, setTrimiteri] = useState("");
    const [atasamente, setAtasamente] = useState([]); 


    const [treatments, setTreatments] = useState([
        {
            medicament: '',
            dozaj: '',
            startDate: '',
            durata: '',
            observatii: ''
        }
    ]);

    const handleTreatmentChange = (index, field, value) => {
        const newTreatments = [...treatments];
        newTreatments[index][field] = value;
        setTreatments(newTreatments);
        };

    const handleRemoveTreatment = (index) => {
        const newTreatments = treatments.filter((_, i) => i !== index);
        setTreatments(newTreatments);
        };


    const handleSaveSheet = async () => {
        if (!diagnostic.trim()) return toast.error("Completează diagnosticul.");
        if (!recomandari.trim()) return toast.error("Adaugă recomandări.");
        if (treatments.length === 0) return toast.error("Adaugă cel puțin un tratament.");

        
        try {
           
            setLoading(true);
            setLoadingMessage("Se salvează fișa medicală...");
        

            const formData = new FormData();

            formData.append("appointmentID", selectedAppointment.appointmentID);
            formData.append("patientID", selectedAppointment.patientID);
            formData.append("doctorID", selectedAppointment.doctorID);
            formData.append("diagnostic", diagnostic);
            formData.append("rezumat", rezumat);
            formData.append("recomandari", recomandari);
            formData.append("trimiteri", trimiteri);
            formData.append("treatments", JSON.stringify(treatments));

            atasamente.forEach((file) => {
            formData.append("atasamente", file);
            });

            
            await axios.post(`${backendUrl}/api/main/save-medical-sheet`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            });
            

            toast.success("Fișa medicală a fost salvată cu succes!");

            // Schimbare automata status în "finalizare"
            await axios.post(`${backendUrl}/api/main/update-appointment-status`, {
                appointmentID: selectedAppointment.appointmentID,
                newStatus: "finalizata"
            });
            
            setShowMedicalSheetModal(false);

            setDiagnostic("");
            setRecomandari("");
            setTrimiteri("");
            setTreatments([{ medicament: '', dozaj: '', startDate: '', durata: '', observatii: '' }]);
            setAtasamente([]);

        } catch (error) {
        console.error("Eroare la salvarea fișei medicale:", error);

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
            case 409:
                toast.warning(data.message || "Fișa a fost deja trimisă pentru această programare.");
                break;
            case 400:
                toast.error(data.message || "Datele trimise nu sunt valide.");
                break;
            case 500:
                toast.error("Eroare internă la salvarea fișei medicale.");
                break;
            default:
                toast.error(data.message || "A apărut o eroare neașteptată.");
                break;
            }
        } else {
            toast.error("Eroare de rețea sau server indisponibil.");
        }
        } finally{
            setLoading(false);
            
        }
        };

  return (
    <div>
        <div className="overflow-x-auto shadow-md rounded-xl bg-white mt-5">
        <table className="table-fixed min-w-full text-left text-gray-700">
            <thead className="bg-purple-100 text-purple-900 text-base">
            <tr>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faHashtag} className="mr-2" />ID</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faUser} className="mr-2" />ID Pacient</th>

                <th className="px-4 py-3"><FontAwesomeIcon icon={faBook} className="mr-2" />Investigație</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />Data</th>
                <th className="px-4 py-3"><FontAwesomeIcon icon={faClock} className="mr-2" />Interval</th>
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
                              <tr key={app._id} className="hover:bg-purple-50 transition-colors">
                                <td className="px-4 py-4">#{app.appointmentID}</td>
                                <td className="px-4 py-4">#{app.patientID}</td>
                                <td className="px-4 py-4">{app.investigationName}</td>
                                <td className="px-4 py-4">{formatDate(app.date)}</td>
                                <td className="px-4 py-4">{app.startTime} - {app.endTime}</td>
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

                                {/* Status: în așteptare -> Confirmă */}
                                {app.status === "in asteptare" && (
                                    <button
                                        title="Confirmă"
                                        onClick={() => {
                                            setActionToConfirm({ actionType: "confirm", appointment: app });
                                            setShowActionConfirmModal(true);
                                        }}
                                        className="text-green-600 hover:text-green-800"
                                        >
                                        <FontAwesomeIcon icon={faSquarePlus} />
                                    </button>
                                )}

                                {/*  Status: confirmată -> În desfășurare */}
                                {app.status === "confirmata" && (
                                    <button
                                        title="În desfășurare"
                                        onClick={() => {
                                            setActionToConfirm({ actionType: "start", appointment: app });
                                            setShowActionConfirmModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                        >
                                        <FontAwesomeIcon icon={faClock} />
                                    </button>
                                )}

                                {/*  Anulează - doar dacă e în așteptare sau confirmată */}
                                {(app.status === "in asteptare" || app.status === "confirmata") && (
                                    <button
                                    title="Anulează"
                                    onClick={() => {
                                        setSelectedAppointment(app);
                                        setShowCancelModal(true);
                                    }}
                                    className="text-red-600 hover:text-red-800 cursor-pointer"
                                    >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                )}

                                {/*  Completează fișă - doar dacă e în desfășurare */}
                                {app.status === "in desfasurare" && (
                                    <button
                                    title="Completează fișă"
                                    onClick={() => {
                                        setSelectedAppointment(app);
                                        setShowMedicalSheetModal(true)
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800  cursor-pointer"
                                    >
                                    <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                )}

                                {app.status === "finalizata" && (
                                    <button
                                    title="Dosar Pacient"
                                    onClick={() => {
                                        navigate(`/profil-medic/${doctorID}/dosare-pacienti/${app.patientID}`);
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
                         setLoading(true);
                        setLoadingMessage("Se anuleazcă programarea...");

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
                    className="px-5 py-2.5   cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition cursor-pointer"
                >
                    Da, anulează
                </button>
                <button
                    onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    }}
                    className="px-5 py-2.5  cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-semibold transition cursor-pointer"
                >
                    Renunță
                </button>
                </div>
            </div>
            </div>
        )} 

        {/* Confirmare Modal */}
        {showActionConfirmModal && actionToConfirm && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
                <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                    {actionToConfirm.actionType === "confirm" ? "Confirmare programare" : "Începe programarea"}
                </h2>
                <p className="text-gray-600 mb-4">
                    Sigur vrei să {actionToConfirm.actionType === "confirm" ? "confirmi" : "începi"} programarea #{actionToConfirm.appointment.appointmentID}?
                </p>

                <div className="flex justify-center gap-4">
                    <button
                    onClick={async () => {
                        try {
                            setLoading(true);
                            setLoadingMessage("Se modifică statusul programări...");

                        await axios.post(`${backendUrl}/api/main/update-appointment-status`, {
                            appointmentID: actionToConfirm.appointment.appointmentID,
                            newStatus: actionToConfirm.actionType === "confirm" ? "confirmata" : "in desfasurare"
                        });
                        toast.success(`Programarea a fost ${actionToConfirm.actionType === "confirm" ? "confirmată" : "începută"}.`);
                        setShowActionConfirmModal(false);
                        setActionToConfirm(null);
                        } catch (err) {
                        toast.error("Eroare la actualizare.");
                        console.error(err);
                        } finally{
                            setLoading(false)
                        }
                    }}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition cursor-pointer"
                    >
                    Da, continuă
                    </button>
                    <button
                    onClick={() => {
                        setShowActionConfirmModal(false);
                        setActionToConfirm(null);
                    }}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-semibold transition cursor-pointer"
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


                    <p><strong>Pacient:</strong> {selectedAppointment.patientName}</p>
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

        {/*  Fisa medicala*/}
        {showMedicalSheetModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl w-[95%] max-w-4xl overflow-y-auto max-h-[90vh]">
                {/* Header */}
                <div className="border-b pb-3 mb-5">
                    <h2 className="text-2xl font-bold text-purple-800">Fișă medicală pacient</h2>
                    <p className="text-sm text-gray-500">Completează datele medicale pentru această consultație.</p>
                </div>

                {/* Informatii pacient */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-800 bg-gray-50 p-4 rounded-lg">
                    <p><strong>ID Programare:</strong> {selectedAppointment.appointmentID}</p>
                    <p><strong>ID Pacient:</strong> {selectedAppointment.patientID}</p>
                    <p><strong>Nume Pacient:</strong> {selectedAppointment.patientName}</p>
                    <p><strong>Dată:</strong> {formatDate(selectedAppointment.date)}</p>
                    <p><strong>Interval:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                    <p><strong >Investigație:</strong> {selectedAppointment.investigationName}</p>
                </div>

                {/* Diagnostic */}
                <div className="mb-4">
                    <label className="font-semibold text-sm text-gray-700">Diagnostic</label>
                    <textarea
                        rows="3"
                        className="w-full border rounded-md p-2 mt-1"
                        placeholder="Ex: Hipertensiune arterială..."
                        value={diagnostic}
                        onChange={(e) => setDiagnostic(e.target.value)}
                        />
                </div>

                {/* Descriere */}
                <div className="mb-4">
                    <label className="font-semibold text-sm text-gray-700">Descriere</label>
                    <textarea
                        rows="3"
                        className="w-full border rounded-md p-2 mt-1"
                        placeholder="Ex: Pacientul s-a prezentat cu..."
                        value={rezumat}
                        onChange={(e) => setRezumat(e.target.value)}
                        />
                </div>

                {/* Recomandari */}
                <div className="mb-4">
                    <label className="font-semibold text-sm text-gray-700">Recomandări</label>
                    <textarea 
                        rows="3" 
                        value={recomandari}
                        onChange={(e) => setRecomandari(e.target.value)}
                        className="w-full border rounded-md p-2 mt-1" 
                        placeholder="Ex: Regim alimentar, control la 3 luni..." 
                        />
                </div>

                {/* Trimiteri */}
                <div className="mb-4">
                    <label className="font-semibold text-sm text-gray-700">Trimiteri / Observații</label>
                    <textarea 
                        rows="2" 
                        value={trimiteri}
                        onChange={(e) => setTrimiteri(e.target.value)}
                        className="w-full border rounded-md p-2 mt-1" 
                        placeholder="Ex: Trimitere la cardiolog..." />
                </div>

                {/* Tratament curent */}
                <h4 className="text-purple-800 font-semibold mb-3">Tratament Prescris</h4>
                {treatments.map((treat, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <label className="block font-medium text-gray-600">Medicament</label>
                        <input
                        type="text"
                        value={treat.medicament}
                        onChange={(e) => handleTreatmentChange(index, 'medicament', e.target.value)}
                        className="w-full border rounded-md p-2"
                        placeholder="Ex: Concor 5mg"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600">Dozaj</label>
                        <input
                        type="text"
                        value={treat.dozaj}
                        onChange={(e) => handleTreatmentChange(index, 'dozaj', e.target.value)}
                        className="w-full border rounded-md p-2"
                        placeholder="1 comprimat dimineața"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600">Început la</label>
                        <input
                        type="date"
                        value={treat.startDate}
                        onChange={(e) => handleTreatmentChange(index, 'startDate', e.target.value)}
                        className="w-full border rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-600">Durată</label>
                        <input
                        type="number"
                        value={treat.durata}
                        onChange={(e) => handleTreatmentChange(index, 'durata', e.target.value)}
                        className="w-full border rounded-md p-2"
                        placeholder="Permanent / 7 zile"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-medium text-gray-600">Observații</label>
                        <textarea
                        rows="2"
                        value={treat.observatii}
                        onChange={(e) => handleTreatmentChange(index, 'observatii', e.target.value)}
                        className="w-full border rounded-md p-2"
                        placeholder="Ex: După micul dejun..."
                        />
                    </div>
                    </div>

                    {/* Buton de ștergere tratament */}
                    {treatments.length > 1 && (
                    <div className="flex justify-end mt-2">
                        <button
                        onClick={() => handleRemoveTreatment(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        >
                        Șterge tratamentul
                        </button>
                    </div>
                    )}
                </div>
                ))}

                {/* Buton pentru adaugare tratament */}
                <button
                    onClick={() =>
                        setTreatments([
                        ...treatments,
                        { medicament: '', dozaj: '', startDate: '', durata: '', observatii: '' }
                        ])
                    }
                    className="btn-outline-green-little-little  cursor-pointer"
                >
                + Adaugă tratament
                </button>


                {/* Fisiere atasate */}
                <div className="mb-4">
                    <label className="font-semibold text-sm text-gray-700">Atașează fișiere medicale (imagini, rapoarte)</label>
                    <input 
                    type="file" 
                    multiple accept="image/*,application/pdf" 
                    className="mt-2" 
                    onChange={(e) => setAtasamente(Array.from(e.target.files))}
                    />
                </div>

                {/* Butoane */}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800  cursor-pointer"
                    onClick={() => {
                        setShowMedicalSheetModal(false)
                        setDiagnostic("");
                        setRezumat("");
                        setRecomandari("");
                        setTrimiteri("");
                        setTreatments([{ medicament: '', dozaj: '', startDate: '', durata: '', observatii: '' }]);
                        setAtasamente([]);
                    
                    }}
                    >
                    Anulează
                    </button>
                    <button
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md  cursor-pointer"
                    onClick={handleSaveSheet}
                    >
                    Salvează fișa
                    </button>
                </div>
                </div>
            </div>
            )}
            {loading && <Loader message={loadingMessage} />}
    </div>
  )
}

export default DisplayAppTableM