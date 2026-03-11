import React, { useState } from "react"
import "./LoginPage.css"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux";
import { updateProfile, deleteProfile } from "./Redux";

function EditProfile() {
    const CURRENT_USER = JSON.parse(localStorage.getItem("CURRENTUSER"));
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [Email, setEmail] = useState(CURRENT_USER[0].email);
    const [Password, setPassword] = useState(CURRENT_USER[0].password);

    const delete_profile = async (e) => {
        e.preventDefault();
        const result = await dispatch(deleteProfile(CURRENT_USER[0]._id));
        if (deleteProfile.fulfilled.match(result)) {
            alert("Account deleted.");
            navigate("/");
        } else {
            alert("Failed to delete account.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(updateProfile({
            id: CURRENT_USER[0]._id,
            updatedData: { email: Email, password: Password }
        }));
        if (updateProfile.fulfilled.match(result)) {
            alert("Profile updated.");
            navigate("/projects");
        } else {
            alert("Failed to update profile.");
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            <div className="edit_profile" style={{ padding: '10px' }}>
                <div style={{ maxWidth: '360px', padding: '40px', margin: '20px auto', border: '2px solid #4a5568' }}>
                    <h1>Edit Profile</h1>
                    <p style={{ color: 'gray', fontSize: '13px' }}>
                        Role: <strong>{CURRENT_USER[0].role}</strong>
                    </p>
                    <form>
                        <label>Email</label>
                        <input
                            type="email"
                            defaultValue={CURRENT_USER[0].email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Password</label>
                        <input
                            type="password"
                            defaultValue={CURRENT_USER[0].password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div style={{ display: "flex", justifyContent: "center", gap: '20px', margin: '10px 0px' }}>
                            <button onClick={handleSubmit} style={{ background: 'lime', color: 'white' }}>SAVE</button>
                            <button style={{ background: 'red', color: 'white' }} onClick={delete_profile}>Delete Account</button>
                            <button style={{ border: '1px solid var(--accent-amber)' }} onClick={() => navigate("/projects")}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
