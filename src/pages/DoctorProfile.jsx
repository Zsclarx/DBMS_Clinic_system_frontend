import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/DoctorDetailAdmin.css';
import Modal from '../components/Modal';
import {Link} from 'react-router-dom';

const DoctorProfile = () => {

 
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false);

  // State for validation messages
  const [validationErrors, setValidationErrors] = useState({
    phone: '',
    email: '',
    dayOfBirth: '',
    monthOfBirth: '',
    yearOfBirth: '',
  });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!authToken || userRole.toLowerCase() !== 'doctor') {
        navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
        return;
    }
}, [navigate]);


  const fetchDoctorDetails = useCallback(async () => {
    try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userID');
        console.log(token);
        console.log(userId);

        if (!token || !userId) {
            throw new Error('Authentication token or user ID not found');
        }

        // Fetch all doctors
        const doctorsResponse = await fetch('http://localhost:8080/doctors', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!doctorsResponse.ok) {
            throw new Error('Failed to fetch doctors');
        }

        const doctorsData = await doctorsResponse.json();
        
        console.log(doctorsData);
        // Filter the doctor with the matching userId
        const filteredDoctor = doctorsData.find(doctor => doctor.userID == userId);
        if (!filteredDoctor) {
            throw new Error('No doctor found for this user ID');
        }

        setDoctor(filteredDoctor);

        // Fetch user details with doctor’s user ID
        const userResponse = await fetch(`http://localhost:8080/users/${filteredDoctor.userID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user details');
        }

        const userData = await userResponse.json();
        setUser(userData);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}, []);

  useEffect(() => {
    fetchDoctorDetails();
  }, [fetchDoctorDetails]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // This triggers the confirmation dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isUnsavedChanges]);

  

  if (loading) {
    return <p>Loading doctor details...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!doctor || !user) {
    return <p>No details available for this doctor.</p>;
  }

  return (
    <><nav className="navbar">
      <div className="navbar-title"> Doctor Dashboard</div>
      <ul className="navbar-links">
        <li><Link to="/doctors">Home</Link></li>
        <li><Link to="/doctor/profile">Profile</Link></li>
        <li><Link to="/doctor/appointments">Appointments</Link></li>
        <li><Link to="/doctor/schedule">Schedule</Link></li>
        <li><Link to="/logout">Logout</Link></li>
        
      </ul>
    </nav><div className="doctor-detail-container">


        
        
          <div>
            <h3>Doctor Information</h3>
            <p><strong>First Name:</strong> {user.firstName}</p>
            <p><strong>Last Name:</strong> {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Date of Birth:</strong> {user.dayOfBirth}/{user.monthOfBirth}/{user.yearOfBirth}</p>
            <p><strong>Address:</strong> {user.address}</p>

            <p><strong>Phone Number:</strong> {user.contactInfo}</p>
            <p><strong>Specialization:</strong> {doctor.specialization}</p>
            <p><strong>Department:</strong> {doctor.departmentID}</p>
            <p><strong>Fees:</strong> ${doctor.fees}</p>
            <p><strong>Rating:</strong> {doctor.rating}</p>
          </div>
        

        
      </div></>
  );
};

export default DoctorProfile;
