// src/pages/PharmacyDashboard.jsx
import React, { useEffect, useState } from 'react';
import { prescriptionApi } from '../api/prescriptionApi';
import { useAuth } from '../context/AuthContext';
import '../components/Prescription.css';

// Fallback mock data so you can test without a doctor creating prescriptions
const MOCK_RX = [
  {
    id: 'RX-1001',
    patientName: 'John Doe',
    patientId: 'P001',
    doctorName: 'Dr. Smith',
    diagnosis: 'Acute bacterial sinusitis',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'pending',
    priority: 'urgent',
    medications: [
      { name: 'Amoxicillin', dose: '500mg', frequency: 'TID', duration: '7 days', quantity: 21 },
      { name: 'Paracetamol', dose: '500mg', frequency: 'PRN', duration: '5 days', quantity: 15 },
    ],
    notes: 'Take with food. Complete full course.',
  },
  {
    id: 'RX-1002',
    patientName: 'Jane Smith',
    patientId: 'P002',
    doctorName: 'Dr. Ali',
    diagnosis: 'Hypertension follow-up',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'pending',
    priority: 'routine',
    medications: [
      { name: 'Amlodipine', dose: '5mg', frequency: 'OD', duration: '30 days', quantity: 30 },
    ],
    notes: 'Monitor BP weekly.',
  },
  {
    id: 'RX-1003',
    patientName: 'Ahmed Ali',
    patientId: 'P003',
    doctorName: 'Dr. Smith',
    diagnosis: 'Type 2 Diabetes',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'dispensed',
    priority: 'routine',
    medications: [
      { name: 'Metformin', dose: '850mg', frequency: 'BD', duration: '30 days', quantity: 60 },
    ],
    notes: 'Take after meals.',
    dispensedBy: 'pharm-01',
    dispensedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('pending'); // pending | dispensed | all
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await prescriptionApi.getPrescriptions(
        filter === 'all' ? undefined : filter
      );
      setPrescriptions(data.length ? data : filter === 'pending' ? MOCK_RX.filter(r => r.status === 'pending') : MOCK_RX);
    } catch (err) {
      console.warn('API failed, using mock:', err.message);
      setPrescriptions(
        filter === 'all' ? MOCK_RX : MOCK_RX.filter((r) => r.status === filter)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (rx, status) => {
    setMessage({ type: '', text: '' });
    try {
      await prescriptionApi.updateStatus(rx.id, {
        status,
        dispensedBy: user?.id || 'pharm-01',
        notes,
      });
      setMessage({ type: 'success', text: `Prescription ${rx.id} marked as ${status}.` });
    } catch (err) {
      // fallback in mock mode
      setPrescriptions((prev) =>
        prev.map((p) =>
          p.id === rx.id ? { ...p, status, dispensedAt: new Date().toISOString() } : p
        )
      );
      setMessage({ type: 'success', text: `Prescription ${rx.id} marked as ${status} (local).` });
    }
    setSelected(null);
    setNotes('');
  };

  const pendingCount = prescriptions.filter((p) => p.status === 'pending').length;

  return (
    <div className="rx-page">
      <div className="rx-header">
        <div>
          <h2>💊 Pharmacy Dashboard</h2>
          <p className="rx-subtitle">
            {pendingCount} pending prescription{pendingCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="rx-tabs">
          {['pending', 'dispensed', 'all'].map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f === 'pending' && '⏳ '}
              {f === 'dispensed' && '✅ '}
              {f === 'all' && '📋 '}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {message.text && <div className={`rx-alert ${message.type}`}>{message.text}</div>}

      {loading ? (
        <p className="rx-empty">Loading prescriptions…</p>
      ) : prescriptions.length === 0 ? (
        <p className="rx-empty">No prescriptions in this view.</p>
      ) : (
        <div className="rx-grid">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className={`rx-card ${rx.status} ${rx.priority === 'urgent' ? 'urgent' : ''}`}
              onClick={() => setSelected(rx)}
            >
              <div className="rx-card-top">
                <span className="rx-id">{rx.id}</span>
                <span className={`rx-badge ${rx.status}`}>{rx.status.replace('_', ' ')}</span>
              </div>

              <div className="rx-patient">
                <strong>{rx.patientName}</strong>
                <span className="rx-pid">ID: {rx.patientId}</span>
              </div>

              <div className="rx-doctor">
                👨‍⚕️ {rx.doctorName}
              </div>

              <div className="rx-diagnosis">
                <em>Dx:</em> {rx.diagnosis || '—'}
              </div>

              <div className="rx-meds">
                {rx.medications?.slice(0, 2).map((m, i) => (
                  <span key={i} className="rx-med-pill">
                    {m.name} {m.dose}
                  </span>
                ))}
                {rx.medications?.length > 2 && (
                  <span className="rx-med-pill more">+{rx.medications.length - 2} more</span>
                )}
              </div>

              <div className="rx-footer">
                <span className="rx-time">
                  {new Date(rx.createdAt).toLocaleString()}
                </span>
                {rx.priority === 'urgent' && <span className="rx-priority">URGENT</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {selected && (
        <div className="rx-modal-overlay" onClick={() => setSelected(null)}>
          <div className="rx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rx-modal-header">
              <h3>Prescription {selected.id}</h3>
              <button className="rx-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="rx-modal-body">
              <div className="rx-detail-row">
                <span>Patient</span>
                <strong>{selected.patientName} (ID: {selected.patientId})</strong>
              </div>
              <div className="rx-detail-row">
                <span>Prescriber</span>
                <strong>{selected.doctorName}</strong>
              </div>
              <div className="rx-detail-row">
                <span>Diagnosis</span>
                <strong>{selected.diagnosis || '—'}</strong>
              </div>
              <div className="rx-detail-row">
                <span>Priority</span>
                <strong className={selected.priority === 'urgent' ? 'urgent-text' : ''}>
                  {selected.priority}
                </strong>
              </div>

              <h4>Medications</h4>
              <table className="rx-med-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dose</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.medications?.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.dose}</td>
                      <td>{m.frequency}</td>
                      <td>{m.duration}</td>
                      <td>{m.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selected.notes && (
                <div className="rx-notes">
                  <strong>Doctor's notes:</strong>
                  <p>{selected.notes}</p>
                </div>
              )}

              {selected.status === 'pending' && (
                <div className="rx-pharm-notes">
                  <label>Pharmacy notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    placeholder="e.g. substituted brand, partial stock…"
                  />
                </div>
              )}
            </div>

            <div className="rx-modal-footer">
              {selected.status === 'pending' ? (
                <>
                  <button
                    className="rx-btn danger"
                    onClick={() => handleDispense(selected, 'cancelled')}
                  >
                    Cancel
                  </button>
                  <button
                    className="rx-btn secondary"
                    onClick={() => handleDispense(selected, 'partially_dispensed')}
                  >
                    Partial
                  </button>
                  <button
                    className="rx-btn primary"
                    onClick={() => handleDispense(selected, 'dispensed')}
                  >
                    ✅ Dispense
                  </button>
                </>
              ) : (
                <button className="rx-btn secondary" onClick={() => setSelected(null)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}