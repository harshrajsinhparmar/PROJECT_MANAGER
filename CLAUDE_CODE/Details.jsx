import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Details.css";

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

function Details() {
    const { id } = useParams();
    const navigate = useNavigate();

    const createdProjects = useSelector((state) => state.registration.createdProjects);
    const assignedProjects = useSelector((state) => state.registration.assignedProjects);
    const allProjects = [...createdProjects, ...assignedProjects];

    const project = allProjects.find((p) => p._id === id);

    if (!project) {
        return (
            <div className="details-container">
                <h1>Project Not Found</h1>
                <button onClick={() => navigate("/projects")}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="details-wrapper">
            <button className="back-link" onClick={() => navigate("/projects")}>
                ← Back to Projects
            </button>

            <div className="details-card">

                {/* Status + Priority badges */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
                    <span style={{
                        background: STATUS_COLORS[project.status] || 'gray',
                        color: 'white',
                        padding: '4px 14px',
                        borderRadius: '12px'
                    }}>
                        {project.status}
                    </span>
                    <span style={{
                        background: PRIORITY_COLORS[project.priority] || 'gray',
                        color: 'white',
                        padding: '4px 14px',
                        borderRadius: '12px'
                    }}>
                        {project.priority} priority
                    </span>
                    <span style={{
                        border: '1px solid var(--accent-amber)',
                        padding: '4px 14px',
                        borderRadius: '12px'
                    }}>
                        Sprint {project.sprint}
                    </span>
                </div>

                {/* Core info */}
                <h2>{project.Title}</h2>
                <p><strong>Description:</strong> {project.Description}</p>
                <p><strong>Due Date:</strong> {project.date}</p>
                <p><strong>Start Date:</strong> {project.startDate}</p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <div style={{ margin: '10px 0' }}>
                        <strong>Tags: </strong>
                        {project.tags.map((tag, i) => (
                            <span key={i} style={{
                                background: '#4a5568',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                marginLeft: '4px'
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Activity Log */}
                {project.activityLog && project.activityLog.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Activity Log</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {project.activityLog.map((log, i) => (
                                <li key={i} style={{
                                    borderLeft: '3px solid var(--accent-amber)',
                                    paddingLeft: '10px',
                                    marginBottom: '6px',
                                    fontSize: '13px'
                                }}>
                                    {log.action} — <span style={{ color: 'gray' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Details;
