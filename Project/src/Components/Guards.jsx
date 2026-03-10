    import React from "react";
    import { Navigate, Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

    const LoginGuard = () => {
        return localStorage.getItem("CURRENTUSER") ? <Outlet /> : <Navigate to="/login" />;
    }

    const GuestGuard = () => {
        return !localStorage.getItem("CURRENTUSER") ? <Outlet /> : <Navigate to="/projects" />;
    }

    const ProjectGuard = () => {
        const P_id = useParams();
        const allProjects = useSelector((state) => state.registration.Projects);
        const CURRENTUSER_ID = JSON.parse(localStorage.getItem("CURRENTUSER")).map((u) => u.id);
        //current user ni id project id che teena thi match thavi joye
         const matchedProject = allProjects.find((p) => p._id === id);

    if (!matchedProject) {
        return <h1>INVALID URL</h1>;
    }

    return String(matchedProject.user_id) === String(CURRENTUSER_ID)
        ? <Outlet />
        : <h1>Look at your own project</h1>;
    }


    export { LoginGuard, ProjectGuard, GuestGuard };