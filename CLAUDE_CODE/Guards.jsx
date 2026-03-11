import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const LoginGuard = () => {
    return localStorage.getItem("CURRENTUSER") ? <Outlet /> : <Navigate to="/login" />;
};

const GuestGuard = () => {
    return !localStorage.getItem("CURRENTUSER") ? <Outlet /> : <Navigate to="/projects" />;
};

const ProjectGuard = () => {
    const { id } = useParams();
    const CURRENTUSER_ID = JSON.parse(localStorage.getItem("CURRENTUSER"))[0]._id;

    // Check both created and assigned projects
    const createdProjects = useSelector((state) => state.registration.createdProjects);
    const assignedProjects = useSelector((state) => state.registration.assignedProjects);
    const allProjects = [...createdProjects, ...assignedProjects];

    const matchedProject = allProjects.find((p) => p._id === id);

    if (!matchedProject) {
        return <h1>INVALID URL</h1>;
    }

    // Allow access if user created it OR is assigned to it
    const isCreator = String(matchedProject.createdBy) === String(CURRENTUSER_ID);
    const isAssignee = matchedProject.assignedTo?.some(uid => String(uid) === String(CURRENTUSER_ID));

    return (isCreator || isAssignee) ? <Outlet /> : <h1>Look at your own project</h1>;
};

export { LoginGuard, ProjectGuard, GuestGuard };
