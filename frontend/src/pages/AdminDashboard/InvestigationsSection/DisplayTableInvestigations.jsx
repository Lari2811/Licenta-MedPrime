import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faEdit, faEnvelope, faEye, faHospital,
  faMapMarkerAlt, faStethoscope, faTimesCircle, faTools, faTrashAlt,
  faMagnifyingGlass,
  faUserDoctor,
  faClinicMedical,
  faVial,
  faCirclePause,
  faHourglassHalf,
  faHashtag,
  faClock,
  faSquarePlus,
  faMapLocationDot,
  faClose
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from '../../../context/AppContex';
import axios from 'axios';

import { assets } from '../../../assets/assets';
import LocationModalListInv from '../../../components/TableModalList/InvestigationTable/LocationModalListInv';
import SpecialityListModalInv from '../../../components/TableModalList/InvestigationTable/SpecialityListModalInv';

const DisplayTableInvestigations = ({investigations}) => {

    const navigate = useNavigate();
    const { backendUrl } = useContext(AppContext);

    console.log("in table:", investigations)
    
    const { adminID } = useParams();

    const [showLocationsModal, setShowLocationsModal] = useState(false);
    const [showSpecialitiesModal, setShowSpecialitiesModal] = useState(false)

    const [selectedInvestigationID, setSelectedInvestigationID] = useState('')
    const [selectedInvestigationName, setSelectedInvestigationName] = useState('')

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [selectedInvestigation, setSelectedInvestigation] = useState(null);


    const[deleteInvestigationInfo, setDeleteInvestigationInfo] = useState(null)

    const [loading, setLoading] = useState(false)
    const[loadingMessage, setLoadingMessage] = useState("")
    

    const handleOpenLocationsModal = (inv) => {
        setSelectedInvestigationID(inv.investigationID);
        setSelectedInvestigationName(inv.name);
        setShowLocationsModal(true);
    };

    const handleOpenSpecialitiesModal = (inv) => {
        setSelectedInvestigationID(inv.investigationID);
        setSelectedInvestigationName(inv.name);
        setShowSpecialitiesModal(true);
    };

    const handleOpenDeleteModal = async (investigationID) => {
        try {
            const res = await axios.post(`${backendUrl}/api/admin/get-investigation-summary`, {
                investigationID: investigationID
            });

            setDeleteInvestigationInfo(res.data);
            setShowDeleteModal(true);

            console.log("Info-delete",setDeleteInvestigationInfo)
            
        } catch (err) {
            console.error("Eroare la preluarea doctorului:", err); 
            toast.error("Nu s-au putut obține informațiile despre medic.");
        }
    }

    const handleConfirmDeleteInvestigation = async () => {
        if (!deleteInvestigationInfo?.investigation?.investigationID) {
            toast.error("Lipsă investigationID.");
            return;
        }

        try {
            setLoading(true);
            setLoadingMessage("Investigația se șterge...");

            const res = await axios.delete(
                `${backendUrl}/api/admin/delete-investigation/${deleteInvestigationInfo.investigation.investigationID}`
            );

            if (res.status === 200) {
                toast.success("Investigația a fost ștearsă cu succes.");
                setShowDeleteModal(false);
                setDeleteInvestigationInfo(null);
            } else {
                toast.error("A apărut o eroare la ștergerea investigației.");
            }
        } catch (err) {
            console.error("Eroare la ștergerea investigației:", err);
            toast.error("Nu s-a putut șterge investigația.");
        } finally {
            setLoading(false);
        }
    };


  return (
    <div>
        <div className="overflow-x-auto shadow-md rounded-xl shadow-md bg-white mt-5">
            <table className="min-w-[100px] w-full text-base text-left text-gray-700">
                <thead className="bg-purple-100 text-purple-900">
                    <tr>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faVial} className="mr-2 text-purple-700" />Investigație</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faClock} className="mr-2 text-purple-700" />Durata</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-purple-700" />Locați</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faStethoscope} className="mr-2 text-purple-700" />Specialități</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faSquarePlus} className="mr-2 text-purple-700" />Creat la</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faEdit} className="mr-2 text-purple-700" />Modificat la</th>
                    <th className="px-6 py-3 text-center"><FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" />Acțiuni</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200 font-semibold">
                    {investigations.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="py-6 text-center text-gray-500 italic">
                        Nu există specialități care să corespundă filtrului aplicat.
                        </td>
                    </tr>
                    ) : (
                        investigations.map(inv => (
                            <tr key={inv.investigationID} className="hover:bg-purple-50 transition-colors text-sm">
                                <td className="px-5 py-4 text-base whitespace-normal break-words max-w-xs">
                                    <div className="flex items-center gap-4">
                                    <img 
                                        src={inv.profileImage && inv.profileImage !== "" ? inv.profileImage : assets.investigation_default}
                                        alt="Profil specialitate" 
                                        className="w-12 h-12 rounded-full object-cover border border-gray-300" 
                                    />

                                    <div className="flex flex-col">
                                        <div className="font-medium text-sm text-gray-800">{inv.name}</div>
                                        <div className="text-sm text-gray-600">#{inv.investigationID}</div>
                                    </div>
                                    </div>

                                </td>

                                <td className="px-5 py-4 text-sm"> {inv.duration} min </td>

                                <td className="px-5 py-4 text-sm text-center">
                                    <button
                                        onClick={() => handleOpenLocationsModal(inv)}
                                        className="text-purple-500 hover:underline hover:cursor-pointer "
                                    >
                                        <FontAwesomeIcon icon={faMapLocationDot} className='text-xl'/>
                                    </button>
                                </td>

                                <td className="px-5 py-4 text-sm  text-center">
                                    <button
                                        onClick={() => handleOpenSpecialitiesModal(inv)}
                                        className="text-purple-500 hover:underline hover:cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faStethoscope} className='text-xl'/>
                                    </button>
                                </td>

                                <td className="px-5 py-4 text-sm text-center">
                                    <div className="flex flex-col">
                                        <span>{new Date(inv.createdAt).toLocaleDateString('ro-RO')}</span>
                                        <span className="text-xs text-gray-500">
                                        {new Date(inv.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-sm text-center">
                                    <div className="flex flex-col">
                                        <span>{new Date(inv.updatedAt).toLocaleDateString('ro-RO')}</span>
                                        <span className="text-xs text-gray-500">
                                        {new Date(inv.updatedAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>

                              <td className="px-5 py-4 text-sm text-center">
                                    <div className="flex justify-center gap-3 text-lg text-purple-500">
        
                                    <button
                                        title="Vezi detalii "
                                         onClick={() => {
                                            setSelectedInvestigation(inv);
                                            setShowInfoModal(true);
                                    }}
                                    >
                                        <FontAwesomeIcon icon={faEye} className='hover:text-purple-900 hover:cursor-pointer mr-2' />
                                    </button>

                                    <button
                                        onClick={() => handleOpenDeleteModal(inv.investigationID) }
                                        
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} className='hover:text-red-900 hover:cursor-pointer text-red-600' />
                                    </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                        )}
                </tbody>
            </table>
        </div>

        <LocationModalListInv
            isOpen={showLocationsModal}
            onClose={ () => setShowLocationsModal(false)}
            investigationID={selectedInvestigationID}
            investigationName={selectedInvestigationName}
        />

        <SpecialityListModalInv
            isOpen={showSpecialitiesModal}
            onClose={ () => setShowSpecialitiesModal(false)}
            investigationID={selectedInvestigationID}
            investigationName={selectedInvestigationName}
        />

        {showInfoModal && selectedInvestigation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative max-h-[85vh] overflow-y-auto">
             {/* Buton inchidere */}
                    <button
                      onClick={() => setShowInfoModal(false)}
                      className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center cursor-pointer"
                      title="Închide"
                    >
                      <FontAwesomeIcon icon={faClose} />
                    </button>
            <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Detalii investigație</h2>

            {/* Date generale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800 mb-4">
                <p><strong>Denumire:</strong> {selectedInvestigation.name}</p>
                <p><strong>ID:</strong> {selectedInvestigation.investigationID}</p>
                <p><strong>Durată:</strong> {selectedInvestigation.duration} min</p>
                <p><strong>Sloturi disponibile:</strong> {selectedInvestigation.numberOfSlots}</p>
                <p><strong>Necesită medic:</strong> {selectedInvestigation.requiresDoctor ? "Da" : "Nu"}</p>
                <p><strong>Status setup:</strong> {selectedInvestigation.isInvestigationSetupCompleted ? "Completat" : "Incomplet"}</p>
                <p><strong>Creată:</strong> {new Date(selectedInvestigation.createdAt).toLocaleString('ro-RO')}</p>
                <p><strong>Ultima modificare:</strong> {new Date(selectedInvestigation.updatedAt).toLocaleString('ro-RO')}</p>
            </div>

            {/* Descriere scurta */}
            {Array.isArray(selectedInvestigation.shortDescription) && selectedInvestigation.shortDescription.length > 0 && (
                <div className="mb-4">
                <p className="font-semibold text-purple-700">Descriere generală:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {selectedInvestigation.shortDescription.map((item, idx) => (
                    <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                    ))}
                </ul>
                </div>
            )}

            {/* Pasi consultatie */}
            {Array.isArray(selectedInvestigation.consultationSteps) && selectedInvestigation.consultationSteps.length > 0 && (
                <div className="mb-4">
                <p className="font-semibold text-purple-700">Pași consultație:</p>
                <ol className="list-decimal list-inside text-sm text-gray-700 mt-1">
                    {selectedInvestigation.consultationSteps.map((step, idx) => (
                    <li key={idx}>{typeof step === 'string' ? step : JSON.stringify(step)}</li>
                    ))}
                </ol>
                </div>
            )}

            {/* Sfaturi pregatire */}
            {Array.isArray(selectedInvestigation.preparationTips) && selectedInvestigation.preparationTips.length > 0 && (
                <div className="mb-4">
                <p className="font-semibold text-purple-700">Sfaturi pentru pregătire:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {selectedInvestigation.preparationTips.map((tip, idx) => (
                    <li key={idx}>{typeof tip === 'string' ? tip : JSON.stringify(tip)}</li>
                    ))}
                </ul>
                </div>
            )}

            {/* Inchidere */}
            <div className="flex justify-center mt-6">
                <button
                onClick={() => {
                    setShowInfoModal(false);
                    setSelectedInvestigation(null);
                }}
                className="btn-outline-red cursor-pointer"
                >
                    <FontAwesomeIcon icon={faClose} />
                Închide
                </button>
            </div>
            </div>
        </div>
        )}

        {showDeleteModal && deleteInvestigationInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md">
                <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                    Ștergere investigația
                </h2>

                <h3 className="font-medium text-gray-800 mb-3 text-center">
                    Ești sigur că vrei să ștergi această investigație?
                </h3>

            <div className="space-y-2 text-sm text-gray-700">
                <p><strong>ID:</strong> {deleteInvestigationInfo.investigation.investigationID}</p>
                <p><strong>Denumire:</strong> {deleteInvestigationInfo.investigation.name}</p>
                <p><strong>Programări active:</strong> {deleteInvestigationInfo.activeAppointmentsCount || 0}</p>

                <div>
                <p className="font-bold text-gray-700">Locații asociate:</p>
                <p className="ml-4">
                    Total: {deleteInvestigationInfo.locationsCount.total} &nbsp; 
                    <span className="text-green-700 font-medium">({deleteInvestigationInfo.locationsCount.active} active</span>,{" "}
                    <span className="text-red-700 font-medium">{deleteInvestigationInfo.locationsCount.inactive} inactive)</span>
                </p>
                </div>

                <div>
                <p className="font-bold text-gray-700">Specialități asociate:</p>
                {deleteInvestigationInfo.specialitiesCount > 0 ? (
                    <p className="ml-4">{deleteInvestigationInfo.specialitiesCount} specialități</p>
                ) : (
                    <p className="italic text-gray-400 ml-4">Nicio specialitate asociată</p>
                )}
                </div>
            </div>

            <div className="flex justify-center mt-6 gap-3">
                <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
                >
                Anulează
                </button>
                <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer"
                onClick={handleConfirmDeleteInvestigation}
                >
                Confirmă Ștergerea
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  )
}

export default DisplayTableInvestigations