import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { scheduleData } from "../assets/doctors/scheduleData";

const zile = ['luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata', 'duminica'];

const AvailableScheduleDoctor = ({ id_medic }) => {
  const entry = scheduleData.find((e) => e.id_medic === id_medic);
  const schedule = entry?.schedule;

  if (!schedule) {
    return <p className="text-red-500">Programul nu este disponibil pentru acest medic.</p>;
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-purple-700 flex items-center gap-2">
        <FontAwesomeIcon icon={faClock} /> Program disponibil
      </h2>
      <table className="w-full table-auto border text-sm sm:text-base text-left">
        <tbody>
          {zile.map((zi) => (
            <tr key={zi} className="border-b">
              <td className="capitalize py-2 px-4 font-medium text-gray-700 w-1/3">{zi}</td>
              <td className="py-2 px-4 text-gray-800">
                {schedule[zi] ? schedule[zi] : <span className="text-gray-400 italic">Închis</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailableScheduleDoctor;
