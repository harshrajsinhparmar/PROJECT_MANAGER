import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addProjectDb, deleteProjectDb, editProjectDb, assignProjectDb } from "./Redux";
import KanbanView from "./KanbanView";

const STATUS_COLORS = {
    backlog:    { bg: '#2a2a2a', text: '#999999', label: 'Backlog' },
    todo:       { bg: '#0d2540', text: '#4a9eff', label: 'To Do' },
    inprogress: { bg: '#2e1f00', text: '#f2aa4d', label: 'In Progress' },
    inreview:   { bg: '#25104a', text: '#a855f7', label: 'In Review' },
    onhold:     { bg: '#2e1000', text: '#fb923c', label: 'On Hold' },
    done:       { bg: '#002e24', text: '#2dd4bf', label: 'Done' },
    complete:   { bg: '#162800', text: '#84cc16', label: 'Complete' },
};

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

const BLANK_FORM = {
    Title: '', Description: '', status: 'todo', priority: 'medium',
    date: '', startDate: '', sprint: 1, tags: ''
};

export default function Projects() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(s => s.registration.currentUser);
    const createdProjects = useSelector(s => s.registration.createdProjects);
    const assignedProjects = useSelector(s => s.registration.assignedProjects);

    const [tab, setTab] = useState('created');
    const [viewMode, setViewMode] = useState('list');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [form, setForm] = useState(BLANK_FORM);
    const [assignInputs, setAssignInputs] = useState({});
    const [formError, setFormError] = useState('');

    const projects = tab === 'created' ? createdProjects : assignedProjects;
    const filtered = filterStatus === 'all' ? projects : projects.filter(p => p.status === filterStatus);

    const openAdd = () => {
        setForm(BLANK_FORM);
        setEditingProject(null);
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (e, p) => {
        e.stopPropagation();
        setForm({ ...p, tags: (p.tags || []).join(', ') });
        setEditingProject(p);
        setFormError('');
        setShowModal(true);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this project?')) dispatch(deleteProjectDb(id));
    };

    const handleSave = async () => {
        if (!form.Title.trim()) return setFormError('Title is required');
        if (!form.date) return setFormError('Due date is required');
        const payload = {
            ...form,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            createdBy: currentUser._id
        };
        delete payload._id;
        delete payload.__v;
        delete payload.createdAt;
        delete payload.updatedAt;
        if (editingProject) {
            await dispatch(editProjectDb({ id: editingProject._id, updatedData: payload }));
        } else {
            await dispatch(addProjectDb(payload));
        }
        setShowModal(false);
    };

    const handleAssign = async (e, projectId) => {
        e.stopPropagation();
        const val = assignInputs[projectId]?.trim();
        if (!val) return;
        await dispatch(assignProjectDb({ projectId, assignToUserId: val }));
        setAssignInputs(prev => ({ ...prev, [projectId]: '' }));
    };

    const inputStyle = {
        width: '100%', padding: '9px 12px', background: '#0d0d1a',
        border: '1px solid #2a2a3e', borderRadius: 6, color: '#e0e0e0',
        fontSize: 14, boxSizing: 'border-box', outline: 'none'
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a18', color: '#e0e0e0', fontFamily: "'Inter', sans-serif" }}>

            {/* ── Top Nav ── */}
            <div style={{ background: '#13132b', borderBottom: '1px solid #222240', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => navigate('/dashboard')}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}>←</button>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f0f0f0' }}>Projects</h2>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => setViewMode(v => v === 'list' ? 'kanban' : 'list')}
                        style={{ padding: '7px 14px', background: viewMode === 'kanban' ? '#1a3a5c' : 'transparent', border: '1px solid #4a9eff', borderRadius: 6, color: '#4a9eff', cursor: 'pointer', fontSize: 13 }}>
                        {viewMode === 'kanban' ? '☰ List View' : '⬜ Kanban'}
                    </button>
                    <button onClick={() => navigate('/calendar')}
                        style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #a855f7', borderRadius: 6, color: '#a855f7', cursor: 'pointer', fontSize: 13 }}>
                        📅 Calendar
                    </button>
                    <button onClick={() => navigate('/gantt')}
                        style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #2dd4bf', borderRadius: 6, color: '#2dd4bf', cursor: 'pointer', fontSize: 13 }}>
                        📊 Gantt
                    </button>
                    <button onClick={openAdd}
                        style={{ padding: '7px 16px', background: '#4a9eff', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        + New Project
                    </button>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ background: '#0f0f24', borderBottom: '1px solid #1e1e3a', display: 'flex', padding: '0 28px' }}>
                {[
                    { key: 'created', label: '🗂 My Projects', count: createdProjects.length },
                    { key: 'assigned', label: '📌 Assigned to Me', count: assignedProjects.length },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
                        color: tab === t.key ? '#4a9eff' : '#666', fontWeight: tab === t.key ? 700 : 400,
                        borderBottom: `2px solid ${tab === t.key ? '#4a9eff' : 'transparent'}`, fontSize: 14,
                        transition: 'all 0.15s'
                    }}>
                        {t.label} <span style={{ background: '#1a1a3a', borderRadius: 10, padding: '1px 7px', fontSize: 12, marginLeft: 4 }}>{t.count}</span>
                    </button>
                ))}
            </div>

            {/* ── Kanban View ── */}
            {viewMode === 'kanban' ? (
                <KanbanView projects={filtered} />
            ) : (
                <div style={{ padding: '20px 28px' }}>

                    {/* Filter pills */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
                        <button onClick={() => setFilterStatus('all')}
                            style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid #333', background: filterStatus === 'all' ? '#4a9eff' : 'transparent', color: filterStatus === 'all' ? '#fff' : '#888', cursor: 'pointer', fontSize: 12 }}>
                            All ({projects.length})
                        </button>
                        {Object.entries(STATUS_COLORS).map(([key, val]) => {
                            const count = projects.filter(p => p.status === key).length;
                            return (
                                <button key={key} onClick={() => setFilterStatus(key)}
                                    style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${val.text}55`, background: filterStatus === key ? val.bg : 'transparent', color: val.text, cursor: 'pointer', fontSize: 12 }}>
                                    {val.label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Cards */}
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#444', marginTop: 80 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                            <div style={{ fontSize: 16 }}>No projects here yet.</div>
                            {tab === 'created' && (
                                <button onClick={openAdd}
                                    style={{ marginTop: 16, padding: '10px 22px', background: '#4a9eff', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                                    Create your first project
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                            {filtered.map(p => {
                                const sc = STATUS_COLORS[p.status] || STATUS_COLORS.backlog;
                                const subtaskDone = (p.subtasks || []).filter(s => s.completed).length;
                                const subtaskTotal = (p.subtasks || []).length;

                                return (
                                    <div key={p._id}
                                        onClick={() => navigate(`/projects/${p._id}`)}
                                        style={{ background: '#13132b', borderRadius: 10, padding: 16, border: '1px solid #1e1e3a', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4a9eff55'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e3a'; e.currentTarget.style.transform = 'translateY(0)'; }}>

                                        {/* Card header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f0f0f0', lineHeight: 1.3 }}>{p.Title}</h3>
                                            <span style={{ flexShrink: 0, background: sc.bg, color: sc.text, padding: '3px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                                                {sc.label}
                                            </span>
                                        </div>

                                        {p.Description && (
                                            <p style={{ margin: '0 0 10px', color: '#777', fontSize: 13, lineHeight: 1.5 }}>
                                                {p.Description.length > 90 ? p.Description.slice(0, 90) + '…' : p.Description}
                                            </p>
                                        )}

                                        {/* Badges */}
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                            <span style={{ background: '#0a0a18', color: PRIORITY_COLORS[p.priority], border: `1px solid ${PRIORITY_COLORS[p.priority]}44`, padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>
                                                {p.priority}
                                            </span>
                                            {p.sprint && (
                                                <span style={{ background: '#0a0a18', color: '#666', border: '1px solid #2a2a3a', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>
                                                    Sprint {p.sprint}
                                                </span>
                                            )}
                                            {(p.tags || []).slice(0, 2).map(tag => (
                                                <span key={tag} style={{ background: '#1a1040', color: '#a78bfa', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>#{tag}</span>
                                            ))}
                                        </div>

                                        {/* Subtask progress */}
                                        {subtaskTotal > 0 && (
                                            <div style={{ marginBottom: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginBottom: 3 }}>
                                                    <span>Subtasks</span>
                                                    <span>{subtaskDone}/{subtaskTotal}</span>
                                                </div>
                                                <div style={{ height: 3, background: '#1e1e3a', borderRadius: 2 }}>
                                                    <div style={{ height: '100%', width: `${Math.round(subtaskDone / subtaskTotal * 100)}%`, background: '#4a9eff', borderRadius: 2, transition: 'width 0.3s' }} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#555', fontSize: 12 }}>Due {p.date}</span>
                                            {tab === 'created' && (
                                                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                                    <button onClick={e => openEdit(e, p)}
                                                        style={{ padding: '3px 10px', background: '#0d2540', border: '1px solid #4a9eff55', borderRadius: 5, color: '#4a9eff', cursor: 'pointer', fontSize: 12 }}>
                                                        Edit
                                                    </button>
                                                    <button onClick={e => handleDelete(e, p._id)}
                                                        style={{ padding: '3px 10px', background: '#2e0d0d', border: '1px solid #ef444455', borderRadius: 5, color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Assign (created tab only) */}
                                        {tab === 'created' && (
                                            <div style={{ marginTop: 10, display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                                <input
                                                    placeholder="Assign by User ID"
                                                    value={assignInputs[p._id] || ''}
                                                    onChange={e => setAssignInputs(prev => ({ ...prev, [p._id]: e.target.value }))}
                                                    style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 12 }}
                                                />
                                                <button onClick={e => handleAssign(e, p._id)}
                                                    style={{ padding: '6px 12px', background: '#25104a', border: '1px solid #a855f755', borderRadius: 5, color: '#a855f7', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
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

            {/* ── Add/Edit Modal ── */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
                    <div style={{ background: '#13132b', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', border: '1px solid #2a2a4a' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>
                            {editingProject ? 'Edit Project' : 'New Project'}
                        </h3>

                        {formError && (
                            <div style={{ background: '#2e0d0d', color: '#ef4444', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 14 }}>
                                {formError}
                            </div>
                        )}

                        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Title *</label>
                        <input value={form.Title} onChange={e => setForm({ ...form, Title: e.target.value })}
                            placeholder="Project title" style={{ ...inputStyle, marginBottom: 12 }} />

                        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Description</label>
                        <textarea value={form.Description} onChange={e => setForm({ ...form, Description: e.target.value })}
                            placeholder="What is this project about?" rows={3}
                            style={{ ...inputStyle, resize: 'vertical', marginBottom: 12, fontFamily: 'inherit' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                    style={{ ...inputStyle, cursor: 'pointer' }}>
                                    {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Priority</label>
                                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                                    style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Start Date</label>
                                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                                    style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Due Date *</label>
                                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                    style={inputStyle} />
                            </div>
                        </div>

                        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Sprint</label>
                        <input type="number" value={form.sprint} onChange={e => setForm({ ...form, sprint: Number(e.target.value) })}
                            min={1} style={{ ...inputStyle, marginBottom: 12 }} />

                        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Tags (comma separated)</label>
                        <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                            placeholder="e.g. frontend, api, urgent" style={{ ...inputStyle, marginBottom: 20 }} />

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleSave}
                                style={{ flex: 1, padding: '11px', background: '#4a9eff', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                                {editingProject ? 'Save Changes' : 'Create Project'}
                            </button>
                            <button onClick={() => setShowModal(false)}
                                style={{ padding: '11px 20px', background: '#1e1e3a', border: '1px solid #333', borderRadius: 8, color: '#999', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
