import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from './employeesSlice';
import EmployeeForm from './components/EmployeeForm';

export default function EmployeeListPage() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.employees);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployees({ search }));
  }, [dispatch, search]);

  return (
    <div>
      <div className="page-header">
        <h1>Employee Master</h1>
        <button onClick={() => setShowForm(true)}>+ New Employee</button>
      </div>

      <div className="toolbar">
        <input placeholder="Search by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {status === 'loading' && <p>Loading...</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th><th>Name</th><th>Email</th><th>Department</th>
            <th>Job Title</th><th>Phone</th><th>Hire Date</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id}>
              <td>{e.employeeCode}</td>
              <td>{e.fullName}</td>
              <td>{e.email}</td>
              <td>{e.departmentName}</td>
              <td>{e.jobTitle}</td>
              <td>{e.phone}</td>
              <td>{new Date(e.hireDate).toLocaleDateString()}</td>
              <td>{e.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && <EmployeeForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
