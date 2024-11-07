import React, { useState, useEffect } from 'react';
import { useNavigate, useParams , Link} from 'react-router-dom';
import axios from 'axios';
import '../style/AddSchedule.css';

const AddDoctorSchedule = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [timeslot, setTimeslot] = useState('');
    const [timeslot1, setTimeslot1] = useState('');
    const [workday, setWorkday] = useState('');


    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLowerCase() !== 'doctor') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        try {
            setTimeslot1(timeslot + ":00");
            console.log(id);
            console.log(timeslot);
            await axios.post(`http://localhost:8080/api/timeslots`, {
                doctorID: id,
                timeslot,
                workday
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            navigate(`/doctor/schedule`);
        } catch (error) {
            console.error('Error adding schedule:', error);
        }
    };

    const handleBack = () => {
        navigate(`/doctor/schedule`);
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
        
      </ul></nav><div className="add-schedule-container">
                <div className="add-schedule">
                    <h1>Add Schedule</h1>
                    <form onSubmit={handleSubmit}>
                        <label>Timeslot:</label>
                        <input type="time" value={timeslot} onChange={(e) => setTimeslot(e.target.value + ":00")} required />

                        <label>Workday:</label>
                        <select value={workday} onChange={(e) => setWorkday(e.target.value)} required>
                            <option value="">Select Day</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </select>

                        <div className="button-group">
                            <button type="button" className="back-button" onClick={handleBack}>Back</button>
                            <button type="submit" className="submit-button">Add Timeslot</button>
                        </div>
                    </form>
                </div>
            </div></>
    );
};

export default AddDoctorSchedule;
