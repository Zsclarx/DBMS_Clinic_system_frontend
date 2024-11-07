// src/DepartmentRegister.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {Link} from 'react-router-dom';
import '../style/DepartmentRegister.css';

const DepartmentRegister = () => {
    const [departmentName, setDepartmentName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'ADMIN') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:8080/departments/save',
                { departmentName, description },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                setMessage('Department saved successfully!');
                setDepartmentName('');
                setDescription('');
            } else {
                setMessage('Failed to save department');
            }
        } catch (error) {
            setMessage(`Error: ${error.response?.data || error.message}`);
        }
    };

    const goBack = () => {
        navigate('/admin/departments');
    };

    return (
        <div className="department-register-page">
            <nav className="navbar">
                <div className="navbar-title">Patient Details</div>
                <ul className="navbar-links">
                    <li><Link to="/admin">Home</Link></li>
                    <li><Link to="/admin/departments">Departments</Link></li>
                    <li><Link to="/admin/doctors">Doctors</Link></li>
                    <li><Link to="/admin/patients">Patients</Link></li>
                    <li><Link to="/admin/staff">Staff</Link></li>
                    <li><Link to="/admin/appointments">Appointments</Link></li>
                </ul>
            </nav>
            <div className="department-register">
                <form onSubmit={handleSubmit}>
                    <h1>Register Department</h1>
                    {message && <p>{message}</p>}
                    <label className="label">Department Name:</label>
                    <input
                        type="text"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        required
                    />
                    <label className="label">Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                    <div className="button-container">
                        <button type="submit" className="register-button">Register</button>
                        <button type="button" className="back-button" onClick={goBack}>
                            <i className="fas fa-arrow-left"></i> Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepartmentRegister;
