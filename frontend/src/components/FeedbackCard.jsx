import React from 'react'


  
const FeedbackCard = ({feedback }) => {
    return (
        <div className="bg-white shadow-md rounded-md border border-gray-200 overflow-hidden mb-6">
          
          {/* Header */}
          <div className="bg-indigo-50 px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{feedback.investigatie}</h3>
              <p className="text-sm text-gray-700">
                {feedback.medic} - {feedback.specialitate} 
              </p>
              <p className="text-sm text-gray-700">
                {feedback.data} - {feedback.ora}
              </p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= Math.floor(feedback.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-700">
                {feedback.rating.toFixed(1)}
              </span>
            </div>
          </div>
    
          {/* Continut feedback */}
          <div className="px-4 py-4">
            <p className="font-medium text-gray-800 mb-2">Feedback pacient:</p>
            <blockquote className="italic bg-gray-50 px-4 py-3 rounded-md text-gray-700 border-l-4 border-purple-300">
              “{feedback.text}”
            </blockquote>
          </div>
        </div>
      );
    }

export default FeedbackCard