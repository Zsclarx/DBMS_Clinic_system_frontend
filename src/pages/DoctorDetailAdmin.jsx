import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/DoctorDetailAdmin.css';
import Modal from '../components/Modal';
import {Link} from 'react-router-dom';

const DoctorDetail = () => {
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

  const fetchDoctorDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log(token);
      console.log(doctorId);
      const doctorResponse = await fetch(`http://localhost:8080/doctors/${doctorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!doctorResponse.ok) {
        throw new Error('Failed to fetch doctor details');
      }

      const doctorData = await doctorResponse.json();
      setDoctor(doctorData);

      const userResponse = await fetch(`http://localhost:8080/users/${doctorData.userID}`, {
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
  }, [doctorId]);

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

  const confirmDelete = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`http://localhost:8080/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete doctor');
      }

      const userResponse = await fetch(`http://localhost:8080/users/${user.userID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to delete user');
      }
      navigate('/admin/doctors');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsUnsavedChanges(!isEditing);
  };

  const validatePhoneNumber = (phoneNumber) => {
    return /^\d{10}$/.test(phoneNumber); // Check if it is exactly 10 digits
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validateDateOfBirth = (day, month, year) => {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    return birthDate < today; // Check if the birth date is in the past
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('authToken');
    
    // Clear previous validation messages
    setValidationErrors({ phone: '', email: '', dayOfBirth: '', monthOfBirth: '', yearOfBirth: '' });

    let isValid = true;

    // Validate Phone Number
    if (!validatePhoneNumber(user.contactInfo)) {
      setValidationErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 digits.' }));
      isValid = false;
    }

    // Validate Email
    if (!validateEmail(user.email)) {
      setValidationErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      isValid = false;
    }

    // Validate Date of Birth
    if (!validateDateOfBirth(user.dayOfBirth, user.monthOfBirth, user.yearOfBirth)) {
      setValidationErrors((prev) => ({ ...prev, dayOfBirth: 'Date of birth must be in the past.' }));
      isValid = false;
    }

    if (!isValid) {
      return; // Prevent update if validation fails
    }

    try {
      const updatedDoctor = { ...doctor };
      const updatedUser = { ...user };

      const response = await fetch(`http://localhost:8080/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDoctor),
      });

      if (!response.ok) {
        throw new Error('Failed to update doctor details');
      }

      const userResponse = await fetch(`http://localhost:8080/users/${user.userID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to update user details');
      }

      alert('Doctor and user details updated successfully.');
      setIsEditing(false);
      setIsUnsavedChanges(false);
      navigate(`/admin/doctors/${updatedDoctor.doctorID}`);
    } catch (err) {
      setError(err.message);
    }
  };

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
      <div className="navbar-title">Doctor Management</div>
      <ul className="navbar-links">
        <li><Link to="/admin">Home</Link></li>
        <li><Link to="/admin/departments">Departments</Link></li>
        <li><Link to="/admin/doctors">Doctors</Link></li>
        <li><Link to="/admin/patients">Patients</Link></li>
        <li><Link to="/admin/staff">Staff</Link></li>
        <li><Link to="/admin/appointments">Appointments</Link></li>
      </ul>
    </nav><div className="doctor-detail-container">
        <h1>{isEditing ? 'Edit Doctor Details' : `Dr. ${user.firstName} ${user.lastName}`}</h1>

        {isEditing ? (
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              placeholder="Username"
              required />
            <label>Password:</label>
            <input
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              placeholder="Password"
              required />
            <label>First Name:</label>
            <input
              type="text"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              placeholder="First Name"
              required />
            <label>Last Name:</label>
            <input
              type="text"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              placeholder="Last Name"
              required />
            <label>Email:</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="Email"
              required />
            {validationErrors.email && <span className="error">{validationErrors.email}</span>}

            <label>Phone Number:</label>
            <input
              type="text"
              value={user.contactInfo}
              onChange={(e) => setUser({ ...user, contactInfo: e.target.value })}
              placeholder="Phone Number"
              maxLength="10" // Enforce max length of 10 digits
              required />
            {validationErrors.phone && <span className="error">{validationErrors.phone}</span>}

            <label>Day of Birth:</label>
            <input
              type="number"
              value={user.dayOfBirth}
              onChange={(e) => setUser({ ...user, dayOfBirth: parseInt(e.target.value) })}
              placeholder="Day"
              min="1"
              max="31"
              required />
            {validationErrors.dayOfBirth && <span className="error">{validationErrors.dayOfBirth}</span>}
            <label>Month of Birth:</label>
            <input
              type="number"
              value={user.monthOfBirth}
              onChange={(e) => setUser({ ...user, monthOfBirth: parseInt(e.target.value) })}
              placeholder="Month"
              min="1"
              max="12"
              required />
            <label>Year of Birth:</label>
            <input
              type="number"
              value={user.yearOfBirth}
              onChange={(e) => setUser({ ...user, yearOfBirth: parseInt(e.target.value) })}
              placeholder="Year"
              min="1900"
              max={new Date().getFullYear()}
              required />
            {validationErrors.yearOfBirth && <span className="error">{validationErrors.yearOfBirth}</span>}

            <label>Specialization:</label>
            <input
              type="text"
              value={doctor.specialization}
              onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
              placeholder="Specialization"
              required />
            <label>Fees:</label>
            <input
              type="number"
              value={doctor.fees}
              onChange={(e) => setDoctor({ ...doctor, fees: parseFloat(e.target.value) })}
              placeholder="Fees"
              required />
            <label>Rating:</label>
            <input
              type="number"
              value={doctor.rating}
              onChange={(e) => setDoctor({ ...doctor, rating: parseInt(e.target.value) })}
              placeholder="Rating"
              min="0"
              max="5"
              required />
            <button onClick={handleUpdate}>Save Changes</button>
            <button onClick={handleEditToggle}>Cancel</button>
          </div>
        ) : (
          <div>
            <h3>Doctor Information</h3>
            <p><strong>First Name:</strong> {user.firstName}</p>
            <p><strong>Last Name:</strong> {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Date of Birth:</strong> {user.dayOfBirth}/{user.monthOfBirth}/{user.yearOfBirth}</p>
            <p><strong>Address:</strong> {user.address}</p>
            <p><strong>Username:</strong> {user.username}</p>
            
            <p><strong>Phone Number:</strong> {user.contactInfo}</p>
            <p><strong>Specialization:</strong> {doctor.specialization}</p>
            <p><strong>Department:</strong> {doctor.departmentID}</p>
            <p><strong>Fees:</strong> ${doctor.fees}</p>
            <p><strong>Rating:</strong> {doctor.rating}</p>
            <button onClick={handleEditToggle}>Edit</button>
            <button onClick={confirmDelete}>Delete</button>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleDelete}
          message="Are you sure you want to delete this doctor?" />
      </div></>
  );
};

export default DoctorDetail;
