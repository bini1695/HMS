import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import './Dashboard.css';

const STATUS_COLORS = {
  active: 'success',
  planning: 'info',
  on_hold: 'warning',
  completed: 'neutral',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load dashboard data. Is the backend running?'));
  }, []);

  if (error) {
    return <div className="card dashboard-error">{error}</div>;
  }

  if (!stats) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const maxRoleCount = Math.max(...stats.usersByRole.map((r) => r.count), 1);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Here's what's happening across your organization.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Users" value={stats.totals.totalUsers} icon="👥" accent="primary" />
        <StatCard label="Active Users" value={stats.totals.activeUsers} icon="✅" accent="success" />
        <StatCard label="Total Projects" value={stats.totals.totalProjects} icon="📁" accent="info" />
        <StatCard
          label="Total Budget"
          value={`$${Number(stats.totals.totalBudget).toLocaleString()}`}
          icon="💰"
          accent="warning"
        />
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-panel">
          <h3 className="panel-title">Users by role</h3>
          <div className="bar-chart">
            {stats.usersByRole.map((r) => (
              <div className="bar-row" key={r.role}>
                <span className="bar-label">{r.role}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(r.count / maxRoleCount) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card dashboard-panel">
          <h3 className="panel-title">Recent users</h3>
          <ul className="recent-list">
            {stats.recentUsers.map((u) => (
              <li key={u.id} className="recent-item">
                <span
                  className="recent-avatar"
                  style={{ background: u.avatar_color || '#4F46E5' }}
                >
                  {u.name?.[0]?.toUpperCase()}
                </span>
                <div className="recent-info">
                  <span className="recent-name">{u.name}</span>
                  <span className="recent-email">{u.email}</span>
                </div>
                <span className="badge badge-neutral">{u.role}</span>
              </li>
            ))}
            {stats.recentUsers.length === 0 && (
              <li className="recent-empty">No users yet</li>
            )}
          </ul>
        </div>
      </div>

      <div className="card dashboard-panel dashboard-projects">
        <h3 className="panel-title">Recent projects</h3>
        <ul className="project-list">
          {stats.recentProjects.map((p) => (
            <li key={p.id} className="project-item">
              <div className="project-item-top">
                <span className="project-name">{p.name}</span>
                <span className={`badge badge-${STATUS_COLORS[p.status] || 'neutral'}`}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="project-item-bottom">
                <span>{p.progress}% complete</span>
                {p.due_date && <span>Due {new Date(p.due_date).toLocaleDateString()}</span>}
              </div>
            </li>
          ))}
          {stats.recentProjects.length === 0 && (
            <li className="recent-empty">No projects yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}
