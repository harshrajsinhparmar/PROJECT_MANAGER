import React from "react";
import { useSelector } from "react-redux";
import "./GanttView.css";
function GanttView() {
    const CURRENTUSER_ID = JSON.parse(localStorage.getItem("CURRENTUSER"))[0].id;
    const AllPriojects = useSelector((state) => state.registration.Projects);
    const User_Projects = AllPriojects.filter((p) => p.user_id == CURRENTUSER_ID);
    console.log("USER_PROJECTS", User_Projects);
    const Today = new Date(Date.now())
    return (
        <>

            <div className="gantt-wrapper">
                <h2>Gantt Chart of Current Month</h2>
                <div className="gantt-grid">
                    <div className="gantt-days">
                        {
                            Array.from({ length: 31 }, (_, i) => (
                                <div key={i} style={{ borderLeft: '1px solid white' }}>{i + 1}</div>
                            ))
                        }
                    </div >
                    <div>
                        {User_Projects.map((p) => {
                             const StartDate = new Date(p.startDate || p.createdAt);
                            const Due_Date = new Date(p.date);
                            const current_Date = new Date(Date.now());

                            const endsBeforeMonth = Due_Date.getMonth() < current_Date.getMonth() && Due_Date.getFullYear() <= current_Date.getFullYear()
                            const startsAfterMonth = StartDate.getMonth() > current_Date.getMonth() && StartDate.getFullYear() > current_Date.getFullYear()

                            if (endsBeforeMonth || startsAfterMonth) return null;

                            let Start = 1;
                            if (StartDate.getMonth() === current_Date.getMonth() && StartDate.getFullYear() === current_Date.getFullYear()) {
                                Start = StartDate.getDate();
                            }

                            let End = 31;
                            if (Due_Date.getMonth() === current_Date.getMonth() && Due_Date.getFullYear() === current_Date.getFullYear()) {
                                End = Due_Date.getDate();
                            }

                            const duration = Math.max(1, End - Start + 1);
                            return (
                                <div key={p.id} className="gantt-row">
                                    <div className="gantt-label">{p.Title}</div>
                                    <div className="gantt-bar-container">
                                        <div className={`gantt-bar ${p.status}`} style={{
                                            gridColumnStart: Start,
                                            gridColumnEnd: `span ${duration}`
                                        }}> {p.status}
                                        </div>

                                    </div>
                                </div>);
                        })}
                    </div>
                </div>
            </div>
        </>)
}

export default GanttView;