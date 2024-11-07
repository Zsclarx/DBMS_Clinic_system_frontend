// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Signin from './pages/Signin.jsx';
import UserList from './pages/UserList.jsx';
import AdminPage from './pages/AdminPage.jsx';
import Logout from './pages/logout.jsx';
import DepartmentList from './pages/DepartmentList';
import DepartmentRegister from './pages/DepartmentRegister';
import AppointmentPage from './pages/Appointment.jsx';
import AdminPatient from './pages/AdminPatient';
import AdminPatientDetails from './pages/AdminPatientDetails';
import StaffPage from './pages/StaffPage.jsx';
import AddStaff from './pages/Addstaff.jsx';
import PatientDashboard from './pages/patient.jsx';
import ViewProfile from './pages/Patientprofile.jsx';
import NotificationList from './pages/NotificationList';
import DepartmentList1 from './pages/PatientDepartment.jsx';
import PatientAppointments from './pages/PatientAppointment.jsx';
import PatientDetails from './pages/PatientDetails.jsx';
import PatientBills from './pages/PatientBills.jsx';
import DoctorList from './pages/DoctorList.jsx';
import DoctorDetailAdmin from './pages/DoctorDetailAdmin.jsx';
import AddDoctor from './pages/AddDoctor.jsx';
import SignUp from './pages/SignUp.jsx';
import DoctorHome from './pages/DoctorHome.jsx';
import DoctorAppointmentsPage from './pages/DoctorAppointment.jsx';
import DoctorProfile from './pages/DoctorProfile.jsx';
import App1 from './pages/tryout.jsx';
import AddDosage from './pages/AddDosage.jsx'; 
import SeeDosage from './pages/SeeDosage'; 
import AdminDoctorSchedule from './pages/AdminDoctorSchedule'; // Import for Doctor Schedule page
import AddDoctorSchedule from './pages/AddDoctorSchedule';
import AppointmentForm from './pages/AppointmentForm.jsx';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Signin/>} />
                <Route path="/" element={<Signin/>} />
                <Route path="/users" element={<UserList/>}/>
                <Route path="/admin" element={<AdminPage/>} />
                <Route path="/logout" element={<Logout/>} />
                <Route path="/admin/departments" element={<DepartmentList/>}/>
                <Route path="/register/department" element={<DepartmentRegister/>}/>
                <Route path="/admin/appointments" element={<AppointmentPage/>}/>
                <Route path="/admin/patients" element={<AdminPatient/>}/>
                <Route path="/admin/patient/:id" element={<AdminPatientDetails/>}/>
                <Route path="/admin/staff" element={<StaffPage/>}/>
                <Route path="admin/staff/add" element={<AddStaff/>}/>
                <Route path = "/patients" element={<PatientDashboard/>} />
                <Route path="/patient/profile" element={<ViewProfile/>}/>
                <Route path="/patient/notifications" element={<NotificationList/>}/>
                <Route path="/patient/departments" element={<DepartmentList1/>}/>
                <Route path="/patient/appointments" element={<PatientAppointments/>}/>
                <Route path="/patient/prescriptions" element={<PatientDetails/>}/>
                <Route path="/patient/bills" element={<PatientBills/>}/>
                <Route path="/admin/doctors" element={<DoctorList/>}/>
                <Route path="/admin/doctors/add" element={<AddDoctor/>}/>
                <Route path="/admin/doctors/:doctorId" element={<DoctorDetailAdmin/>}/>
                <Route path="/SignUp" element={<SignUp/>}/>
                <Route path="/doctors" element={<DoctorHome/>}/>
                {/* <Route path="/doctor/appointments" element={<DoctorAppointmentsPage/>}/> */}
                <Route path="/doctor/profile" element={<DoctorProfile/>}/>
                <Route path="/doctor/appointments" element={<App1 />} />
                <Route path="/doctor/add-dosage/:appointmentID" element={<AddDosage />} />
                <Route path="/doctor/see-dosage/:appointmentID" element={<SeeDosage />} />
                <Route path="/" element={<App />} /> {/* Set a default route if needed */}
                <Route path="/doctor/schedule" element={<AdminDoctorSchedule/>}/>
                <Route path="/doctor/schedule/add/:id" element={<AddDoctorSchedule />} />
                <Route path="/patient/book-appointment" element={<AppointmentForm/>}/>


                {/* Add other routes here as needed */}
            </Routes>
        </Router>
    );
}

export default App;
