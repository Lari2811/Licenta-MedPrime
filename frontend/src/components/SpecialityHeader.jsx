import React, { useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContex";

const SpecialityHeader = () => {
  const { specialitate } = useParams();
  const { specialityData } = useContext(AppContext);

  const currentSpeciality = specialityData.find(
    (s) => s.speciality.toLowerCase() === specialitate.toLowerCase()
  );

  if (!currentSpeciality) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col gap-4 mb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/" className="hover:underline hover:text-purple-600">
          Acasă
        </Link>
        <span>›</span>
        <Link to="/specialitati" className="hover:underline hover:text-purple-600">
          Specialități
        </Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">{currentSpeciality.speciality}</span>
      </nav>

      {/* Titlu și imagine */}
      <div className="flex items-center gap-5">
        <img
          src={currentSpeciality.image}
          alt={currentSpeciality.speciality}
          className="w-20 h-20 rounded-full object-cover bg-purple-100 p-2"
        />
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            {currentSpeciality.speciality}
          </h1>
          <p className="text-md sm:text-lg text-gray-700 mt-1">
            {currentSpeciality.about.short}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecialityHeader;
