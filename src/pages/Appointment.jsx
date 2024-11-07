import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/Appointment.css';

const AppointmentPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [doctorName, setDoctorName] = useState('');
    const [patientName, setPatientName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'ADMIN') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get("http://localhost:8080/appointments/all", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsersDoctorsAndPatients = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const [usersResponse, doctorsResponse, patientsResponse] = await Promise.all([
                axios.get("http://localhost:8080/users", {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                axios.get("http://localhost:8080/doctors", {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                axios.get("http://localhost:8080/patients", {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
            ]);
            setUsers(usersResponse.data);
            setDoctors(doctorsResponse.data);
            setPatients(patientsResponse.data);
        } catch (error) {
            console.error('Error fetching users, doctors, or patients:', error);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
        fetchUsersDoctorsAndPatients();
    }, [fetchAppointments, fetchUsersDoctorsAndPatients]);

    const getUserIDForDoctor = (doctorID) => {
        const doctor = doctors.find((doc) => doc.doctorID === doctorID);
        return doctor ? doctor.userID : null;
    };

    const getUserIDForPatient = (patientID) => {
        const patient = patients.find((pat) => pat.patientID === patientID);
        return patient ? patient.userID : null;
    };

    const getUserName = (userID) => {
        const user = users.find((usr) => usr.userID === userID);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    };

    const filteredAppointments = appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate).toDateString();
        const today = new Date().toDateString();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const filterByDate = 
            (filter === 'pending' && appointment.status === 'Pending') ||
            (filter === 'today' && appointmentDate === today) ||
            (filter === 'tomorrow' && appointmentDate === tomorrow.toDateString()) ||
            (filter === 'all');

        const doctorUserID = getUserIDForDoctor(appointment.doctorID);
        const patientUserID = getUserIDForPatient(appointment.patientID);
        const doctorFullName = getUserName(doctorUserID).toLowerCase();
        const patientFullName = getUserName(patientUserID).toLowerCase();

        const filterByDoctorName = doctorName ? doctorFullName.includes(doctorName.toLowerCase()) : true;
        const filterByPatientName = patientName ? patientFullName.includes(patientName.toLowerCase()) : true;

        return filterByDate && filterByDoctorName && filterByPatientName;
    });

    return (
        <div className="appointments-container">
            <nav className="navbar">
                <div className="navbar-title">Appointment System</div>
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
                        <div>
                            <label>Doctor Name:</label>
                            <input
                                type="text"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                placeholder="Filter by Doctor Name"
                            />
                        </div>
                        <div>
                            <label>Patient Name:</label>
                            <input
                                type="text"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder="Filter by Patient Name"
                            />
                        </div>
                    </div>
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Patient Name</th>
                                <th>Doctor Name</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map((appointment, index) => {
                                const doctorUserID = getUserIDForDoctor(appointment.doctorID);
                                const patientUserID = getUserIDForPatient(appointment.patientID);
                                return (
                                    <tr key={appointment.appointmentID}>
                                        <td>{index + 1}</td>
                                        <td>{getUserName(patientUserID)}</td>
                                        <td>{getUserName(doctorUserID)}</td>
                                        <td>{new Date(appointment.appointmentDate).toISOString().slice(0, 10)}</td>
                                        <td>{appointment.time}</td>
                                        <td>{appointment.status}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default AppointmentPage;
