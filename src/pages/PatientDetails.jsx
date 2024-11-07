import { useEffect, useState } from 'react';
import '../style/PatientprescriptionDetails.css';
import Navbar from '../components/PatientNavbar';
import { useNavigate } from 'react-router-dom';

function PatientDetails() {
    const [patient, setPatient] = useState(null);
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [doctorNames, setDoctorNames] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [medicationAdvice, setMedicationAdvice] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        if (!authToken || userRole.toLowerCase() !== "patient") {
            navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('authToken');
                const userID = localStorage.getItem('userID');
                if (!userID || !token) throw new Error('Authentication error');

                // Fetch Patient data
                const patientsResponse = await fetch('http://localhost:8080/patients', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!patientsResponse.ok) throw new Error('Failed to fetch patients');
                const patientsData = await patientsResponse.json();
                const foundPatient = patientsData.find(p => p.userID == userID);
                if (!foundPatient) throw new Error('Patient not found');

                setPatient(foundPatient);

                // Fetch User data
                const userResponse = await fetch(`http://localhost:8080/users/${userID}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!userResponse.ok) throw new Error('Failed to fetch user data');
                const userData = await userResponse.json();
                setUser(userData);

                // Fetch Appointments
                const appointmentResponse = await fetch('http://localhost:8080/appointments/all', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!appointmentResponse.ok) throw new Error('Failed to fetch appointments');
                const allAppointments = await appointmentResponse.json();
                const patientAppointments = allAppointments.filter(appointment => appointment.patientID === foundPatient.patientID);
                setAppointments(patientAppointments);

                // Fetch prescriptions for each appointment
                const prescriptionsData = await Promise.all(patientAppointments.map(async (appointment) => {
                    const prescriptionResponse = await fetch(`http://localhost:8080/prescriptions/appointment/${appointment.appointmentID}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    const text = await prescriptionResponse.text();
                    return text ? JSON.parse(text) : [];
                }));
                setPrescriptions(prescriptionsData);

                // Fetch advice for each prescription
                await fetchMedicationAdvice(prescriptionsData, token);

                // Fetch Doctor Names
                const doctorsResponse = await fetch('http://localhost:8080/doctors', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!doctorsResponse.ok) throw new Error('Failed to fetch doctors');
                const doctorsData = await doctorsResponse.json();

                const doctorNamesMap = await Promise.all(doctorsData.map(async doctor => {
                    const userResponse = await fetch(`http://localhost:8080/users/${doctor.userID}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!userResponse.ok) throw new Error('Failed to fetch doctor user data');
                    const userData = await userResponse.json();
                    return { id: doctor.doctorID, name: `${userData.firstName} ${userData.lastName}` };
                }));

                const namesMap = doctorNamesMap.reduce((map, doctor) => {
                    map[doctor.id] = doctor.name;
                    return map;
                }, {});
                setDoctorNames(namesMap);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchMedicationAdvice = async (prescriptionsData, token) => {
        const adviceMap = {};

        await Promise.all(prescriptionsData.flat().map(async (prescription) => {
            const adviceResponse = await fetch(`http://localhost:8080/medication-details/${prescription.prescriptionID}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (adviceResponse.ok) {
                const text = await adviceResponse.text();
                const adviceData = text ? JSON.parse(text) : [];

                // Check if there's already an array for this prescription ID, or initialize it
                if (!adviceMap[prescription.prescriptionID]) {
                    adviceMap[prescription.prescriptionID] = [];
                }

                // Append all advice entries to the relevant prescription ID
                adviceMap[prescription.prescriptionID].push(...adviceData.map(item => item.advice));
            }
        }));

        // Update the state with the accumulated advice data
        setMedicationAdvice(adviceMap);
    };

    const handleAppointmentClick = (index) => {
        setSelectedAppointment(index);
    };

    if (loading) {
        return <p>Loading patient details...</p>;
    }

    return (
        <>
            <Navbar />
            <div className="patient-details">
                <h1>Patient Details</h1>
                {error && <p className="error">{error}</p>}
                {patient && (
                    <div className="patient-info">
                        <h2>Patient Information</h2>
                        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                    </div>
                )}
                <div className="details-container">
                    <div className="left-column">
                        <h2>Appointments</h2>
                        {appointments.length > 0 ? (
                            appointments.map((appointment, index) => (
                                <div key={appointment.appointmentID} className="appointment-item" onClick={() => handleAppointmentClick(index)}>
                                    <p><strong>Date:</strong> {new Date(appointment.dateIssued).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {appointment.time}</p>
                                    <p><strong>Doctor:</strong> {doctorNames[appointment.doctorID] || 'Unknown Doctor'}</p>
                                </div>
                            ))
                        ) : (
                            <p>No appointments found.</p>
                        )}
                    </div>
                    <div className="right-column">
                        <h2>Prescription Details</h2>
                        {selectedAppointment !== null && prescriptions[selectedAppointment]?.length > 0 ? (
                            prescriptions[selectedAppointment].map((prescription, index) => (
                                <div key={index} className="prescription-item">

                                    <p><strong>Dosage:</strong> {prescription.dosage}</p>

                                    <div className="advice-section">
                                        <h4>Advice:</h4>
                                        {medicationAdvice[prescription.prescriptionID]?.length > 0 ? (
                                            medicationAdvice[prescription.prescriptionID].map((advice, adviceIndex) => (
                                                <p key={adviceIndex}>{advice}</p>
                                            ))
                                        ) : (
                                            <p>Loading advice...</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Select an appointment to view prescriptions.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default PatientDetails;
