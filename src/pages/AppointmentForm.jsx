import { useState, useEffect } from 'react';
import '../style/AppointmentForm.css';
import Navbar from '../components/PatientNavbar';

function AppointmentForm() {

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [times, setTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');
  const [doctorFee, setDoctorFee] = useState(0); // New state to store doctor's fee
  const [patientID, setPatientID] = useState(''); // New state to store patient's ID

  useEffect(() => {
    fetchDoctorsWithDepartmentsAndUsers();
    fetchPatientID();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorFee(selectedDoctor); // Fetch fee whenever doctor selection changes
    }
  }, [selectedDoctor]);

  const fetchPatientID = async () => {
    const token = localStorage.getItem('authToken');
    const userID = localStorage.getItem('userID'); // Retrieve userID from local storage

    try {
      const response = await fetch('http://localhost:8080/patients', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient data.');
      }

      const patients = await response.json();
      const patient = patients.find((p) => p.userID == userID);

      if (patient) {
        setPatientID(patient.patientID); // Set the patientID based on userID
      } else {
        setError('Patient ID not found for the current user.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve patient ID.');
    }
  };

  const fetchDoctorsWithDepartmentsAndUsers = async () => {
    const token = localStorage.getItem('authToken'); 
    try {
      const [doctorsResponse, usersResponse] = await Promise.all([
        fetch('http://localhost:8080/doctors', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:8080/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!doctorsResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch doctors or users');
      }

      const doctorsData = await doctorsResponse.json();
      const usersData = await usersResponse.json();

      const formattedDoctors = await Promise.all(
        doctorsData.map(async (doctor) => {
          const user = usersData.find((user) => user.userID === doctor.userID);

          try {
            const departmentResponse = await fetch(`http://localhost:8080/departments/${doctor.departmentID}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!departmentResponse.ok) {
              throw new Error(`Failed to fetch department for doctor ID ${doctor.id}`);
            }

            const department = await departmentResponse.json();
            const doctorName = user ? `${user.firstName} ${user.lastName}` : doctor.name;

            return {
              id: doctor.doctorID,
              name: `${doctorName} (${department.departmentName})`,
            };
          } catch (err) {
            console.error(err);
            return {
              id: doctor.doctorID,
              name: `${doctor.name} + Unknown Department`,
            };
          }
        })
      );

      setDoctors(formattedDoctors);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch doctors and departments.');
    }
  };

  const fetchDoctorFee = async (doctorId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`http://localhost:8080/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor fee');
      }

      const fee = await response.json();
      console.log(fee);
      setDoctorFee(fee.fees); // Set the fetched fee
    } catch (err) {
      console.error(err);
      setError('Failed to fetch doctor fee.');
    }
  };

  const fetchAvailability = async (date) => {
    if (!selectedDoctor || !date) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(
        `http://localhost:8080/api/doctor-availability/${selectedDoctor}/date?date=${date}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setTimes(data);
      setSelectedTime(''); // Reset selected time whenever availability is fetched
      console.log('Fetched availability:', data); // Log the fetched data
    } catch (err) {
      setError('Failed to fetch availability of Doctor on selected dates.');
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    console.log('Selected date:', newDate); // Log the newly selected date
    setPreferredDate(newDate);
    setTimes([]); // Clear times when a new date is selected
    setSelectedTime(''); // Reset selected time as well

    // Call fetchAvailability with the new date
    fetchAvailability(newDate); // Use the new date directly
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const appointmentData = {
      doctorID: selectedDoctor,
      appointmentDate: preferredDate,
      time: selectedTime,
      status: 'pending',
      patientID: patientID, // Use the retrieved patientID
      amount: doctorFee, // Set the doctor’s fee as amount
    };

    try {
      const response = await fetch('http://localhost:8080/appointments/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        alert('Appointment saved successfully!');
      } else {
        setError('Failed to save appointment.');
      }
    } catch (err) {
      setError('Error occurred while saving appointment.');
    }
  };

  return (
    <div>
      <Navbar/>
      <form onSubmit={handleSubmit}>
        <h1>Book Appointment</h1>
        {error && <p className="error">{error}</p>}
        
        <div>
          <label>
            Select Doctor:
            <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} required>
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Preferred Date:
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              max={new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              value={preferredDate}
              onChange={handleDateChange} // Use the updated function here
              required
            />
          </label>
        </div>

        {times.length > 0 && (
          <div>
            <label>
              Select Time:
              <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required>
                <option value="">Select a time</option>
                {times.map((time) => (
                  <option key={time.availabilityId} value={time.timeOfService}>
                    {time.timeOfService}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <button type="submit">Book Appointment</button>
      </form>
    </div>
  );
}

export default AppointmentForm;
