import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../../context/AppContex';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPenToSquare, faLock, faSearchLocation, faMapLocationDot, faBook, faTimes, faCheck, faPlane, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";
import { selectOptions } from '../../../utils/selectOptions';
import CustomSelect from '../../../components/customSelect';
import Loader from '../../../components/lOADER.JSX';
import axios from 'axios';

const SendRequest = ({patientData}) => {

  const {backendUrl } = useContext(AppContext)

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [descriere, setDescriere ] = useState("")
  const [detalii, setDetalii] = useState("")
  const [selectedPriority, setSelectedPriority] = useState(null);

 
  const handleTrimiteCerere = async () => {
  if (!selectedPriority) {
    toast.error("Selectează prioritatea!");
    return;
  }

  if (!descriere.trim()) {
    toast.error("Adaugă o descriere pentru solicitare!");
    return;
  }

  if (!detalii.trim()) {
    toast.error("Adaugă detaliile pentru solicitare!");
    return;
  }

  const payload = {
    userID: patientData.patientID,
    tipSolicitare: "ALTE_SOLICITARI", 
    prioritate: selectedPriority,
    descriere: descriere.trim(),
    detalii:  detalii.trim(),
  };

  try {
    setLoading(true);
    setLoadingMessage("Trimiterea solicitării...");

    const res = await axios.post(`${backendUrl}/api/main/create-request`, payload); // adaptează URL-ul dacă e nevoie

    if (res.data.success) {
      toast.success("Solicitarea a fost trimisă cu succes!");
      setSelectedPriority(null);
      setDescriere("");
      setDetalii("");
    } else {
      toast.error(res.data.message || "Eroare la trimiterea solicitării.");
    }
  } catch (error) {
    console.error("Eroare la trimiterea cererii:", error);
    toast.error("A apărut o eroare la trimiterea solicitării.");
  } finally {
    setLoading(false);
  }
};

  return (
      <div className="mb-10 shadow-xl rounded-3xl bg-white/95 w-full border-l-7 border-r-7 border-b-10 border-purple-100">
            <div className="flex justify-between items-center bg-purple-100 px-4 py-4 rounded-t-2xl">
                <h3 className="text-lg font-bold text-purple-800">
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2"/> 
                    Trimite o solicitare către Admin
                    </h3>
            </div>
    
          <div className="md:gap-7 gap-1">  
              <div className="mb-4 px-5 py-5">
                <label className="block font-medium mb-1">Prioritate *</label>
                <CustomSelect
                  options={selectOptions.priorityOptions}
                  value={selectedPriority}
                  onChange={setSelectedPriority}
                  placeholder="Selectează prioritatea"
                />
              </div>
            
              <div className="border-t-2 border-purple-100 px- px-5 py-5">
                <label className="font-semibold text-lg text-purple-800">
                  Detaliază solicitarea ta
                </label>
                  <textarea
                    value={descriere}
                    onChange={(e) => setDescriere(e.target.value)}
                    placeholder="Ex: Aș dori să schimb poza de profil..."
                    className="border border-gray-300 rounded-md p-2 w-full mt-1"
                    rows={3}
                  />
              </div>

               <div className="border-t-2 border-b-2 border-purple-100 px- px-5 py-5">
                <label className="block font-medium text-gray-700">Detalii * </label>
                  <textarea
                    value={detalii}
                    onChange={(e) => setDetalii(e.target.value)}
                    placeholder="Adaugă detalii solicitari (pasii realizați în întâmpinarea problemei)... "
                    className="border border-gray-300 rounded-md p-2 w-full mt-1"
                    rows={3}
                  />
              </div>

              
            </div>

            <div className="flex justify-center px-5 py-5">
                <button
                  onClick={handleTrimiteCerere}
                  className="btn-outline-purple"
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  Trimite cerere către admin
                </button>
              </div>
    
    
       {loading && <Loader message={loadingMessage} />}
        </div>
  )
}

export default SendRequest