import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/User';
import PatientDashboard from './pages/PatientDashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import CareWorkspace from './pages/CareWorkspace';
import PatientPortal from './pages/PatientPortal';
import ProtectedRoute from './pages/ProtectedRoute';
import PharmacyDashboard from './pages/PharmacyDashboard';   // ⬅️ NEW
import LabOrder from './components/LabOrder';
import './App.css';

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin home */}
      <Route
        path="/"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Users & roles */}
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout>
              <Users />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient overview */}
      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute roles={['admin', 'doctor']}>
            <AppLayout>
              <PatientDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient list */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute roles={['admin', 'doctor']}>
            <AppLayout>
              <Patients />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Appointments — any logged-in user */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Appointments />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 🧪 Lab Orders */}
      <Route
        path="/lab-orders"
        element={
          <ProtectedRoute roles={['admin', 'doctor', 'nurse', 'lab_technician']}>
            <AppLayout>
              <LabOrder />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 💊 Pharmacy */}
      <Route
        path="/pharmacy"
        element={
          <ProtectedRoute roles={['pharmacist', 'admin']}>
            <AppLayout>
              <PharmacyDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Clinical workspace */}
      <Route
        path="/workspace"
        element={
          <ProtectedRoute
            roles={[
              'doctor',
              'receptionist',
              'nurse',
              'pharmacist',
              'lab_technician',
              'billing',
            ]}
          >
            <AppLayout>
              <CareWorkspace />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient portal */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute roles={['patient']}>
            <AppLayout>
              <PatientPortal />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}