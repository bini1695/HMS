import React, { useMemo, useState } from 'react';
import { MOCK_PATIENTS } from '../data/mockHospitalData';
import './Patients.css';

const emptyPatient = { name: '', age: '', gender: 'Female', phone: '', email: '', condition: '', doctor: 'Dr. Maya Patel', bloodType: 'O+', status: 'Active' };

export default function Patients() {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyPatient);

  const filteredPatients = useMemo(() => patients.filter((patient) => {
    const matchesSearch = `${patient.name} ${patient.id} ${patient.condition}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === 'All' || patient.status === status);
  }), [patients, search, status]);

  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const addPatient = (event) => {
    event.preventDefault();
    const initials = form.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    const patient = { ...form, id: `PT-${1043 + patients.length}`, initials, age: Number(form.age), lastVisit: '2026-09-23', nextVisit: null, allergies: 'None known', address: 'Address pending' };
    setPatients([patient, ...patients]);
    setSelectedPatient(patient);
    setModalOpen(false);
    setForm(emptyPatient);
  };

  return (
    <div className="patients-page">
      <div className="page-header">
        <div><h1 className="page-title">Patient management</h1><p className="page-subtitle">Keep patient records organized and ready for care.</p></div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add patient</button>
      </div>

      <div className="patient-summary-grid">
        <div className="card patient-summary-card"><span className="summary-icon summary-blue">♙</span><div><strong>{patients.length}</strong><span>Total patients</span></div></div>
        <div className="card patient-summary-card"><span className="summary-icon summary-green">✓</span><div><strong>{patients.filter((patient) => patient.status === 'Active').length}</strong><span>Active care</span></div></div>
        <div className="card patient-summary-card"><span className="summary-icon summary-orange">↻</span><div><strong>{patients.filter((patient) => patient.status === 'Follow-up').length}</strong><span>Needs follow-up</span></div></div>
      </div>

      <div className="patients-layout">
        <section className="card patients-list-panel">
          <div className="panel-heading"><div><h2 className="section-title">All patients</h2><span className="section-meta">{filteredPatients.length} records</span></div><span className="mock-label">MOCK DATA</span></div>
          <div className="patients-filters"><input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients..." /><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Active</option><option>Follow-up</option><option>Inactive</option></select></div>
          <div className="patient-list">
            {filteredPatients.map((patient) => <button className={`patient-list-item ${selectedPatient?.id === patient.id ? 'patient-list-item-selected' : ''}`} key={patient.id} onClick={() => setSelectedPatient(patient)}><span className="patient-avatar">{patient.initials}</span><span className="patient-list-copy"><strong>{patient.name}</strong><small>{patient.id} · {patient.condition}</small></span><span className={`badge ${patient.status === 'Active' ? 'badge-success' : patient.status === 'Follow-up' ? 'badge-warning' : 'badge-neutral'}`}>{patient.status}</span></button>)}
          </div>
        </section>

        {selectedPatient && <section className="card patient-detail-panel"><div className="patient-detail-head"><div className="patient-profile"><span className="patient-avatar patient-avatar-large">{selectedPatient.initials}</span><div><h2>{selectedPatient.name}</h2><span>{selectedPatient.id} · {selectedPatient.age} years · {selectedPatient.gender}</span></div></div><button className="btn btn-secondary btn-sm" onClick={() => alert('Patient record export is available when connected to the backend.')}>Export record</button></div><div className="patient-detail-status"><span className="detail-label">Current status</span><span className={`badge ${selectedPatient.status === 'Active' ? 'badge-success' : selectedPatient.status === 'Follow-up' ? 'badge-warning' : 'badge-neutral'}`}>{selectedPatient.status}</span></div><div className="detail-grid"><div><span>Primary condition</span><strong>{selectedPatient.condition}</strong></div><div><span>Assigned doctor</span><strong>{selectedPatient.doctor}</strong></div><div><span>Blood type</span><strong>{selectedPatient.bloodType}</strong></div><div><span>Allergies</span><strong>{selectedPatient.allergies}</strong></div><div><span>Phone</span><strong>{selectedPatient.phone}</strong></div><div><span>Email</span><strong>{selectedPatient.email}</strong></div><div><span>Last visit</span><strong>{selectedPatient.lastVisit}</strong></div><div><span>Next visit</span><strong>{selectedPatient.nextVisit || 'Not scheduled'}</strong></div></div><div className="patient-note"><span>Address</span><strong>{selectedPatient.address}</strong></div></section>}
      </div>

      {modalOpen && <div className="modal-overlay" onClick={() => setModalOpen(false)}><div className="modal card patient-modal" onClick={(event) => event.stopPropagation()}><h2 className="modal-title">Add patient</h2><form onSubmit={addPatient}><div className="modal-row"><div className="form-group"><label className="form-label">Full name</label><input className="form-input" name="name" value={form.name} onChange={updateForm} required /></div><div className="form-group"><label className="form-label">Age</label><input className="form-input" name="age" type="number" min="0" value={form.age} onChange={updateForm} required /></div></div><div className="modal-row"><div className="form-group"><label className="form-label">Phone</label><input className="form-input" name="phone" value={form.phone} onChange={updateForm} required /></div><div className="form-group"><label className="form-label">Gender</label><select className="form-select" name="gender" value={form.gender} onChange={updateForm}><option>Female</option><option>Male</option><option>Non-binary</option></select></div></div><div className="form-group"><label className="form-label">Email</label><input className="form-input" name="email" type="email" value={form.email} onChange={updateForm} required /></div><div className="form-group"><label className="form-label">Primary condition</label><input className="form-input" name="condition" value={form.condition} onChange={updateForm} required /></div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add patient</button></div></form></div></div>}
    </div>
  );
}
