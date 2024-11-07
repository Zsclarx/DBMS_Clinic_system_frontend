import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../style/NotificationList.css';
import Navbar from '../components/PatientNavbar';
import { useNavigate } from 'react-router-dom';

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const userID = localStorage.getItem('userID');

    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLocaleLowerCase() !== "patient") {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const response = await axios.get(`http://localhost:8080/notifications/user/${userID}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setNotifications(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [userID]);

    // Function to handle search input
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Filter notifications based on the search term
    const filteredNotifications = notifications.filter(notification =>
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div><Navbar /></div>
            <div className="notification-list">
                <h1>User Notifications</h1>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                {filteredNotifications.length === 0 ? (
                    <p>No notifications available.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNotifications.map((notification, index) => (
                                <tr key={notification.notificationID}>
                                    <td>{index + 1}</td>
                                    <td>{notification.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default NotificationList;
