import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/DepartmentList.css';

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formData, setFormData] = useState({ description: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole !== 'ADMIN') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }

        fetchDepartments();
    }, [navigate]);

    const fetchDepartments = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:8080/departments/all', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const deleteDepartment = async (id) => {
        try {
            const authToken = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:8080/departments/delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            fetchDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
        }
    };

    const startEditing = (department) => {
        setEditingDepartment(department);
        setFormData({ description: department.description });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const submitEdit = async () => {
        try {
            const authToken = localStorage.getItem('authToken');
            formData.departmentName = editingDepartment.departmentName;
            await axios.put(`http://localhost:8080/departments/update`, {
                departmentID: editingDepartment.departmentID,
                ...formData
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            setEditingDepartment(null);
            fetchDepartments();
        } catch (error) {
            console.error('Error updating department:', error);
        }
    };

    const handleAddDepartment = () => {
        navigate('/register/department');
    };

    const handleBack = () => {
        navigate('/admin'); // Navigate back to the admin home
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-title">Departments Page</div>
                <ul className="navbar-links">
                    <li><a href="/admin">Home</a></li>
                    <li><a href="/admin/departments">Departments</a></li>
                    <li><a href="/admin/doctors">Doctors</a></li>
                    <li><a href="/admin/patients">Patients</a></li>
                    <li><a href="/admin/staff">Staff</a></li>
                    <li><a href="/admin/appointments">Appointments</a></li>
                    <li><Link to="/logout">Logout</Link></li>
                </ul>
            </nav>
            <div className="department-list">
                <h1>Departments</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(department => (
                            <tr key={department.departmentID}>
                                <td>{department.departmentName}</td>
                                <td>{department.description}</td>
                                <td>
                                    <div className="button-group">
                                        <button onClick={() => deleteDepartment(department.departmentID)}>Delete</button>
                                        <button onClick={() => startEditing(department)}>Edit</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="add-department-button" onClick={handleAddDepartment}>
                    Add Department
                </button>
                {/* Back button moved below the Add Department button */}
                <button className="back-button" onClick={handleBack}>Back</button>
            </div>

            {editingDepartment && (
                <div className="edit-overlay">
                    <div className="edit-popup">
                        <h2>Edit Department</h2>
                        <label>
                            Department Name:
                            <p>{editingDepartment.departmentName}</p> {/* Display the department name */}
                        </label>
                        <label>
                            Description:
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleEditChange}
                            ></textarea>
                        </label>
                        <div className="edit-buttons">
                            <button onClick={submitEdit}>Save Changes</button>
                            <button onClick={() => setEditingDepartment(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DepartmentList;
