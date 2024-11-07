import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function UserDetails() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [flashMessage, setFlashMessage] = useState(''); // State for flash message
  const location = useLocation(); // To access the current location

  useEffect(() => {
    // Check for flash message in query parameters
    const params = new URLSearchParams(location.search);
    const message = params.get('flashMessage');
    if (message) {
      setFlashMessage(decodeURIComponent(message)); // Set the flash message

      // Set a timeout to clear the flash message after 3 seconds
      const timer = setTimeout(() => {
        setFlashMessage('');
      }, 3000);

      // Cleanup the timeout on component unmount or if flashMessage changes
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Retrieve token from local storage
        const userID = localStorage.getItem('userID'); // Retrieve userID
        if (!userID) {
          throw new Error('User ID not found in local storage'); // Handle missing userID
        }
        if (!token) {
          throw new Error('Authentication token not found'); // Handle missing auth token
        }

        const response = await fetch(`http://localhost:8080/users/${userID}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the header
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json(); // Parse the JSON response
        setUser(data); // Update state with the user data
      } catch (err) {
        setError(err.message); // Handle errors
      }
    };

    fetchUser(); // Call the function to fetch user details
  }, []); // Empty dependency array means this effect runs once after the component mounts

  return (
    <div>
      <h1>User Details</h1>
      {flashMessage && <p className="flash-message">{flashMessage}</p>} {/* Display flash message */}
      {error && <p className="error">{error}</p>} {/* Display error messages */}
      {user ? (
        <div>
          <p><strong>ID:</strong> {user.userID}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>First Name:</strong> {user.firstName}</p>
          <p><strong>Last Name:</strong> {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Contact Info:</strong> {user.contactInfo}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          <p><strong>Age:</strong> {user.age}</p>
          <p><strong>Date of Birth:</strong> {user.dayOfBirth}/{user.monthOfBirth}/{user.yearOfBirth}</p>
          <p><strong>Blood Group:</strong> {user.bloodGroup}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      ) : (
        <p>Loading user details...</p> // Loading state
      )}
    </div>
  );
}

export default UserDetails;
