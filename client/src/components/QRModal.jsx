import { X } from 'lucide-react';

const QRModal = ({ shortCode, onClose }) => {
  const qrUrl = `/api/urls/${shortCode}/qr`;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl shadow-xl">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
        <p className="text-center text-sm text-gray-500 mt-2">Scan to open link</p>
      </div>
    </div>
  );
};

export default QRModal;