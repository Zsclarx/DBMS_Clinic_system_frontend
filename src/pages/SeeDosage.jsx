import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SeeDosage = () => {
    const { appointmentID } = useParams();
    const [dosageData, setDosageData] = useState([]);
    const [adviceData, setAdviceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!authToken || userRole.toLowerCase() !== 'doctor') {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const fetchDosageAndAdvice = async () => {
            try {
                
                const token = localStorage.getItem('authToken');
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };
                console.log(appointmentID);
                // // Fetch appointment details to retrieve prescription ID
                // const appointmentResponse = await axios.get(`http://localhost:8080/appointments/${appointmentID}`, { headers });
                // const patientID1 = appointmentResponse.data.patientID;
                
                // console.log(patientID1);
                const dosageResponse = await axios.get(`http://localhost:8080/prescriptions/appointment/${appointmentID}`, { headers });
                const prescriptionID = dosageResponse.data[0].prescriptionID;

                console.log(dosageResponse);
                // Fetch advice details
                const adviceResponse = await axios.get(`http://localhost:8080/medication-details/${prescriptionID}`, { headers });

                // Update state with the fetched data
                setDosageData(Array.isArray(dosageResponse.data) ? dosageResponse.data : [dosageResponse.data]);
                setAdviceData(Array.isArray(adviceResponse.data) ? adviceResponse.data : [adviceResponse.data]);
            } catch (error) {
                setError('Error fetching dosage and advice');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDosageAndAdvice();
    }, [appointmentID]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <><nav className="navbar">
            <div className="navbar-title">Doctor Dashboard</div>
            <ul className="navbar-links">
                <li><Link to="/doctors">Home</Link></li>
                <li><Link to="/doctor/profile">Profile</Link></li>
                <li><Link to="/doctor/appointments">Appointments</Link></li>
                <li><Link to="/doctor/schedule">Schedule</Link></li>

            </ul></nav><div>
                <h2>Dosages for Appointment {appointmentID}</h2>
                <h3>Current Dosages</h3>
                <ul>
                    {dosageData.map((dosage, index) => (
                        <li key={dosage.dosageID || index}>{dosage.dosage}</li>
                    ))}
                </ul>
                <h3>Advice</h3>
                <ul>
                    {adviceData.map((advice, index) => (
                        <li key={advice.adviceID || index}>{advice.advice}</li>
                    ))}
                </ul>
            </div></>
    );
};

export default SeeDosage;
