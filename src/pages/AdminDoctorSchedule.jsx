import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/DoctorSchedule.css';

const AdminDoctorSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [doctorID, setDoctorID] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('authToken');
    const userID = parseInt(localStorage.getItem('userID'), 10); // Parse userID from localStorage

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLowerCase() !== 'doctor') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    useEffect(() => {
        // Fetch doctors and set doctorID
        const fetchDoctor = async () => {
            try {
                const doctorsResponse = await axios.get(`http://localhost:8080/doctors`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const doctors = doctorsResponse.data;
                const doctor = doctors.find(doc => doc.userID === userID);
                console.log(doctor);    
                
                if (doctor) {
                    setDoctorID(doctor.doctorID); // Set doctorID based on the matching doctor
                } else {
                    console.error('Doctor not found for the given userID');
                }
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };

        fetchDoctor();
    }, [token, userID]);

    useEffect(() => {
        if (doctorID !== null) {
            fetchDoctorSchedule();
        }
    }, [doctorID]);

    const fetchDoctorSchedule = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/timeslots/doctor/${doctorID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSchedule(response.data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
    };

    const deleteTimeslot = async (timeslot) => {
        if (window.confirm('Are you sure you want to delete this timeslot?')) {
            try {
                await axios.delete(`http://localhost:8080/api/timeslots/${doctorID}/${timeslot}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchDoctorSchedule(); // Refresh after deletion
            } catch (error) {
                console.error('Error deleting timeslot:', error);
            }
        }
    };

    const addTimeslot = () => {
        navigate(`/doctor/schedule/add/${doctorID}`);
    };

    return (
        <><nav className="navbar">
            <div className="navbar-title">Doctor Dashboard</div>
            <ul className="navbar-links">
        <li><Link to="/doctors">Home</Link></li>
        <li><Link to="/doctor/profile">Profile</Link></li>
        <li><Link to="/doctor/appointments">Appointments</Link></li>
        <li><Link to="/doctor/schedule">Schedule</Link></li>
        <li><Link to="/logout">Logout</Link></li>
        
      </ul></nav><div className="doctor-schedule">
                <h1>Doctor's Schedule</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Timeslot</th>
                            <th>Workday</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((slot, index) => (
                            <tr key={index}>
                                <td>{slot.timeslot}</td>
                                <td>{slot.workday}</td>
                                <td>
                                    <button onClick={() => deleteTimeslot(slot.timeslot)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={addTimeslot} className="add-schedule-btn">Add Schedule</button>
            </div></>
    );
};

export default AdminDoctorSchedule;
