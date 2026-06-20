import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PasswordModal from '../components/PasswordModal';
import toast from 'react-hot-toast';

const LinkRedirect = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const redirect = async () => {
      try {
        // Check if we have a password token in session
        const token = sessionStorage.getItem(`${code}`);
        if (token) {
        }
        // Attempt to fetch the original URL
        const res = await axios.get(`/${code}`, { maxRedirects: 0, validateStatus: null });
        if (res.status === 403 && res.data.requiresPassword) {
          setShowModal(true);
        } else if (res.status === 301 || res.status === 302) {
          // Redirect manually
          const location = res.headers.location;
          if (location) {
            window.location.href = location;
          }
        } else {
          toast.error('Link not found or expired');
          navigate('/');
        }
      } catch (err) {
        toast.error('Error accessing link');
        navigate('/');
      }
    };
    redirect();
  }, [code, navigate]);

  const handlePasswordSuccess = () => {
    setShowModal(false);
    window.location.href = `/${code}?pwd_token=${sessionStorage.getItem(`${code}`)}`;
  };

  return (
    <>
      {showModal && (
        <PasswordModal
          shortCode={code}
          onSuccess={handlePasswordSuccess}
          onClose={() => navigate('/')}
        />
      )}
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </>
  );
};

export default LinkRedirect;