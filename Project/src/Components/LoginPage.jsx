import React, { useState } from "react"
import "./LoginPage.css"
import { Link, useNavigate, useParams } from "react-router-dom"
import { loginUser } from "./Redux";
import { useDispatch } from "react-redux";
function LoginPage() {
    const dispatch = useDispatch();
    const [Email, setEmail] = useState();
    const [Password, setPassword] = useState();
    const navigate = useNavigate();
    const [user, setuser] = useState(JSON.parse(localStorage.getItem('users')) || []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(loginUser({ email: Email, password: Password }));
        if (loginUser.fulfilled.match(result)) {
            navigate("/projects");
        } else {
            alert(result.payload);
            console.log(result.payload); // "Email not found" or "Wrong password"
        }
    };

    return (<div style={{ padding: '10px' }}>
        <div className="login_page">
            <h1>Login Page</h1>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input type="email" onChange={(e) => setEmail(e.target.value)} required />

                <label>Password</label>
                <input type="password" onChange={(e) => setPassword(e.target.value)} required />
                <p>No account ?<Link to="/">Signup Here</Link></p>
                <button type="submit" style={{ border: '1px solid var(--accent-amber)' }} >Submit</button>
            </form>
        </div ></div>
    )
}

export default LoginPage
