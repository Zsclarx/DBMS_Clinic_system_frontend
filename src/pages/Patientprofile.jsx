import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/PatientNavbar'; // Adjust the import path as needed
import '../style/viewprofile.css'; // Import your CSS file for styles
import { useNavigate } from 'react-router-dom';

const PatientProfile = () => {
    const [userDetails, setUserDetails] = useState({});
    const [patientDetails, setPatientDetails] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const userID = localStorage.getItem('userID');
    const authToken = localStorage.getItem('authToken');
    const navigate = useNavigate();
    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLocaleLowerCase() != "patient") {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/users/${userID}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setUserDetails(response.data);
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };

        const fetchPatientDetails = async () => {
            try {
                const response = await axios.get('http://localhost:8080/patients', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const patientData = response.data.find(patient => patient.userID === parseInt(userID, 10));

                if (patientData) {
                    setPatientDetails(patientData);
                } else {
                    console.error("No matching patient found.");
                }
            } catch (error) {
                console.error("Error fetching patient details:", error);
            }
        };

        fetchUserDetails();
        fetchPatientDetails();
    }, [userID, authToken]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:8080/users/${userID}`, userDetails, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            await axios.put(`http://localhost:8080/patients/update/${patientDetails.patientID}`, patientDetails, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            alert("Details updated successfully!");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating details:", error);
        }
    };

    const getAvatarUrl = () => {
        const randomNum = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/id/${randomNum}/100/100`;
    };

    return (
        <div>
            <Navbar />
            <div className="profile-header">
                <img src={getAvatarUrl()} alt="Profile Avatar" className="avatar" />
                <h2>Welcome, {userDetails.firstName} {userDetails.lastName}!</h2>
            </div>

            <div className="profile-container">
                <h2>Profile Details</h2>
                {isEditing ? (
                    <div>
                        <h3>Edit User Details</h3>
                        <input
                            type="text"
                            value={userDetails.firstName}
                            onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                            placeholder="First Name"
                        />
                        <input
                            type="text"
                            value={userDetails.lastName}
                            onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                            placeholder="Last Name"
                        />
                        <input
                            type="text"
                            value={userDetails.email}
                            onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                            placeholder="Email"
                        />
                        <input
                            type="text"
                            value={userDetails.contactInfo}
                            onChange={(e) => setUserDetails({ ...userDetails, contactInfo: e.target.value })}
                            placeholder="Contact Info"
                        />
                        <input
                            type="text"
                            value={userDetails.address}
                            onChange={(e) => setUserDetails({ ...userDetails, address: e.target.value })}
                            placeholder="Address"
                        />

                        <h3>Edit Patient Details</h3>
                        <input
                            type="text"
                            value={patientDetails.emergencyContactName}
                            onChange={(e) => setPatientDetails({ ...patientDetails, emergencyContactName: e.target.value })}
                            placeholder="Emergency Contact Name"
                        />
                        <input
                            type="text"
                            value={patientDetails.emergencyContactPhone}
                            onChange={(e) => setPatientDetails({ ...patientDetails, emergencyContactPhone: e.target.value })}
                            placeholder="Emergency Contact Phone"
                        />
                        <input
                            type="text"
                            value={patientDetails.diseases}
                            onChange={(e) => setPatientDetails({ ...patientDetails, diseases: e.target.value })}
                            placeholder="Diseases"
                        />

                        <div className="button-group">
                            <button onClick={handleUpdate}>Save Changes</button>
                            <button onClick={handleEditToggle} className="cancel">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3>User Details</h3>
                        <p>First Name: {userDetails.firstName}</p>
                        <p>Last Name: {userDetails.lastName}</p>
                        <p>Email: {userDetails.email}</p>
                        <p>Contact Info: {userDetails.contactInfo}</p>
                        <p>Address: {userDetails.address}</p>

                        <h3>Patient Details</h3>
                        <p>Emergency Contact Name: {patientDetails.emergencyContactName}</p>
                        <p>Emergency Contact Phone: {patientDetails.emergencyContactPhone}</p>
                        <p>Diseases: {patientDetails.diseases}</p>

                        <button onClick={handleEditToggle}>Edit</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientProfile;
