import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AppContext } from '../../../context/AppContex';

const DeleteDoctor = ({doctorID, onClose, onDoctorDeleted}) => {

    const { backendUrl } = useContext(AppContext);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
      setIsDeleting(true);

      try {
        const response = await axios.delete(`${backendUrl}/api/admin/delete-doctor/${doctorID}`);

        console.log("Răspuns backend la ștergere:", response);

        if (response.status === 200 && response.data?.success) {
          toast.success(response.data.message || "Doctorul a fost șters cu succes!");

          if (onDoctorDeleted) {
            onDoctorDeleted();
          }
          
          onClose();
          return;
        } else {
          toast.error(response.data.message || "Eroare la ștergerea doctorului.");
        }

      } catch (err) {
        toast.error("Eroare server la ștergere.");
        console.error("Eroare la ștergere:", err);
      } finally {
        setIsDeleting(false);
      }
    };

  

  return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md text-center">
        <div className="w-12 h-1 bg-red-600 rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmare ștergere</h3>
        <p className="text-gray-600 mb-6">
          Ești sigur că vrei să ștergi această specialitate?
          <br />
          <span className="font-medium text-red-600">{doctorID}</span>
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
            disabled={isDeleting}
          >
            Nu
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
            disabled={isDeleting}
          >
           Da
          </button>
          {isDeleting && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-5 rounded shadow-lg flex flex-col items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-red-600" viewBox="0 0 24 24">
                    <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    />
                    <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
                <p className="text-sm text-gray-700 font-medium">Se șterge specialitatea...</p>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default DeleteDoctor