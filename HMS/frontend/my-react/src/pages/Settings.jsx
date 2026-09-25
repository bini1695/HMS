import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Your account information.</p>
        </div>
      </div>

      <div className="card settings-card">
        <div className="settings-row">
          <span className="settings-label">Name</span>
          <span className="settings-value">{user?.name}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Email</span>
          <span className="settings-value">{user?.email}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Role</span>
          <span className="badge badge-info">{user?.role}</span>
        </div>
      </div>
    </div>
  );
}
