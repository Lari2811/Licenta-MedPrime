import React, { useState, useEffect, useRef, useContext } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faArrowDown, faArrowUp, faBell, faBriefcase,  faClock,  faEnvelopeOpenText,  faEye,  faEyeSlash,  faHospital, faLock, faMagnifyingGlass, faMapMarkerAlt, faPaperPlane, faPenToSquare, faStethoscope,  faTools,  faUserDoctor } from "@fortawesome/free-solid-svg-icons";

import CustomSelect from "../../../components/customSelect";

import { useCheckAdminAccess } from '../../../accessControl/useCheckAdminAccess';
import { AppContext } from '../../../context/AppContex';
import DisplayBacklogTable from "../RequestsSection/DisplayBacklogTable";
import Loader from "../../../components/Loader";

const AdminBacklogReq = () => {

  useCheckAdminAccess();

  const { backendUrl } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [requestsData, setRequestsData] = useState([]);
  const [error, setError] = useState(null);

  

  const fetchRequests = async () => {
  try {
    setLoading(true);
    setLoadingMessage("Se încarcă cererile...");

    const res = await axios.get(`${backendUrl}/api/doctor/get-all-requests`);
    if (res.data.success) {
      const toateCererile = res.data.data;
      const cereriNeasignate = toateCererile.filter(req => req.status === "NEASIGNAT");

      setRequestsData(cereriNeasignate);
      console.log("Cererile neasignate:", cereriNeasignate);
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

    
 //get Data from DB
  useEffect(() => {
    fetchRequests();
  }, []);

  //contorizare
      const [currentPage, setCurrentPage] = useState(1);
      const [itemsPerPage, setItemsPerPage] = useState(5);
  
      //Filtre ==============================
      // stare pentru fiecare filtru
      const [filterTip, setFilterTip] = useState("");
      const [filterPrioritate, setFilterPrioritate] = useState("");
      const [sortOption, setSortOption] = useState("");
  
  
      const tipOptions = [
          { value: "", label: "Toate tipurile" },
          { value: "MODIFICARE_DATE_PERSONALE", label: "Modificare date personale" },
          { value: "MODIFICARE_SPECIALITATE", label: "Modificare specialitate" },
          { value: "MODIFICARE_LOCATII_SI_PROGRAM", label: "Modificare locații și program" },
          { value: "ALTE_SOLICITARI", label: "Alte solicitări" },
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
      ];
  
  
      //==========================================
  
      const filteredRequests = requestsData
    .filter((item) => {
      return (
        (filterTip === "" || item.tipSolicitare === filterTip) &&
        (filterPrioritate === "" || item.prioritate === filterPrioritate) 
      );
    })
    .sort((a, b) => {
      if (!sortOption) return 0;
  
      if (sortOption === "creareAsc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortOption === "creareDesc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
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
    <div className=''>

      {/* Intro - Cereri */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-md rounded-xl px-6 py-4 mb-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  <FontAwesomeIcon icon={faEnvelopeOpenText} className='mr-2 text-purple-600' /> Solicitări
                </h1>
                <p className="text-sm text-gray-500">Vizualizează și gestionează solicitările NEASIGNATE din backlog.</p>
              </div>
              
      </div>


        {/* Afisare */}
        
        <div className="bg-white rounded-xl shadow-md px-6 py-4 mb-1">   

            {/* Filtre */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-purple-700" />
                    <h2 className="text-base sm:text-lg md:text-lg font-medium text-gray-800">Filtrează solicitările</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-center">
                   

                    <div className="w-full lg:w-1/3">
                        <CustomSelect
                        options={tipOptions}
                        value={filterTip}
                        onChange={setFilterTip}
                        placeholder="Filtrează după tip"
                        />
                    </div>

                    
                    <div className="w-full lg:w-1/3">
                        <CustomSelect
                        options={prioritateOptions}
                        value={filterPrioritate}
                        onChange={setFilterPrioritate}
                        placeholder="Filtrează după prioritate"
                        />
                    </div>

                    <div className="w-full lg:w-1/3">
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

            <DisplayBacklogTable
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
  )
}

export default AdminBacklogReq