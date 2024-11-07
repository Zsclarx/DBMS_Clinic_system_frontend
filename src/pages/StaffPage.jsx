import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import '../style/StaffPage.css';

const StaffPage = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [error, setError] = useState(null);
    const [editingStaff, setEditingStaff] = useState(null);
    const navigate = useNavigate();

    const fetchStaff = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8080/staff', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch staff data.');
            }

            const staffData = await response.json();
            const userPromises = staffData.map(staff =>
                fetch(`http://localhost:8080/users/${staff.userID}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }).then(userResponse => {
                    if (!userResponse.ok) {
                        return { ...staff, userDetails: null };
                    }
                    return userResponse.json().then(userData => ({
                        ...staff,
                        userDetails: userData,
                    }));
                }).catch(() => ({ ...staff, userDetails: null }))
            );

            const staffWithUserDetails = await Promise.all(userPromises);
            setStaffList(staffWithUserDetails);
        } catch (error) {
            setError('Failed to fetch staff data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = () => {
        navigate("/admin/staff/add"); 
    };

    const handleBack = () => {
        navigate("/admin"); 
    };

    const handleDelete = async (staffID, userID) => {
        if (window.confirm("Are you sure you want to delete this staff member?")) {
            try {
                const token = localStorage.getItem('authToken');
                const staffResponse = await fetch(`http://localhost:8080/staff/${staffID}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!staffResponse.ok) {
                    const errorData = await staffResponse.json();
                    throw new Error(errorData.message || 'Failed to delete staff.');
                }

                const userResponse = await fetch(`http://localhost:8080/users/${userID}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!userResponse.ok) {
                    const errorData = await userResponse.json();
                    throw new Error(errorData.message || 'Failed to delete user.');
                }

                fetchStaff();
            } catch (error) {
                setError('Failed to delete staff or user: ' + error.message);
            }
        }
    };

    const startEditing = (staff) => {
        setEditingStaff(staff);
    };

    const submitEdit = async () => {
        if (!editingStaff) return;

        try {
            const token = localStorage.getItem('authToken');
            // console.log(editingStaff);
            const staffUpdateData = {
                designation: editingStaff.designation,
                salary: editingStaff.salary,
            };

            const userUpdateData = {
                firstName: editingStaff.userDetails.firstName,
                lastName: editingStaff.userDetails.lastName,
                dayOfBirth: editingStaff.userDetails.dayOfBirth,
                monthOfBirth: editingStaff.userDetails.monthOfBirth,
                yearOfBirth: editingStaff.userDetails.yearOfBirth,
                contactInfo: editingStaff.userDetails.contactInfo,
                email: editingStaff.userDetails.email,
                bloodGroup: editingStaff.userDetails.bloodGroup,
            };
            
            const staffResponse = await fetch(`http://localhost:8080/staff/${editingStaff.staffID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffUpdateData),
            });

            if (!staffResponse.ok) {
                const errorData = await staffResponse.json();
                throw new Error(errorData.message || 'Failed to update staff.');
            }
            console.log(editingStaff.userDetails);
            console.log(editingStaff.userID);
            const userResponse = await fetch(`http://localhost:8080/users/${editingStaff.userID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingStaff.userDetails),
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                throw new Error(errorData.message || 'Failed to update user.');
            }

            fetchStaff();
            setEditingStaff(null);
        } catch (error) {
            setError('Failed to update staff or user: ' + error.message);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-title">Admin Dashboard</div>
                <ul className="navbar-links">
                    <li><Link to="/admin">Home</Link></li>
                    <li><Link to="/admin/departments">Departments</Link></li>
                    <li><Link to="/admin/doctors">Doctors</Link></li>
                    <li><Link to="/admin/patients">Patients</Link></li>
                    <li><Link to="/admin/staff">Staff</Link></li>
                    <li><Link to="/admin/appointments">Appointments</Link></li>
                    <li><Link to="/logout">Logout</Link></li>
                </ul>
            </nav>
            <div className="staff-container">
                <h1 className="page-title">Staff Members</h1>
                {loading && <p className="loading-message">Loading...</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="add-staff">
                    <button className="back-button" onClick={handleBack}>
                        Back
                    </button>
                    <button className="add-button" onClick={handleAddStaff} disabled={loadingAdd}>
                        {loadingAdd ? 'Adding...' : 'Add Staff'}
                    </button>
                </div>

                <table className="staff-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Phone No.</th>
                            <th>e-Mail</th>
                            <th>Blood Group</th>
                            <th>Date of Birth</th>
                            <th>Designation</th>
                            <th>Salary</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.length > 0 ? (
                            staffList.map(staff => (
                                <tr key={staff.staffID}>
                                    <td>{staff.userDetails?.username || 'N/A'}</td>
                                    <td>{staff.userDetails?.firstName || 'N/A'} {staff.userDetails?.lastName || 'N/A'}</td>
                                    <td>{staff.userDetails?.contactInfo || 'N/A'}</td>
                                    <td>{staff.userDetails?.email || 'N/A'}</td>
                                    <td>{staff.userDetails?.bloodGroup || 'N/A'}</td>
                                    <td>{staff.userDetails?.dayOfBirth || 'N/A'}-{staff.userDetails?.monthOfBirth || 'N/A'}-{staff.userDetails?.yearOfBirth || 'N/A'}</td>
                                    <td>{staff.designation}</td>
                                    <td>{staff.salary}</td>
                                    <td>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(staff.staffID, staff.userID)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="edit-button"
                                            onClick={() => startEditing(staff)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">No staff members found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Edit Modal */}
                {editingStaff && (
                    <div className="edit-modal">
                        <div className="edit-modal-content">
                            <h2>Edit Staff</h2>
                            <label>
                                First Name:
                                <input type="text" value={editingStaff.userDetails?.firstName || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, userDetails: { ...prev.userDetails, firstName: e.target.value } }))} />
                            </label>
                            <label>
                                Last Name:
                                <input type="text" value={editingStaff.userDetails?.lastName || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, userDetails: { ...prev.userDetails, lastName: e.target.value } }))} />
                            </label>
                            <label>
                                Phone No.:
                                <input type="text" value={editingStaff.userDetails?.contactInfo || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, userDetails: { ...prev.userDetails, contactInfo: e.target.value } }))} />
                            </label>
                            <label>
                                e-Mail:
                                <input type="email" value={editingStaff.userDetails?.email || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, userDetails: { ...prev.userDetails, email: e.target.value } }))} />
                            </label>
                            <label>
                                Blood Group:
                                <input type="text" value={editingStaff.userDetails?.bloodGroup || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, userDetails: { ...prev.userDetails, bloodGroup: e.target.value } }))} />
                            </label>
                            <label>
                                Day of Birth:
                                <input type="text" value={editingStaff.userDetails?.dayOfBirth || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, userDetails: { ...prev.userDetails, dayOfBirth: e.target.value } }))} />
                            </label>
                            <label>
                                Month of Birth:
                                <input type="text" value={editingStaff.userDetails?.monthOfBirth || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, userDetails: { ...prev.userDetails, monthOfBirth: e.target.value } }))} />
                            </label>
                            <label>
                                Year of Birth:
                                <input type="text" value={editingStaff.userDetails?.yearOfBirth || ''} onChange={(e) => setEditingStaff(prev => ({ ...prev, userDetails: { ...prev.userDetails, yearOfBirth: e.target.value } }))} />
                            </label>
                            <label>
                                Designation:
                                <input type="text" value={editingStaff.designation} onChange={(e) => setEditingStaff(prev => ({ ...prev, designation: e.target.value }))} />
                            </label>
                            <label>
                                Salary:
                                <input type="number" value={editingStaff.salary} onChange={(e) => setEditingStaff(prev => ({ ...prev, salary: Number(e.target.value) }))} />
                            </label>
                            <div className="edit-modal-buttons">
                                <button onClick={submitEdit}>Save Changes</button>
                                <button onClick={() => setEditingStaff(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default StaffPage;
