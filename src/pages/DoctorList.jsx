import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/DoctorList.css';
import {Link} from 'react-router-dom';


function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorsAndDepartments = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      try {
        // Fetch doctors
        const doctorsResponse = await fetch('http://localhost:8080/doctors', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!doctorsResponse.ok) throw new Error('Failed to fetch doctors');

        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData);

        // Fetch departments
        const departmentsResponse = await fetch('http://localhost:8080/departments/all', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!departmentsResponse.ok) throw new Error('Failed to fetch departments');

        const departmentsData = await departmentsResponse.json();
        const departmentMap = departmentsData.reduce((map, department) => {
          map[department.departmentID] = department.departmentName;
          return map;
        }, {});

        setDepartments(departmentMap);

        // Fetch users for doctors
        const userPromises = doctorsData.map(async (doctor) => {
          const userResponse = await fetch(`http://localhost:8080/users/${doctor.userID}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!userResponse.ok) throw new Error(`Failed to fetch user with ID ${doctor.userID}`);
          return userResponse.json();
        });

        const usersData = await Promise.all(userPromises);
        const usersMap = usersData.reduce((map, user) => {
          map[user.userID] = `${user.firstName} ${user.lastName}`;
          return map;
        }, {});

        setUsers(usersMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsAndDepartments();
  }, []);

  const handleDoctorClick = (doctorID) => {
    navigate(`/admin/doctors/${doctorID}`);
  };

  const handleAddDoctor = () => {
    navigate('/admin/doctors/add'); // This line ensures the navigation to the add doctor page
  };



  const filteredDoctors = doctors.filter(doctor => {
    const doctorName = users[doctor.userID] || '';
    return doctorName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <><nav className="navbar">
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
    </nav><div className="doctors-container">
        <h1>Doctors List</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar" />
        <button className="add-doctor-button" onClick={handleAddDoctor}>
          Add Doctor
        </button>

        {error ? (
          <p className="error-message">{error}</p>
        ) : loading ? (
          <p className="loading">Loading doctors...</p>
        ) : filteredDoctors.length === 0 ? (
          <p>No doctors available.</p>
        ) : (
          filteredDoctors.map((doctor) => (
            <button
              key={doctor.doctorID}
              className="doctor-button"
              onClick={() => handleDoctorClick(doctor.doctorID)}
              aria-label={`View details for ${users[doctor.userID] || 'Unknown'}`}
            >
              <div className="doctor-info">
                <p><strong>Name:</strong> {users[doctor.userID] || 'Unknown'}</p>
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                <p><strong>Department:</strong> {departments[doctor.departmentID] || 'Unknown'}</p>
              </div>
            </button>
          ))
        )}
      </div></>
  );
}

export default DoctorList;
