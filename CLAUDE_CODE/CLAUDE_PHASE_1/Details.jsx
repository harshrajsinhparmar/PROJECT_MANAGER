import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateSubtasks, updateChecklist, updateMilestones, editProjectDb } from "./Redux";

const STATUS_COLORS = {
    backlog:    { bg: '#2d2d2d', text: '#aaa',    label: 'Backlog' },
    todo:       { bg: '#1a3a5c', text: '#4a9eff', label: 'To Do' },
    inprogress: { bg: '#3a2d00', text: '#f2aa4d', label: 'In Progress' },
    inreview:   { bg: '#2d1a4a', text: '#a855f7', label: 'In Review' },
    onhold:     { bg: '#3a1e00', text: '#fb923c', label: 'On Hold' },
    done:       { bg: '#003a2d', text: '#2dd4bf', label: 'Done' },
    complete:   { bg: '#1e3a00', text: '#84cc16', label: 'Complete' },
};

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

function ProgressBar({ value, color }) {
    return (
        <div style={{ height: 6, background: '#2a2a3e', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
            <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
        </div>
    );
}

export default function Details() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const createdProjects = useSelector(s => s.registration.createdProjects);
    const assignedProjects = useSelector(s => s.registration.assignedProjects);
    const project = [...createdProjects, ...assignedProjects].find(p => p._id === id);

    const [activeTab, setActiveTab] = useState('subtasks');
    const [newSubtask, setNewSubtask] = useState('');
    const [newCheckItem, setNewCheckItem] = useState('');
    const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' });

    useEffect(() => { window.scrollTo(0, 0); }, [id]);

    if (!project) {
        return (
            <div style={{ minHeight: '100vh', background: '#0d0d1a', color: '#e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 18, marginBottom: 8 }}>Project not found</div>
                <button onClick={() => navigate('/projects')} style={{ padding: '10px 20px', background: '#4a9eff', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', marginTop: 16 }}>
                    ← Back to Projects
                </button>
            </div>
        );
    }

    const sc = STATUS_COLORS[project.status] || STATUS_COLORS.backlog;

    // Progress calculations
    const subtaskPct = project.subtasks?.length ? Math.round(project.subtasks.filter(s => s.completed).length / project.subtasks.length * 100) : 0;
    const checkPct = project.checklist?.length ? Math.round(project.checklist.filter(c => c.done).length / project.checklist.length * 100) : 0;
    const milestonePct = project.milestones?.length ? Math.round(project.milestones.filter(m => m.completed).length / project.milestones.length * 100) : 0;

    // Handlers
    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        dispatch(updateSubtasks({ id, action: 'add', title: newSubtask.trim() }));
        setNewSubtask('');
    };
    const toggleSubtask = (subtaskId) => dispatch(updateSubtasks({ id, action: 'toggle', subtaskId }));
    const deleteSubtask = (subtaskId) => dispatch(updateSubtasks({ id, action: 'delete', subtaskId }));

    const addCheckItem = () => {
        if (!newCheckItem.trim()) return;
        dispatch(updateChecklist({ id, action: 'add', item: newCheckItem.trim() }));
        setNewCheckItem('');
    };
    const toggleCheckItem = (itemId) => dispatch(updateChecklist({ id, action: 'toggle', itemId }));
    const deleteCheckItem = (itemId) => dispatch(updateChecklist({ id, action: 'delete', itemId }));

    const addMilestone = () => {
        if (!newMilestone.title.trim()) return;
        dispatch(updateMilestones({ id, action: 'add', title: newMilestone.title.trim(), dueDate: newMilestone.dueDate }));
        setNewMilestone({ title: '', dueDate: '' });
    };
    const toggleMilestone = (milestoneId) => dispatch(updateMilestones({ id, action: 'toggle', milestoneId }));
    const deleteMilestone = (milestoneId) => dispatch(updateMilestones({ id, action: 'delete', milestoneId }));

    const inputStyle = {
        flex: 1, padding: '8px 12px', background: '#0d0d1a', border: '1px solid #333',
        borderRadius: 6, color: '#e0e0e0', fontSize: 14
    };
    const addBtnStyle = {
        padding: '8px 16px', background: '#4a9eff', border: 'none', borderRadius: 6,
        color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap'
    };
    const tabStyle = (active) => ({
        padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
        color: active ? '#4a9eff' : '#666', fontWeight: active ? 700 : 400, fontSize: 14,
        borderBottom: active ? '2px solid #4a9eff' : '2px solid transparent', transition: 'all 0.2s'
    });

    return (
        <div style={{ minHeight: '100vh', background: '#0d0d1a', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ background: '#1a1a2e', borderBottom: '1px solid #333', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => navigate('/projects')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 20 }}>←</button>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{project.Title}</h2>
                <span style={{ background: sc.bg, color: sc.text, padding: '4px 12px', borderRadius: 20, fontSize: 13, marginLeft: 4 }}>{sc.label}</span>
                <span style={{ color: PRIORITY_COLORS[project.priority], border: `1px solid ${PRIORITY_COLORS[project.priority]}`, padding: '3px 10px', borderRadius: 20, fontSize: 12, background: '#0d0d1a' }}>
                    {project.priority}
                </span>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 32px' }}>
                {/* Info row */}
                <div style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 10, padding: '16px 20px', marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                    {[
                        { label: 'Sprint', value: `Sprint ${project.sprint || 1}` },
                        { label: 'Start Date', value: project.startDate || '—' },
                        { label: 'Due Date', value: project.date },
                        { label: 'Tags', value: project.tags?.length ? project.tags.map(t => `#${t}`).join(' ') : '—' },
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ fontSize: 11, color: '#666', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                            <div style={{ fontSize: 14, color: '#ccc' }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                {/* Description */}
                {project.Description && (
                    <div style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</div>
                        <p style={{ margin: 0, color: '#ccc', lineHeight: 1.7, fontSize: 14 }}>{project.Description}</p>
                    </div>
                )}

                {/* Progress overview */}
                <div style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 10, padding: '16px 20px', marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                    {[
                        { label: 'Subtasks', pct: subtaskPct, color: '#4a9eff', count: project.subtasks?.length || 0, done: project.subtasks?.filter(s => s.completed).length || 0 },
                        { label: 'Checklist', pct: checkPct, color: '#a855f7', count: project.checklist?.length || 0, done: project.checklist?.filter(c => c.done).length || 0 },
                        { label: 'Milestones', pct: milestonePct, color: '#84cc16', count: project.milestones?.length || 0, done: project.milestones?.filter(m => m.completed).length || 0 },
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}>
                                <span>{item.label}</span>
                                <span style={{ color: item.color }}>{item.done}/{item.count} ({item.pct}%)</span>
                            </div>
                            <ProgressBar value={item.pct} color={item.color} />
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #333', marginBottom: 20 }}>
                    {[
                        { key: 'subtasks', label: '✅ Subtasks' },
                        { key: 'checklist', label: '📋 Checklist' },
                        { key: 'milestones', label: '🏁 Milestones' },
                        { key: 'activity', label: '🕐 Activity' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={tabStyle(activeTab === t.key)}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── SUBTASKS ── */}
                {activeTab === 'subtasks' && (
                    <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <input
                                placeholder="Add a subtask..."
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                                style={inputStyle}
                            />
                            <button onClick={addSubtask} style={addBtnStyle}>Add</button>
                        </div>
                        {project.subtasks?.length === 0 && (
                            <div style={{ color: '#444', textAlign: 'center', padding: 40, fontSize: 15 }}>No subtasks yet. Add one above.</div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(project.subtasks || []).map(s => (
                                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 14px' }}>
                                    <input
                                        type="checkbox"
                                        checked={s.completed}
                                        onChange={() => toggleSubtask(s._id)}
                                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#4a9eff' }}
                                    />
                                    <span style={{ flex: 1, fontSize: 14, textDecoration: s.completed ? 'line-through' : 'none', color: s.completed ? '#555' : '#ccc' }}>
                                        {s.title}
                                    </span>
                                    <button onClick={() => deleteSubtask(s._id)}
                                        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
                                        onMouseEnter={e => e.target.style.color = '#ef4444'}
                                        onMouseLeave={e => e.target.style.color = '#555'}>
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CHECKLIST ── */}
                {activeTab === 'checklist' && (
                    <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <input
                                placeholder="Add a checklist item..."
                                value={newCheckItem}
                                onChange={e => setNewCheckItem(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                                style={inputStyle}
                            />
                            <button onClick={addCheckItem} style={{ ...addBtnStyle, background: '#a855f7' }}>Add</button>
                        </div>
                        {project.checklist?.length === 0 && (
                            <div style={{ color: '#444', textAlign: 'center', padding: 40, fontSize: 15 }}>No checklist items yet.</div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(project.checklist || []).map(c => (
                                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8, padding: '10px 14px' }}>
                                    <input
                                        type="checkbox"
                                        checked={c.done}
                                        onChange={() => toggleCheckItem(c._id)}
                                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#a855f7' }}
                                    />
                                    <span style={{ flex: 1, fontSize: 14, textDecoration: c.done ? 'line-through' : 'none', color: c.done ? '#555' : '#ccc' }}>
                                        {c.item}
                                    </span>
                                    <button onClick={() => deleteCheckItem(c._id)}
                                        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
                                        onMouseEnter={e => e.target.style.color = '#ef4444'}
                                        onMouseLeave={e => e.target.style.color = '#555'}>
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── MILESTONES ── */}
                {activeTab === 'milestones' && (
                    <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <input
                                placeholder="Milestone title..."
                                value={newMilestone.title}
                                onChange={e => setNewMilestone(m => ({ ...m, title: e.target.value }))}
                                style={{ ...inputStyle, minWidth: 200 }}
                            />
                            <input
                                type="date"
                                value={newMilestone.dueDate}
                                onChange={e => setNewMilestone(m => ({ ...m, dueDate: e.target.value }))}
                                style={{ ...inputStyle, flex: 'none', width: 160, background: '#0d0d1a' }}
                            />
                            <button onClick={addMilestone} style={{ ...addBtnStyle, background: '#84cc16', color: '#0d0d1a' }}>Add</button>
                        </div>
                        {project.milestones?.length === 0 && (
                            <div style={{ color: '#444', textAlign: 'center', padding: 40, fontSize: 15 }}>No milestones yet.</div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(project.milestones || []).map(m => (
                                <div key={m._id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    background: '#1a1a2e', border: `1px solid ${m.completed ? '#1e3a00' : '#2a2a3e'}`,
                                    borderRadius: 8, padding: '12px 16px'
                                }}>
                                    <div
                                        onClick={() => toggleMilestone(m._id)}
                                        style={{
                                            width: 18, height: 18, borderRadius: '50%', border: `2px solid ${m.completed ? '#84cc16' : '#555'}`,
                                            background: m.completed ? '#84cc16' : 'transparent', cursor: 'pointer', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                        }}>
                                        {m.completed && <span style={{ color: '#0d0d1a', fontSize: 10, fontWeight: 900 }}>✓</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: m.completed ? '#555' : '#e0e0e0', textDecoration: m.completed ? 'line-through' : 'none' }}>
                                            {m.title}
                                        </div>
                                        {m.dueDate && (
                                            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Due: {m.dueDate}</div>
                                        )}
                                    </div>
                                    {m.completed && <span style={{ fontSize: 12, color: '#84cc16', fontWeight: 600 }}>✓ Done</span>}
                                    <button onClick={() => deleteMilestone(m._id)}
                                        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
                                        onMouseEnter={e => e.target.style.color = '#ef4444'}
                                        onMouseLeave={e => e.target.style.color = '#555'}>
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── ACTIVITY LOG ── */}
                {activeTab === 'activity' && (
                    <div>
                        {!project.activityLog?.length ? (
                            <div style={{ color: '#444', textAlign: 'center', padding: 40, fontSize: 15 }}>No activity yet.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {[...(project.activityLog || [])].reverse().map((entry, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #1e1e2e' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4a9eff', marginTop: 5, flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, color: '#ccc' }}>{entry.action}</div>
                                            <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>
                                                {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
