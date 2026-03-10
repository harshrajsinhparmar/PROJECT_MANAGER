import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Details.css";

function Details() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Clean the ID and find the project
    const cleanId = id.replace(':', "");
    const projects = JSON.parse(localStorage.getItem("Projects")) || [];
    const project = projects.find((p) => p.id == cleanId);

    // Safety Check: If project doesn't exist
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
                <div style={{
                    display: 'flex',
                    justifyContent: 'center'
                }}

                >
                    <span style={{ maxWidth: '100px' }} className={`status-badge ${project.status}`}>
                        {project.status}
                    </span></div>
                <p>Description:</p><h2>{project.Description}</h2>
                <span style={{ display: "flex", gap: '20px' }}>
                    <p >ID: {cleanId}</p>
                    <p>Title: {project.Title}</p>
                    <p><strong>Due Date:</strong> {project.date}</p>
                </span>
            </div>
        </div >
    );
}

export default Details;