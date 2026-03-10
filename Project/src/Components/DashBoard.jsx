import React from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";
import "./DashBoard.css"
import GanttView from "./GanttView";
function DashBoard() {
    const CURRENTUSER_ID = JSON.parse(localStorage.getItem("CURRENTUSER"))[0].id;
    const Dashboard = useSelector((state) => state.registration.Projects.filter((p) => p.user_id == CURRENTUSER_ID));

    const Active_Projects = Dashboard.filter((p) => p.status == "active");
    const Completed_Projects = Dashboard.filter((p) => p.status == "completed");
    const Overdue_Projects = Dashboard.filter((p) => p.date < new Date(Date.now()).toISOString().substring(0, 10));

    const navigate = useNavigate();
    return (
        <div className="dashboard-wrapper">
            <div>            <h1 style={{ color: '#f2aa4d' }}>DASHBOARD VIEW</h1>
                <div className="stat-card">

                    <h2 >Total Projects :  {Dashboard.length}</h2>


                    <h2 > active projects: {Active_Projects.length}</h2>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ background: 'cyan', width: `${(Active_Projects.length / Dashboard.length) * 100}%` }}></div>
                    </div>

                    <h2  > completed projects: {Completed_Projects.length}</h2>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ background: 'lime', width: `${(Completed_Projects.length / Dashboard.length) * 100}%` }}></div>
                    </div>

                    <h2  ><i style={{ color: 'red' }}> overdue projects : </i>{Overdue_Projects.length}</h2>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ background: 'red', width: `${(Overdue_Projects.length / Dashboard.length) * 100}%` }}></div>
                    </div>
                </div >
                <button className="back-btn" onClick={() => navigate("/projects")}>View All Projects</button>
            </div>
            <div><GanttView /> </div >

        </div >
    )
}

export default DashBoard
