import React from "react";
import { useSelector } from "react-redux";
import "./GanttView.css";
function GanttView() {


    const CURRENTUSER_ID = JSON.parse(localStorage.getItem("CURRENTUSER"))[0]._id;
    const AllPriojects = useSelector((state) => state.registration.Projects);
    const User_Projects = AllPriojects.filter((p) => p.user_id == CURRENTUSER_ID);

    console.log("USER_PROJECTS", User_Projects);

    const current_Date = new Date();
    const daysInMonth = new Date(current_Date.getFullYear(), current_Date.getMonth() + 1, 0).getDate();

    return (
        <>

            <div className="gantt-wrapper">
                <h2>Gantt Chart of Current Month</h2>
                <div className="gantt-grid">
                    <div className="gantt-days">
                        {
                            Array.from({ length: daysInMonth }, (_, i) => (
                                <div key={i} style={{ borderLeft: '1px solid white' }}>{i + 1}</div>
                            ))
                        }
                    </div >
                    <div>
                        {User_Projects.map((p) => {
                            const StartDate = new Date(p.startDate || p.createdAt);
                            const Due_Date = new Date(p.date);


                            const endsBeforeMonth =
                                Due_Date.getFullYear() < current_Date.getFullYear() ||
                                (Due_Date.getFullYear() === current_Date.getFullYear() &&
                                    Due_Date.getMonth() < current_Date.getMonth());

                            const startsAfterMonth =
                                StartDate.getFullYear() > current_Date.getFullYear() ||
                                (StartDate.getFullYear() === current_Date.getFullYear() &&
                                    StartDate.getMonth() > current_Date.getMonth());

                            if (endsBeforeMonth || startsAfterMonth) return null;

                            let Start = 1;
                            if (StartDate.getMonth() === current_Date.getMonth() && StartDate.getFullYear() === current_Date.getFullYear()) {
                                Start = StartDate.getDate();
                            }

                            //const daysInMonth = new Date(current_Date.getFullYear(), current_Date.getMonth() + 1, 0).getDate();
                            let End = daysInMonth;
                            if (Due_Date.getMonth() === current_Date.getMonth() && Due_Date.getFullYear() === current_Date.getFullYear()) {
                                End = Due_Date.getDate();
                            }

                            const duration = Math.max(1, End - Start + 1);
                            return (
                                <div key={p._id} className="gantt-row">
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