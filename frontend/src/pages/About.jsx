import Reac, {useState }from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { aboutData } from '../assets/about-us/about-us'
import { faqData } from '../assets/about-us/faqData';
import { assets } from '../assets/assets';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faHandshake, faAward, faUserMd, faLightbulb, faGraduationCap,
        faHouse, faUsers, faHeartPulse, faBullseye, faEye, faGem, faCircleQuestion


} from "@fortawesome/free-solid-svg-icons";

const About = () => {

  const iconMap = {
    Empatie: faHeart,
    Respect: faHandshake,
    Excelență: faAward,
    Profesionalism: faUserMd,
    Inovație: faLightbulb,
    "Educație continuă": faGraduationCap,
  };
  
  const location = useLocation();
  
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  const [showAll, setShowAll] = useState(false);
  const displayedFaqs = showAll ? faqData : faqData.slice(0, 5);

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
          <FontAwesomeIcon icon={faUsers} />
          <span className="ml-1">Despre noi</span>
        </span>
      </nav>

      {/* Hero section */}
      <div className="relative h-[400px] mb-12 mx-auto overflow-hidden rounded-2xl shadow-lg md:ml-10 md:mr-10 ml-4 mr-4">
        <img
          src={assets.about_img}
          alt="About Us Hero"
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B2C91]/90 to-transparent flex items-center">
         
          <div className="container mx-auto px-6">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md leading-snug sm:leading-tight ml-3">
              {aboutData.hero.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white drop-shadow-xs ml-3">
            <FontAwesomeIcon icon={faHeartPulse } style={{color: "#ffffff",}} className='mr-2'/>
            {aboutData.hero.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Poveste */}
      <div
        id="story"
        className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-10 px-6 py-10 speciality-container scroll-mt-28"
      >
        <h1 className="title text-2xl sm:text-3xl md:text-4xl font-medium text-center mb-4 mt-1">
          {aboutData.story.title}
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8 items-center ml-4 mr-4 ">
          <div className='text-sm sm:text-base md:text-base  text-gray-900 '>
            {aboutData.story?.storyParagraphs?.map((paragraph, idx) => (
              <p key={idx} className="text-justify indent-4 mb-3">{paragraph}</p>
            ))}
          </div>
          <div className="relative h-[300px] rounded-lg overflow-hidden">
            {<img
              src={aboutData.story.image}
              alt="Clinica MED PRIME"
              className="w-full h-full object-cover"
            />}
          </div>
        </div>
      </div>

      {/* Misiune si Viziune */}
      <div 
        id='mission-vision'
        className="flex flex-col lg:flex-row gap-4 px-4 sm:px-6 lg:px-10 my-5">
          
          {/* Misiune */}
          <div 
            id="mission"
            className="lg:w-1/2 w-full bg-white border border-gray-300 rounded-2xl shadow-xl px-4 py-5 flex flex-col gap-1 text-gray-900">
            
            <h2 className="text-xl sm:text-2xl text-center font-bold text-purple-900 mb-3">
              <FontAwesomeIcon icon={faBullseye} className='mr-2' />
              {aboutData.mission.title}
            </h2>

            <div className='text-sm sm:text-base md:text-base  text-gray-900 '>
              {aboutData.mission?.missionParagraphs?.map((paragraph, idx) => (
              <p key={idx} className="text-justify indent-4 mb-2">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Viziune */}
          <div 
            id="vision"
            className="lg:w-1/2  w-full bg-white border border-gray-300 rounded-2xl shadow-xl px-4 py-5 flex flex-col gap-1 text-gray-900">
            
            <h2 className="text-xl sm:text-2xl text-center font-bold text-purple-900 mb-3">
              <FontAwesomeIcon icon={faEye} className='mr-2' />
              {aboutData.vision.title}
            </h2>

            <div className='text-sm sm:text-base md:text-base  text-gray-900 '>
              {aboutData.vision?.visionParagraphs?.map((paragraph, idx) => (
              <p key={idx} className="text-justify indent-4 mb-2">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

      {/* Valori */}
      <div
      id="values"
      className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-10 px-6 py-10 speciality-container scroll-mt-28"
      > 
        <h2 className="text-xl sm:text-2xl text-center font-bold text-purple-900 mb-3">
            <FontAwesomeIcon icon={faGem} className='mr-2' />
            Valorile MedPrime
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mr-6 ml-6">
          {aboutData.values.map((value, index) => (
            <div
              key={index}
              className="bg-purple-50 p-6 rounded-lg shadow-md text-center hover:bg-purple-100"
            >
              <div className="text-3xl mb-0 text-purple-700">
                <FontAwesomeIcon icon={iconMap[value.title]} />
              </div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-700 text-sm">{value.text}</p>
            </div>
          ))}
        </div>


      </div>

       {/* FAQ Section */}
        <div
        id="questions"
        className="bg-white border border-gray-300 rounded-2xl shadow-xl mx-4 sm:mx-10 my-10 px-6 py-10 s"
        >
          <h2 className="text-xl sm:text-2xl text-center font-bold text-purple-900 mb-5">
            <FontAwesomeIcon icon={faCircleQuestion} className='mr-2' />
            Întrebări frecvente
          </h2>

          {displayedFaqs.map((item, index) => (
              <details key={index} className="group mb-4 border border-gray-300 rounded-md overflow-hidden transition-all">
                <summary className="cursor-pointer px-4 py-3 bg-purple-200 text-purple-900 font-medium text-sm sm:text-base group-open:rounded-t-md group-open:rounded-b-none">
                  {item.question}
                </summary>
                <div className="bg-white px-4 py-3 text-sm sm:text-base text-gray-700 border-t border-gray-200">
                  {item.answer}
                </div>
              </details>
            ))}

          {faqData.length > 5 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-4 py-2 border border-purple-600 text-purple-700 rounded-lg font-medium text-xs  md:text-sm transition hover:bg-purple-50 hover:underline"
              >
                {showAll ? 'Ascunde întrebările' : 'Vezi mai multe întrebări'}
              </button>
            </div>
          )}
      
        </div>

      </div>
      

  )
}

export default About