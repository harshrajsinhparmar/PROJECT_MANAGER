import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom";
import { fetchCreatedProjects, fetchAssignedProjects } from "./Redux";
import "./DashBoard.css"
import GanttView from "./GanttView";

const STATUS_COLORS = {
    backlog: 'gray',
    todo: '#4a9eff',
    inprogress: '#f2aa4d',
    inreview: '#a855f7',
    onhold: 'orange',
    done: 'teal',
    complete: 'lime'
};

function DashBoard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const CURRENTUSER_ID = JSON.parse(localStorage.getItem("CURRENTUSER"))[0]._id;

    useEffect(() => {
        dispatch(fetchCreatedProjects(CURRENTUSER_ID));
        dispatch(fetchAssignedProjects(CURRENTUSER_ID));
    }, []);

    const createdProjects = useSelector((state) => state.registration.createdProjects);
    const assignedProjects = useSelector((state) => state.registration.assignedProjects);
    const notifications = useSelector((state) => state.registration.notifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const today = new Date().toISOString().substring(0, 10);

    // Stats for created projects
    const total = createdProjects.length;
    const active = createdProjects.filter(p => p.status === 'inprogress').length;
    const completed = createdProjects.filter(p => p.status === 'complete').length;
    const overdue = createdProjects.filter(p => p.date < today && p.status !== 'complete' && p.status !== 'done').length;
    const inReview = createdProjects.filter(p => p.status === 'inreview').length;

    const pct = (count) => total ? `${Math.round((count / total) * 100)}%` : '0%';

    return (
        <div className="dashboard-wrapper">
            <div>
                <h1 style={{ color: '#f2aa4d' }}>DASHBOARD VIEW</h1>

                {/* Notification banner */}
                {unreadCount > 0 && (
                    <div style={{
                        background: '#a855f7',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        marginBottom: '16px'
                    }}>
                        🔔 You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                    </div>
                )}

                <div className="stat-card">
                    <h2>Total Projects: {total}</h2>

                    <h2>In Progress: {active}</h2>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ background: STATUS_COLORS.inprogress, width: pct(active) }}></div>
                    </div>

                    <h2>In Review: {inReview}</h2>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ background: STATUS_COLORS.inreview, width: pct(inReview) }}></div>
                    </div>

                    <h2>Completed: {completed}</h2>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ background: STATUS_COLORS.complete, width: pct(completed) }}></div>
                    </div>

                    <h2><i style={{ color: 'red' }}>Overdue:</i> {overdue}</h2>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ background: 'red', width: pct(overdue) }}></div>
                    </div>

                    <h2>Assigned to Me: {assignedProjects.length}</h2>
                </div>

                <button className="back-btn" onClick={() => navigate("/projects")}>View All Projects</button>
            </div>
            <div><GanttView /></div>
        </div>
    );
}

export default DashBoard;
