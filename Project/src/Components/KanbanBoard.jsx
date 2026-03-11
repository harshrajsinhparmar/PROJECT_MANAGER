import React from "react";
import { NavLink } from "react-router-dom";
import "./KanbanBoard.css";

const STATUS_OPTIONS = ['backlog', 'todo', 'inprogress', 'inreview', 'onhold', 'done', 'complete'];

const STATUS_LABELS = {
    backlog: 'Backlog',
    todo: 'To Do',
    inprogress: 'In Progress',
    inreview: 'In Review',
    onhold: 'On Hold',
    done: 'Done',
    complete: 'Complete'
};

const STATUS_COLORS = {
    backlog: 'gray',
    todo: '#4a9eff',
    inprogress: '#f2aa4d',
    inreview: '#a855f7',
    onhold: 'orange',
    done: 'teal',
    complete: 'lime'
};

const PRIORITY_COLORS = {
    low: 'lime',
    medium: '#f2aa4d',
    high: 'red'
};

function KanbanBoard({ projects, activeTab, onEdit, onDelete }) {
    return (
        <div className="kanban-wrapper">
            <div className="kanban-board">
                {STATUS_OPTIONS.map(status => {
                    const cards = projects.filter(p => p.status === status);
                    return (
                        <div key={status} className="kanban-column">
                            {/* Column Header */}
                            <div className="kanban-col-header">
                                <span className="kanban-dot" style={{
                                    background: STATUS_COLORS[status]
                                }}></span>
                                <span>{STATUS_LABELS[status]}</span>
                                <span className="kanban-count">{cards.length}</span>
                            </div>

                            {/* Column Body */}
                            <div className="kanban-col-body">
                                {cards.length === 0 && (
                                    <div className="kanban-empty">No tasks</div>
                                )}

                                {cards.map(p => (
                                    <div key={p._id} className="kanban-card">
                                        {/* Title link */}
                                        <NavLink to={`/projects/${p._id}`} className="kanban-card-title">
                                            {p.Title}
                                        </NavLink>

                                        {/* Priority + Sprint badges */}
                                        <div className="kanban-card-badges">
                                            <span style={{
                                                background: PRIORITY_COLORS[p.priority],
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                fontSize: '11px'
                                            }}>
                                                {p.priority}
                                            </span>
                                            <span style={{
                                                border: '1px solid var(--accent-amber)',
                                                padding: '2px 6px',
                                                borderRadius: '10px',
                                                fontSize: '11px'
                                            }}>
                                                S{p.sprint}
                                            </span>
                                        </div>

                                        {/* Tags */}
                                        {p.tags && p.tags.length > 0 && (
                                            <div className="kanban-card-tags">
                                                {p.tags.map((tag, i) => (
                                                    <span key={i} className="kanban-tag">#{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Due date */}
                                        <div className="kanban-card-due">📅 {p.date}</div>

                                        {/* Description preview */}
                                        {p.Description && (
                                            <div className="kanban-card-desc">
                                                {p.Description.length > 60
                                                    ? p.Description.substring(0, 60) + '...'
                                                    : p.Description}
                                            </div>
                                        )}

                                        {/* Action buttons — only on "mine" tab */}
                                        {activeTab === "mine" && (
                                            <div className="kanban-card-actions">
                                                <button
                                                    className="kb-edit-btn"
                                                    onClick={() => onEdit(p)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="kb-del-btn"
                                                    onClick={() => onDelete(p._id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}

                                        {/* Assigned tab info */}
                                        {activeTab === "assigned" && (
                                            <div className="kanban-card-assigned">
                                                Assigned by: {p.createdBy}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default KanbanBoard;