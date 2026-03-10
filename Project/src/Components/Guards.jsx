    import React from "react";
    import { Navigate, Outlet, useParams } from "react-router-dom";

    const LoginGuard = () => {
        return localStorage.getItem("CURRENTUSER") ? <Outlet /> : <Navigate to="/login" />;
    }

    const GuestGuard = () => {
        return !localStorage.getItem("CURRENTUSER") ? <Outlet /> : <Navigate to="/projects" />;
    }

    const ProjectGuard = () => {
        const P_id = useParams();
        const PROJECT_W_ID = JSON.parse(localStorage.getItem("Projects")).filter((p) => p.id == P_id.id.replace(':', ""));
        const CURRENTUSER_ID = JSON.parse(localStorage.getItem("CURRENTUSER")).map((u) => u.id);
        //current user ni id project id che teena thi match thavi joye
        if (PROJECT_W_ID.length != 0) {
            return CURRENTUSER_ID == PROJECT_W_ID[0].user_id ? <Outlet /> : <><h1>Look at you own project</h1></>;
        }
        else {

            return <h1> INVALID URL</h1>

        }
    }


    export { LoginGuard, ProjectGuard, GuestGuard };