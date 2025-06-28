import React, { useContext, useState } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu/SpecialityMenu'
import TopDoctors from '../components/TopDoctors/TopDoctors'
import BloodDonation from '../components/BloodDonation'
import JoinNow from '../components/JoinNow'
import { Link } from 'react-router-dom'
import axios from 'axios'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../context/AppContex'

const home = () => {


  return (
    <div className=''>
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
        <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition text-purple-600 underline font-medium">
          <FontAwesomeIcon icon={faHouse}  />
          <span className="ml-1">Acasă</span>
        </Link>
             </nav>

        <Header />
        <SpecialityMenu />
        <TopDoctors />
        <BloodDonation />
        <JoinNow />
        
    </div>
  )
}

export default home