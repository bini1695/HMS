import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './Projects.css';

const STATUS_COLORS = {
  active: 'success',
  planning: 'info',
  on_hold: 'warning',
  completed: 'neutral',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => setProjects(res.data.recentProjects))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Track progress across all active initiatives.</p>
        </div>
      </div>

      {error && <div className="card projects-error">{error}</div>}
      {loading && <div className="card projects-loading">Loading projects...</div>}

      {!loading && !error && (
        <div className="projects-grid">
          {projects.map((p) => (
            <div className="card project-card" key={p.id}>
              <div className="project-card-top">
                <h3 className="project-card-name">{p.name}</h3>
                <span className={`badge badge-${STATUS_COLORS[p.status] || 'neutral'}`}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="project-card-bottom">
                <span>{p.progress}% complete</span>
                {p.due_date && <span>Due {new Date(p.due_date).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="card projects-empty">No projects yet. Add rows to the projects table to see them here.</div>
          )}
        </div>
      )}
    </div>
  );
}
