import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import md5 from 'md5';
import '../style/PatientDashboard.css';

const PatientDashboard = () => {
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [user, setUser] = useState({});
    const navigate = useNavigate();


    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLowerCase() !== 'patient') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://localhost:8080/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(response.data);
            setHasUnread(response.data.length > 0);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const fetchUserInfo = async () => {
        const userId = localStorage.getItem('userID');
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get(`http://localhost:8080/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    const getGravatarUrl = (email) => {
        const hash = md5(email.trim().toLowerCase());
        return `https://www.gravatar.com/avatar/${hash}?d=identicon`; // 'identicon' provides a randomly generated image
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Session expired. Please log in again.');
            navigate('/login');
        } else {
            fetchUserInfo();
            fetchNotifications();
        }
    }, [navigate]);

    const handleNotificationsClick = () => {
        setHasUnread(false);
        navigate('/patient/notifications');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userID');
        navigate('/logout');
    };


    return (
        <div className="patient-dashboard">
            <div className="welcome-section">
                <div className="welcome-card">
                    <h1>Welcome, {user.firstName} {user.lastName}!</h1>
                    <div className="profile-icon">
                        <img src={user.email ? getGravatarUrl(user.email) : 'path/to/default-avatar.jpg'} alt="Profile Avatar" />
                    </div>
                    <p>Your health journey starts here. Navigate through your options below.</p>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>

                </div>

                <div className="notifications-dropdown">
                    <button className="notifications-button" onClick={handleNotificationsClick}>
                        Notifications
                        {hasUnread && <span className="notification-badge">1</span>}
                    </button>
                </div>
            </div>

            <div className="dashboard-options">
                <Link to="/patient/book-appointment" className="dashboard-card">
                    <div className="foreground">Book an Appointment</div>
                </Link>
                <Link to="/patient/profile" className="dashboard-card">
                    <div className="foreground">View Profile</div>
                </Link>
                <Link to="/patient/appointments" className="dashboard-card">
                    <div className="foreground"> Appointments</div>
                </Link>
            
                <Link to="/patient/bills" className="dashboard-card">
                    <div className="foreground">See Bills</div>
                </Link>
                <Link to="/patient/prescriptions" className="dashboard-card">
                    <div className="foreground">Check Prescriptions</div>
                </Link>
                <Link to="/patient/departments" className="dashboard-card">
                    <div className="foreground">View Departments</div>
                </Link>
            </div>
        </div>
    );
};

export default PatientDashboard;
