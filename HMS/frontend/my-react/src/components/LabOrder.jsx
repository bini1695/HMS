// src/components/LabOrder.jsx
import React, { useState, useEffect } from 'react';
import './LabOrder.css';
import { labOrderApi } from '../api/labOrderApi';
import { labTests as mockLabTests, patients as mockPatients } from '../data/labTests';

const LabOrder = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [patients, setPatients] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    testIds: [],
    priority: 'routine',
    clinicalNotes: '',
    fasting: false,
    scheduledDate: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Try API first, fall back to mock data
      const [patientsData, testsData, ordersData] = await Promise.all([
        labOrderApi.getPatients().catch(() => mockPatients),
        labOrderApi.getLabTests().catch(() => mockLabTests),
        labOrderApi.getOrders().catch(() => []),
      ]);
      setPatients(patientsData);
      setLabTests(testsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Load error:', err);
      // Fallback to mock data
      setPatients(mockPatients);
      setLabTests(mockLabTests);
    }
  };

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    const patient = patients.find((p) => p.id === patientId);
    setFormData({
      ...formData,
      patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
    });
  };

  const handleTestToggle = (testId) => {
    const selected = formData.testIds.includes(testId)
      ? formData.testIds.filter((id) => id !== testId)
      : [...formData.testIds, testId];
    setFormData({ ...formData, testIds: selected });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      patientName: '',
      testIds: [],
      priority: 'routine',
      clinicalNotes: '',
      fasting: false,
      scheduledDate: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.patientId) {
      setMessage({ type: 'error', text: 'Please select a patient.' });
      return;
    }
    if (formData.testIds.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one lab test.' });
      return;
    }

    setLoading(true);
    try {
      const selectedTests = labTests.filter((t) => formData.testIds.includes(t.id));
      const payload = {
        ...formData,
        tests: selectedTests,
        orderedAt: new Date().toISOString(),
        status: 'pending',
      };

      const newOrder = await labOrderApi.createOrder(payload).catch(() => ({
        id: `ORD-${Date.now()}`,
        ...payload,
      }));

      setOrders((prev) => [newOrder, ...prev]);
      setMessage({ type: 'success', text: 'Lab order created successfully!' });
      resetForm();
      setTimeout(() => setActiveTab('list'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab-order-container">
      <div className="lab-order-header">
        <h2>🧪 Laboratory Orders</h2>
        <div className="tabs">
          <button
            className={activeTab === 'new' ? 'active' : ''}
            onClick={() => setActiveTab('new')}
          >
            New Order
          </button>
          <button
            className={activeTab === 'list' ? 'active' : ''}
            onClick={() => setActiveTab('list')}
          >
            My Orders ({orders.length})
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert ${message.type}`}>{message.text}</div>
      )}

      {activeTab === 'new' && (
        <form className="lab-order-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Patient Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Patient *</label>
                <select
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  required
                >
                  <option value="">-- Choose a patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} (ID: {p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT (Emergency)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Scheduled Date (optional)</label>
                <input
                  type="datetime-local"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="fasting"
                    checked={formData.fasting}
                    onChange={handleChange}
                  />
                  Fasting Required
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Select Lab Tests *</h3>
            <div className="lab-tests-grid">
              {labTests.map((test) => (
                <div
                  key={test.id}
                  className={`lab-test-card ${
                    formData.testIds.includes(test.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleTestToggle(test.id)}
                >
                  <div className="test-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.testIds.includes(test.id)}
                      onChange={() => handleTestToggle(test.id)}
                    />
                  </div>
                  <div className="test-info">
                    <span className="test-name">{test.name}</span>
                    <span className="test-category">{test.category}</span>
                    <span className="test-price">${test.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Clinical Notes</h3>
            <textarea
              name="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={handleChange}
              placeholder="Reason for test, symptoms, relevant medical history..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Reset
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Lab Order'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'list' && (
        <div className="orders-list">
          {orders.length === 0 ? (
            <p className="empty-state">No lab orders found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Tests</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Ordered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.patientName}</td>
                    <td>{order.tests?.map((t) => t.name).join(', ')}</td>
                    <td>
                      <span className={`badge ${order.priority}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.orderedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-link">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default LabOrder;