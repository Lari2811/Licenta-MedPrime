import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faEdit, faEnvelope, faEye, faHospital,
  faMapMarkerAlt, faStethoscope, faTimesCircle, faTools, faTrashAlt,
  faHashtag,
  faMagnifyingGlass,
  faUserDoctor,
  faSave,
  faSquarePlus,
  faVial,
  faCheck,
  faCheckSquare,
  faSquareXmark
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import DoctorListModal from '../../../components/TableModalList/LocationTable/DoctorListModal';
import SpecialityListModal from '../../../components/TableModalList/LocationTable/SpecialityListModal';
import InvestigationListModal from '../../../components/TableModalList/LocationTable/InvestigationsListModal';
import { assets } from '../../../assets/assets';
import { formatLocationStatus } from '../../../utils/formatStatusLocation';
import { ziuaCorecta } from '../../../utils/ziProgram';
import axios from 'axios';
import { AppContext } from '../../../context/AppContex';
import { toast } from 'react-toastify';


const DisplayTable = ({location }) => {

    const navigate = useNavigate();

    const {backendUrl} = useContext(AppContext)

    const { adminID } = useParams();

    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [showSpecialityModal, setShowSpecialityModal] = useState(false);
    const [showInvestigationModal, setShowInvestigationModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState(null);


    const[deleteLocationInfo, setDeleteLocationInfo] = useState(null)

    const [selectedLocationID, setSelectedLocationID] = useState('');
    const [selectedClinicName, setSelectedClinicName] = useState('');
    const [selectedCounty, setSelectedCounty] = useState('');

    const [loading, setLoading] = useState(false)
    const[loadingMessage, setLoadingMessage] = useState("")
    

     const handleClickDetails = (locationId) => {
        navigate(`/admin/${adminID}/locatii/${locationId}`);
    };  
 
    const handleOpenDoctorModal = (loc) => {
        setSelectedLocationID(loc.locationID);
        setSelectedClinicName(loc.clinicName);
        setSelectedCounty(loc.address.county);
        setShowDoctorModal(true);
    };

    const handleOpenSpecialityModal = (loc) => {
        setSelectedLocationID(loc.locationID);
        setSelectedClinicName(loc.clinicName);
        setSelectedCounty(loc.address.county);
        setShowSpecialityModal(true);
    };

    const handleOpenInvestigationModal = (loc) => {
        setSelectedLocationID(loc.locationID);
        setSelectedClinicName(loc.clinicName);
        setSelectedCounty(loc.address.county);
        setShowInvestigationModal(true);
    };


    // ------------- Stergere -------------
    const handleOpenDeleteModal = async (locationID) => {
        console.log("Delete", locationID)
        try {
            const res = await axios.post(`${backendUrl}/api/admin/get-location-summary`, {
            locationID: locationID
            });

            console.log("info delete", res.data)

            setDeleteLocationInfo(res.data);
            setShowDeleteModal(true);
        } catch (err) {
            console.error("Eroare la preluarea locației:", err);
            toast.error("Nu s-au putut obține informațiile despre locație.");
        }
    };

    const handleConfirmDeleteLocation = async () => {
        if (!deleteLocationInfo?.location?.locationID) {
            toast.error("Lipsă locationID.");
            return;
        }

        try {
            setLoading(true);
            setLoadingMessage("Se șterge locația...");
            
            const res = await axios.delete(`${backendUrl}/api/admin/delete-location/${deleteLocationInfo.location.locationID}`);

            if (res.status === 200) {
            toast.success("Locația a fost ștearsă cu succes.");
            setShowDeleteModal(false);
            setDeleteLocationInfo(null);
            } else {
            toast.error("A apărut o eroare la ștergerea locației.");
            }
        } catch (err) {
            console.error("Eroare la ștergere:", err);
            toast.error("Nu s-a putut șterge locația.");
        } finally {
            setLoading(false);
        }
    };

  return (
    <div>
        {/* Tabel locatii */}
        <div className="overflow-x-auto shadow-md rounded-xl shadow-md bg-white mt-5">
            <table className="min-w-[1600px] w-full text-left text-gray-700">
                <thead className="bg-purple-100 text-purple-900 text-base">
                    <tr>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faHospital} className="mr-2 text-purple-700" />Clinică</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-purple-700" />Locații</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faEnvelope} className="mr-2 text-purple-700" />Contact</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-purple-700" />Status</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faUserDoctor} className="mr-2 text-purple-700" />Medici</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faStethoscope} className="mr-2 text-purple-700" />Specialități</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faVial} className="mr-2 text-purple-700" />Investigații</th>
                        <th className="px-6 py-3"><FontAwesomeIcon icon={faSquarePlus} className="mr-2 text-purple-700" />Creat la</th>
                        <th className="px-6 py-3 text-center"><FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" />Acțiuni</th>
                    </tr>
                </thead>

                    <tbody className="bg-white divide-y divide-gray-200 font-semibold">
                        {location.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="py-6 text-center text-gray-500 italic">
                            Nu există locații care să corespundă filtrului aplicat.
                            </td>
                        </tr>
                        ) : (
                        location.map(loc => (
                            <tr key={loc._id} className="hover:bg-purple-50 transition-colors text-sm">
                                
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                        src={loc.images?.profileImage || assets.location_default}
                                        alt="Profil clinică"
                                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                                        />
                                        <div className="flex flex-col text-center">
                                        <span className="font-medium text-sm text-gray-800">{loc.clinicName}</span>
                                        <span className="text-sm text-center text-gray-500">{loc.locationID}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-sm">{loc.address.county}, {loc.address.city}</td>
                                <td className="px-5 py-4 text-sm">{loc.email}<br />{loc.phone}</td>
                                <td className="px-5 py-4 text-sm">
                                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold ${
                                        loc.status === 'deschis'
                                        ? 'bg-green-100 text-green-700'
                                        : loc.status === 'inchis temporar'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                        <FontAwesomeIcon
                                        icon={
                                            loc.status === 'deschis'
                                            ? faCheckCircle
                                            : loc.status === 'inchis temporar'
                                            ? faTools 
                                            : faTimesCircle
                                        }
                                        />
                                        {loc.status === 'deschis'
                                        ? 'Deschis'
                                        : loc.status === 'inchis temporar'
                                        ? 'Închis Temporar'
                                        : 'Închis Definitiv'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-sm text-center">
                                <button
                                    onClick={() => handleOpenDoctorModal(loc)}
                                    className="cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faUserDoctor} className="mr-2 text-purple-700  text-xl" />
                                </button>
                                </td>

                                <td className="px-5 py-4 text-sm text-center">
                                <button
                                    onClick={() => handleOpenSpecialityModal(loc)}
                                    className="text-purple-500 hover:underline hover:cursor-pointer hover:cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faStethoscope} className="mr-2 text-purple-700  text-xl" />
                                </button>
                                </td>

                                <td className="px-5 py-4 text-sm text-center">
                                    <button
                                        onClick={() => handleOpenInvestigationModal(loc)}
                                        className="text-purple-500 hover:underline hover:cursor-pointer hover:cursor-pointer"
                                    >
                                    <FontAwesomeIcon icon={faVial} className="mr-2 text-purple-700  text-xl" />
                                    </button>
                                </td>
                                
                                <td className="px-5 py-4 text-sm text-center">
                                    <div className="flex flex-col">
                                        <span>{new Date(loc.createdAt).toLocaleDateString('ro-RO')}</span>
                                        <span className="text-xs text-gray-500">
                                        {new Date(loc.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-base text-center">
                                    <div className="flex justify-center gap-3 text-lg text-purple-500">

                                    <button
                                        title="Vezi detalii"
                                        className='text-purple-500 hover:text-purple-600 hover:cursor-pointer'

                                        onClick={() => {
                                            setSelectedLocation(loc);
                                            setShowInfoModal(true);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faEye} className='hover:text-purple-900  hover:cursor-pointer' />
                                        </button>

                                    <button
                                        title="Ștergere locație"
                                        className='text-red-500 hover:text-red-600 hover:cursor-pointer'
                                        onClick={() => {
                                            handleOpenDeleteModal(loc.locationID)
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} className='hover:text-red-900  hover:cursor-pointer' />
                                    </button>


                                
                                    </div>
                                </td>
                            </tr>
                    ))
                    )}
                </tbody>
            </table>
        </div>

        <DoctorListModal
            isOpen={showDoctorModal}
            onClose={() => setShowDoctorModal(false)}
            locationID={selectedLocationID}
            clinicName={selectedClinicName}
            county={selectedCounty}
        />
        
        <SpecialityListModal
            isOpen={showSpecialityModal}
            onClose={() => setShowSpecialityModal(false)}
            locationID={selectedLocationID}
            clinicName={selectedClinicName}
            county={selectedCounty}
        />

        <InvestigationListModal
            isOpen={showInvestigationModal}
            onClose={() => setShowInvestigationModal(false)}
            locationID={selectedLocationID}
            clinicName={selectedClinicName}
            county={selectedCounty}
        />


        {showInfoModal && selectedLocation && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative max-h-[85vh] overflow-y-auto">
                    <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-7 text-center">Profil locație medicală</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                        <p><strong>Nume:</strong> {selectedLocation.clinicName}</p>
                        <p><strong>Email:</strong> {selectedLocation.email}</p>
                        <p><strong>Telefon:</strong> {selectedLocation.phone}</p>
                        <p className="text-sm font-medium text-gray-800">
                            <strong>Status:</strong>
                            <span className={`ml-2 inline-flex items-center gap-1 ${formatLocationStatus(selectedLocation.status).color}`}>
                                {formatLocationStatus(selectedLocation.status).label}
                                <FontAwesomeIcon icon={formatLocationStatus(selectedLocation.status).icon} />
                            </span>
                        </p>
                        <p><strong>Creată:</strong> {new Date(selectedLocation.createdAt).toLocaleString("ro-RO")}</p>
                        <p><strong>Ultima actualizare:</strong> {new Date(selectedLocation.updatedAt).toLocaleString("ro-RO")}</p>
                    </div>

                        {/* Info profil */}
                        {selectedLocation.infoProfile && (
                            <div className="mt-4">
                            <p className="font-semibold text-purple-700">Descriere:</p>
                            <p className="text-sm text-gray-700">{selectedLocation.infoProfile}</p>
                            </div>
                        )}

                    

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Coloana 1 - Alte info, adresa, facilitati */}
                        <div className="space-y-4">
                            {/* Alte info */}
                            {selectedLocation.otherInformations?.length > 0 && (
                            <div>
                                <p className="font-semibold text-purple-700">Alte informații:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700">
                                {selectedLocation.otherInformations.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                                </ul>
                            </div>
                            )}

                            {/* Adresa */}
                            <div>
                            <p className="font-semibold text-purple-700">Adresă:</p>
                            <p className="text-sm text-gray-700">
                                {selectedLocation.address?.address_details}, {selectedLocation.address?.city}, {selectedLocation.address?.county}
                            </p>
                            </div>

                            {/* Facilitati */}
                            {selectedLocation.facilities?.length > 0 && (
                            <div>
                                <p className="font-semibold text-purple-700">Facilități:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700">
                                {selectedLocation.facilities.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                                </ul>
                            </div>
                            )}
                        </div>

                        {/* Coloana 2 - Program */}
                        <div>
                            <p className="font-semibold text-purple-700 mb-2">Program săptămânal:</p>
                            {selectedLocation.schedule?.length > 0 ? (
                            <ul className="text-sm text-gray-700 list-disc list-inside">
                                {selectedLocation.schedule.map((item, idx) => (
                                <li key={idx}>
                                    {ziuaCorecta(item.day)}: {item.startTime} - {item.endTime}
                                </li>
                                ))}
                            </ul>
                            ) : (
                            <p className="italic text-gray-500 text-sm">Fără program definit.</p>
                            )}
                        </div>
                    </div>

                    {selectedLocation.images?.gallery?.length > 0 && (
                        <div className="mb-6">
                            <p className="font-semibold text-purple-700 mb-2">Imagine profil:</p>
                            <div className="grid grid-cols-4 gap-3">
                            
                                <img
                                    src={selectedLocation.images.profileImage}
                                    alt={`Profil`}
                                    className="h-32 w-full object-cover rounded-md shadow-sm"
                                />
                            </div>
                        </div>
                    )}

                    {selectedLocation.images?.gallery?.length > 0 && (
                        <div className="mb-6">
                            <p className="font-semibold text-purple-700 mb-2">Galerie locație:</p>
                            <div className="grid grid-cols-4 gap-3">
                            {selectedLocation.images.gallery.map((img, i) => (
                                <img
                                key={i}
                                src={img}
                                alt={`Imagine ${i + 1}`}
                                className="h-32 w-full object-cover rounded-md shadow-sm"
                                />
                            ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Inchide */}
                    <div className="flex justify-center mt-6">
                        <button
                        onClick={() => {
                            setShowInfoModal(false);
                            setSelectedLocation(null);
                        }}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer"
                        >
                        Închide
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showDeleteModal && deleteLocationInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md">
            <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                Ștergere locație?
            </h2>
             <h3 className="font-medium text-gray-800 mb-3 text-center">
                Ești sigur că vrei să ștergi această locație?
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
                <p><strong>ID:</strong> {deleteLocationInfo.location.locationID}</p>
                <p><strong>Denumire:</strong> {deleteLocationInfo.location.clinicName}</p>
                <p><strong>Adresa:</strong> {deleteLocationInfo.location.address?.address_details}, {deleteLocationInfo.location.address?.city}, {deleteLocationInfo.location.address?.county}</p> 

                {/* Info statistice */}
                <p><strong>Programări active:</strong> {deleteLocationInfo.activeAppointmentsCount || 0}</p>
                <p>
                    <strong>Specialități asociate:</strong>{" "}
                    {(deleteLocationInfo?.specialitiesCount || 0)}
                    <span className="text-sm text-gray-500 ml-2">
                        ({deleteLocationInfo?.activeSpecialitiesCount || 0} <FontAwesomeIcon icon={faCheckSquare} className='text-green-600'/>, {deleteLocationInfo?.inactiveSpecialitiesCount || 0} <FontAwesomeIcon icon={faSquareXmark} className='text-red-600'/>)
                    </span>
                </p>

                <p>
                    <strong>Investigații asociate:</strong>{" "}
                    {(deleteLocationInfo?.investigationsCount || 0)}
                    <span className="text-sm text-gray-500 ml-2">
                        ({deleteLocationInfo?.activeInvestigationsCount || 0} <FontAwesomeIcon icon={faCheckSquare} className='text-green-600'/>, {deleteLocationInfo?.inactiveSpecialitiesCount || 0} <FontAwesomeIcon icon={faSquareXmark} className='text-red-600'/>)
                    </span>
                </p>

                <p><strong>Medici asociați:</strong> {deleteLocationInfo.associatedDoctors.length || 0}</p>
            </div>

            <div className="flex justify-end mt-6 gap-3">
                <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
                >
                Anulează
                </button>
                <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer"
                onClick={() => handleConfirmDeleteLocation()}
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

export default DisplayTable