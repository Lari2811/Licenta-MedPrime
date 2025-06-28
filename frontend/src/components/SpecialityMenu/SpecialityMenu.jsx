import React, { useContext, useEffect, useRef, useState } from 'react';
import { specialityData } from '../../assets/specialities/specialities';
import { Link } from 'react-router-dom';
import './SpecialityMenu.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../../context/AppContex';
import { toast } from 'react-toastify';
import axios from 'axios';
import { normalizeLocationName } from '../../utils/normalizeLocationName';
import { assets } from '../../assets/assets';

const SpecialityMenu = () => {

    const { backendUrl } = useContext(AppContext);

    const [specialitiesData, setSpecialitiesData] = useState()
  
    const fetchSpecialities = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/get-all-specialities`);
          setSpecialitiesData(res.data.data);
          //console.log("Specialitati din backend:", res.data.data);
      
      } catch (err) {  
        toast.error("Eroare server la specialități");
      }
    };

    useEffect(() => {
          fetchSpecialities();
    }, []);
    
    const scrollRef = useRef(null);

    const scroll = (direction) => {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    };

  return (
    <div
      id="speciality"
      className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-10 px-6 py-10 speciality-container scroll-mt-28"
    >
      <h1 className="title text-2xl sm:text-3xl md:text-4xl font-medium text-center mb-4 mt-1">
        Cu ce te putem ajuta?
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs">
        Fiecare drum spre sănătate are un început. Alege un domeniu și descoperă medicii care te pot ajuta.
      </p>

      <div className="speciality-carousel mt-8 relative">
        <button className="arrow left hidden md:flex" onClick={() => scroll('left')}>
          <FontAwesomeIcon icon={faChevronLeft} size="lg" />
        </button>

        <div className="speciality-scroll" ref={scrollRef}>
          {specialitiesData?.map((item, index) => (
            <Link
              to={`/specialitati/${item.specialityID}/${normalizeLocationName(item.name)}/despre`}
              key={index}
              onClick={() => scrollTo(0, 0)}
              className="speciality-card w-[160px] h-[240px] sm:w-[200px] sm:h-[280px] md:w-[240px] md:h-[320px]"
            >
              <img
                src={item.profileImage || assets.speciality_default }
                alt={item.speciality}
                className="w-full h-[80%] object-cover rounded-[12px] mb-2"
              />
              <p className="speciality-name text-xs sm:text-sm md:text-base">{item.name}</p>
              <div className="speciality-about">{item.shortDescription}</div>
            </Link>
          ))}
        </div>

        <button className="arrow right hidden md:flex" onClick={() => scroll('right')}>
          <FontAwesomeIcon icon={faChevronRight} size="lg" />
        </button>
      </div>
    </div>
  );
};

export default SpecialityMenu;
