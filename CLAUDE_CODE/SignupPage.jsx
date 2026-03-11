import React, { useState } from "react"
import "./SignupPage.css"
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signupUser } from "./Redux";

function SignupPage() {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [Role, setRole] = useState("member");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(signupUser({ email: Email, password: Password, role: Role }));
        if (signupUser.fulfilled.match(result)) {
            alert("Account created!");
            navigate("/login");
        } else {
            alert(result.payload || "Signup failed");
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            <div className="signup_form">
                <h1>Signup Page</h1>
                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <label>Role</label>
                    <select value={Role} onChange={(e) => setRole(e.target.value)}>
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                    </select>

                    <p>Already signed up? <Link to="/login">Login Here</Link></p>
                    <button type="submit" style={{ border: '1px solid var(--accent-amber)' }}>
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignupPage;
