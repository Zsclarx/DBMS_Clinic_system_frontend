import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/PatientAppointment.css";
import Navbar from "../components/PatientNavbar";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    rating: "",
    comments: "",
    appointmentID: null,
    doctorID: null,
  });
  const [patientID, setPatientID] = useState(null);
  const navigate = useNavigate(); // Define navigate correctly here
  const token = localStorage.getItem("authToken");
  const userID = localStorage.getItem("userID");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const patientResponse = await axios.get(
        `http://localhost:8080/patients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const patientData = patientResponse.data.find(
        (patient) => patient.userID === parseInt(userID)
      );
      if (!patientData) {
        throw new Error("Patient not found");
      }
      setPatientID(patientData.patientID);

      const appointmentsResponse = await axios.get(
        "http://localhost:8080/appointments/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const filteredAppointments = appointmentsResponse.data.filter(
        (appointment) => appointment.patientID === patientData.patientID
      );
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error(
        "Error fetching appointments:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  }, [token, userID]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentId = feedback.appointmentID;
      await axios.put(
        `http://localhost:8080/appointments/feedback/${appointmentId}`,
        feedback,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.appointmentID === appointmentId
            ? {
                ...appointment,
                feedback: {
                  rating: feedback.rating,
                  comments: feedback.comments,
                },
              }
            : appointment
        )
      );

      setFeedback({
        rating: "",
        comments: "",
        appointmentID: null,
        doctorID: null,
      });
    } catch (error) {
      console.error(
        "Error submitting feedback:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to submit feedback. Please try again.");
    } finally {
      navigate("/patient/appointments");
    }
  };

  const upcomingAppointments = appointments.filter(
    (appointment) => new Date(appointment.appointmentDate) > new Date()
  );
  const previousAppointments = appointments.filter(
    (appointment) => new Date(appointment.appointmentDate) <= new Date()
  );

  return (
    <>
      <Navbar />
      <div className="patient-appointments-container">
        <h1>My Appointments</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="appointment-section">
              <h2>Upcoming Appointments</h2>
              {upcomingAppointments.length > 0 ? (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map((appointment) => (
                      <tr key={appointment.appointmentID}>
                        <td>
                          {new Date(
                            appointment.appointmentDate
                          ).toLocaleDateString()}
                        </td>
                        <td>{appointment.time}</td>
                        <td>{appointment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No upcoming appointments</p>
              )}
            </div>

            <div className="appointment-section">
              <h2>Previous Appointments</h2>
              {previousAppointments.length > 0 ? (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousAppointments.map((appointment) => (
                      <tr key={appointment.appointmentID}>
                        <td>
                          {new Date(
                            appointment.appointmentDate
                          ).toLocaleDateString()}
                        </td>
                        <td>{appointment.time}</td>
                        <td>{appointment.status}</td>
                        <td>
                          {appointment.status === "Completed" &&
                          appointment.rating === 0 ? (
                            <button
                              onClick={() =>
                                setFeedback({
                                  ...feedback,
                                  appointmentID: appointment.appointmentID,
                                  doctorID: appointment.doctorID,
                                })
                              }
                            >
                              Give Feedback
                            </button>
                          ) : appointment ? (
                            <>
                              Rating: {appointment.rating}, Comments:{" "}
                              {appointment.comments}
                            </>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No previous appointments</p>
              )}
            </div>

            {feedback.appointmentID && (
              <div className="feedback-form">
                <h3>Give Feedback for Appointment</h3>
                <form onSubmit={handleFeedbackSubmit}>
                  <label>
                    Rating:
                    <select
                      value={feedback.rating}
                      onChange={(e) =>
                        setFeedback({
                          ...feedback,
                          rating: parseInt(e.target.value),
                        })
                      }
                      required
                    >
                      <option value="">Select Rating</option>
                      {[1, 2, 3, 4, 5].map((rate) => (
                        <option key={rate} value={rate}>
                          {rate}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Comments:
                    <textarea
                      value={feedback.comments}
                      onChange={(e) =>
                        setFeedback({ ...feedback, comments: e.target.value })
                      }
                      required
                    />
                  </label>
                  <button type="submit">Submit Feedback</button>
                  <button
                    type="button"
                    onClick={() =>
                      setFeedback({
                        rating: "",
                        comments: "",
                        appointmentID: null,
                        doctorID: null,
                      })
                    }
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PatientAppointments;
