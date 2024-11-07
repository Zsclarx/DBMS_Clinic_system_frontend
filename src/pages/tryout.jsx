import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const App1 = () => {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('today');
    const [loading, setLoading] = useState(true);
    const [doctorID, setDoctorID] = useState(null);
    const [users, setUsers] = useState([]);
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');
    
    // Fetch doctor details based on userID
    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLowerCase() !== 'doctor') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }

        const fetchDoctorDetails = async () => {
            try {
                // Fetch the current user's ID (doctor)
                const currentUserID = localStorage.getItem('userID');
                
                const doctorResponse = await axios.get("http://localhost:8080/doctors", {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                console.log(currentUserID);
                const currentDoctor = doctorResponse.data.find(doctor => doctor.userID == currentUserID);
                console.log(currentDoctor);
                if (currentDoctor) {
                    setDoctorID(currentDoctor.doctorID);
                }

                // Fetch user and patient data
                const userResponse = await axios.get("http://localhost:8080/users", {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                setUsers(userResponse.data);

                const patientResponse = await axios.get("http://localhost:8080/patients", {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                setPatients(patientResponse.data);
            } catch (error) {
                console.error('Error fetching doctor and user details:', error);
            }
        };

        fetchDoctorDetails();
    }, [navigate, token]);

    // Fetch appointments for the specific doctor
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/appointments/all", {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Filter appointments for the logged-in doctor
            const doctorAppointments = response.data.filter(app => app.doctorID == doctorID);
            setAppointments(doctorAppointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [token, doctorID]);

    useEffect(() => {
        if (doctorID) {
            fetchAppointments();
        }
    }, [doctorID, fetchAppointments]);

    // Function to get the patient's name by patientID
    const getPatientName = (patientID) => {
        const patient = patients.find(p => p.patientID == patientID);
        if (patient) {
            const user = users.find(user => user.userID == patient.userID);
            return user ? `${user.firstName} ${user.lastName}` : "Unknown Patient";
        }
        return "Unknown Patient";
    };

    // Handle appointment status update
    const handleNotification = async (appointmentID, newStatus) => {
        try {
            // Fetch the patient details to get the userID
            const appointment = appointments.find(app => app.appointmentID == appointmentID);
            if (!appointment) return;

            const patientResponse = await axios.get(`http://localhost:8080/patients/${appointment.patientID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const userID = patientResponse.data.userID;

            // Create the notification message
            const notificationMessage = `Your appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} is ${newStatus}`;
            
            // Save the notification
            await axios.post(`http://localhost:8080/notifications/save`, 
                { appointmentID, userID, message: notificationMessage },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error handling notification:', error);
        }
    };

    const handleAccept = async (appointmentID) => {
        try {
            await axios.put(`http://localhost:8080/appointments/update`, 
                { appointmentID, status: 'Approved' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment.appointmentID === appointmentID ? { ...appointment, status: 'Approved' } : appointment
                )
            );

            await handleNotification(appointmentID, 'Approved'); // Send notification
        } catch (error) {
            console.error('Error accepting appointment:', error);
        }
    };

    const handleDecline = async (appointmentID) => {
        try {
            await axios.put(`http://localhost:8080/appointments/update`, 
                { appointmentID, status: 'Declined' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setAppointments((prev) =>
                prev.map((appointment) =>
                    appointment.appointmentID === appointmentID ? { ...appointment, status: 'Declined' } : appointment
                )
            );
            
            await handleNotification(appointmentID, 'Declined'); // Send notification
        } catch (error) {
            console.error('Error declining appointment:', error);
        }
    };

    const filteredAppointments = appointments.filter((appointment) => {
        if (filter === 'pending') return appointment.status.toLowerCase() === 'pending';
        if (filter === 'today') return new Date(appointment.appointmentDate).toDateString() === new Date().toDateString();
        if (filter === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return new Date(appointment.appointmentDate).toDateString() === tomorrow.toDateString();
        }
        return true;
    });

    return (
        <>
            <div>
                <nav className="navbar">
                    <div className="navbar-title">Doctor Dashboard</div>
                    <ul className="navbar-links">
                        <li><Link to="/doctors">Home</Link></li>
                        <li><Link to="/doctor/profile">Profile</Link></li>
                        <li><Link to="/doctor/appointments">Appointments</Link></li>
                        <li><Link to="/doctor/schedule">Schedule</Link></li>
                        <li><Link to="/logout">Logout</Link></li>
                        
                    </ul>
                </nav>
            </div>
            <div className="appointments-container">
                <h1>Appointments</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div className="filters">
                            <button onClick={() => setFilter('all')}>All</button>
                            <button onClick={() => setFilter('pending')}>Pending</button>
                            <button onClick={() => setFilter('today')}>Today</button>
                            <button onClick={() => setFilter('tomorrow')}>Tomorrow</button>
                        </div>
                        <table className="appointments-table">
                            <thead>
                                <tr>
                                    <th>Appointment ID</th>
                                    <th>Patient Name</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map((appointment) => (
                                    <tr key={appointment.appointmentID}>
                                        <td>{appointment.appointmentID}</td>
                                        <td>{getPatientName(appointment.patientID)}</td>
                                        <td>{new Date(appointment.appointmentDate).toISOString().slice(0, 10)}</td>
                                        <td>{appointment.time}</td>
                                        <td>{appointment.status}</td>
                                        <td>
                                            {appointment.status.toLowerCase() === 'pending' ? (
                                                <>
                                                    <button onClick={() => handleAccept(appointment.appointmentID)}>Accept</button>
                                                    <button onClick={() => handleDecline(appointment.appointmentID)}>Decline</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button disabled>{appointment.status}</button>
                                                    {appointment.status.toLowerCase() === 'approved' && (
                                                        <>
                                                            <button onClick={() => navigate(`/doctor/add-dosage/${appointment.appointmentID}`)}>Add Dosage</button>
                                                            <button onClick={() => navigate(`/doctor/see-dosage/${appointment.appointmentID}`)}>See Dosage</button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </>
    );
};

export default App1;
