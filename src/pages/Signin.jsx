import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Signin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('flashMessage');
    if (message) {
      setFlashMessage(decodeURIComponent(message));
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token, redirectUrl, userID } = await response.json();
        localStorage.setItem('authToken', token);
        localStorage.setItem('userID', userID);

        const roleResponse = await fetch(`http://localhost:8080/users/${userID}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (roleResponse.ok) {
          const userData = await roleResponse.json();
          const userRole = userData.role;
          localStorage.setItem('userRole', userRole);
        } else {
          setError('Failed to fetch user role');
          return;
        }

        navigate(`${redirectUrl}`);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (err) {
      setError('Login failed, please try again.');
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        {error && <p className="error">{error}</p>}
        {flashMessage && <p className="flash-message">{flashMessage}</p>}
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="button-container">
          <button type="submit">Sign In</button>
          <button type="button" onClick={() => navigate('/signup')}>Register</button>
        </div>
      </form>
    </div>
  );
}

export default Signin;
