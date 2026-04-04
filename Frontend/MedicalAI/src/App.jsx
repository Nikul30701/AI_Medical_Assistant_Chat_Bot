// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from './store/slices/authSlice'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage   from './pages/UploadPage'
import DocumentPage from './pages/DocumentPage'

const Private = ({ children }) => {
  const auth = useSelector(selectIsAuthenticated)
  return auth ? children : <Navigate to="/login" replace />
}
const Public = ({ children }) => {
  const auth = useSelector(selectIsAuthenticated)
  return !auth ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
      <Routes>
        <Route path="/"              element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"         element={<Public><LoginPage /></Public>} />
        <Route path="/register"      element={<Public><RegisterPage /></Public>} />
        <Route path="/dashboard"     element={<Private><DashboardPage /></Private>} />
        <Route path="/upload"        element={<Private><UploadPage /></Private>} />
        <Route path="/documents/:id" element={<Private><DocumentPage /></Private>} />
      </Routes>
  )
}