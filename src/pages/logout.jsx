import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userID');
    localStorage.removeItem('userRole');

    // Redirect to the login page
    navigate('/login');
  }, [navigate]);

  return null; // No UI to render
}

export default Logout;
