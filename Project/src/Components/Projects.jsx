import React, { useEffect,useState } from "react"
import { useDispatch, useSelector } from "react-redux";
// NEW LINE
import { addProjectDb, deleteProjectDb, editProjectDb, toggleTheme, fetchProjects } from "./Redux";
import { createPortal } from "react-dom";
import './Projects.css'
import { Navigate, NavLink, useNavigate } from "react-router-dom";
function Projects() {

    const navigate = useNavigate();
    

    const [Title, setTitle] = useState();
    const [Description, setDesc] = useState()
    const [Status, setStatus] = useState("active")
    const [Due_Date, setDate] = useState()

    const CURRENTUSER_ID = JSON.parse(localStorage.getItem("CURRENTUSER"))[0].id;

    useEffect(() => {
        dispatch(fetchProjects(CURRENTUSER_ID));
    }, []);



    const C_USER_PROJECTS = useSelector((state) =>
        state.registration.Projects.filter((p) => p.user_id == CURRENTUSER_ID)
    );





    const CURRENT_USER = JSON.parse(localStorage.getItem("CURRENTUSER"));
    // console.log("CU", CURRENT_USER);
    const USER_PROJECTS = localStorage.getItem("Projects") == null ? [] : JSON.parse(localStorage.getItem("Projects")).filter((p) => p.user_id == CURRENT_USER[0].id);
    // console.log("UP", USER_PROJECTS);
    const dispatch = useDispatch();

    const [Search, setSearch] = useState("");
    const [Search_Status, setSearch_Status] = useState("all");


        const Filtered_Projects = C_USER_PROJECTS
        .filter((p) => p.Title.toLocaleLowerCase().includes(Search.toLocaleLowerCase().trim()))
        .filter((p) => Search_Status === "all" ? true : p.status === Search_Status);
     
        console.log("FP", Filtered_Projects);
    
        const add_Project = (e) => {
        e.preventDefault();
        const data = {
            Title,
            Description,
            status: Status,
            date: Due_Date,
            user_id: CURRENTUSER_ID,
            startDate: new Date().toISOString().substring(0, 10)
        };
        dispatch(addProjectDb(data));
    };



    const [EditId, setEditId] = useState(0);
    // console.log("EID", EditId, "");
    console.log("CURRENT USER PROJECTS", C_USER_PROJECTS.filter((p) => p.id == EditId));
    const [Title_2, setEditTitle] = useState();
    const [Description_2, setEditDesc] = useState()
    const [Status_2, setEditStatus] = useState()
    const [Due_Date_2, setEditDate] = useState()

    const startEditing = (p) => {
        setEditDate(p.date);
        setEditDesc(p.Description);
        setEditStatus(p.status);
        setEditId(p._id);
        setEditTitle(p.Title);

    }

    const edit_Project = (e) => {
        e.preventDefault();
        console.log("EDIT _PROJECT TEST");
        dispatch(editProjectDb({
            id: EditId,
           updatedData: {
                Title: Title_2,
                Description: Description_2,
                status: Status_2,
                date: Due_Date_2,
                user_id: CURRENTUSER_ID,
            }
        }));
        setEditId(null);
    }

    const [deleteId, setdeleteId] = useState(0);


    const logout = () => {
        localStorage.removeItem("CURRENTUSER")
        window.location.reload();
    }

    return (
        <>  <h1>WELCOME {CURRENT_USER[0].id}</h1>
        {deleteId && createPortal(<div className="modal-overlay">
            <div className="modal-form">
                <h1> Are You Sure?</h1>
                <p> You want to Delete This Project?</p>
                <div style={{ display: "flex", justifyContent: "center", gap: '20px', margin: '10px 0px' }}>
                    <button style={{ background: 'red', color: 'white' }} onClick={() => {
                        dispatch(deleteProjectDb(deleteId));
                        setdeleteId(null);
                    }}>Yes</button>
                    <button onClick={() => setdeleteId(0)} style={{ border: '1px solid var(--accent-amber)' }}> Not Sure </button>
                </div>
            </div>

        </div>
            , document.getElementById("modal-root"))
        }
            <div className="PROJECTS">
                <div style={{ display: 'flex ', gap: '20px', maxHeight: '380px' }}>
                    <div className="projects-btns" >
                        <button className="logout-btn" onClick={() => navigate("/dashboard")}>DASHBOARD</button >
                        <button className="logout-btn" onClick={() => navigate("/profile")}>Edit Profile</button>
                        <button className="logout-btn" onClick={logout}>LOGOUT</button>
                        <button className="toggle-btn" onClick={() => dispatch(toggleTheme())} style={{ padding: '10px' }}>{useSelector((state) => state.registration.mode) === "dark" ? "Current: Dark Mode " : "Current:Light Mode"}</button>
                    </div>
                    <div className="project-form" >
                        <form onSubmit={add_Project}>
                            <label>Title</label>
                            <input type="text" onChange={(e) => setTitle(e.target.value)} required />
                            <label>Description</label>
                            <textarea onChange={(e) => setDesc(e.target.value)}></textarea>
                            <select onChange={(e) => setStatus(e.target.value)} required>
                                <option value={"active"}>Active</option>
                                <option value={"completed"}>Completed</option>
                                <option value={"hold"}>On Hold</option>
                            </select>
                            <input type="date" onChange={(e) => setDate(e.target.value)} required />
                            <button type="submit" style={{ border: '1px solid var(--accent-amber)' }}>  ADD+ </button>
                        </form>
                    </div >
                </div>

                <div style={{ maxWidth: '800px' }}>
                    <div className="Search-Bar">
                        <input style={{ width: '70% ' }} placeholder="Search title here" onChange={(e) => setSearch(e.target.value)} />
                        <select style={{ textAlign: 'center' }} onChange={(e) => setSearch_Status(e.target.value)} required>
                            <option value={"all"}>All</option>
                            <option value={"active"}>Active</option>
                            <option value={"completed"}>Completed</option>
                            <option value={"hold"}>On Hold</option>
                        </select>
                    </div>
                    <div className="user-projects">
                        <div >
                            <ol> Click on the Project to reoute to see DESCRIPTION
                                <div style={{ borderLeft: '6px solid #f2aa4d', borderRadius: '5px' }}>

                                    <p ><b >Title<br />
                                        Due Date-Status</b></p></div>
                                {Filtered_Projects.length == 0 && (<div>No projects found</div>)}
                                {
                                    Filtered_Projects.map(
                                        (p, i) => EditId != p.id ?
                                            <li key={i}  >
                                                <NavLink to={`/projects/:${p.id}`} >{p.Title}<br />{p.date}-{p.status}</NavLink>
                                                <div style={{ display: "flex", gap: "10px" }}>

                                                    <button style={{ border: '1px solid var(--accent-amber)' }} onClick={() => startEditing(p)}>Edit</button>
                                                    <button style={{ background: 'red', color: 'white' }} onClick={() => setdeleteId(p.id)}>Delete</button>
                                                </div>
                                            </li>

                                            : <div key={i} className="edit-form" >
                                                <form>
                                                    <label>Title</label>
                                                    <input type="text" defaultValue={p.Title} onChange={(e) => setEditTitle(e.target.value)} required />
                                                    <label>Description</label>
                                                    <textarea defaultValue={p.Description} onChange={(e) => setEditDesc(e.target.value)}></textarea>
                                                    <select defaultValue={p.status} onChange={(e) => setEditStatus(e.target.value)} required>
                                                        <option value={"active"}>Active</option>
                                                        <option value={"completed"}>Completed</option>
                                                        <option value={"hold"}>On Hold</option>
                                                    </select>
                                                    <input type="date" defaultValue={p.date} onChange={(e) => setEditDate(e.target.value)} required />
                                                    <div style={{ display: "flex", justifyContent: "center", gap: '20px', margin: '10px 0px' }}>
                                                        <button style={{ background: 'lime', color: 'white' }} type="submit" onClick={edit_Project}> SAVE </button>
                                                        <button style={{ border: '1px solid var(--accent-amber)' }} onClick={() => { setEditId(0); }}> Cancel </button>
                                                    </div>
                                                </form>
                                            </div >)
                                }

                            </ol>
                        </div >
                    </div ></div >
            </div >

        </>
    )
}


export default Projects
