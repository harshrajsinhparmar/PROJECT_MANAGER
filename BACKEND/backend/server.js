const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Models
const Project = require('./models/Projects.js');
const User = require('./models/User.js');
// Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ DB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

// --- USER ROUTES ---

// SIGNUP - create new user
app.post('/api/users/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already exists" });
        const newUser = new User({ email, password });
        const saved = await newUser.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("SIGNUP ERROR:", err.message);  // ADD THIS
        res.status(500).json({ message: err.message });
    }
});

// LOGIN - find user by email+password
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found" });
        if (user.password !== password) return res.status(401).json({ message: "Wrong password" });
        res.json(user);
    } catch (err) {
        console.error("LOGIN ERROR:", err.message);   // ADD THIS
        res.status(500).json({ message: err.message });
    }
});

// UPDATE profile
app.put('/api/users/:id', async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) { res.status(500).json(err); }
});

// DELETE profile
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Also delete all their projects
        await Project.deleteMany({ user_id: req.params.id });
        res.json({ message: "User and projects deleted" });
    } catch (err) { res.status(500).json(err); }
});

// --- PROJECT ROUTES ---

// 1. GET all projects for a specific user
app.get('/api/projects/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ user_id: req.params.userId });
        res.json(projects);
    } catch (err) {
        console.error("GET PROJECt ERROR:", err.message);   // ADD THIS
        res.status(500).json({ message: err.message });
    }
});

// 2. ADD a new project
app.post('/api/projects', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const saved = await newProject.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("POST PROJECt ERROR:", err.message);   // ADD THIS
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // return the updated document
        );
        res.json(updated);
    } catch (err) {
        console.error("PUT PROJECt ERROR:", err.message);   // ADD THIS
        res.status(500).json({ message: err.message });
    }
});


// 3. DELETE a project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        console.error("DELEsTE PROJECt ERROR:", err.message);   // ADD THIS
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));