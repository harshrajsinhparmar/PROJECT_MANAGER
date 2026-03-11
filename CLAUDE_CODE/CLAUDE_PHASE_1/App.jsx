import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCreatedProjects, fetchAssignedProjects, fetchNotifications } from "./Redux";

import SignupPage from "./SignupPage";
import LoginPage from "./LoginPage";
import DashBoard from "./DashBoard";
import Projects from "./Projects";
import Details from "./Details";
import GanttView from "./GanttView";
import CalendarView from "./CalendarView";
import EditProfile from "./EditProfile";
import Guards from "./Guards";

function App() {
    const dispatch = useDispatch();
    const currentUser = useSelector(s => s.registration.currentUser);

    useEffect(() => {
        if (currentUser?._id) {
            dispatch(fetchCreatedProjects(currentUser._id));
            dispatch(fetchAssignedProjects(currentUser._id));
            dispatch(fetchNotifications(currentUser._id));
        }
    }, [currentUser?._id]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<Guards><DashBoard /></Guards>} />
                <Route path="/projects" element={<Guards><Projects /></Guards>} />
                <Route path="/projects/:id" element={<Guards><Details /></Guards>} />
                <Route path="/gantt" element={<Guards><GanttView /></Guards>} />
                <Route path="/calendar" element={<Guards><CalendarView /></Guards>} />
                <Route path="/edit-profile" element={<Guards><EditProfile /></Guards>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
