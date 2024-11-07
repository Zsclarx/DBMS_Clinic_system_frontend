import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../style/doctorHome.css';

const DoctorHome = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLowerCase() !== 'doctor') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    const doctorName = "Dr. John Doe"; // Example name; you can fetch it dynamically
    const avatarUrl = `https://ui-avatars.com/api/?name=${doctorName.replace(' ', '+')}&size=128&background=0073e6&color=ffffff`;

    return (
        <div className="doctor-home">
    <div className="doctor-welcome">
        <img src={avatarUrl} alt="Doctor Avatar" className="doctor-avatar" />
        <h1>Welcome, {doctorName}</h1>
        <p>Your health, our priority.</p>
        
        {/* Logout Button */}
        <button className="logout-button" onClick={() => navigate('/logout')}>
            Logout
        </button>
    </div>

    <div className="doctor-options">
        <div className="doctor-option-card" onClick={() => navigate('/doctor/profile')}>
            <h2>View Profile</h2>
            <p>Check and update your profile details.</p>
        </div>
        <div className="doctor-option-card" onClick={() => navigate('/doctor/schedule')}>
            <h2>View Weekly Schedule</h2>
            <p>See your upcoming appointments for the week.</p>
        </div>
        <div className="doctor-option-card" onClick={() => navigate('/doctor/appointments')}>
            <h2>See All Appointments</h2>
            <p>Browse and manage all your patient appointments.</p>
        </div>
    </div>
</div>

    );
};

export default DoctorHome;
