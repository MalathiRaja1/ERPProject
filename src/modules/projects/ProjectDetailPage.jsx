import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useToast, extractErrorMessage } from '../../components/ToastProvider';

const STATUS_COLORS = { Planning: '#8a8f98', Active: '#2d6cdf', OnHold: '#d68910', Completed: '#1f9254', Cancelled: '#c0392b' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState({ employeeId: '', roleOnProject: '' });

  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', dueDate: '' });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ milestoneId: '', title: '', description: '', assignedToEmployeeId: '', priority: 'Medium', dueDate: '' });

  const loadAll = async () => {
    const [p, s, m, ms, t] = await Promise.all([
      apiClient.get(`/projects/${id}`),
      apiClient.get(`/projects/${id}/summary`),
      apiClient.get(`/projects/${id}/members`),
      apiClient.get(`/projects/${id}/milestones`),
      apiClient.get(`/projects/${id}/tasks`)
    ]);
    setProject(p.data);
    setSummary(s.data);
    setMembers(m.data);
    setMilestones(ms.data);
    setTasks(t.data);
  };

  useEffect(() => {
    loadAll();
    apiClient.get('/employees').then((res) => setEmployees(res.data));
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${id}/members`, { ...memberForm, employeeId: Number(memberForm.employeeId) });
      toast.success('Team member added.');
      setShowMemberForm(false);
      setMemberForm({ employeeId: '', roleOnProject: '' });
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to add member'));
    }
  };

  const handleRemoveMember = async (memberId) => {
    await apiClient.delete(`/projects/members/${memberId}`);
    toast.success('Member removed.');
    loadAll();
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${id}/milestones`, milestoneForm);
      toast.success('Milestone added.');
      setShowMilestoneForm(false);
      setMilestoneForm({ name: '', dueDate: '' });
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to add milestone'));
    }
  };

  const handleToggleMilestone = async (m) => {
    await apiClient.patch(`/projects/milestones/${m.id}/status`, {
      status: m.status === 'Pending' ? 'Completed' : 'Pending'
    });
    loadAll();
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/projects/${id}/tasks`, {
        ...taskForm,
        milestoneId: taskForm.milestoneId ? Number(taskForm.milestoneId) : null,
        assignedToEmployeeId: taskForm.assignedToEmployeeId ? Number(taskForm.assignedToEmployeeId) : null,
        dueDate: taskForm.dueDate || null
      });
      toast.success('Task added.');
      setShowTaskForm(false);
      setTaskForm({ milestoneId: '', title: '', description: '', assignedToEmployeeId: '', priority: 'Medium', dueDate: '' });
      loadAll();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to add task'));
    }
  };

  const handleTaskStatus = async (task, status) => {
    await apiClient.patch(`/projects/tasks/${task.id}/status`, { status });
    loadAll();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await apiClient.delete(`/projects/tasks/${taskId}`);
    loadAll();
  };

  if (!project || !summary) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/projects">← Back to Projects</Link>
          <h1>{project.name} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>({project.code})</span></h1>
        </div>
        <span style={{ color: STATUS_COLORS[project.status], fontWeight: 600 }}>{project.status}</span>
      </div>

      <div className="toolbar">
        <button onClick={() => setTab('overview')} disabled={tab === 'overview'}>Overview</button>
        <button onClick={() => setTab('team')} disabled={tab === 'team'}>Team ({members.length})</button>
        <button onClick={() => setTab('milestones')} disabled={tab === 'milestones'}>Milestones ({milestones.length})</button>
        <button onClick={() => setTab('tasks')} disabled={tab === 'tasks'}>Tasks ({tasks.length})</button>
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 10, minWidth: 200, boxShadow: 'var(--shadow)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Budget</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>₹{summary.budget.toFixed(2)}</div>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 10, minWidth: 200, boxShadow: 'var(--shadow)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Invoiced Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1f9254' }}>₹{summary.invoicedRevenue.toFixed(2)}</div>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 10, minWidth: 200, boxShadow: 'var(--shadow)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Remaining Budget</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: summary.remainingBudget >= 0 ? '#1f9254' : '#c0392b' }}>₹{summary.remainingBudget.toFixed(2)}</div>
          </div>
          <div style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 10, minWidth: 200, boxShadow: 'var(--shadow)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Task Completion</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{summary.taskCompletionPercent}% ({summary.completedTasks}/{summary.totalTasks})</div>
          </div>
          {project.description && (
            <div style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 10, width: '100%', boxShadow: 'var(--shadow)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>Description</div>
              <p>{project.description}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'team' && (
        <div>
          <button onClick={() => setShowMemberForm(true)}>+ Add Member</button>
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead><tr><th>Code</th><th>Name</th><th>Role on Project</th><th></th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>{m.employeeCode}</td><td>{m.employeeName}</td><td>{m.roleOnProject}</td>
                  <td><button onClick={() => handleRemoveMember(m.id)}>Remove</button></td>
                </tr>
              ))}
              {members.length === 0 && <tr><td colSpan={4}>No team members yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'milestones' && (
        <div>
          <button onClick={() => setShowMilestoneForm(true)}>+ Add Milestone</button>
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead><tr><th>Name</th><th>Due Date</th><th>Tasks</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {milestones.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{new Date(m.dueDate).toLocaleDateString()}</td>
                  <td>{m.completedTaskCount} / {m.taskCount}</td>
                  <td style={{ color: m.status === 'Completed' ? '#1f9254' : '#d68910' }}>{m.status}</td>
                  <td><button onClick={() => handleToggleMilestone(m)}>{m.status === 'Pending' ? 'Mark Complete' : 'Reopen'}</button></td>
                </tr>
              ))}
              {milestones.length === 0 && <tr><td colSpan={5}>No milestones yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'tasks' && (
        <div>
          <button onClick={() => setShowTaskForm(true)}>+ Add Task</button>
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead><tr><th>Title</th><th>Milestone</th><th>Assigned To</th><th>Priority</th><th>Due</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.milestoneName || '—'}</td>
                  <td>{t.assignedToName || '—'}</td>
                  <td>{t.priority}</td>
                  <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                  <td>{t.status}</td>
                  <td>
                    <select value={t.status} onChange={(e) => handleTaskStatus(t, e.target.value)}>
                      <option value="Todo">Todo</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>{' '}
                    <button onClick={() => handleDeleteTask(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && <tr><td colSpan={7}>No tasks yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showMemberForm && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleAddMember}>
            <h2>Add Team Member</h2>
            <label>Employee</label>
            <select value={memberForm.employeeId} onChange={(e) => setMemberForm({ ...memberForm, employeeId: e.target.value })} required>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeCode} — {e.fullName}</option>)}
            </select>
            <label>Role on Project</label>
            <input value={memberForm.roleOnProject} onChange={(e) => setMemberForm({ ...memberForm, roleOnProject: e.target.value })} placeholder="e.g. Developer, Designer" required />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowMemberForm(false)}>Cancel</button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}

      {showMilestoneForm && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleAddMilestone}>
            <h2>Add Milestone</h2>
            <label>Name</label>
            <input value={milestoneForm.name} onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })} required />
            <label>Due Date</label>
            <input type="date" value={milestoneForm.dueDate} onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} required />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowMilestoneForm(false)}>Cancel</button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}

      {showTaskForm && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleAddTask}>
            <h2>Add Task</h2>
            <label>Title</label>
            <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
            <label>Description</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
            <label>Milestone (optional)</label>
            <select value={taskForm.milestoneId} onChange={(e) => setTaskForm({ ...taskForm, milestoneId: e.target.value })}>
              <option value="">None</option>
              {milestones.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <label>Assign To (optional)</label>
            <select value={taskForm.assignedToEmployeeId} onChange={(e) => setTaskForm({ ...taskForm, assignedToEmployeeId: e.target.value })}>
              <option value="">Unassigned</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeCode} — {e.fullName}</option>)}
            </select>
            <label>Priority</label>
            <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <label>Due Date (optional)</label>
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowTaskForm(false)}>Cancel</button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
