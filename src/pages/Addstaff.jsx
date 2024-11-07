import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Addstaff.css'; // Adjust as necessary
import {Link} from 'react-router-dom';

const AddStaff = () => {
  const [staffDetails, setStaffDetails] = useState({
    username: '',
    password: '',
    contactInfo: '',
    yearOfBirth: '',
    monthOfBirth: '',
    dayOfBirth: '',
    bloodGroup: '',
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    address: '',
    gender: '',
    designation: '',
    salary: '',
    role:'Staff'
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === 'yearOfBirth' || name === 'monthOfBirth' || name === 'dayOfBirth') {
      calculateAge();
    }
  };

  const calculateAge = () => {
    const { yearOfBirth, monthOfBirth, dayOfBirth } = staffDetails;
    if (yearOfBirth && monthOfBirth && dayOfBirth) {
      const birthDate = new Date(yearOfBirth, monthOfBirth - 1, dayOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      const monthDifference = new Date().getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && new Date().getDate() < birthDate.getDate())) {
        setStaffDetails((prevState) => ({
          ...prevState,
          age: age - 1,
        }));
      } else {
        setStaffDetails((prevState) => ({
          ...prevState,
          age: age,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    try {
      const userResponse = await fetch('http://localhost:8080/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: staffDetails.username,
          password: staffDetails.password,
          contactInfo: staffDetails.contactInfo,
          yearOfBirth: parseInt(staffDetails.yearOfBirth, 10),
          monthOfBirth: parseInt(staffDetails.monthOfBirth, 10),
          dayOfBirth: parseInt(staffDetails.dayOfBirth, 10),
          bloodGroup: staffDetails.bloodGroup,
          firstName: staffDetails.firstName,
          lastName: staffDetails.lastName,
          age: staffDetails.age,
          email: staffDetails.email,
          address: staffDetails.address,
          gender: staffDetails.gender,
          role: staffDetails.role
        }),
      });

      if (!userResponse.ok) {
        const errorResponse = await userResponse.json();
        throw new Error(errorResponse.message || 'Failed to create user');
      }

      const userData = await userResponse.json();

      const staffResponse = await fetch('http://localhost:8080/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userData.userID,
          designation: staffDetails.designation,
          salary: parseFloat(staffDetails.salary),
        }),
      });

      if (!staffResponse.ok) {
        const errorResponse = await staffResponse.json();
        throw new Error(errorResponse.message || 'Failed to create staff');
      }

      navigate('/admin/staff');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <><nav className="navbar">
          <div className="navbar-title">Admin Dashboard</div>
          <ul className="navbar-links">
              <li><Link to="/admin">Home</Link></li> {/* Home link */}
              <li><Link to="/admin/departments">Departments</Link></li>
              <li><Link to="/admin/doctors">Doctors</Link></li>
              <li><Link to="/admin/patients">Patients</Link></li>
              <li><Link to="/admin/staff">Staff</Link></li>
              <li><Link to="/admin/appointments">Appointments</Link></li>
              <li><Link to="/logout">Logout</Link></li>
          </ul>
      </nav><div className="add-staff-container">
              <h1>Add Staff</h1>
              {error && <p className="error-message">{error}</p>}
              <form onSubmit={handleSubmit} className="staff-form">
                  <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={staffDetails.firstName}
                      onChange={handleChange}
                      required />
                  <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={staffDetails.lastName}
                      onChange={handleChange}
                      required />
                  <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={staffDetails.username}
                      onChange={handleChange}
                      required />
                  <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={staffDetails.password}
                      onChange={handleChange}
                      required />
                  <input
                      type="text"
                      name="contactInfo"
                      placeholder="Contact Info"
                      value={staffDetails.contactInfo}
                      onChange={handleChange} />
                  <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={staffDetails.address}
                      onChange={handleChange}
                      required />
                  <select
                      name="gender"
                      value={staffDetails.gender}
                      onChange={handleChange}
                      required
                  >
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                  </select>
                  <input
                      type="number"
                      name="yearOfBirth"
                      placeholder="Year of Birth"
                      value={staffDetails.yearOfBirth}
                      onChange={handleChange} />
                  <input
                      type="number"
                      name="monthOfBirth"
                      placeholder="Month of Birth"
                      value={staffDetails.monthOfBirth}
                      onChange={handleChange} />
                  <input
                      type="number"
                      name="dayOfBirth"
                      placeholder="Day of Birth"
                      value={staffDetails.dayOfBirth}
                      onChange={handleChange} />
                  <input
                      type="text"
                      name="bloodGroup"
                      placeholder="Blood Group"
                      value={staffDetails.bloodGroup}
                      onChange={handleChange} />
                  <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={staffDetails.email}
                      onChange={handleChange}
                      required />
                  <input
                      type="text"
                      name="designation"
                      placeholder="Designation"
                      value={staffDetails.designation}
                      onChange={handleChange}
                      required />
                  <input
                      type="number"
                      name="salary"
                      placeholder="Salary"
                      value={staffDetails.salary}
                      onChange={handleChange}
                      required />

                  <button type="submit" className="submit-button">Add Staff</button>
              </form>
          </div></>
  );
};

export default AddStaff;
