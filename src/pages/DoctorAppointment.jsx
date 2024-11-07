import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/DoctorAppointment.css';

const DoctorAppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const doctorID = localStorage.getItem('doctorID'); // Retrieve doctorID from localStorage
    const authToken = localStorage.getItem('authToken');
    const navigate = useNavigate();

    // Check authentication and authorization
    // useEffect(() => {
    //     if (!authToken || !doctorID) {
    //         navigate('/login', { state: { flashMessage: 'Please log in to view appointments.' } });
    //         return;
    //     }
    // }, [navigate, authToken, doctorID]);

    // Fetch appointments for the doctor
    const fetchDoctorAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/appointments/doctor/${doctorID}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching doctor appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [doctorID, authToken]);

    useEffect(() => {
        fetchDoctorAppointments();
    }, [fetchDoctorAppointments]);

    // Handle appointment status update
    const updateAppointmentStatus = async (appointmentID, status) => {
        try {
            await axios.put(
                `http://localhost:8080/appointments/update-status/${appointmentID}`,
                { status },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );
            fetchDoctorAppointments(); // Refresh appointments list after updating
        } catch (error) {
            console.error(`Error updating appointment status:`, error);
        }
    };

    return (
        <><nav className="navbar">
            <div className="navbar-title"> Doctor Dashboard</div>
            <ul className="navbar-links">
                <li><Link to="/doctors">Home</Link></li>
                <li><Link to="/doctor/profile">Profile</Link></li>
                <li><Link to="/doctor/appointments">Appointments</Link></li>
                <li><Link to="/doctor/schedule">Schedule</Link></li>

            </ul>
        </nav><div className="doctor-detail-container"></div><div className="doctor-appointments-container">
                <h1>Your Appointments</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Appointment ID</th>
                                <th>Patient ID</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment.appointmentID}>
                                    <td>{appointment.appointmentID}</td>
                                    <td>{appointment.patientID}</td>
                                    <td>{new Date(appointment.appointmentDate).toISOString().slice(0, 10)}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.status}</td>
                                    <td>
                                        <button
                                            onClick={() => updateAppointmentStatus(appointment.appointmentID, 'Confirmed')}
                                            disabled={appointment.status === 'Confirmed'}
                                            className="confirm-btn"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => updateAppointmentStatus(appointment.appointmentID, 'Declined')}
                                            disabled={appointment.status === 'Declined'}
                                            className="decline-btn"
                                        >
                                            Decline
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div></>
    );
};

export default DoctorAppointmentsPage;
