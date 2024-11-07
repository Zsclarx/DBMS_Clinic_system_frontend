import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/AdminPatient.css';

const AdminPatient = () => {
    const [patients, setPatients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'ADMIN') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);
    
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://localhost:8080/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const patientData = response.data;

            const userPromises = patientData.map(async (patient) => {
                const userResponse = await axios.get(`http://localhost:8080/users/${patient.userID}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return { ...patient, user: userResponse.data };
            });

            const patientsWithUsers = await Promise.all(userPromises);
            setPatients(patientsWithUsers);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const openDeleteModal = (patientID, userID) => {
        setSelectedPatient({ patientID, userID });
        setShowModal(true);
    };

    const closeDeleteModal = () => {
        setShowModal(false);
        setSelectedPatient(null);
    };

    const confirmDelete = async () => {
        if (selectedPatient) {
            const { patientID, userID } = selectedPatient;
            try {
                const token = localStorage.getItem('authToken');
                await axios.delete(`http://localhost:8080/patients/delete/${patientID}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                await axios.delete(`http://localhost:8080/users/${userID}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchPatients();
                closeDeleteModal();
            } catch (error) {
                console.error('Error deleting patient:', error);
            }
        }
    };

    const viewDetails = (patientID) => {
        navigate(`/admin/patient/${patientID}`);
    };

    return (
        <>
            <div>
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
            </div>
            
            <div className="container">
                <div className="department-list">
                    <h1>Patients</h1>
                    {patients.length === 0 ? (
                        <p>No patients found.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Diseases</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map(patient => (
                                    <tr key={patient.patientID}>
                                        <td>{patient.user ? `${patient.user.firstName} ${patient.user.lastName}` : 'Unknown'}</td>
                                        <td>{patient.diseases || 'No diseases listed'}</td>
                                        <td>
                                            <div className="button-group">
                                                <button onClick={() => openDeleteModal(patient.patientID, patient.user ? patient.user.userID : null)}>Delete</button>
                                                <button onClick={() => viewDetails(patient.patientID)}>More Details</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this patient?</p>
                        <div className="modal-buttons">
                            <button onClick={confirmDelete} className="confirm-btn">Yes, Delete</button>
                            <button onClick={closeDeleteModal} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminPatient;
