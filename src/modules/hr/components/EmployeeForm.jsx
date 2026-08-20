import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import apiClient from '../../../api/client';
import { createEmployee, fetchEmployees } from '../employeesSlice';

export default function EmployeeForm({ onClose }) {
  const dispatch = useDispatch();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    employeeCode: '', fullName: '', email: '', password: '',
    departmentId: '', jobTitle: '', phone: '', salary: '', hireDate: new Date().toISOString().slice(0, 10)
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/departments').then((res) => setDepartments(res.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await dispatch(createEmployee({
        ...form,
        departmentId: Number(form.departmentId),
        salary: Number(form.salary)
      })).unwrap();
      dispatch(fetchEmployees({}));
      onClose();
    } catch (err) {
      setError(err?.toString() || 'Failed to create employee');
    }
  };

  return (
    <div className="modal-overlay">
      <form className="modal-card" onSubmit={handleSubmit}>
        <h2>New Employee</h2>
        <label>Employee Code</label>
        <input name="employeeCode" value={form.employeeCode} onChange={handleChange} required />
        <label>Full Name</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} required />
        <label>Email (used as login)</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
        <label>Temporary Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} />
        <label>Department</label>
        <select name="departmentId" value={form.departmentId} onChange={handleChange} required>
          <option value="">Select department</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <label>Job Title</label>
        <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required />
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
        <label>Salary</label>
        <input name="salary" type="number" step="0.01" value={form.salary} onChange={handleChange} required />
        <label>Hire Date</label>
        <input name="hireDate" type="date" value={form.hireDate} onChange={handleChange} required />

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
