import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateProjectStatus } from "./Redux";

const COLUMNS = [
    { key: 'backlog',    label: 'Backlog',     color: '#888888', bg: '#111111', border: '#2a2a2a' },
    { key: 'todo',       label: 'To Do',       color: '#4a9eff', bg: '#071828', border: '#0d2540' },
    { key: 'inprogress', label: 'In Progress', color: '#f2aa4d', bg: '#1a1000', border: '#2e1f00' },
    { key: 'inreview',   label: 'In Review',   color: '#a855f7', bg: '#150a2e', border: '#25104a' },
    { key: 'onhold',     label: 'On Hold',     color: '#fb923c', bg: '#1a0c00', border: '#2e1500' },
    { key: 'done',       label: 'Done',        color: '#2dd4bf', bg: '#00201a', border: '#003328' },
    { key: 'complete',   label: 'Complete',    color: '#84cc16', bg: '#0d1800', border: '#162800' },
];

const PRIORITY_DOT = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

export default function KanbanView({ projects }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [draggingId, setDraggingId] = useState(null);
    const [overCol, setOverCol] = useState(null);

    const onDragStart = (e, id) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e, key) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setOverCol(key);
    };

    const onDrop = async (e, key) => {
        e.preventDefault();
        if (!draggingId) return;
        const p = projects.find(x => x._id === draggingId);
        if (p && p.status !== key) {
            dispatch(updateProjectStatus({ id: draggingId, status: key }));
        }
        setDraggingId(null);
        setOverCol(null);
    };

    const onDragEnd = () => {
        setDraggingId(null);
        setOverCol(null);
    };

    return (
        <div style={{ padding: '16px 20px', overflowX: 'auto', minHeight: 'calc(100vh - 120px)' }}>
            <div style={{ display: 'flex', gap: 10, minWidth: 'max-content', alignItems: 'flex-start' }}>
                {COLUMNS.map(col => {
                    const cards = projects.filter(p => p.status === col.key);
                    const isOver = overCol === col.key;

                    return (
                        <div key={col.key}
                            onDragOver={e => onDragOver(e, col.key)}
                            onDrop={e => onDrop(e, col.key)}
                            onDragLeave={() => overCol === col.key && setOverCol(null)}
                            style={{
                                width: 230,
                                minHeight: 520,
                                background: isOver ? col.bg : '#0f0f24',
                                border: `2px solid ${isOver ? col.color : '#1e1e3a'}`,
                                borderRadius: 10,
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'border-color 0.18s, background 0.18s',
                            }}>

                            {/* Column header */}
                            <div style={{ padding: '11px 12px 10px', borderBottom: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: col.color, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {col.label}
                                </span>
                                <span style={{ background: col.bg, color: col.color, border: `1px solid ${col.border}`, borderRadius: 10, padding: '0px 7px', fontSize: 11, fontWeight: 700 }}>
                                    {cards.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                                {cards.map(p => {
                                    const isDragging = draggingId === p._id;
                                    const subtaskTotal = (p.subtasks || []).length;
                                    const subtaskDone = (p.subtasks || []).filter(s => s.completed).length;

                                    return (
                                        <div key={p._id}
                                            draggable
                                            onDragStart={e => onDragStart(e, p._id)}
                                            onDragEnd={onDragEnd}
                                            onClick={() => navigate(`/projects/${p._id}`)}
                                            style={{
                                                background: isDragging ? '#07071a' : '#13132b',
                                                border: '1px solid #1e1e3a',
                                                borderRadius: 8,
                                                padding: 11,
                                                cursor: 'grab',
                                                opacity: isDragging ? 0.45 : 1,
                                                userSelect: 'none',
                                                transition: 'opacity 0.15s, border-color 0.15s',
                                            }}
                                            onMouseEnter={e => { if (!isDragging) e.currentTarget.style.borderColor = col.color + '88'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e3a'; }}>

                                            {/* Priority dot + title */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
                                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_DOT[p.priority] || '#888', flexShrink: 0, marginTop: 4 }} />
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#eee', lineHeight: 1.35 }}>
                                                    {p.Title}
                                                </div>
                                            </div>

                                            {/* Description snippet */}
                                            {p.Description && (
                                                <div style={{ fontSize: 11, color: '#555', marginBottom: 7, lineHeight: 1.45, paddingLeft: 14 }}>
                                                    {p.Description.length > 65 ? p.Description.slice(0, 65) + '…' : p.Description}
                                                </div>
                                            )}

                                            {/* Tags */}
                                            {p.tags?.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 7 }}>
                                                    {p.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} style={{ fontSize: 10, background: '#1a1040', color: '#a78bfa', padding: '1px 6px', borderRadius: 6 }}>#{tag}</span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Subtask progress bar */}
                                            {subtaskTotal > 0 && (
                                                <div style={{ marginBottom: 7 }}>
                                                    <div style={{ height: 3, background: '#1e1e3a', borderRadius: 2 }}>
                                                        <div style={{ height: '100%', width: `${Math.round(subtaskDone / subtaskTotal * 100)}%`, background: col.color, borderRadius: 2, transition: 'width 0.3s' }} />
                                                    </div>
                                                    <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{subtaskDone}/{subtaskTotal} subtasks</div>
                                                </div>
                                            )}

                                            {/* Due date */}
                                            {p.date && (
                                                <div style={{ fontSize: 10, color: '#444' }}>📅 {p.date}</div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Drop zone hint */}
                                {isOver && draggingId && (
                                    <div style={{
                                        border: `2px dashed ${col.color}66`, borderRadius: 8, height: 52,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: col.color, fontSize: 12, opacity: 0.7,
                                    }}>
                                        Drop here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <p style={{ textAlign: 'center', color: '#333', fontSize: 12, marginTop: 14 }}>
                Drag cards between columns to change status — Click any card to open details
            </p>
        </div>
    );
}
