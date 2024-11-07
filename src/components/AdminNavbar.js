// src/components/AdminNavbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../style/AdminNavbar.css';

const AdminNavbar = () => {
    return (
        <nav className="admin-navbar">
            <h2>Admin Dashboard</h2>
            <div className="nav-links">
                <NavLink to="/admin/departments">Departments</NavLink>
                <NavLink to="/admin/patients">Patients</NavLink>
                <NavLink to="/admin/doctors">Doctors</NavLink>
                <NavLink to="/admin/staff">Staff</NavLink>
                <NavLink to="/admin/appointments">Appointments</NavLink>
                <NavLink to="/logout">Logout</NavLink>
            </div>
        </nav>
    );
};

export default AdminNavbar;
