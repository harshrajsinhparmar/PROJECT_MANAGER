import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateSubtasks, updateChecklist, updateMilestones } from "./Redux";

const STATUS_COLORS = {
    backlog:    { bg: '#2a2a2a', text: '#999',    label: 'Backlog' },
    todo:       { bg: '#0d2540', text: '#4a9eff', label: 'To Do' },
    inprogress: { bg: '#2e1f00', text: '#f2aa4d', label: 'In Progress' },
    inreview:   { bg: '#25104a', text: '#a855f7', label: 'In Review' },
    onhold:     { bg: '#2e1000', text: '#fb923c', label: 'On Hold' },
    done:       { bg: '#002e24', text: '#2dd4bf', label: 'Done' },
    complete:   { bg: '#162800', text: '#84cc16', label: 'Complete' },
};

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

function Bar({ pct, color }) {
    return (
        <div style={{ height: 5, background: '#1e1e3a', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
    );
}

function DeleteBtn({ onClick }) {
    const [hover, setHover] = useState(false);
    return (
        <button onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ background: 'none', border: 'none', color: hover ? '#ef4444' : '#3a3a5a', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 2px', transition: 'color 0.15s' }}>
            ×
        </button>
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
    const [newCheck, setNewCheck] = useState('');
    const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' });

    if (!project) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a18', color: '#e0e0e0', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 52 }}>🔍</div>
                <div style={{ fontSize: 18, marginTop: 12, marginBottom: 20, color: '#666' }}>Project not found</div>
                <button onClick={() => navigate('/projects')}
                    style={{ padding: '10px 22px', background: '#4a9eff', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    ← Back to Projects
                </button>
            </div>
        );
    }

    const sc = STATUS_COLORS[project.status] || STATUS_COLORS.backlog;

    const subtasks = project.subtasks || [];
    const checklist = project.checklist || [];
    const milestones = project.milestones || [];
    const activityLog = project.activityLog || [];

    const subtaskPct = subtasks.length ? Math.round(subtasks.filter(s => s.completed).length / subtasks.length * 100) : 0;
    const checkPct = checklist.length ? Math.round(checklist.filter(c => c.done).length / checklist.length * 100) : 0;
    const milestonePct = milestones.length ? Math.round(milestones.filter(m => m.completed).length / milestones.length * 100) : 0;

    // Subtask actions
    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        dispatch(updateSubtasks({ id, action: 'add', title: newSubtask.trim() }));
        setNewSubtask('');
    };
    const toggleSubtask = subtaskId => dispatch(updateSubtasks({ id, action: 'toggle', subtaskId }));
    const deleteSubtask = subtaskId => dispatch(updateSubtasks({ id, action: 'delete', subtaskId }));

    // Checklist actions
    const addCheck = () => {
        if (!newCheck.trim()) return;
        dispatch(updateChecklist({ id, action: 'add', item: newCheck.trim() }));
        setNewCheck('');
    };
    const toggleCheck = itemId => dispatch(updateChecklist({ id, action: 'toggle', itemId }));
    const deleteCheck = itemId => dispatch(updateChecklist({ id, action: 'delete', itemId }));

    // Milestone actions
    const addMilestone = () => {
        if (!newMilestone.title.trim()) return;
        dispatch(updateMilestones({ id, action: 'add', title: newMilestone.title.trim(), dueDate: newMilestone.dueDate }));
        setNewMilestone({ title: '', dueDate: '' });
    };
    const toggleMilestone = milestoneId => dispatch(updateMilestones({ id, action: 'toggle', milestoneId }));
    const deleteMilestone = milestoneId => dispatch(updateMilestones({ id, action: 'delete', milestoneId }));

    const inputStyle = {
        flex: 1, padding: '8px 12px', background: '#0a0a18', border: '1px solid #1e1e3a',
        borderRadius: 6, color: '#e0e0e0', fontSize: 14, outline: 'none', fontFamily: 'inherit'
    };

    const tabs = [
        { key: 'subtasks',  label: '✅ Subtasks',    count: subtasks.length },
        { key: 'checklist', label: '📋 Checklist',   count: checklist.length },
        { key: 'milestones',label: '🏁 Milestones',  count: milestones.length },
        { key: 'activity',  label: '🕐 Activity Log',count: activityLog.length },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a18', color: '#e0e0e0', fontFamily: "'Inter', sans-serif" }}>

            {/* ── Header ── */}
            <div style={{ background: '#13132b', borderBottom: '1px solid #1e1e3a', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/projects')}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}>←</button>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f0f0f0' }}>{project.Title}</h2>
                <span style={{ background: sc.bg, color: sc.text, padding: '3px 11px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sc.label}</span>
                <span style={{ color: PRIORITY_COLORS[project.priority], border: `1px solid ${PRIORITY_COLORS[project.priority]}55`, padding: '3px 10px', borderRadius: 20, fontSize: 12, background: '#0a0a18' }}>
                    {project.priority}
                </span>
            </div>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '22px 28px' }}>

                {/* ── Info grid ── */}
                <div style={{ background: '#13132b', border: '1px solid #1e1e3a', borderRadius: 10, padding: '14px 18px', marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                    {[
                        ['Sprint', `Sprint ${project.sprint || 1}`],
                        ['Start Date', project.startDate || '—'],
                        ['Due Date', project.date || '—'],
                        ['Tags', project.tags?.length ? project.tags.map(t => `#${t}`).join(' ') : '—'],
                    ].map(([label, val]) => (
                        <div key={label}>
                            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 13, color: '#bbb' }}>{val}</div>
                        </div>
                    ))}
                </div>

                {/* ── Description ── */}
                {project.Description && (
                    <div style={{ background: '#13132b', border: '1px solid #1e1e3a', borderRadius: 10, padding: '14px 18px', marginBottom: 18 }}>
                        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Description</div>
                        <p style={{ margin: 0, color: '#bbb', lineHeight: 1.7, fontSize: 14 }}>{project.Description}</p>
                    </div>
                )}

                {/* ── Progress overview ── */}
                <div style={{ background: '#13132b', border: '1px solid #1e1e3a', borderRadius: 10, padding: '14px 18px', marginBottom: 22, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                    {[
                        { label: 'Subtasks',   pct: subtaskPct,   color: '#4a9eff', done: subtasks.filter(s => s.completed).length,   total: subtasks.length },
                        { label: 'Checklist',  pct: checkPct,     color: '#a855f7', done: checklist.filter(c => c.done).length,        total: checklist.length },
                        { label: 'Milestones', pct: milestonePct, color: '#84cc16', done: milestones.filter(m => m.completed).length,  total: milestones.length },
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginBottom: 5 }}>
                                <span>{item.label}</span>
                                <span style={{ color: item.color }}>{item.done}/{item.total}</span>
                            </div>
                            <Bar pct={item.pct} color={item.color} />
                        </div>
                    ))}
                </div>

                {/* ── Tab bar ── */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1e1e3a', marginBottom: 20 }}>
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                            color: activeTab === t.key ? '#4a9eff' : '#555',
                            fontWeight: activeTab === t.key ? 700 : 400, fontSize: 13,
                            borderBottom: `2px solid ${activeTab === t.key ? '#4a9eff' : 'transparent'}`,
                            transition: 'all 0.15s', fontFamily: 'inherit'
                        }}>
                            {t.label}
                            {t.count > 0 && (
                                <span style={{ marginLeft: 5, background: '#1e1e3a', borderRadius: 8, padding: '0 5px', fontSize: 11, color: activeTab === t.key ? '#4a9eff' : '#555' }}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ════ SUBTASKS ════ */}
                {activeTab === 'subtasks' && (
                    <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                                placeholder="Add a subtask and press Enter…" style={inputStyle} />
                            <button onClick={addSubtask}
                                style={{ padding: '8px 16px', background: '#4a9eff', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                Add
                            </button>
                        </div>

                        {subtasks.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#333', padding: '40px 0', fontSize: 14 }}>No subtasks yet.</div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {subtasks.map(s => (
                                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#13132b', border: `1px solid ${s.completed ? '#1a3a1a' : '#1e1e3a'}`, borderRadius: 8, padding: '10px 14px' }}>
                                    <input type="checkbox" checked={s.completed} onChange={() => toggleSubtask(s._id)}
                                        style={{ width: 15, height: 15, accentColor: '#4a9eff', cursor: 'pointer', flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: 14, color: s.completed ? '#444' : '#ccc', textDecoration: s.completed ? 'line-through' : 'none' }}>
                                        {s.title}
                                    </span>
                                    <DeleteBtn onClick={() => deleteSubtask(s._id)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ════ CHECKLIST ════ */}
                {activeTab === 'checklist' && (
                    <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                            <input value={newCheck} onChange={e => setNewCheck(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addCheck()}
                                placeholder="Add a checklist item…" style={inputStyle} />
                            <button onClick={addCheck}
                                style={{ padding: '8px 16px', background: '#a855f7', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                Add
                            </button>
                        </div>

                        {checklist.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#333', padding: '40px 0', fontSize: 14 }}>No checklist items yet.</div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {checklist.map(c => (
                                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#13132b', border: `1px solid ${c.done ? '#2d1a4a' : '#1e1e3a'}`, borderRadius: 8, padding: '10px 14px' }}>
                                    <input type="checkbox" checked={c.done} onChange={() => toggleCheck(c._id)}
                                        style={{ width: 15, height: 15, accentColor: '#a855f7', cursor: 'pointer', flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: 14, color: c.done ? '#444' : '#ccc', textDecoration: c.done ? 'line-through' : 'none' }}>
                                        {c.item}
                                    </span>
                                    <DeleteBtn onClick={() => deleteCheck(c._id)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ════ MILESTONES ════ */}
                {activeTab === 'milestones' && (
                    <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                            <input value={newMilestone.title} onChange={e => setNewMilestone(m => ({ ...m, title: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && addMilestone()}
                                placeholder="Milestone title…" style={{ ...inputStyle, minWidth: 160 }} />
                            <input type="date" value={newMilestone.dueDate} onChange={e => setNewMilestone(m => ({ ...m, dueDate: e.target.value }))}
                                style={{ ...inputStyle, flex: 'none', width: 150 }} />
                            <button onClick={addMilestone}
                                style={{ padding: '8px 16px', background: '#84cc16', border: 'none', borderRadius: 6, color: '#0a0a18', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                Add
                            </button>
                        </div>

                        {milestones.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#333', padding: '40px 0', fontSize: 14 }}>No milestones yet.</div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {milestones.map(m => (
                                <div key={m._id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, background: '#13132b',
                                    border: `1px solid ${m.completed ? '#203800' : '#1e1e3a'}`,
                                    borderRadius: 8, padding: '12px 16px',
                                    transition: 'border-color 0.2s'
                                }}>
                                    {/* Circle toggle */}
                                    <div onClick={() => toggleMilestone(m._id)} style={{
                                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                        border: `2px solid ${m.completed ? '#84cc16' : '#333'}`,
                                        background: m.completed ? '#84cc16' : 'transparent',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}>
                                        {m.completed && <span style={{ color: '#0a0a18', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: m.completed ? '#444' : '#ddd', textDecoration: m.completed ? 'line-through' : 'none' }}>
                                            {m.title}
                                        </div>
                                        {m.dueDate && (
                                            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Due: {m.dueDate}</div>
                                        )}
                                    </div>

                                    {m.completed && (
                                        <span style={{ fontSize: 11, color: '#84cc16', fontWeight: 700, whiteSpace: 'nowrap' }}>✓ Done</span>
                                    )}
                                    <DeleteBtn onClick={() => deleteMilestone(m._id)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ════ ACTIVITY LOG ════ */}
                {activeTab === 'activity' && (
                    <div>
                        {activityLog.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#333', padding: '40px 0', fontSize: 14 }}>No activity recorded yet.</div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {[...activityLog].reverse().map((entry, i) => (
                                <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid #111125', alignItems: 'flex-start' }}>
                                    <div style={{ marginTop: 5, flexShrink: 0 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4a9eff' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, color: '#bbb', lineHeight: 1.4 }}>{entry.action}</div>
                                        <div style={{ fontSize: 11, color: '#444', marginTop: 3 }}>
                                            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
