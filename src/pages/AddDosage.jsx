import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const AddDosage = () => {
    const { appointmentID } = useParams();
    const [dosage, setDosage] = useState('');
    const [advice, setAdvice] = useState('');
    const [advices, setAdvices] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');

        if (!authToken || userRole.toLowerCase() !== 'doctor') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    const handleAddAdvice = () => {
        if (advice.trim() !== '') {
            setAdvices([...advices, advice]);
            setAdvice('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const appointmentResponse = await axios.get(`http://localhost:8080/appointments/${appointmentID}`, { headers });
            const amount = appointmentResponse.data.amount;

            const prescriptionUpdate = {
                appointmentID: appointmentID,
                dosage: dosage,
            };

            await axios.post('http://localhost:8080/prescriptions', prescriptionUpdate, { headers });
            const presresponse = await axios.get(`http://localhost:8080/prescriptions/appointment/${appointmentID}`, { headers });

            const medicationDetails = advices.map((adv) => ({
                prescriptionID: presresponse.data[0].prescriptionID,
                advice: adv,
            }));

            for (const medicationDetail of medicationDetails) {
                await axios.post(`http://localhost:8080/medication-details`, medicationDetail, { headers });
            }

            await axios.put(`http://localhost:8080/appointments/update`, { appointmentID, status: 'Completed' }, { headers });

            // Increment income and appointment for both weekly and monthly statistics
            await axios.post(`http://localhost:8080/api/monthly-statistics/increment/income`, null, { params: { amount }, headers });
            await axios.post(`http://localhost:8080/api/monthly-statistics/increment/appointment`, null, { headers });

            await axios.post(`http://localhost:8080/api/weekly-statistics/increment/income`, null, { params: { amount }, headers });
            await axios.post(`http://localhost:8080/api/weekly-statistics/increment/appointment`, null, { headers });

            alert('Dosage and advice saved successfully');
            setDosage('');
            setAdvices([]);
        } catch (error) {
            alert('Error saving dosage or advice');
            console.error(error);
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-title">Doctor Dashboard</div>
                <ul className="navbar-links">
                    <li><Link to="/doctors">Home</Link></li>
                    <li><Link to="/doctor/profile">Profile</Link></li>
                    <li><Link to="/doctor/appointments">Appointments</Link></li>
                    <li><Link to="/doctor/schedule">Schedule</Link></li>
                </ul>
            </nav>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Dosage:</label>
                    <input
                        type="text"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Advice:</label>
                    <input
                        type="text"
                        value={advice}
                        onChange={(e) => setAdvice(e.target.value)}
                    />
                    <button type="button" onClick={handleAddAdvice}>Add Advice</button>
                </div>

                {advices.length > 0 && (
                    <div>
                        <h4>Added Advices:</h4>
                        <ul>
                            {advices.map((adv, index) => (
                                <li key={index}>{adv}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <button type="submit">Add Dosage and Advices</button>
            </form>
        </>
    );
};

export default AddDosage;
