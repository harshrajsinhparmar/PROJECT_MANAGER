import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addProjectDb, deleteProjectDb, editProjectDb, assignProjectDb } from "./Redux";
import KanbanView from "./KanbanView";

const STATUS_COLORS = {
    backlog:    { bg: '#2d2d2d', text: '#aaa',     label: 'Backlog' },
    todo:       { bg: '#1a3a5c', text: '#4a9eff',  label: 'To Do' },
    inprogress: { bg: '#3a2d00', text: '#f2aa4d',  label: 'In Progress' },
    inreview:   { bg: '#2d1a4a', text: '#a855f7',  label: 'In Review' },
    onhold:     { bg: '#3a1e00', text: '#fb923c',  label: 'On Hold' },
    done:       { bg: '#003a2d', text: '#2dd4bf',  label: 'Done' },
    complete:   { bg: '#1e3a00', text: '#84cc16',  label: 'Complete' },
};

const PRIORITY_COLORS = {
    low:    '#22c55e',
    medium: '#f59e0b',
    high:   '#ef4444',
};

const BLANK = {
    Title: '', Description: '', status: 'todo', priority: 'medium',
    date: '', startDate: '', sprint: 1, tags: ''
};

export default function Projects() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(s => s.registration.currentUser);
    const createdProjects = useSelector(s => s.registration.createdProjects);
    const assignedProjects = useSelector(s => s.registration.assignedProjects);

    const [tab, setTab] = useState('created');          // 'created' | 'assigned'
    const [viewMode, setViewMode] = useState('list');   // 'list' | 'kanban'
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [assignInput, setAssignInput] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [error, setError] = useState('');

    const projects = tab === 'created' ? createdProjects : assignedProjects;
    const filtered = filterStatus === 'all' ? projects : projects.filter(p => p.status === filterStatus);

    const openAdd = () => { setForm(BLANK); setEditingProject(null); setError(''); setShowModal(true); };
    const openEdit = (p) => {
        setForm({ ...p, tags: (p.tags || []).join(', ') });
        setEditingProject(p);
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.Title.trim()) return setError('Title is required');
        if (!form.date) return setError('Due date is required');
        const payload = {
            ...form,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            createdBy: currentUser._id
        };
        if (editingProject) {
            await dispatch(editProjectDb({ id: editingProject._id, updatedData: payload }));
        } else {
            await dispatch(addProjectDb(payload));
        }
        setShowModal(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this project?')) dispatch(deleteProjectDb(id));
    };

    const handleAssign = async (projectId) => {
        if (!assignInput.trim()) return;
        await dispatch(assignProjectDb({ projectId, assignToUserId: assignInput.trim() }));
        setAssignInput('');
    };

    const inputStyle = {
        width: '100%', padding: '8px 12px', background: '#1a1a2e',
        border: '1px solid #333', borderRadius: 6, color: '#e0e0e0',
        fontSize: 14, boxSizing: 'border-box', marginBottom: 10
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0d0d1a', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ background: '#1a1a2e', borderBottom: '1px solid #333', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 20 }}>←</button>
                    <h2 style={{ margin: 0, fontSize: 20 }}>Projects</h2>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setViewMode(v => v === 'list' ? 'kanban' : 'list')}
                        style={{ padding: '8px 16px', background: viewMode === 'kanban' ? '#4a9eff22' : '#1a1a2e', border: '1px solid #4a9eff', borderRadius: 6, color: '#4a9eff', cursor: 'pointer' }}>
                        {viewMode === 'kanban' ? '☰ List' : '⬜ Kanban'}
                    </button>
                    <button onClick={() => navigate('/calendar')}
                        style={{ padding: '8px 16px', background: '#1a1a2e', border: '1px solid #a855f7', borderRadius: 6, color: '#a855f7', cursor: 'pointer' }}>
                        📅 Calendar
                    </button>
                    <button onClick={() => navigate('/gantt')}
                        style={{ padding: '8px 16px', background: '#1a1a2e', border: '1px solid #2dd4bf', borderRadius: 6, color: '#2dd4bf', cursor: 'pointer' }}>
                        📊 Gantt
                    </button>
                    <button onClick={openAdd}
                        style={{ padding: '8px 18px', background: '#4a9eff', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                        + New Project
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #333', padding: '0 32px', background: '#12122a' }}>
                {['created', 'assigned'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '12px 20px', background: 'none', border: 'none',
                        color: tab === t ? '#4a9eff' : '#888', cursor: 'pointer', fontWeight: tab === t ? 700 : 400,
                        borderBottom: tab === t ? '2px solid #4a9eff' : '2px solid transparent', fontSize: 14
                    }}>
                        {t === 'created' ? '🗂 My Projects' : '📌 Assigned to Me'} ({t === 'created' ? createdProjects.length : assignedProjects.length})
                    </button>
                ))}
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' ? (
                <KanbanView projects={filtered} tab={tab} />
            ) : (
                <div style={{ padding: '24px 32px' }}>
                    {/* Filter bar */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                        <button onClick={() => setFilterStatus('all')}
                            style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #444', background: filterStatus === 'all' ? '#4a9eff' : 'transparent', color: filterStatus === 'all' ? '#fff' : '#aaa', cursor: 'pointer', fontSize: 13 }}>
                            All
                        </button>
                        {Object.entries(STATUS_COLORS).map(([key, val]) => (
                            <button key={key} onClick={() => setFilterStatus(key)}
                                style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${val.text}`, background: filterStatus === key ? val.bg : 'transparent', color: val.text, cursor: 'pointer', fontSize: 13 }}>
                                {val.label}
                            </button>
                        ))}
                    </div>

                    {/* Project cards */}
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#555', marginTop: 80, fontSize: 16 }}>
                            No projects found.{tab === 'created' && <span> <button onClick={openAdd} style={{ background: 'none', border: 'none', color: '#4a9eff', cursor: 'pointer', textDecoration: 'underline' }}>Create one</button></span>}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                            {filtered.map(p => {
                                const sc = STATUS_COLORS[p.status] || STATUS_COLORS.backlog;
                                return (
                                    <div key={p._id} style={{ background: '#1a1a2e', borderRadius: 10, padding: 18, border: '1px solid #2a2a3e', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#4a9eff'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3e'}
                                        onClick={() => navigate(`/projects/${p._id}`)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f0f0f0' }}>{p.Title}</h3>
                                            <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 12, fontSize: 12, whiteSpace: 'nowrap', marginLeft: 8 }}>
                                                {sc.label}
                                            </span>
                                        </div>

                                        {p.Description && (
                                            <p style={{ margin: '0 0 10px', color: '#888', fontSize: 13, lineHeight: 1.5 }}>
                                                {p.Description.length > 100 ? p.Description.slice(0, 100) + '...' : p.Description}
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                                            <span style={{ background: '#0d0d1a', color: PRIORITY_COLORS[p.priority], border: `1px solid ${PRIORITY_COLORS[p.priority]}`, padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>
                                                {p.priority}
                                            </span>
                                            {p.sprint && (
                                                <span style={{ background: '#0d0d1a', color: '#888', border: '1px solid #333', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>
                                                    Sprint {p.sprint}
                                                </span>
                                            )}
                                            {(p.tags || []).slice(0, 2).map(tag => (
                                                <span key={tag} style={{ background: '#1e1e3a', color: '#a78bfa', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>#{tag}</span>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                            <span style={{ color: '#666', fontSize: 12 }}>Due: {p.date}</span>
                                            {tab === 'created' && (
                                                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => openEdit(p)}
                                                        style={{ padding: '4px 10px', background: '#1e3a5c', border: '1px solid #4a9eff', borderRadius: 5, color: '#4a9eff', cursor: 'pointer', fontSize: 12 }}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(p._id)}
                                                        style={{ padding: '4px 10px', background: '#3a1a1a', border: '1px solid #ef4444', borderRadius: 5, color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Assign section (created only) */}
                                        {tab === 'created' && (
                                            <div style={{ marginTop: 12, display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                                <input
                                                    placeholder="Assign by User ID"
                                                    value={assignInput}
                                                    onChange={e => setAssignInput(e.target.value)}
                                                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                                                />
                                                <button onClick={() => handleAssign(p._id)}
                                                    style={{ padding: '8px 12px', background: '#2d1a4a', border: '1px solid #a855f7', borderRadius: 6, color: '#a855f7', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
                                                    Assign
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 28, width: 480, maxHeight: '90vh', overflowY: 'auto', border: '1px solid #333' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>{editingProject ? 'Edit Project' : 'New Project'}</h3>
                        {error && <div style={{ background: '#3a1a1a', color: '#ef4444', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}

                        <input placeholder="Title *" value={form.Title} onChange={e => setForm({ ...form, Title: e.target.value })} style={inputStyle} />
                        <textarea placeholder="Description" value={form.Description} onChange={e => setForm({ ...form, Description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                                    {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Priority</label>
                                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Start Date</label>
                                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Due Date *</label>
                                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                            </div>
                        </div>

                        <input type="number" placeholder="Sprint" value={form.sprint} onChange={e => setForm({ ...form, sprint: Number(e.target.value) })} style={inputStyle} />
                        <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} style={inputStyle} />

                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button onClick={handleSave}
                                style={{ flex: 1, padding: '10px', background: '#4a9eff', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
                                {editingProject ? 'Save Changes' : 'Create Project'}
                            </button>
                            <button onClick={() => setShowModal(false)}
                                style={{ padding: '10px 20px', background: '#2a2a3e', border: '1px solid #444', borderRadius: 8, color: '#aaa', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
