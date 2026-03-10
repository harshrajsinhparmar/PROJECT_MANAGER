import React, { useState } from "react"
import "./LoginPage.css"
import { Link, useNavigate, useParams } from "react-router-dom"
function LoginPage() {

    const [Email, setEmail] = useState();
    const [Password, setPassword] = useState();
    const navigate = useNavigate();
    const [user, setuser] = useState(JSON.parse(localStorage.getItem('users')) || []);

    function handleSubmit(e) {
        e.preventDefault();
        const USER = JSON.parse(localStorage.getItem("users")).filter((u) => u.email == Email);

        console.log(USER)
        if (USER.length != 0) {
            if (USER.filter((u) => u.password == Password).length != 0) {
                localStorage.setItem("CURRENTUSER", JSON.stringify([...USER]));
                alert("LOGGING IN");
                navigate("/projects");
            }
            else {
                alert("Wrong Password");
            }
        }
        else {
            alert("Wrong Email");
        }
        //const CURRENT_USER = JSON.parse(localStorage.getItem("CURRENTUSER"));

    }

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
