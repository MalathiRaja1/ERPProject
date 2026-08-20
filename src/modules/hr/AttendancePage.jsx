import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    const { data } = await apiClient.get('/attendance', { params: { date } });
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    apiClient.get('/employees').then((res) => setEmployees(res.data));
  }, []);

  useEffect(() => { loadRecords(); }, [date]);

  const handleCheckIn = async () => {
    if (!selectedEmployee) return;
    await apiClient.post('/attendance/check-in', { employeeId: Number(selectedEmployee) });
    loadRecords();
  };

  const handleCheckOut = async () => {
    if (!selectedEmployee) return;
    await apiClient.post('/attendance/check-out', { employeeId: Number(selectedEmployee) });
    loadRecords();
  };

  const handleMark = async (employeeId, status) => {
    await apiClient.post('/attendance/mark', { employeeId, date, status });
    loadRecords();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Attendance</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="toolbar">
        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
          <option value="">Select employee to punch...</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeCode} — {e.fullName}</option>)}
        </select>
        <button onClick={handleCheckIn}>Check In</button>
        <button onClick={handleCheckOut}>Check Out</button>
      </div>

      {loading && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th><th>Name</th><th>Check In</th><th>Check Out</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.employeeCode}</td>
              <td>{r.employeeName}</td>
              <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</td>
              <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</td>
              <td>{r.status}</td>
              <td>
                <button onClick={() => handleMark(r.employeeId, 'Absent')}>Mark Absent</button>{' '}
                <button onClick={() => handleMark(r.employeeId, 'OnLeave')}>Mark Leave</button>
              </td>
            </tr>
          ))}
          {records.length === 0 && !loading && (
            <tr><td colSpan={6}>No attendance records for this date yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
