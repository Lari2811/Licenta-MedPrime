import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faDownload, faFilePdf } from '@fortawesome/free-solid-svg-icons';

const PdfPreviewModal = ({ url, fileName }) => {
  const [showModal, setShowModal] = useState(false);

  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'fisier.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Trigger */}
      <button onClick={() => setShowModal(true)} className="text-blue-600 underline">
        <FontAwesomeIcon icon={faEye} className="mr-1" />
        Vezi PDF
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg w-[90%] max-w-4xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Previzualizare PDF</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-red-500 text-xl">×</button>
            </div>
            <iframe
              src={url}
              title="PDF preview"
              className="w-full h-[70vh] border rounded"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={downloadFile}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Descarcă
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PdfPreviewModal;
