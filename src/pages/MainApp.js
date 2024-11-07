import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import App from './App';
import AddDosage from './AddDosage'; 
import SeeDosage from './SeeDosage'; 

const MainApp = () => {
    return (
        <Router>
            <Routes>
                <Route path="/appointments" element={<App />} />
                <Route path="/add-dosage/:appointmentID" element={<AddDosage />} />
                <Route path="/see-dosage/:appointmentID" element={<SeeDosage />} />
                <Route path="/" element={<App />} /> {/* Set a default route if needed */}
            </Routes>
        </Router>
    );
};

export default MainApp;
