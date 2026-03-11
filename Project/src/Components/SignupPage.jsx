import React, { useState } from "react"
import "./SignupPage.css"
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, } from "react-redux";
import { signupUser } from "./Redux";
function SignupPage() {
    const dispatch = useDispatch();
    const [Email, setEmail] = useState();
    const [Password, setPassword] = useState();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(signupUser({ email: Email, password: Password }));
        if (signupUser.fulfilled.match(result)) {
            alert("USER SAVED");
            navigate("/login");
        } else {
            alert(result.payload);
            console.log(result.payload); // shows "Email already exists" from server
        }
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
