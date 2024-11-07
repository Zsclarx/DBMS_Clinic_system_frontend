import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/PatientNavbar";

const PatientBills = () => {
  const [appointments, setAppointments] = useState([]); // Initialized as empty array
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");

    if (!authToken || userRole.toLowerCase() !== "patient") {
      navigate("/logout", {
        state: { flashMessage: "Access denied: Patients only" },
      });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchPatientAppointments = async () => {
      const token = localStorage.getItem("authToken");
      const userID = localStorage.getItem("userID"); // Assuming the patient’s userID is stored in localStorage

      try {
        // Fetch patients data to find the patient's ID
        const patientsResponse = await axios.get("http://localhost:8080/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Find the patient using their userID
        const patient = patientsResponse.data.find((pat) => pat.userID === parseInt(userID));
        if (!patient) {
          setError(new Error("Patient data not found."));
          return;
        }

        // Fetch appointments for the specific patient
        const appointmentsResponse = await axios.get(
          `http://localhost:8080/appointments/patient/${patient.patientID}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch doctors and users data
        const [usersResponse, doctorsResponse] = await Promise.all([
          axios.get("http://localhost:8080/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/doctors", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        // Ensure appointments is an array before setting state
        setAppointments(Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : []);
        setUsers(usersResponse.data);
        setDoctors(doctorsResponse.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAppointments();
  }, []);

  const getUserIDForDoctor = (doctorID) => {
    const doctor = doctors.find((doc) => doc.doctorID === doctorID);
    return doctor ? doctor.userID : null;
  };

  const getDoctorName = (doctorID) => {
    const userID = getUserIDForDoctor(doctorID);
    const user = users.find((usr) => usr.userID === userID);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown Doctor";
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  if (error) {
    return <div>Error fetching bills: {error.message}</div>;
  }

  return (
    <>
      <Navbar />
      <div>
        <h1>Billing Information</h1>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Doctor Name</th>
              <th>Appointment Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date Issued</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(appointments) && appointments.map((appointment, index) => (
              <tr key={appointment.appointmentID}>
                <td>{index + 1}</td>
                <td>{getDoctorName(appointment.doctorID)}</td>
                <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                <td>{appointment.amount}</td>
                <td>{appointment.status}</td>
                <td>{new Date(appointment.dateIssued).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PatientBills;
