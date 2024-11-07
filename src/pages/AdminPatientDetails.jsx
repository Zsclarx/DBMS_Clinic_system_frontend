import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/PatientDetails.css';

const AdminPatientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [patient, setPatient] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');

        if (!authToken || userRole !== 'ADMIN') {
            navigate('/login', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }

        const fetchDetails = async () => {
            try {
                const patientResponse = await axios.get(`http://localhost:8080/patients/${id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });
                setPatient(patientResponse.data);

                const userResponse = await axios.get(`http://localhost:8080/users/${patientResponse.data.userID}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });
                setUser(userResponse.data);
            } catch (error) {
                console.error('Error fetching details:', error);
                setError('Failed to fetch details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id, navigate]);

    const openDeleteModal = () => setShowModal(true);
    const closeDeleteModal = () => setShowModal(false);

    const confirmDelete = async () => {
        const authToken = localStorage.getItem('authToken');
        if (patient?.userID) {
            try {
                // Delete the patient entry
                await axios.delete(`http://localhost:8080/patients/delete/${id}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });

                // Delete the corresponding user entry
                await axios.delete(`http://localhost:8080/users/${patient.userID}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });

                navigate('/admin/patients');
            } catch (error) {
                console.error('Error deleting patient or user:', error);
                setError('Failed to delete patient and/or user');
            } finally {
                closeDeleteModal();
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <nav className="navbar" style={{ backgroundColor: '#333', padding: '10px', color: '#fff' }}>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Patient Details</div>
                <ul style={{ listStyleType: 'none', display: 'flex', gap: '15px' }}>
                    <li><Link to="/admin" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link></li>
                    <li><Link to="/admin/departments" style={{ color: '#fff', textDecoration: 'none' }}>Departments</Link></li>
                    <li><Link to="/admin/doctors" style={{ color: '#fff', textDecoration: 'none' }}>Doctors</Link></li>
                    <li><Link to="/admin/patients" style={{ color: '#fff', textDecoration: 'none' }}>Patients</Link></li>
                    <li><Link to="/admin/staff" style={{ color: '#fff', textDecoration: 'none' }}>Staff</Link></li>
                    <li><Link to="/admin/appointments" style={{ color: '#fff', textDecoration: 'none' }}>Appointments</Link></li>
                </ul>
            </nav>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '40px',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '10px',
                    padding: '30px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    {loading ? (
                        <p>Loading patient details...</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>{error}</p>
                    ) : (
                        user && patient && (
                            <>
                                <h2 style={{ color: '#333', textAlign: 'center' }}>
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Contact Info:</strong> {user.contactInfo}</p>
                                <p><strong>Address:</strong> {user.address}</p>
                                <p><strong>Gender:</strong> {user.gender}</p>
                                <p><strong>Blood Group:</strong> {user.bloodGroup}</p>
                                <p><strong>Birthdate:</strong> {user.dayOfBirth}/{user.monthOfBirth}/{user.yearOfBirth}</p>
                                <p><strong>Age:</strong> {user.age}</p>
                                <p><strong>Diseases:</strong> {patient.diseases}</p>
                                <p><strong>Emergency Contact Name:</strong> {patient.emergencyContactName}</p>
                                <p><strong>Emergency Contact Phone:</strong> {patient.emergencyContactPhone}</p>
                                <p><strong>Emergency Contact Address:</strong> {patient.emergencyContactAddress}</p>
                                
                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={openDeleteModal}
                                        style={{
                                            backgroundColor: 'red',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete Patient
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/patients')}
                                        style={{
                                            backgroundColor: 'blue',
                                            color: 'white',
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Back
                                    </button>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this patient and their user account?</p>
                        <div className="modal-buttons">
                            <button onClick={confirmDelete} className="confirm-btn">Yes, Delete</button>
                            <button onClick={closeDeleteModal} className="cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPatientDetails;
