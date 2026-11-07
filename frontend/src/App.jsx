import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, CheckCircle2, Circle, ClipboardList, Clock3, LayoutDashboard, ListTodo, LogOut, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';

const token = () => localStorage.getItem('taskflow_token');
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(path, { ...options, headers });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`);
  return data;
}
const emptyTask = { title: '', description: '', priority: 'MEDIUM', status: 'TODO' };
const statusName = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Completed' };

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (mode === 'register') await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('taskflow_token', result.token);
      localStorage.setItem('taskflow_user', JSON.stringify(result.user));
      onLogin(result.user);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="auth-shell">
    <section className="auth-visual"><div className="brand brand-light"><span className="brand-mark"><Activity size={20}/></span> taskflow</div>
      <div className="visual-copy"><span className="eyebrow">PLAN CLEAR. WORK SMART.</span><h1>Make progress<br/>feel effortless.</h1><p>One calm place to organize your work, keep priorities clear, and move every task forward.</p>
        <div className="visual-card"><div className="visual-card-top"><span>YOUR WEEK</span><span className="live-dot">● ON TRACK</span></div><div className="mini-progress"><i/></div><div className="visual-card-bottom"><strong>Tasks moving forward</strong><span>Stay focused, one step at a time.</span></div></div>
      </div><span className="visual-footer">A little more clarity, every day.</span>
    </section>
    <section className="auth-panel"><div className="auth-inner"><div className="mobile-brand brand"><span className="brand-mark"><Activity size={20}/></span> taskflow</div>
      <span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</span><h2>{mode === 'login' ? 'Sign in to TaskFlow' : 'Create your account'}</h2><p className="muted">{mode === 'login' ? 'Enter your details to access your workspace.' : 'Create an account and start organizing your work.'}</p>
      <form onSubmit={submit} className="auth-form">
        {mode === 'register' && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required/></label>}
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required/></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength="8" required/></label>
        {error && <div className="error">{error}</div>}
        <button className="primary-btn full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={17}/></button>
      </form>
      <div className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></div>
      <div className="secure-note"><ShieldCheck size={15}/> Your workspace is protected with secure authentication.</div>
    </div></section>
  </main>;
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task ? { title: task.title, description: task.description || '', priority: task.priority, status: task.status } : emptyTask);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const change = (key, value) => setForm(old => ({ ...old, [key]: value }));
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try { await onSave(form); onClose(); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><form className="modal" onSubmit={submit}>
    <div className="modal-head"><div><span className="eyebrow">{task ? 'UPDATE TASK' : 'NEW TASK'}</span><h3>{task ? 'Edit task' : 'Create a task'}</h3></div><button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button></div>
    <label>Task title<input autoFocus value={form.title} onChange={e => change('title', e.target.value)} placeholder="What needs to get done?" required maxLength="200"/></label>
    <label>Description<textarea value={form.description} onChange={e => change('description', e.target.value)} placeholder="Add a few details…" rows="4" maxLength="3000"/></label>
    <div className="form-row"><label>Priority<select value={form.priority} onChange={e => change('priority', e.target.value)}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label><label>Status<select value={form.status} onChange={e => change('status', e.target.value)}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Completed</option></select></label></div>
    {error && <div className="error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={busy}>{busy ? 'Saving…' : task ? 'Save changes' : 'Create task'} <ArrowUpRight size={16}/></button></div>
  </form></div>;
}

function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [modal, setModal] = useState(null); const [filter, setFilter] = useState('ALL'); const [query, setQuery] = useState(''); const [notice, setNotice] = useState('');
  async function load() { setLoading(true); setError(''); try { setTasks(await api('/api/tasks')); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const counts = useMemo(() => ({ ALL: tasks.length, TODO: tasks.filter(t => t.status === 'TODO').length, IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length, DONE: tasks.filter(t => t.status === 'DONE').length }), [tasks]);
  const visible = tasks.filter(t => (filter === 'ALL' || t.status === filter) && (`${t.title} ${t.description || ''}`).toLowerCase().includes(query.toLowerCase()));
  async function save(form) { if (modal?.task) await api(`/api/tasks/${modal.task.id}`, { method: 'PUT', body: JSON.stringify(form) }); else await api('/api/tasks', { method: 'POST', body: JSON.stringify(form) }); await load(); setNotice(modal?.task ? 'Task updated successfully' : 'Task created successfully'); }
  async function remove(task) { if (!window.confirm(`Delete "${task.title}"?`)) return; try { await api(`/api/tasks/${task.id}`, { method: 'DELETE' }); await load(); setNotice('Task deleted'); } catch (err) { setError(err.message); } }
  async function changeStatus(task, status) { try { await api(`/api/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify({ title: task.title, description: task.description, priority: task.priority, status }) }); await load(); } catch (err) { setError(err.message); } }
  function logout() { localStorage.removeItem('taskflow_token'); localStorage.removeItem('taskflow_user'); onLogout(); }
  const firstName = user?.name?.split(' ')[0] || 'there';
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark"><Activity size={20}/></span> taskflow</div><div className="side-label">WORKSPACE</div><div className="nav-item active"><LayoutDashboard size={18}/> Overview</div><div className="side-label side-label-bottom">PERSONAL</div><div className="nav-item"><ListTodo size={18}/> My tasks <span className="nav-count">{tasks.length}</span></div>
    <div className="sidebar-bottom"><div className="profile"><div className="avatar">{firstName.charAt(0).toUpperCase()}</div><div className="profile-info"><strong>{user?.name}</strong><span>{user?.email}</span></div></div><button className="logout-btn" onClick={logout}><LogOut size={17}/> Sign out</button></div></aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="top-user"><span className="status-pill"><i/> All systems normal</span><div className="avatar small">{firstName.charAt(0).toUpperCase()}</div></div></header>
      <section className="page-content"><div className="welcome-row"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Good day, {firstName} <span className="wave">✳</span></h1><p className="muted">Here's what's happening with your tasks today.</p></div><button className="primary-btn" onClick={() => setModal({ task: null })}><Plus size={18}/> New task</button></div>
        <div className="stats-grid"><div className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon blue"><ClipboardList size={18}/></span></div><strong>{counts.ALL}</strong><small>Across your workspace</small></div><div className="stat-card"><div className="stat-top"><span>To do</span><span className="stat-icon amber"><Circle size={18}/></span></div><strong>{counts.TODO}</strong><small>Waiting to get started</small></div><div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon violet"><Clock3 size={18}/></span></div><strong>{counts.IN_PROGRESS}</strong><small>Currently being worked on</small></div><div className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon green"><CheckCircle2 size={18}/></span></div><strong>{counts.DONE}</strong><small>Nicely done</small></div></div>
        <section className="tasks-panel"><div className="panel-head"><div><h2>Your tasks</h2><p className="muted">Keep track of what matters.</p></div><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks"/></div></div>
          <div className="filter-tabs">{[['ALL','All tasks'],['TODO','To do'],['IN_PROGRESS','In progress'],['DONE','Completed']].map(([key,label]) => <button key={key} className={filter === key ? 'selected' : ''} onClick={() => setFilter(key)}>{label}<span>{counts[key]}</span></button>)}</div>
          {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}{error && <div className="error">{error} <button onClick={load}>Retry</button></div>}
          {loading ? <div className="empty-state">Loading your tasks…</div> : visible.length === 0 ? <div className="empty-state"><div className="empty-icon"><ClipboardList size={24}/></div><strong>{query ? 'No matching tasks' : 'Nothing here yet'}</strong><span>{query ? 'Try a different search.' : 'Create your first task and make a little progress.'}</span>{!query && <button className="secondary-btn" onClick={() => setModal({ task: null })}><Plus size={16}/> Create your first task</button>}</div> : <div className="task-list">{visible.map(task => <article className="task-row" key={task.id}><div className={`task-check ${task.status === 'DONE' ? 'done' : ''}`}>{task.status === 'DONE' ? <CheckCircle2 size={19}/> : <Circle size={19}/>}</div><div className="task-details"><strong>{task.title}</strong><p>{task.description || 'No description added'}</p><div className="task-meta"><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority} PRIORITY</span><span className={`status ${task.status.toLowerCase()}`}>{statusName[task.status]}</span></div></div><div className="task-controls"><select aria-label="Change task status" value={task.status} onChange={e => changeStatus(task, e.target.value)}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Completed</option></select><button className="icon-btn" title="Edit task" onClick={() => setModal({ task })}><ArrowUpRight size={17}/></button><button className="icon-btn danger-hover" title="Delete task" onClick={() => remove(task)}><Trash2 size={17}/></button></div></article>)}</div>}
        </section><footer className="footer-note">TaskFlow <span>·</span> A clearer way to get things done.</footer></section></main>
    {modal && <TaskModal task={modal.task} onClose={() => setModal(null)} onSave={save}/>}
  </div>;
}

export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('taskflow_user') || 'null'); } catch { return null; } });
  return user && token() ? <Dashboard user={user} onLogout={() => setUser(null)}/> : <Auth onLogin={setUser}/>;
}
