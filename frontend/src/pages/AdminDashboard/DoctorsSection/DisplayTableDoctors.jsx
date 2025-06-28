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
  faCircleInfo
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

const DisplayTableDoctors = ({doctors}) => {

    const navigate = useNavigate();

    const {backendUrl} = useContext(AppContext)
    const { adminID } = useParams();
        

    const handleClickDetails = (doctorID) => {
        navigate(`/admin/${adminID}/medici/${doctorID}`);
    }; 

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState(null);


    const[deleteDoctorInfo, setDeleteDoctorInfo] = useState(null)

    const [loading, setLoading] = useState(false)
    const[loadingMessage, setLoadingMessage] = useState("")



    const handleOpenDeleteModal = async (doctorID) => {
        try {
            const res = await axios.post(`${backendUrl}/api/admin/get-doctor-summary`, {
                doctorID: doctorID
            });

            setDeleteDoctorInfo(res.data);
            setShowDeleteModal(true);

            console.log("Info-delete",deleteDoctorInfo)
            
        } catch (err) {
            console.error("Eroare la preluarea doctorului:", err); 
            toast.error("Nu s-au putut obține informațiile despre medic.");
        }
    }

    const handleConfirmDeleteDoctor = async () => {
        if (!deleteDoctorInfo?.doctor?.doctorID) {
            toast.error("Lipsă doctorID.");
            return;
        }

        try {
            setLoading(true);
            setLoadingMessage("Medicul se șterge")
            const res = await axios.delete(`${backendUrl}/api/admin/delete-doctor/${deleteDoctorInfo.doctor.doctorID}`);

            if (res.status === 200) {
                toast.success("Medicul a fost șters cu succes.");
                setShowDeleteModal(false);
                setDeleteDoctorInfo(null);
                } else {
            toast.error("A apărut o eroare la ștergerea medicului.");
            }
        } catch (err) {
            console.error("Eroare la ștergerea medicului:", err);
            toast.error("Nu s-a putut șterge medicul.");
        } finally {
            setLoading(false);
        }
    };



  return (
    <div> 
        <div className="overflow-x-auto shadow-md rounded-xl shadow-md bg-white mt-5">
            <table className="min-w-[1300px] w-full text-sm text-left text-gray-700">
                <thead className="bg-purple-100 text-purple-900">
                    <tr> 
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faUserDoctor} className="mr-2 text-purple-700" />Medic</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faStethoscope} className="mr-2 text-purple-700" />Specialitate</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faBook} className="mr-2 text-purple-700" />Tip</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-purple-700" />Locați</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faStar} className="mr-2 text-purple-700" />Rating</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faSpinner} className="mr-2 text-purple-700" />Status</th>
                    <th className="px-6 py-3"><FontAwesomeIcon icon={faSuitcaseMedical} className="mr-2 text-purple-700" />Profil</th>
                    <th className="px-6 py-3 text-center"><FontAwesomeIcon icon={faTools} className="mr-2 text-purple-700" />Acțiuni</th>
                    </tr>
                </thead>

               <tbody className="bg-white divide-y divide-gray-200">
                    {doctors.length === 0 ? (
                        <tr>
                        <td colSpan="8" className="py-6 text-center text-gray-500 italic">
                            Nu există medici înregistrati momentan.
                        </td>
                        </tr>
                    ) : (
                        doctors.map(doc => (
                        <tr key={doc._id} className="hover:bg-purple-50 transition-colors">
                            {/*  Medic */}
                            <td className="px-5 py-4">
                            <div className="flex items-center gap-4">
                                <img
                                src={doc.profileImage || assets.doctor_default}
                                alt="Profil medic"
                                className="w-12 h-12 rounded-full object-cover border border-gray-300"
                                />
                                <div>
                                <div className="font-medium text-gray-800">{doc.lastName} {doc.firstName}</div>
                                <div className="text-sm text-gray-600">ID: {doc.doctorID}</div>
                                </div>
                            </div>
                            </td>

                            {/*  Specialitate */}
                            <td className="px-5 py-4 text-sm">
                                {doc.specialities && doc.specialities.length > 0 ? (
                                    doc.specialities.map((spec, i) => (
                                    <div key={i} className="text-gray-700">{spec.specialityName}</div>
                                    ))
                                ) : (
                                    <span className="italic text-gray-400">Fără specialitate</span>
                                )}
                            </td>

                            {/* Tip*/}
                            <td className="px-5 py-4 text-sm">
                                {doc.type ? (
                                    <p>
                                    {doc.type === 'rezident' && 'Medic Rezident'}
                                    {doc.type === 'specialist' && 'Medic Specialist'}
                                    {doc.type === 'primar' && 'Medic Primar'}
                                    </p>
                                ) : (
                                    <span className="italic text-gray-400">Nespecificat</span>
                                )}
                            </td>


                            {/* Locatii */}
                            <td className="px-5 py-4 text-sm">
                                {doc.locations && doc.locations.length > 0 ? (
                                    doc.locations.map((loc, i) => (
                                    <div key={i} className="text-gray-700">
                                        {loc.locationName}
                                    </div>
                                    ))
                                ) : (
                                    <span className="italic text-gray-400">Fără locație</span>
                                )}
                            </td>


                            {/*  Rating */}
                            <td className="px-5 py-4 text-sm">
                                {typeof doc.rating === "number" ? doc.rating.toFixed(1) : "0.0"} / 5<br />
                                <span className="text-xs text-gray-500">{doc.ratingCount || 0} recenzii</span>
                            </td>

                            {/*  Status */}
                            <td className="px-5 py-4 text-sm">
                            {statusConfig[doc.status] ? (
                                <span className={`inline-flex items-center gap-2 font-medium ${statusConfig[doc.status].color}`}>
                                <FontAwesomeIcon icon={statusConfig[doc.status].icon} />
                                {statusConfig[doc.status].text}
                                </span>
                            ) : (
                                <span className="text-gray-400 italic">Status necunoscut</span>
                            )}
                            </td>

                            {/* Profil */}
                            <td className="px-5 py-4 text-center">
                            {doc.status === "in asteptare" ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <span className="text-red-600 font-semibold">Incomplet</span>
                                    <FontAwesomeIcon icon={faBell} className="text-red-600 hover:text-red-800" />
                                </div>
                            ) : (
                                <div>
                                    <span className="text-green-600 font-semibold">Completat</span>
                                    <FontAwesomeIcon icon={faClipboardCheck} className="text-green-600 hover:text-green-800 ml-2" />
                                </div>
                            )}
                            </td>


                            {/*  Actiuni */}
                            <td className="px-5 py-4 text-sm text-center">
                                <div className="flex justify-center gap-3 text-lg text-purple-500">
    
                                <button
                                    title="Vezi detalii"
                                    onClick={() => {
                                        setSelectedDoctor(doc);
                                        setShowInfoModal(true);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faEye} className='hover:text-purple-900 cursor-pointer' />
                                    </button>
    
                                
                                <button
                                    title="Șterge"
                                    onClick={() => handleOpenDeleteModal(doc.doctorID) }
                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </button>
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                
            </table>


            {showDeleteModal && deleteDoctorInfo && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md">
                        <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
                         <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                            Ștergere medicul
                        </h2>

                        <h3 className="font-medium text-gray-800 mb-3 text-center">
                            Ești sigur că vrei să ștergi acest medic?
                        </h3>

                        <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Nume:</strong> {deleteDoctorInfo.doctor.doctorID} - {deleteDoctorInfo.doctor.fullName}</p>
                        <p><strong>Email:</strong> {deleteDoctorInfo.doctor.email}</p>
                        <p><strong>Programări active:</strong> {deleteDoctorInfo.activeAppointmentsCount}</p>

                        <div>
                            <p className="font-bold text-gray-700">Locații asociate:</p>
                            {deleteDoctorInfo.locations.length > 0 ? (
                            <ul className="list-disc list-inside ml-4">
                                {deleteDoctorInfo.locations.map((loc, idx) => (
                                <li key={idx}>{loc.locationID} - {loc.clinicName}</li>
                                
                                ))}
                            </ul>
                            ) : (
                            <p className="italic text-gray-400 ml-4">Nicio locație asociată</p>
                            )}
                        </div>

                        <div>
                            <p className="font-bold text-gray-700">Specialități asociate:</p>
                            {deleteDoctorInfo.specialities.length > 0 ? (
                            <ul className="list-disc list-inside ml-4">
                                {deleteDoctorInfo.specialities.map((spec, idx) => (
                                <li key={idx}>{spec.specialityID} - {spec.specialityName}</li>
                                ))}
                            </ul>
                            ) : (
                            <p className="italic text-gray-400 ml-4">Nicio specialitate asociată</p>
                            )}
                        </div>
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
                            onClick={handleConfirmDeleteDoctor}
                        >
                            Confirmă Ștergerea
                        </button>
                        </div>
                    </div>
                </div>
            )}

           {showInfoModal && selectedDoctor && (
                  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative max-h-[85vh] overflow-y-auto">
                        <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-7 text-center">  Profil detaliat medic</h2>

                    {/* Date personale */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
                        <p><strong>Nume:</strong> {selectedDoctor.lastName} {selectedDoctor.firstName}</p>
                        <p><strong>Email:</strong> {selectedDoctor.email}</p>
                        <p><strong>Telefon:</strong> {selectedDoctor.phone}</p>
                        <p><strong>Parafă:</strong> {selectedDoctor.parafaCode}</p>
                        <p><strong>CNP:</strong> {selectedDoctor.cnp}</p>
                        <p><strong>Data nașterii:</strong> {selectedDoctor.birthDate}</p>
                        <p><strong>Gen:</strong> {selectedDoctor.gender}</p>
                        <p><strong>Vârstă:</strong> {selectedDoctor.age}</p>
                        <p><strong>Status:</strong> {selectedDoctor.status}</p>
                        <p><strong>Tip:</strong> {selectedDoctor.type}</p>
                    </div>

                    {/* Studii */}
                    <div className="mt-6">
                        <p className="font-semibold text-purple-700">Studii:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                        {selectedDoctor.studies?.map((study, i) => (
                            <li key={i}>{study}</li>
                        ))}
                        </ul>
                    </div>

                    {/* Certificari */}
                    <div className="mt-4">
                        <p className="font-semibold text-purple-700">Certificări:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                        {selectedDoctor.certifications?.map((cert, i) => (
                            <li key={i}>{cert}</li>
                        ))}
                        </ul>
                    </div>

                    {/* Experienta */}
                    <div className="mt-4">
                        <p className="font-semibold text-purple-700">Experiență:</p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                        {selectedDoctor.experience?.map((exp, i) => (
                            <li key={i}>{exp}</li>
                        ))}
                        </ul>
                    </div>

                    {/* Limbi vorbite */}
                    <div className="mt-4">
                        <p className="font-semibold text-purple-700">Limbi vorbite:</p>
                        <p className="text-sm text-gray-700">{selectedDoctor.languagesSpoken?.join(", ")}</p>
                    </div>

                    {/* Specialitati */}
                    <div className="mt-4">
                        <p className="font-semibold text-purple-700">Specialități:</p>
                        {selectedDoctor.specialities?.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-700">
                            {selectedDoctor.specialities.map((spec, i) => (
                            <li key={i}>{spec.specialityName}</li>
                            ))}
                        </ul>
                        ) : <p className="italic text-gray-500 text-sm">Fără specialitate</p>}
                    </div>

                    {/* Locatii + program */}
                    <div className="mt-4">
                    <p className="font-semibold text-purple-700 mb-2">Locații și program:</p>
                    {selectedDoctor.locations?.length > 0 ? (
                        <div className="space-y-4">
                        {selectedDoctor.locations.map((loc, i) => (
                            <div key={i} className="border rounded p-3 bg-gray-50">
                            <p className="text-sm font-medium text-gray-800">{loc.locationName}</p>
                            <p className="text-sm text-gray-600 italic">{loc.address?.address_details}, {loc.address?.city}, {loc.address?.county}</p>

                            {/* Program */}
                            {loc.schedule?.length > 0 ? (
                                <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                                {loc.schedule.map((item, idx) => (
                                    <li key={idx}>
                                    {ziuaCorecta(item.day)}: {item.startTime} - {item.endTime}
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className="text-sm italic text-gray-400 mt-2">Fără program specificat</p>
                            )}
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="italic text-gray-500 text-sm">Fără locații</p>
                    )}
                    </div>


                    {/* Rating si programari */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                        <p><strong>Rating:</strong> {selectedDoctor.rating?.toFixed(1)} / 5</p>
                        <p><strong>Recenzii:</strong> {selectedDoctor.ratingCount || 0}</p>
                    </div>

                    {/* Inchide */}
                    <div className="flex justify-center mt-6">
                        <button 
                        onClick={() => {
                            setShowInfoModal(false);
                            setSelectedDoctor(null);
                        }}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer"
                        >
                        Închide
                        </button>
                    </div>

                    </div>
                </div>
            )}
        </div>

        
    </div>
  )
}
export default DisplayTableDoctors