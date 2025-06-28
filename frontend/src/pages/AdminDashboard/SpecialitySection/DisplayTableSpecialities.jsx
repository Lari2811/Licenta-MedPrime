import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faEdit, faEnvelope, faEye, faHospital,
  faMapMarkerAlt, faStethoscope, faTimesCircle, faTools, faTrashAlt,
  faMagnifyingGlass,
  faUserDoctor,
  faClinicMedical,
  faHashtag,
  faSquarePlus,
  faClose,
  faMapLocationDot,
  faVial
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../../../assets/assets';
import DoctorListModalS from '../../../components/TableModalList/SpecialityTable/DoctorListModalS';
import LocationListModalS from '../../../components/TableModalList/SpecialityTable/LocationsListModalS';
import InvestigationListModal from '../../../components/TableModalList/LocationTable/InvestigationsListModal';
import InvestigationsListModalS from '../../../components/TableModalList/SpecialityTable/InvestigationsListModalS';

import { formatDateRo } from '../../../utils/formatDataRO';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';


const DisplayTableSpecialities = ({ specialities }) => {

    const {backendUrl} = useContext(AppContext)

    const navigate = useNavigate();
    const { adminID } = useParams();


    const [showLocationsModal, setShowLocationsModal] = useState(false);
    const [showInvestigationsnModal, setShowInvestigationsModal] = useState(false);
    const [showDoctorsModal, setShowDoctorsModal] = useState(false);

    const [selectedSpecialityID, setSelectedSpecialityID] = useState('');
    const [selectedSpecialityName, setSelectedSpecialityName] = useState('');

    const handleOpenLocationsModal = (spec) => {
        setSelectedSpecialityID(spec.specialityID);
        setSelectedSpecialityName(spec.name);
        setShowLocationsModal(true);
    };

    const handleOpenDoctorsModal = (spec) => {
        setSelectedSpecialityID(spec.specialityID);
        setSelectedSpecialityName(spec.name);
        setShowDoctorsModal(true);
    };

    const handleOpenInvestigationsModal = (spec) => {
        setSelectedSpecialityID(spec.specialityID);
        setSelectedSpecialityName(spec.name);
        setShowInvestigationsModal(true);
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [selectedSpeciality, setSelectedSpeciality] = useState(null);


    const[deleteSpecialityInfo, setDeleteSpecialityInfo] = useState(null)

    const [loading, setLoading] = useState(false)
    const[loadingMessage, setLoadingMessage] = useState("")

    const handleOpenDeleteModal = async (specialityID) => {
        try {
            const res = await axios.post(`${backendUrl}/api/admin/get-speciality-summary`, {
            specialityID: specialityID,
            });

            setDeleteSpecialityInfo(res.data);
            setShowDeleteModal(true);

            console.log("Info-delete", res.data);
        } catch (err) {
            console.error("Eroare la preluarea specialității:", err);
            toast.error("Nu s-au putut obține informațiile despre specialitate.");
        }
    };

    const handleConfirmDeleteSpeciality = async () => {
        if (!deleteSpecialityInfo?.speciality?.specialityID) {
            toast.error("Lipsă specialityID.");
            return;
        }

        

        try {
            setLoading(true);
            setLoadingMessage("Specialitatea se șterge...");

            const res = await axios.delete(
                `${backendUrl}/api/admin/delete-speciality/${deleteSpecialityInfo.speciality.specialityID}`
            );

            if (res.status === 200) {
                toast.success("Specialitatea a fost ștearsă cu succes.");
                setShowDeleteModal(false);
                setDeleteSpecialityInfo(null);

            } else {
                toast.error("A apărut o eroare la ștergerea specialității.");
            }
        } catch (err) {
            console.error("Eroare la ștergerea specialității:", err);
            toast.error("Nu s-a putut șterge specialitatea.");
        } finally {
            setLoading(false);
        }
    };
    

  return (

    <div>
        <div className="overflow-x-auto shadow-md rounded-xl shadow-md bg-white mt-5">
            <table className="min-w-full table-auto text-base text-left text-gray-700">
                <thead className="bg-purple-100 text-purple-900 ">
                    <tr>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faStethoscope} className="mr-2 text-purple-700" />Specialitate</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faHashtag} className="mr-2 text-purple-700" />ID</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-purple-700" />Locați</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faVial} className="mr-2 text-purple-700" />Investigați</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faUserDoctor} className="mr-2 text-purple-700" />Medici</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faSquarePlus} className="mr-2 text-purple-700" />Creat la</th>
                    <th className="px-6 py-3 text-center"><FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" />Acțiuni</th>
                    </tr>
                </thead>

                    <tbody className="bg-white divide-y divide-gray-200 font-semibold ">
                    {specialities.length === 0 ? (
                    <tr>
                        <td colSpan="100" className="py-6 text-center text-lg  text-gray-500 italic">
                        Nu există specialități care să corespundă filtrului aplicat.
                        </td>
                    </tr>
                    ) : (
                    specialities.map(spec => (
                        <tr key={spec._id} className="hover:bg-purple-50 transition-colors ">
                            <td className="px-5 py-4 text-base">
                                <div className="flex items-center gap-4">
                                <img 
                                    src={spec.profileImage && spec.profileImage !== "" ? spec.profileImage : assets.speciality_default}
                                    alt="Profil specialitate" 
                                    className="w-12 h-12 rounded-full object-cover border border-gray-300" 
                                />
                                <div className="font-medium text-gray-800">
                                    {spec.name}
                                    
                                    </div>
                               
                                </div>
                            </td>

                            <td className="px-5 py-4 text-base"><FontAwesomeIcon icon={faHashtag} /> {spec.specialityID}</td>

                            <td className="px-5 py-4 text-base text-center">
                                <button
                                    onClick={() => handleOpenLocationsModal(spec)}
                                    className="text-purple-500 hover:underline hover:cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faMapLocationDot} className='text-xl text-orange-700'/>
                                </button>
                            </td>

                            <td className="px-5 py-4 text-base text-center">
                                <button
                                    onClick={() => handleOpenInvestigationsModal(spec)}
                                    className="text-purple-500 hover:underline hover:cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faVial} className='text-xl text-green-600'/>
                                </button>
                            </td>

                            <td className="px-5 py-4 text-base text-center">
                                <button
                                    onClick={() => handleOpenDoctorsModal(spec)}
                                    className="text-purple-500 hover:underline hover:cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faUserDoctor} className='text-xl text-purple-600'/>
                                </button>
                            </td>

                            <td className="px-5 py-4 text-base text-center">
                                <div className="flex flex-col">
                                    <span>{new Date(spec.createdAt).toLocaleDateString('ro-RO')}</span>
                                    <span className="text-xs text-gray-500">
                                    {new Date(spec.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-center">
                                <div className="flex justify-center gap-3 text-lg text-purple-500">

                                <button
                                    title="Vezi detalii "
                                        onClick={() => {
                                        setSelectedSpeciality(spec);
                                        setShowInfoModal(true);
                                }}
                                >
                                    <FontAwesomeIcon icon={faEye} className='hover:text-purple-900 hover:cursor-pointer mr-2' />
                                </button>

                                <button
                                    onClick={() => handleOpenDeleteModal(spec.specialityID) }
                                    
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

        <DoctorListModalS
            isOpen={showDoctorsModal}
            onClose={ () => setShowDoctorsModal(false)}
            specialityID={selectedSpecialityID}
            specialityName={selectedSpecialityName}
        />

        <LocationListModalS
            isOpen={showLocationsModal}
            onClose={ () => setShowLocationsModal(false)}
            specialityID={selectedSpecialityID}
            specialityName={selectedSpecialityName}
        />

        <InvestigationsListModalS
            isOpen={showInvestigationsnModal}
            onClose={ () => setShowInvestigationsModal(false)}
            specialityID={selectedSpecialityID}
            specialityName={selectedSpecialityName}
        />

        {showInfoModal && selectedSpeciality && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative max-h-[85vh] overflow-y-auto">
            {/* Buton închidere */}
            <button
                onClick={() => {
                setShowInfoModal(false);
                setSelectedSpeciality(null);
                }}
                className="absolute top-4 right-4 bg-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-900 transition-colors duration-200 shadow-sm border border-gray-300 flex items-center cursor-pointer"
                title="Închide"
            >
                <FontAwesomeIcon icon={faClose} />
            </button>

            <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Detalii specialitate</h2>

            {/* info generale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800 mb-4">
                <p><strong>Denumire:</strong> {selectedSpeciality.name}</p>
                <p><strong>ID:</strong> {selectedSpeciality.specialityID}</p>
                <p><strong>Creată:</strong> {new Date(selectedSpeciality.createdAt).toLocaleString('ro-RO')}</p>
                <p><strong>Ultima modificare:</strong> {new Date(selectedSpeciality.updatedAt).toLocaleString('ro-RO')}</p>
            </div>

            {/* Descriere */}
            {selectedSpeciality.shortDescription && (
                <div className="mb-4">
                <p className="font-semibold text-purple-700">Descriere scurtă:</p>
                <p className="text-sm text-gray-700">{selectedSpeciality.shortDescription}</p>
                </div>
            )}

            {/* Alte info */}
            {Array.isArray(selectedSpeciality.otherInfo) && selectedSpeciality.otherInfo.length > 0 && (
                <div className="mb-4">
                <p className="font-semibold text-purple-700">Alte informații:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {selectedSpeciality.otherInfo.map((info, idx) => (
                    <li key={idx}>{info}</li>
                    ))}
                </ul>
                </div>
            )}

            {/* Motive de consult */}
            {Array.isArray(selectedSpeciality.reasonsToConsult) && selectedSpeciality.reasonsToConsult.length > 0 && (
                <div className="mb-4">
                <p className="font-semibold text-purple-700">Motive frecvente pentru consult:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {selectedSpeciality.reasonsToConsult.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                    ))}
                </ul>
                </div>
            )}

            {/* Beneficii  */}
            {Array.isArray(selectedSpeciality.consultationBenefits) && selectedSpeciality.consultationBenefits.length > 0 && (
                <div className="mb-4">
                <p className="font-semibold text-purple-700">Beneficii ale consultației:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {selectedSpeciality.consultationBenefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                    ))}
                </ul>
                </div>
            )}

            {/* FAQ */}
            {Array.isArray(selectedSpeciality.faq) && selectedSpeciality.faq.length > 0 && (
                <div className="mb-4">
                <p className="font-semibold text-purple-700">Întrebări frecvente (FAQ):</p>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {selectedSpeciality.faq.map((item, idx) => (
                    <li key={idx}>
                        <strong>{item.question}</strong>
                        <p className="ml-2">{item.answer}</p>
                    </li>
                    ))}
                </ul>
                </div>
            )}

            {/* inchidere */}
            <div className="flex justify-center mt-6">
                <button
                onClick={() => {
                    setShowInfoModal(false);
                    setSelectedSpeciality(null);
                }}
                className="btn-outline-red cursor-pointer"
                >
                <FontAwesomeIcon icon={faClose} className="mr-2" />
                Închide
                </button>
            </div>
            </div>
        </div>
        )}

        {showDeleteModal && deleteSpecialityInfo && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md">
                <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                    Ștergere specialitate
                </h2>

                <h3 className="font-medium text-gray-800 mb-3 text-center">
                    Ești sigur că vrei să ștergi această specialitate?
                </h3>

                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>ID:</strong> {deleteSpecialityInfo.speciality.specialityID}</p>
                    <p><strong>Denumire:</strong> {deleteSpecialityInfo.speciality.name}</p>
                    <p><strong>Programări active:</strong> {deleteSpecialityInfo.activeAppointmentsCount || 0}</p>

                    <div>
                    <p className="font-bold text-gray-700">Locații asociate:</p>
                    <p className="ml-4">
                        Total: {deleteSpecialityInfo.locationsCount.total} &nbsp;
                        <span className="text-green-700 font-medium">({deleteSpecialityInfo.locationsCount.active} active</span>,{" "}
                        <span className="text-red-700 font-medium">{deleteSpecialityInfo.locationsCount.inactive} inactive)</span>
                    </p>
                    </div>

                    <div>
                    <p className="font-bold text-gray-700">Investigații asociate:</p>
                    {deleteSpecialityInfo.investigationsCount > 0 ? (
                        <p className="ml-4">{deleteSpecialityInfo.investigationsCount} investigații</p>
                    ) : (
                        <p className="italic text-gray-400 ml-4">Nicio investigație asociată</p>
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
                    onClick={handleConfirmDeleteSpeciality}
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

export default DisplayTableSpecialities