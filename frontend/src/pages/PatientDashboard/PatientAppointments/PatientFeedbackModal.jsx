import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};



const PatientFeedbackModal = ({ appointment, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");



  const handleSubmit = () => {
    if (rating === 0) {
      alert("Te rugăm să alegi un rating.");
      return;
    }
   

    onSubmit({
      appointmentID: appointment.appointmentID,
      patientID: appointment.patientID,
      doctorID: appointment.doctorID,
      rating,
      comment: comment.trim() ? [comment.trim()] : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-lg">
        <div className="w-12 h-1 bg-purple-600 rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Oferă feedback</h2>

        {/* Info investigatie */}
        <div className="mb-4 text-sm text-gray-600 space-y-1">
          <p><span className="font-semibold">Medic:</span> Dr. {appointment?.doctorName || "N/A"}</p>
          <p><span className="font-semibold">Investigație:</span> {appointment?.investigationName || "N/A"}</p>
          <p><span className="font-semibold">Locație:</span> {appointment?.locationName || "N/A"}</p>
          <p><span className="font-semibold">Data:</span> {formatDate(appointment?.date) || "N/A"}</p>
          <p><span className="font-semibold">Ora:</span> {appointment?.startTime} - {appointment?.endTime} </p>
        </div>

        {/* Stele rating */}
        <div className="mb-4 text-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={faStar}
              className={`text-2xl cursor-pointer transition-colors duration-200 ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
          <p className="text-xs text-gray-500 mt-1">Alege un rating pentru experiența ta</p>
        </div>

        {/* Comentariu */}
        <textarea
          rows={4}
          className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-purple-400"
          placeholder="Scrie un comentariu despre vizită (opțional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* Butoane */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
          >
            Trimite
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
          >
            Renunță
          </button>
        </div>
      </div>

    </div>
  );
};

export default PatientFeedbackModal;
