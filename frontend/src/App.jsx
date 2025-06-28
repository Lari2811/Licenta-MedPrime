import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home'
import Doctors from './pages/Doctors'

import About from './pages/About'
import Contact from './pages/Contact'
import Specialties from './pages/Specialties'
import Donation from './pages/Donation'

import Locations from './pages/Locations'
import Questionnaire from './pages/Questionnaire'

import SpecialityDetails from './pages/SpecialityDetails '

import DoctorProfile from './pages/DoctorProfile'
import LocationDetails from './pages/LocationDetails'

import Login from './pages/LoginRegister/Login';
import Register from './pages/LoginRegister/Register';


import Navbar from './components/Navbar/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminMainPage from './pages/AdminDashboard/AdminMainPage';
import CompletareProfil from './pages/MedicDashboard/CompletareProfil';
import DoctorMainPage from './pages/MedicDashboard/DoctorMainPage';
import PatientMainPage from './pages/PatientDashboard/PatientMainPage';
import FinishRegistration from './pages/PatientDashboard/FinishRegistration';


const App = () => {

  const location = useLocation();

  const isMedicDashboard = location.pathname.startsWith("/profil-medic") ||
  location.pathname.startsWith("/admin");

// Verifica exact rutele unde nu vrem Navbar + Footer
  const hideLayout =
    location.pathname === '/autentificare' ||
    location.pathname === '/inregistrare' ||
    location.pathname === '/autentificare-medic' ||
    (location.pathname.includes('/profil-pacient/') && location.pathname.includes('/completare-profil'));


  return (
    <div className='mx-0 sm:mx-[0%]'>
      <ScrollToTop />

      {!hideLayout && !isMedicDashboard && <Navbar />}

      <div className={` ${hideLayout ? 'w-full' : ''}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/despre-noi' element={<About />} />

          <Route path='/locatii' element={<Locations />} />
          <Route path='/locatii/:locationID/:clinicNameUrl/:sectiune' element={<LocationDetails />} />
          
          <Route path='/medici' element={<Doctors />} />
          <Route path='/medici/:doctorID/:doctorName/:sectiune' element={<DoctorProfile />} />
          
          <Route path='/specialitati' element={<Specialties />} />
          <Route path="/specialitati/:specialityID/:specialityName/:sectiune" element={<SpecialityDetails />} />
          
          <Route path="/profil-pacient/:patientID/completare-profil" element={<FinishRegistration />} />
          <Route path="/profil-pacient/:patientID/:section/:subsection?" element={ <PatientMainPage /> } />
          
          <Route path='/contact' element={<Contact />} />
          <Route path='/donare' element={<Donation />} />
         
          <Route path='/chestionar-satisfactie' element={<Questionnaire />} />

          <Route path="/profil-medic/:doctorID/completare-profil" element={<CompletareProfil />} />
          <Route path="/profil-medic/:doctorID/:section/:subsection?" element={ <DoctorMainPage /> } />
          
          <Route path='/inregistrare' element={<Register />} />
          <Route path='/autentificare' element={<Login />} />

         <Route path="/admin/:adminID/:section/:subsection?" element={<AdminMainPage />} />

         

        </Routes>
      </div>

      {!hideLayout && !isMedicDashboard && <Footer />}

     <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default App