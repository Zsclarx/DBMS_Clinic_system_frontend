import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/DepartmentList.css';
import Navbar from '../components/PatientNavbar';

const DepartmentList1 = () => {
    const [departments, setDepartments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLocaleLowerCase() != "patient") {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);
    console.log("Hello World!");

    useEffect(() => {
        fetchDepartments();},);

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


    return (
        <>
            <Navbar/>
            <div className="department-list" >
                <h1>Departments</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(department => (
                            <tr key={department.departmentID}>
                                <td>{department.departmentName}</td>
                                <td>{department.description}</td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default DepartmentList1;
