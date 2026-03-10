import React, { useState } from "react"
import "./SignupPage.css"
import { Link, UNSAFE_withComponentProps, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function SignupPage() {

    const [Email, setEmail] = useState();
    const [Password, setPassword] = useState();
    const navigate = useNavigate();
    const [user, setuser] = useState(JSON.parse(localStorage.getItem('users')) || []);
    const Exist = useSelector((state) => state.registration.users).filter(p => p.email == Email).length;
    console.log(useSelector((state) => state.registration.users).filter(p => p.email == Email).length != 0);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (Exist != 0) {
            alert("EMAIL ALRERADY EXIST");
            return
        }
        else {
            localStorage.setItem("users", JSON.stringify([...user, { email: Email, password: Password, id: Date.now() }]));
            console.log("CURRENT", user);
            alert("USER SAVED");
            navigate("/login");
        }
    }

    return (<div style={{ padding: '10px' }}>
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

export default SignupPage
