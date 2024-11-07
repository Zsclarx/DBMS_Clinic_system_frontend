// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/AuthService';

const ProtectedRoute = ({ children }) => {
    const token = getToken();
    return token ? children : <Navigate to="/auth/login" />;
};

export default ProtectedRoute;
