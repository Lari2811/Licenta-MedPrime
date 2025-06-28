import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faArrowDown, faArrowUp, faBell, faBriefcase,  faClock,  faEnvelopeOpenText,  faEye,  faEyeSlash,  faHospital, faLock, faMagnifyingGlass, faMapMarkerAlt, faPaperPlane, faPenToSquare, faStethoscope,  faTools,  faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../../../context/AppContex";
import { useCheckDoctorAccess } from '../../../accessControl/useCheckDoctorAccess '

import CustomSelect from "../../../components/customSelect";
import DisplayRequestsTable from "../Request/DisplayRequestsTable";
import Loader from "../../../components/Loader";

import socket from "../../../socket";

const DoctorRequests = () => {

    useCheckDoctorAccess();
      
    const { backendUrl } = useContext(AppContext);

    const { doctorID } = useParams();

    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const [requestsData, setRequestsData] = useState([]);
    const [error, setError] = useState(null);

    const fetchRequests = async () => {
        try {

        setLoading(true);
        setLoadingMessage("Se încarcă cererile medicului...");

        const res = await axios.get(`${backendUrl}/api/doctor/get-doctor-requests/${doctorID}`);
        if (res.data.success) {
        setRequestsData(res.data.data);
        console.log("Solicitări  medic:", res.data.data);
        } else {
        setError(res.data.message || "Eroare necunoscută");
        }
        } catch (err) {
            console.error("Eroare la fetch:", err);
            setError("Eroare la conectarea cu serverul.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!doctorID) return; 

        fetchRequests();

        socket.on('reqDeleted', () => {
            console.log(' Solicitare stearsa!');
            fetchRequests(); 
            toast.info('Solicitările au fost actualizate!');
            });

    return () => {
      socket.off('reqDeleted');
    };
    }, [doctorID]);

    //contorizare
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    //Filtre ==============================
    const [filterTip, setFilterTip] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPrioritate, setFilterPrioritate] = useState("");
    const [sortOption, setSortOption] = useState("");


    const tipOptions = [
        { value: "", label: "Toate tipurile" },
        { value: "MODIFICARE_DATE_PERSONALE", label: "Modificare date personale" },
        { value: "MODIFICARE_SPECIALITATE", label: "Modificare specialitate" },
        { value: "MODIFICARE_LOCATII_SI_PROGRAM", label: "Modificare locații și program" },
        { value: "ALTE_SOLICITARI", label: "Alte solicitări" },
    ];

    const statusOptions = [
        { value: "", label: "Toate statusurile" },
        { value: "NEASIGNAT", label: "Neasignat" },
        { value: "ASIGNAT", label: "Asignat" },
        { value: "IN_PROGRES", label: "În progres" },
        { value: "FINALIZAT", label: "Finalizat" },
        { value: "RESPINS", label: "Respins" },
    ];

    const prioritateOptions = [
        { value: "", label: "Toate prioritățile" },
        { value: "URGENT", label: "Urgent" },
        { value: "INFORMATIV", label: "Informativ" },
        { value: "NORMAL", label: "Normal" },
    ];

    const sortOptions = [
        { value: "", label: "Fără sortare" },
        { value: "creareAsc", label: (<> <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> <span>Data creare</span> </>) },
        { value: "creareDesc", label: (<> <FontAwesomeIcon icon={faArrowDown} className="mr-1"/> <span>Data creare</span> </>) },
        { value: "updateAsc", label: (<> <FontAwesomeIcon icon={faArrowUp} className="mr-1"/> <span>Data update</span></>) },
        { value: "updateDesc", label: (<> <FontAwesomeIcon icon={faArrowDown} className="mr-1"/> <span>Data update</span></>) },
    ];
    //==========================================

    const filteredRequests = requestsData
        .filter((item) => {
            return (
            (filterTip === "" || item.tipSolicitare === filterTip) &&
            (filterStatus === "" || item.status === filterStatus) &&
            (filterPrioritate === "" || item.prioritate === filterPrioritate) 
            );
        })
        .sort((a, b) => {
            if (!sortOption) return 0;

            if (sortOption === "creareAsc") {
            return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortOption === "creareDesc") {
            return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortOption === "updateAsc") {
            return new Date(a.updatedAt) - new Date(b.updatedAt);
            } else if (sortOption === "updateDesc") {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
            return 0;
        });

     //statistica
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );


  return (
    <div>

        {/* Intro - Cereri */}
        <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center border-b-1 border-gray-200 p-3">
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
                {/* Icon */}
                <FontAwesomeIcon
                icon={faEnvelopeOpenText} 
                className="text-purple-600 md:text-3xl text-3xl sm:mb-0 ml-5"
                />
                {/* Text */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                Solicitări
                <p className="text-gray-600 text-sm font-semibold">
                    Vizualizează și gestionează solicitările tale către administrator.
                </p>
                </h2>
            </div>
        </div>

        {/* Afisare */}
        <div className="px-6 py-3">
            <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-4">    
            
            {/* Filtre */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
                    <h2 className="text-base sm:text-lg md:text-lg font-medium text-gray-800">Filtrează solicitările</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-center">
                   

                    <div className="w-full lg:w-1/4">
                        <CustomSelect
                        options={tipOptions}
                        value={filterTip}
                        onChange={setFilterTip}
                        placeholder="Filtrează după tip"
                        />
                    </div>

                    <div className="w-full lg:w-1/4">
                        <CustomSelect
                        options={statusOptions}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        placeholder="Filtrează după status"
                        />
                    </div>

                    <div className="w-full lg:w-1/4">
                        <CustomSelect
                        options={prioritateOptions}
                        value={filterPrioritate}
                        onChange={setFilterPrioritate}
                        placeholder="Filtrează după prioritate"
                        />
                    </div>

                    <div className="w-full lg:w-1/4">
                        <CustomSelect
                        options={sortOptions}
                        value={sortOption}
                        onChange={setSortOption}
                        placeholder="Sortează"
                        />
                    </div>

                    {/* Resetare */}
                    <button
                    onClick={() => {
                        setFilterTip("");
                        setFilterStatus("");
                        setFilterPrioritate("");
                        setSortOption("");
                        setSearchTerm("");
                        }}
                    className="bg-purple-100 hover:bg-purple-200 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm w-full lg:w-auto"
                    >
                    Resetează
                    </button>
                </div>
                
            </div>

             {/* Navigare pagini */}
            <div>
                {/* Primul rand */}
                <div className="flex items-center justify-center relative my-2 mt-10">
                    <div className="flex-grow border-t border-gray-300 mr-3"></div>
                    <span className="text-gray-700 md:text-base text-sm font-medium whitespace-nowrap">
                    Numărul solicitărilor: <strong>{filteredRequests.length}</strong>
                    </span>
                    <div className="flex-grow border-t border-gray-300 ml-3"></div>
                </div>

                {/* Al doilea rand */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-3 text-sm text-gray-700">
                    
                    {/* Select nr. pe pagina */}
                    <div className="flex items-center gap-2">
                    <span>Arată pe pagină:</span>
                    {[5, 25, 50, 100].map(number => (
                        <button
                        key={number}
                        onClick={() => {
                            setItemsPerPage(number);
                            setCurrentPage(1);
                        }}
                        className={`px-2 py-1 rounded ${
                            itemsPerPage === number
                            ? 'font-bold text-purple-700 underline'
                            : 'hover:text-purple-600'
                        }`}
                        >
                        {number}
                        </button>
                    ))}
                    <span>solicitări</span>
                    </div>

                    {/* Navigare pagini */}
                    <div className="flex items-center gap-3">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                    >
                    
                        ← Anterior
                    </button>
                    <span>{currentPage} din {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                    >
                        Următor →
                    </button>
                    </div>
                </div>
            </div>

            <DisplayRequestsTable
                requests={paginatedRequests}
            />

            {/* Navigare pagini */}
            <div className="flex justify-end items-center gap-3 mt-4 text-sm">
                <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                >
            
                ← Anterior
                </button>
                <span>{currentPage} din {totalPages}</span>
                <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-gray-500 enabled:hover:text-purple-700 disabled:opacity-40"
                >
                Următor →
                </button>
            </div>

            </div>
        </div>


        {loading && <Loader message={loadingMessage} />}
    </div>
  )
}

export default DoctorRequests