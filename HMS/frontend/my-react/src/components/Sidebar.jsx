// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuth();

  // Build nav items based on role
  const navItems =
    user?.role === 'admin'
      ? [
          { to: '/', label: 'Admin dashboard', icon: '⬛', end: true },
          { to: '/users', label: 'Users & roles', icon: '👤' },
          { to: '/appointments', label: 'Appointments', icon: '◷' },
          { to: '/lab-orders', label: 'Lab Orders', icon: '🧪' },
          { to: '/pharmacy', label: 'Pharmacy', icon: '💊' },
        ]
      : user?.role === 'patient'
      ? [
          { to: '/portal', label: 'My health portal', icon: '♡' },
          { to: '/appointments', label: 'Appointment schedule', icon: '◷' },
        ]
      : user?.role === 'doctor'
      ? [
          { to: '/patient-dashboard', label: 'Patient overview', icon: '▦' },
          { to: '/patients', label: 'Patient history', icon: '♙' },
          { to: '/appointments', label: 'Appointments', icon: '◷' },
          { to: '/workspace', label: 'Clinical tools', icon: '▦' },
          { to: '/lab-orders', label: 'Lab Orders', icon: '🧪' },
        ]
      : user?.role === 'pharmacist'
      ? [
          { to: '/pharmacy', label: 'Prescriptions', icon: '💊' },
          { to: '/appointments', label: 'Appointments', icon: '◷' },
        ]
      : user?.role === 'lab_technician'
      ? [
          { to: '/lab-orders', label: 'Lab Orders', icon: '🧪' },
          { to: '/appointments', label: 'Appointments', icon: '◷' },
        ]
      : user?.role === 'nurse'
      ? [
          { to: '/patients', label: 'Patients', icon: '♙' },
          { to: '/lab-orders', label: 'Lab Orders', icon: '🧪' },
          { to: '/appointments', label: 'Appointments', icon: '◷' },
          { to: '/workspace', label: 'Clinical tools', icon: '▦' },
        ]
      : [
          // fallback for receptionist, billing, or unknown roles
          { to: '/workspace', label: 'Role workspace', icon: '▦' },
          { to: '/appointments', label: 'Appointments', icon: '◷' },
        ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">N</span>
        <span className="sidebar-brand-text">Nimbus</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' sidebar-link-active' : '')
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Nimbus Admin v1.0</p>
      </div>
    </aside>
  );
}