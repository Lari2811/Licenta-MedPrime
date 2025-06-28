import React from 'react'
import { Link } from 'react-router-dom'
import DonationFaq from '../components/DonationFaq'
import BloodNeedSection from '../components/BloodNeedSection'
import DonationInfo from '../components/DonationInfo'

import { assets } from '../assets/assets';
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContex";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faDroplet, faHeartPulse, faHospital, faHouse, faUsers } from '@fortawesome/free-solid-svg-icons'

const Donation = () => {

  const { locationsData } = useContext(AppContext);

  
  return (
    <div className=''>

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
        <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
          <FontAwesomeIcon icon={faHouse}  />
          <span className="ml-1">Acasă</span>
        </Link>
        <span className="text-gray-400">{'>'}</span>
        <span className="text-purple-600 underline font-medium">
          <FontAwesomeIcon icon={faDroplet} />
          <span className="ml-1">Donare de sânge </span>
        </span>
      </nav>

      {/* Hero section */}
      <div className="relative h-[400px] mb-12 mx-auto overflow-hidden rounded-2xl shadow-2xl md:ml-10 md:mr-10 ml-4 mr-4">
        <img
          src={assets.hero_donation}
          alt="About Us Hero"
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B2C91]/90 to-transparent flex items-center">
         
          <div className="container mx-auto px-6">
            
            <h1 className="ml-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md leading-snug sm:leading-tight">
              Centrul de Donare Sânge
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white drop-shadow-xs ml-3">
            <FontAwesomeIcon icon={faHeartPulse} style={{color: "#ffffff",}} className='mr-2'/>
              Donează sânge, salvează vieți!
            </p>

            <p className="text-xs sm:text-sm md:text-base text-white drop-shadow-xs mb-6 mt-6 ml-3">
              Dedicați excelenței în îngrijirea sănătății și bunăstării
              pacienților noștri de peste un deceniu.
            </p>

             
          </div>
        </div>
      </div>

      {/* Blood Need Section */}
      <BloodNeedSection />

      {/* Info Donation Section*/}
      <DonationInfo />

      {/* FAQ Section */}
      <DonationFaq />

    </div>
  )
}

export default Donation