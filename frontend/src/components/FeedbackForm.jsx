import React, {useState} from 'react'



const FeedbackForm = ({ appointment, onClose }) => {

    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");

    const [feedbackData, setFeedbackData] = useState([
        {
          id_pacient: "IDPA5",
          id_programare: "2",
          feedback_oferit: true,
          text_feedback: "Totul a decurs bine.",
          rating: 4,
        },
      ]);
    
      const handleSubmit = () => {
        if (rating === 0 || text.trim() === "") {
          alert("Completează toate câmpurile.");
          return;
        }
    
        onClose();
    }
    
    console.log("Feedback:", { id: appointment.id, rating, text });
    
    
      
    

    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">

        <div className="bg-white shadow-xl border border-gray-200 rounded-xl p-4 w-[90%] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto relative">
            <div className="w-12 h-1 bg-green-500 rounded-full mx-auto mb-4"></div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Oferă feedback</h2>
          
          <p><strong>Medic:</strong> {appointment.medic}</p>
          <p><strong>Investigație:</strong> {appointment.investigatie}</p>
          <p><strong>Locație:</strong> {appointment.locatie}</p>
          <p><strong>Data și ora:</strong> {appointment.data} {appointment.ora}</p>
    
          <div className="mt-4">
            <label className="block font-medium mb-1">Rating:</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
    
          <div className="mt-4">
            <label className="block font-medium mb-1">Feedback:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border rounded-md p-2"
              rows={4}
              placeholder="Scrie aici feedback-ul tău..."
            />
          </div>
    
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-sm rounded-md hover:bg-gray-400 cursor-pointer"
            >
              Anulează
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 cursor-pointer"
            >
              Trimite feedback
            </button>
          </div>
        </div>
        </div>
      );
    }

export default FeedbackForm