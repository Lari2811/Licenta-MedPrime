import React from 'react'
import { useEffect, useState } from 'react'
import { donareFaq } from '../assets/donation/faqDonation'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet } from '@fortawesome/free-solid-svg-icons';

const FaqDonation = () => {

    const [questions, setQuestions] = useState([]);
    const [showAll, setShowAll] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        setQuestions(donareFaq);
      };
      fetchData();
    }, []);
  
    const visibleQuestions = showAll ? questions : questions.slice(0, 5);
    return (
        <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl mx-4 sm:mx-10 my-10 px-6 py-10">

        <h2 className="text-xl sm:text-2xl text-center font-bold text-purple-900 mb-5 italic">
        <FontAwesomeIcon icon={faDroplet} className='mr-2' />
            Întrebări frecvente despre donarea de sânge
        </h2> 


        {visibleQuestions.map((item, index) => (
          <details key={index} className="group mb-4 border border-gray-300 rounded-md overflow-hidden transition-all">
          <summary className="cursor-pointer px-4 py-3 bg-purple-200 text-purple-900 font-medium text-sm sm:text-base group-open:rounded-t-md group-open:rounded-b-none">
            {item.question}
          </summary>
          <div className="bg-white px-4 py-3 text-sm sm:text-base text-gray-700 border-t border-gray-200">
            {item.answer}
          </div>
        </details>
        ))}

        {questions.length > 5 && (
            <div className="text-center mt-6">
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-300"
                >
                    {showAll ? "Ascunde întrebările" : "Afișează toate întrebările"}
                </button>
            </div>
        )}

      </div>
    );
  };
  

export default FaqDonation