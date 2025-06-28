import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const FeedbackCard = ({ feedback }) => {
  const {
    appointmentID,
    investigationName,
    createdAt,
    rating,
    comment,
    patientInfo,
    appointmentInfo,
  } = feedback;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateStr) => {
    return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
  };

  return (
    <div className="border border-gray-300 rounded-xl p-4 shadow-md bg-white flex flex-col justify-between h-full">
      {/* Header info */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-md text-gray-500">
          <span className="font-semibold">Appointment ID:</span> {appointmentID}
        </div>
      
      </div>

      {/* Grid info section */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm  text-gray-600 mb-4">
        <div className="font-semibold">Data programării:</div>
        <div className="font-medium">{formatDate(appointmentInfo?.date)}</div>

        <div className="font-semibold">Interval orar:</div>
        <div className="font-medium">{appointmentInfo?.startTime} - {appointmentInfo?.endTime}</div>

        <div className="font-semibold">Investigație:</div>
        <div className="font-medium">{investigationName || "Nespecificat"}</div>

        <div className="font-semibold">Pacient:</div>
        <div className="font-medium">{patientInfo?.lastName || "Anonim"} {patientInfo?.firstName || ""}</div>
      </div>
      
      {/* Rating */}
        <div className="flex items-center mb-3">
        {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
            key={i}
            icon={faStar}
            className={`h-5 w-5 ${
                i < rating ? "text-yellow-400" : "text-gray-300"
            }`}
            />
        ))}
        <span className="ml-2 text-sm text-gray-600 font-semibold">({rating}/5)</span>
        </div>

        {/* Comentariu */}
        <div className="bg-gray-50 p-4 rounded-lg border text-gray-700 mb-3">
        <p className="text-sm italic font-semibold">„{comment}”</p>
        </div>

        {/* Data feedback */}
        <p className="text-sm text-gray-400 text-right font-mono">
        {formatDateTime(new Date(createdAt), "dd.MM.yyyy HH:mm")}
        </p>
    </div>
  );
};

export default FeedbackCard;
