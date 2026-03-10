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

// Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ DB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

// --- ROUTES ---

// 1. GET all projects for a specific user
app.get('/api/projects/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ user_id: req.params.userId });
        res.json(projects);
    } catch (err) { res.status(500).json(err); }
});

// 2. ADD a new project
app.post('/api/projects', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const saved = await newProject.save();
        res.status(201).json(saved);
    } catch (err) { res.status(500).json(err); }
});

// 3. DELETE a project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json(err); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));