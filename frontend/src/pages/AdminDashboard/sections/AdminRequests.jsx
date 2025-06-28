import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/AppContex";
import axios from "axios";

import { faArrowDown, faArrowUp, faEnvelopeOpenText, faMagnifyingGlass, faTable } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RequestBoard from "../RequestsSection/RequestBoard";

import CustomSelect from "../../../components/customSelect";
import DisplayRequestsTableAdmin from "../RequestsSection/DisplayRequestsTableAdmin";

import { toast } from "react-toastify";
import Loader from "../../../components/Loader";
import { useCheckAdminAccess } from "../../../accessControl/useCheckAdminAccess";


const formatText = (text) => {
  if (!text) return "-";
  return text
    .toLowerCase()
    .split("_")
    .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(" ");
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};


const AdminRequests = () => {

    useCheckAdminAccess(); 
    
    const { backendUrl } = useContext(AppContext);

    const [requestsData, setRequestsData] = useState([]);
    const [error, setError] = useState(null);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [isBoardExpanded, setIsBoardExpanded] = useState(true);


    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const token = localStorage.getItem("authToken");
    let adminID = null;

    if (token) {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    adminID = decoded.linkedID; 
    }



    const fetchRequests = async () => {
        try {

            setLoading(true);
            setLoadingMessage("Se încarcă cererile medicului...");

            const res = await axios.get(`${backendUrl}/api/doctor/get-all-requests`);
            
            
            if (res.data.success) {
                
                const filteredRequests = res.data.data.filter((req) => req.adminID === adminID);
                setRequestsData(filteredRequests);
        }
        } catch (err) {
        console.error("Eroare la fetch:", err);
        } finally {
            setLoading(false);
        }
        
    };

    useEffect(() => {
        fetchRequests();
    }, []);
   
    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

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


    //==========================================


  return (
    <div className="">

    {/* Intro - Cereri */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 mb-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  <FontAwesomeIcon icon={faEnvelopeOpenText} className='mr-2 text-purple-600' /> Solicitări
                </h1>
                <p className="text-sm text-gray-500">Vizualizează și gestionează solicitările tale.</p>
              </div>
              
      </div>

        <div className="flex justify-end mb-2">
            <button
                onClick={() => setIsBoardExpanded((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm 
                            transition-all duration-300 transform hover:scale-102
                            ${isBoardExpanded ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white' : 'bg-white text-purple-700 border border-purple-600 hover:bg-purple-50'}`}
                >
                {isBoardExpanded ? (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                    Restrânge boardul
                </>
                ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
                    </svg>
                    Extinde boardul
                </>
                )}
            </button>
        </div>

        {/* Tabla */}
        <RequestBoard isBoardExpanded={isBoardExpanded} />

        {/* Afisare */}
       
        <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-10 mt-10">    

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
                    <span>specialități</span>
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


            <DisplayRequestsTableAdmin
                requests = {paginatedRequests}
                fetchRequests={fetchRequests}
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
        
        

      
       {loading && <Loader message={loadingMessage} />}
    </div>
  );
};
export default AdminRequests;
