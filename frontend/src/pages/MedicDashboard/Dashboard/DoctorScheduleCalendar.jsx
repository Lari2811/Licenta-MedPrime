import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatAppointmentStatus } from "../../../utils/formatAppointmentStatus";

const DoctorScheduleCalendar = ({ appointments }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(startOfWeek.setDate(startOfWeek.getDate() + diffToMonday));

    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    });

    setWeekDays(week);
  }, []);

  const selectedDateString = selectedDate.toISOString().split("T")[0];
  const filteredAppointments = (appointments || []).filter(a => a.date === selectedDateString);

  const formatTime = (time) => time?.slice(0, 5) || "";

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Calendar Programări</h3>
      </div>

      {/* Zilele saptamani */}
      <div className="flex border-b">
        {weekDays.map((day, index) => {
          const isSelected = selectedDate.toDateString() === day.toDateString();
          return (
            <div
              key={index}
              className={`flex-1 p-3 text-center cursor-pointer ${
                isSelected ? "border-b-2 border-purple-600 font-semibold" : ""
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString("ro-RO", { weekday: "short" })}
              </div>
              <div className={`text-lg ${isSelected ? "text-purple-600" : "text-gray-700"}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista programari */}
      <div className="p-4 divide-y">
        {filteredAppointments.length === 0 && (
          <div className="text-gray-500 italic py-4 text-center">
            Nu există programări pentru această zi.
          </div>
        )}

        {filteredAppointments.map((slot, index) => {
            const statusInfo = formatAppointmentStatus(slot.status);
            return (
                <div key={index} className="py-3 flex items-center">
                <div className="w-20 text-gray-600 font-medium">
                    {formatTime(slot.endTime)}
                </div>
                <div
                    className={`flex-1 ml-4 p-3 rounded-lg border-l-4 ${statusInfo.bg} ${
                    statusInfo.color.replace("text-", "border-")
                    }`}
                >
                    <div className="flex justify-between">
                    <div>
                        <h4 className="font-semibold text-gray-800">{slot.patientName}</h4>
                        <p className="text-md text-gray-600">{slot.investigationName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-white font-semibold ${statusInfo.color} ${statusInfo.bg}`}
                        >
                        <FontAwesomeIcon icon={statusInfo.icon} className="text-sm" />
                        {statusInfo.label}
                        </span>
                        
                    </div>
                    </div>
                </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default DoctorScheduleCalendar;
