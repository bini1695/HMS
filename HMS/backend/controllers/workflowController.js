const pool = require('../config/db');

const roleAccess = {
  admin: ['admin', 'doctor', 'patient', 'receptionist', 'nurse', 'pharmacist', 'lab_technician', 'billing'],
  doctor: ['patients', 'appointments', 'records', 'prescriptions', 'lab_orders'],
  patient: ['appointments', 'records', 'bills'],
  receptionist: ['patients', 'appointments', 'queue'],
  nurse: ['patients', 'vitals', 'beds', 'medication_schedules'],
  pharmacist: ['prescriptions', 'inventory', 'billing'],
  lab_technician: ['lab_orders', 'lab_results'],
  billing: ['billing', 'insurance'],
};

async function countOrZero(query) {
  try {
    const [[row]] = await pool.query(query);
    return Number(row.total || 0);
  } catch (err) {
    console.error('Workflow metric query failed:', err.message);
    return 0;
  }
}

exports.summary = async (req, res) => {
  try {
    const [patients, appointments, records, pendingLabs, pendingPrescriptions, availableBeds, unpaidBills] = await Promise.all([
      countOrZero('SELECT COUNT(*) AS total FROM patients'),
      countOrZero("SELECT COUNT(*) AS total FROM appointments WHERE status IN ('scheduled', 'checked_in')"),
      countOrZero('SELECT COUNT(*) AS total FROM medical_records'),
      countOrZero("SELECT COUNT(*) AS total FROM lab_orders WHERE status <> 'completed'"),
      countOrZero("SELECT COUNT(*) AS total FROM prescriptions WHERE status = 'pending'"),
      countOrZero("SELECT COUNT(*) AS total FROM beds WHERE status = 'available'"),
      countOrZero("SELECT COUNT(*) AS total FROM bills WHERE status <> 'paid'"),
    ]);
    res.json({ role: req.user.role, permissions: roleAccess[req.user.role] || [], metrics: { patients, appointments, records, pendingLabs, pendingPrescriptions, availableBeds, unpaidBills } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load hospital workflow summary' });
  }
};

exports.appointments = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT a.*, p.medical_record_no, u.name AS doctor_name
      FROM appointments a JOIN patients p ON p.id = a.patient_id
      LEFT JOIN users u ON u.id = a.doctor_id ORDER BY a.appointment_date, a.appointment_time`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load appointments' });
  }
};

exports.patientHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT mr.*, u.name AS doctor_name FROM medical_records mr LEFT JOIN users u ON u.id = mr.doctor_id WHERE mr.patient_id = ? ORDER BY mr.recorded_at DESC`, [req.params.patientId]);
    const [labs] = await pool.query('SELECT * FROM lab_orders WHERE patient_id = ? ORDER BY created_at DESC', [req.params.patientId]);
    const [prescriptions] = await pool.query('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC', [req.params.patientId]);
    res.json({ records: rows, labs, prescriptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load patient history' });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;
    if (!patientId || !appointmentDate || !appointmentTime) return res.status(400).json({ message: 'Patient, date, and time are required' });
    const [result] = await pool.query('INSERT INTO appointments (patient_id, doctor_id, receptionist_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?, ?)', [patientId, doctorId || null, req.user.id, appointmentDate, appointmentTime, reason || null]);
    res.status(201).json({ id: result.insertId, message: 'Appointment created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, symptoms, treatment, notes } = req.body;
    const [result] = await pool.query('INSERT INTO medical_records (patient_id, doctor_id, diagnosis, symptoms, treatment, notes) VALUES (?, ?, ?, ?, ?, ?)', [patientId, req.user.id, diagnosis, symptoms, treatment, notes]);
    res.status(201).json({ id: result.insertId, message: 'Medical record saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save medical record' });
  }
};

exports.createLabOrder = async (req, res) => {
  try {
    const { patientId, testName, priority = 'routine' } = req.body;
    const [result] = await pool.query('INSERT INTO lab_orders (patient_id, doctor_id, test_name, priority) VALUES (?, ?, ?, ?)', [patientId, req.user.id, testName, priority]);
    res.status(201).json({ id: result.insertId, message: 'Lab order created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create lab order' });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, medicine, dosage, instructions } = req.body;
    const [result] = await pool.query('INSERT INTO prescriptions (patient_id, doctor_id, medicine, dosage, instructions) VALUES (?, ?, ?, ?, ?)', [patientId, req.user.id, medicine, dosage, instructions]);
    res.status(201).json({ id: result.insertId, message: 'Prescription created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create prescription' });
  }
};

exports.createVitals = async (req, res) => {
  try {
    const { patientId, temperature, bloodPressure, pulse, oxygenLevel, notes } = req.body;
    const [result] = await pool.query('INSERT INTO vitals (patient_id, nurse_id, temperature, blood_pressure, pulse, oxygen_level, notes) VALUES (?, ?, ?, ?, ?, ?, ?)', [patientId, req.user.id, temperature, bloodPressure, pulse, oxygenLevel, notes]);
    res.status(201).json({ id: result.insertId, message: 'Vitals recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to record vitals' });
  }
};

exports.updateLabResult = async (req, res) => {
  try {
    const { result, status = 'completed', reportUrl } = req.body;
    await pool.query('UPDATE lab_orders SET result = ?, status = ?, report_url = ? WHERE id = ?', [result, status, reportUrl || null, req.params.id]);
    res.json({ message: 'Lab result updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update lab result' });
  }
};

exports.listInventory = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY item_name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load inventory' });
  }
};

exports.listBills = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bills ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load bills' });
  }
};