import React, { useContext, useState, useEffect, useMemo  } from 'react'
import { Link, useLocation} from 'react-router-dom'
import { AppContext } from '../context/AppContex'
import Select from 'react-select'
import SelectedLocationDetails from '../components/SelectedLocationDetails'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook, faEnvelope, faHouse } from '@fortawesome/free-solid-svg-icons';

const Contact = () => {

  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  const [formData, setFormData] = useState({
    nume: "",
    email: "",
    telefon: "",
    subiect: "",
    mesaj: "",
    locatie: "Toate locațiile",
    termeni: false, 
  });

  const [formErrors, setFormErrors] = useState({});

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
  
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
  
    if (!formData.nume.trim()) errors.nume = "Te rugăm să completezi numele.";
    if (!emailRegex.test(formData.email)) errors.email = "Emailul nu este valid.";
    if (!phoneRegex.test(formData.telefon)) {errors.telefon = "Telefonul trebuie să înceapă cu 07 și să aibă 10 cifre.";}
    if (!formData.locatie || formData.locatie === "Toate locațiile") {errors.locatie = "Te rugăm să selectezi o locație specifică.";}
    if (!formData.subiect.trim()) errors.subiect = "Subiectul este necesar.";
    if (!formData.mesaj.trim()) errors.mesaj = "Scrie un mesaj.";
    if (!formData.termeni) {errors.termeni = "Trebuie să accepți termenii și condițiile.";}
  
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
  
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
  
      return;
    }
  
    setFormErrors({});
    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        nume: "",
        email: "",
        telefon: "",
        subiect: "",
        mesaj: "",
        locatie: "Toate locațiile",
        termeni: false, 
      });
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="">

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-gray-500 text-xs sm:text-lg mb-5 px-5 mx-5 sm:mx-10 my-5">
        <Link to="/" className="flex items-center space-x-1 hover:text-purple-600 hover:underline transition">
          <FontAwesomeIcon icon={faHouse}  />
          <span className="ml-1">Acasă</span>
        </Link>
        <span className="text-gray-400">{'>'}</span>
        <span className="text-purple-600 underline font-medium">
          <FontAwesomeIcon icon={faEnvelope} />
          <span className="ml-1">Contact</span>
        </span>
      </nav>

      {/* Titlu pagina */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-5 py-5 flex flex-col items-center gap-3 text-gray-900">

      <h1 className="title text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-medium text-center mb-2 mt-1">
      Contact
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 drop-shadow-xs text-center sm:text-lef">
        Contactează echipa MedPrime pentru orice informație
        </p>
      </div>

      {/* Contact Content */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-5 px-5 py-5 flex flex-col items- gap-3 text-gray-900">
        <div className="grid md:grid-cols-2 grid-cols-1  gap-21 md:mr-7 mr-2 md:ml-7 ml-2">
          
          {/* Contact Form */}
          <div
            id="suport" className="scroll-mt-30">
            <h2 className="md:text-2xl text-xl font-semibold italic text-purple-800 mb-4">
             <FontAwesomeIcon icon={faEnvelope} className='mr-2'/>
              Trimite-ne un mesaj
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nume" className="block text-gray-700 mb-1 md:text-lg text-medium">
                  Nume și prenume
                </label>
                <input
                  type="text"
                  id="nume"
                  name="nume"
                  value={formData.nume}
                  onChange={handleChange}
                  className="w-full px-3 py-1 text-sm md:text-base md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2C91]"
                />
                {formErrors.nume && <p className="text-red-600 text-sm mt-1">{formErrors.nume}</p>}

              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-1 md:text-lg text-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-1 text-sm md:text-base md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2C91]"
                />
                {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}

              </div>

              <div className="mb-4">
                <label htmlFor="telefon" className="block text-gray-700 mb-1 md:text-lg text-medium">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="telefon"
                  name="telefon"
                  value={formData.telefon}
                  onChange={handleChange}
                  className="w-full px-3 py-1 text-sm md:text-base md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2C91]"
                />
                {formErrors.telefon && <p className="text-red-600 text-sm mt-1">{formErrors.telefon}</p>}
              </div>
              
              
              <div className="mb-4">
                <label htmlFor="subiect" className="block text-gray-700 mb-1 md:text-lg text-medium">
                  Subiect
                </label>
                <input
                  type="text"
                  id="subiect" 
                  name="subiect"
                  value={formData.subiect}
                  onChange={handleChange}
                  className="w-full px-3 py-1 text-sm md:text-base md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2C91]"
                />
                {formErrors.subiect && <p className="text-red-600 text-sm mt-1">{formErrors.subiect}</p>}

              </div>

              <div className="mb-4">
                <label htmlFor="mesaj" className="block text-gray-700 mb-1 md:text-lg text-medium">
                  Mesaj
                </label>
                <textarea
                  id="mesaj"
                  name="mesaj"
                  rows={5}
                  value={formData.mesaj}
                  onChange={handleChange}
                  className="w-full px-3 py-1 text-sm md:text-base md:px-4 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2C91]"
                ></textarea>
                {formErrors.mesaj && <p className="text-red-600 text-sm mt-1">{formErrors.mesaj}</p>}

              </div>
              
              <div className="flex flex-col mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="termeni"
                    name="termeni"
                    checked={formData.termeni}
                    onChange={handleChange}
                    className="mr-2 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">
                    Sunt de acord cu{" "}
                    <a href="#" className="text-[#6B2C91] hover:underline">
                      termenii și condițiile
                    </a>{" "}
                    și{" "}
                    <a href="#" className="text-[#6B2C91] hover:underline">
                      politica de confidențialitate
                    </a>
                  </span>
                </label>
                {formErrors.termeni && <p className="text-red-600 text-sm mt-1">{formErrors.termeni}</p>}
              </div>

              <button
                type="submit"
                className="!rounded-button whitespace-nowrap bg-[#6B2C91] text-white px-6 py-2 rounded-md hover:bg-[#5a2278] transition-colors cursor-pointer flex items-center"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Trimite mesajul
              </button>
              


              {submitted && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                  Mesajul a fost trimis cu succes! Vă vom contacta în curând.
                </div>
              )}
            </form>
          </div>


          {/* Contact Information */}
          <div
            id="info-contact" className="scroll-mt-30">
            <h2 className="md:text-2xl text-xl font-semibold italic text-purple-800 mb-4">
              <FontAwesomeIcon icon={faAddressBook} className='mr-2'/>
              Informații de contact
            </h2>

            <h3 className="md:text-xl text-lg text-gray-700 mb-2">
              Suntem aici pentru tine, în mai multe locații
            </h3>

            {/* Displaying selected location information */}
            <SelectedLocationDetails />

          </div>
        </div>
      </div>

      
    </div>
  )
}

export default Contact