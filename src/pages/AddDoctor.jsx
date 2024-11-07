import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../style/AddDoctor.css'; // Adjust as necessary

const AddDoctor = () => {
  const [doctorDetails, setDoctorDetails] = useState({
    username: '',
    password: '',
    role: 'Doctor',
    contactInfo: '',
    yearOfBirth: '',
    monthOfBirth: '',
    dayOfBirth: '',
    bloodGroup: '',
    firstName: '',
    lastName: '',
    email: '',
    specialization: '',
    fees: '',
    departmentID: '',
    address: '', // Field for address
    gender: '',  // Field for gender
    age: '',     // Field for age
    qualifications: [''], // Start with one empty qualification
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch('http://localhost:8080/departments/all', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }

        const departmentsData = await response.json();
        setDepartments(departmentsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear validation errors on input change
    setValidationErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const addQualificationField = () => {
    setDoctorDetails((prevDetails) => ({
      ...prevDetails,
      qualifications: [...prevDetails.qualifications, ''],
    }));
  };

  const handleQualificationChange = (index, value) => {
    const updatedQualifications = [...doctorDetails.qualifications];
    updatedQualifications[index] = value;
    setDoctorDetails((prevDetails) => ({ ...prevDetails, qualifications: updatedQualifications }));
  };

  const validateInputs = () => {
    const errors = {};

    // Phone number validation
    if (doctorDetails.contactInfo && !/^\d{10}$/.test(doctorDetails.contactInfo)) {
      errors.contactInfo = 'Phone number must be 10 digits.';
    }

    // Date of Birth validation
    if (!doctorDetails.yearOfBirth || !doctorDetails.monthOfBirth || !doctorDetails.dayOfBirth) {
      errors.dateOfBirth = 'Date of Birth is required.';
    } else {
      const day = parseInt(doctorDetails.dayOfBirth, 10);
      const month = parseInt(doctorDetails.monthOfBirth, 10) - 1; // Month is 0-indexed
      const year = parseInt(doctorDetails.yearOfBirth, 10);
      const birthDate = new Date(year, month, day);

      // Check for valid date
      if (
        birthDate.getFullYear() !== year ||
        birthDate.getMonth() !== month ||
        birthDate.getDate() !== day
      ) {
        errors.dateOfBirth = 'Invalid date of birth.';
      }
    }

    // Add additional validations as necessary

    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateInputs()) {
      return;
    }
  
    const token = localStorage.getItem('authToken');
  
    try {
      const userResponse = await fetch('http://localhost:8080/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: doctorDetails.username,
          password: doctorDetails.password,
          role: doctorDetails.role,
          contactInfo: doctorDetails.contactInfo,
          yearOfBirth: parseInt(doctorDetails.yearOfBirth, 10),
          monthOfBirth: parseInt(doctorDetails.monthOfBirth, 10),
          dayOfBirth: parseInt(doctorDetails.dayOfBirth, 10),
          bloodGroup: doctorDetails.bloodGroup,
          firstName: doctorDetails.firstName,
          lastName: doctorDetails.lastName,
          email: doctorDetails.email,
          address: doctorDetails.address,
          gender: doctorDetails.gender,
          age: doctorDetails.age,
        }),
      });
  
      if (!userResponse.ok) {
        const errorResponse = await userResponse.json().catch(() => null);
        console.error('Error response:', errorResponse);
  
        if (userResponse.status === 409) {
          throw new Error("This username already exists.");
        }
  
        const errorMessage = errorResponse?.message || 'Failed to create user';
        throw new Error(errorMessage);
      }
  
      const userData = await userResponse.json();
  
      const doctorResponse = await fetch('http://localhost:8080/doctors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: userData.userID,
          specialization: doctorDetails.specialization,
          fees: parseFloat(doctorDetails.fees),
          departmentID: parseInt(doctorDetails.departmentID, 10),
          rating: 5.00,
        }),
      });
  
      if (!doctorResponse.ok) {
        const errorResponse = await doctorResponse.json().catch(() => null);
        throw new Error(errorResponse?.message || 'Failed to create doctor');
      }
  
      // Now that the doctor is created, fetch the last doctor ID
      const allDoctorsResponse = await fetch('http://localhost:8080/doctors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!allDoctorsResponse.ok) {
        const errorResponse = await allDoctorsResponse.json().catch(() => null);
        throw new Error(errorResponse?.message || 'Failed to fetch all doctors');
      }
  
      const allDoctors = await allDoctorsResponse.json();
  
      // Get the last doctor's ID (assuming the list is sorted by ID)
      const lastDoctor = allDoctors[allDoctors.length - 1];
      const lastDoctorID = lastDoctor.doctorID;
  
      console.log('Last doctor ID:', lastDoctorID);
  
      // Send qualifications after creating the doctor
      if (doctorDetails.qualifications[0]) {
        await Promise.all(
          doctorDetails.qualifications.map(async (qualification) => {
            return fetch('http://localhost:8080/qualifications/save', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                doctorID: lastDoctorID, // Use the last doctor ID
                degree: qualification,
              }),
            });
          })
        );
      }
  
      // Redirect to doctor list after successful addition
      navigate('/admin/doctors');
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <>
      <nav className="navbar">
        <div className="navbar-title">Patient Management</div>
        <ul className="navbar-links">
          <li><Link to="/admin">Home</Link></li>
          <li><Link to="/admin/departments">Departments</Link></li>
          <li><Link to="/admin/doctors">Doctors</Link></li>
          <li><Link to="/admin/patients">Patients</Link></li>
          <li><Link to="/admin/staff">Staff</Link></li>
          <li><Link to="/admin/appointments">Appointments</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>

      <div className="add-doctor-container">
        <h1>Add Doctor</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Existing fields */}
          <label>First Name</label>
          <input type="text" name="firstName" value={doctorDetails.firstName} onChange={handleChange} required />

          <label>Last Name</label>
          <input type="text" name="lastName" value={doctorDetails.lastName} onChange={handleChange} required />

          <label>Username</label>
          <input type="text" name="username" value={doctorDetails.username} onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" value={doctorDetails.password} onChange={handleChange} required />

          <label>Contact Info (10 digits)</label>
          <input type="text" name="contactInfo" value={doctorDetails.contactInfo} onChange={handleChange} />
          {validationErrors.contactInfo && <span className="error">{validationErrors.contactInfo}</span>}

          <label>Address</label>
          <input type="text" name="address" value={doctorDetails.address} onChange={handleChange} required />

          <label>Gender</label>
          <select name="gender" value={doctorDetails.gender} onChange={handleChange} required>
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>Year of Birth</label>
          <input type="number" name="yearOfBirth" value={doctorDetails.yearOfBirth} onChange={handleChange} />

          <label>Month of Birth</label>
          <input type="number" name="monthOfBirth" value={doctorDetails.monthOfBirth} onChange={handleChange} />

          <label>Day of Birth</label>
          <input type="number" name="dayOfBirth" value={doctorDetails.dayOfBirth} onChange={handleChange} />
          {validationErrors.dateOfBirth && <span className="error">{validationErrors.dateOfBirth}</span>}

          <label>Blood Group</label>
          <input type="text" name="bloodGroup" value={doctorDetails.bloodGroup} onChange={handleChange} />

          <label>Email</label>
          <input type="email" name="email" value={doctorDetails.email} onChange={handleChange} required />

          <label>Specialization</label>
          <input type="text" name="specialization" value={doctorDetails.specialization} onChange={handleChange} required />

          <label>Fees</label>
          <input type="number" name="fees" value={doctorDetails.fees} onChange={handleChange} required />

          <label>Department</label>
          <select name="departmentID" value={doctorDetails.departmentID} onChange={handleChange} required>
            <option value="" disabled>Select Department</option>
            {departments.map((department) => (
              <option key={department.departmentID} value={department.departmentID}>
                {department.departmentName}
              </option>
            ))}
          </select>

          {/* Qualifications Section */}
          <label>Qualifications</label>
          {doctorDetails.qualifications.map((qualification, index) => (
            <input
              key={index}
              type="text"
              value={qualification}
              onChange={(e) => handleQualificationChange(index, e.target.value)}
              placeholder="Enter qualification"
              required={index === 0}
            />
          ))}
          <button type="button" onClick={addQualificationField}>Add More</button>

          <button type="submit">Add Doctor</button>
        </form>
      </div>
    </>
  );
};

export default AddDoctor;
