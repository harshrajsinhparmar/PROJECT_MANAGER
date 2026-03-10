import React, { useState } from "react"
import "./SignupPage.css"
import { Link, UNSAFE_withComponentProps, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function SignupPage() {

    const [Email, setEmail] = useState();
    const [Password, setPassword] = useState();
    const navigate = useNavigate();
    const [users, setUsers] = useState(JSON.parse(localStorage.getItem('users')) || []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
        const alreadyExists = existingUsers.some(u => u.email === Email);

        if (alreadyExists) {
            alert("EMAIL ALRERADY EXIST");
            return
        }
        const newUser = { email: Email, password: Password, id: Date.now() };
        const updatedUsers = [...existingUsers, newUser];
        localStorage.setItem("users", JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        alert("USER SAVED");
        navigate("/login");
        };
    

    return (
    <div style={{ padding: '10px' }}>
        <div className="signup_form" >
            <h1>Signup Page</h1>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input type="email" onChange={(e) => setEmail(e.target.value)} required />

                <label>Password</label>
                <input type="password" onChange={(e) => setPassword(e.target.value)} required />
                <p>Already signed up ?<Link to="/login">Login Here</Link></p>
                <button type="submit" style={{ border: '1px solid var(--accent-amber)' }} >Submit</button>
            </form>
        </div >
    </div>
    )
}

export default SignupPage;
