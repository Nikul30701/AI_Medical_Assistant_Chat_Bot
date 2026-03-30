import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/slices/authSlice';

const Private = ({children}) => {
  const auth = useSelector(selectIsAuthenticated);
  return auth ? children : <Navigate to="/login" />;
}

const Public = ({children}) => {
  const auth = useSelector(selectIsAuthenticated);
  return auth ? <Navigate to="/" /> : children;
}

const App = () => {
    return (
      
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Public><LoginPage /></Public>} />
          <Route path="/register" element={<Public><RegisterPage /></Public>} />

          {/* Private Routes */}
          <Route 
            path="/dashboard" 
            element={
              <Private>
                <h1>Dashboard</h1>
              </Private>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
    );
};

export default App;
