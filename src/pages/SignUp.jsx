import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/SignUp.css';

const SignUp = () => {
  const [patientDetails, setPatientDetails] = useState({
    username: '',
    password: '',
    role: 'Patient',
    contactInfo: '',
    yearOfBirth: '',
    monthOfBirth: '',
    dayOfBirth: '',
    bloodGroup: '',
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    gender: '',
    age: '',
    diseases: '',
    emergencyContactAddress: '',
    emergencyContactPhone: '',
    emergencyContactName: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === 'yearOfBirth' || name === 'monthOfBirth' || name === 'dayOfBirth') {
      calculateAge();
    }
  };

  const calculateAge = () => {
    const { yearOfBirth, monthOfBirth, dayOfBirth } = patientDetails;
    if (yearOfBirth && monthOfBirth && dayOfBirth) {
      const birthDate = new Date(yearOfBirth, monthOfBirth - 1, dayOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      const monthDifference = new Date().getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && new Date().getDate() < birthDate.getDate())) {
        setPatientDetails((prevState) => ({
          ...prevState,
          age: age - 1,
        }));
      } else {
        setPatientDetails((prevState) => ({
          ...prevState,
          age: age,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        // Create user entry
        const userResponse = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: patientDetails.username,
                password: patientDetails.password,
                role: patientDetails.role,
                contactInfo: patientDetails.contactInfo,
                yearOfBirth: parseInt(patientDetails.yearOfBirth, 10),
                monthOfBirth: parseInt(patientDetails.monthOfBirth, 10),
                dayOfBirth: parseInt(patientDetails.dayOfBirth, 10),
                bloodGroup: patientDetails.bloodGroup,
                firstName: patientDetails.firstName,
                lastName: patientDetails.lastName,
                email: patientDetails.email,
                address: patientDetails.address,
                gender: patientDetails.gender,
                age: patientDetails.age,
            }),
        });

        if (!userResponse.ok) {
            const errorResponse = await userResponse.json();
            throw new Error(errorResponse.error || 'Failed to create user');
        }

        const userData = await userResponse.json();

        // Create patient entry
        const patientResponse = await fetch('http://localhost:8080/patients/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userID: userData.userID,
                diseases: patientDetails.diseases,
                emergencyContactAddress: patientDetails.emergencyContactAddress,
                emergencyContactPhone: patientDetails.emergencyContactPhone,
                emergencyContactName: patientDetails.emergencyContactName,
            }),
        });

        if (!patientResponse.ok) {
            const errorResponse = await patientResponse.json();
            throw new Error(errorResponse.error || 'Failed to create patient');
        }

        // Increment weekly user count
        await fetch('http://localhost:8080/api/weekly-statistics/increment/user', {
            method: 'POST',
        });

        // Increment monthly user count
        await fetch('http://localhost:8080/api/monthly-statistics/increment/user', {
            method: 'POST',
        });

        navigate('/login'); // Redirect to login page after successful signup

    } catch (err) {
        setError(err.message); // Set error message to display on UI
    }
};


  return (
    <div className="sign-up-container">
      <h1>Patient Sign Up</h1>
      {error && <p className="error-message">{error}</p>} {/* Display error if exists */}
      <form onSubmit={handleSubmit} className="sign-up-form">
        <div className="form-column">
          <input type="text" name="firstName" placeholder="First Name" value={patientDetails.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" value={patientDetails.lastName} onChange={handleChange} required />
          <input type="text" name="username" placeholder="Username" value={patientDetails.username} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={patientDetails.password} onChange={handleChange} required />
          <input type="text" name="contactInfo" placeholder="Contact Info" value={patientDetails.contactInfo} onChange={handleChange} />
          <input type="text" name="address" placeholder="Address" value={patientDetails.address} onChange={handleChange} required />
          <input type="text" name="email" placeholder="Email" value={patientDetails.email} onChange={handleChange} required />
          <select name="gender" value={patientDetails.gender} onChange={handleChange} required>
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-column">
          <input type="number" name="yearOfBirth" placeholder="Year of Birth" value={patientDetails.yearOfBirth} onChange={handleChange} />
          <input type="number" name="monthOfBirth" placeholder="Month of Birth" value={patientDetails.monthOfBirth} onChange={handleChange} />
          <input type="number" name="dayOfBirth" placeholder="Day of Birth" value={patientDetails.dayOfBirth} onChange={handleChange} />
          <input type="text" name="bloodGroup" placeholder="Blood Group" value={patientDetails.bloodGroup} onChange={handleChange} />
          <input type="text" name="diseases" placeholder="Diseases" value={patientDetails.diseases} onChange={handleChange} />
          <input type="text" name="emergencyContactAddress" placeholder="Emergency Contact Address" value={patientDetails.emergencyContactAddress} onChange={handleChange} />
          <input type="text" name="emergencyContactPhone" placeholder="Emergency Contact Phone" value={patientDetails.emergencyContactPhone} onChange={handleChange} />
          <input type="text" name="emergencyContactName" placeholder="Emergency Contact Name" value={patientDetails.emergencyContactName} onChange={handleChange} />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
