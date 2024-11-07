// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../style/patientnavbar.css'; // Create a CSS file for navbar styling

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-links">
                <li><Link to="/patients">Dashboard</Link></li>
                <li><Link to="/patient/book-appointment">Book Appointment</Link></li>
                <li><Link to="/patient/profile">View Profile</Link></li>
                <li><Link to="/patient/appointments">Appointments</Link></li>
                <li><Link to="/patient/bills">See Bills</Link></li>
                <li><Link to="/patient/prescriptions">Check Prescriptions</Link></li>
                <li><Link to="/patient/departments">View Departments</Link></li>
                <li><Link to="/logout">Logout</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;