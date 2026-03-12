const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// DELETE the cached model before re-registering
mongoose.deleteModel(/.*Project.*/);
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
        const { email, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already exists" });
        const newUser = new User({ email, password, role });
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
            { returnDocument: 'after' }
        );
        res.json(updated);
    } catch (err) { res.status(500).json(err); }
});

// DELETE profile
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Project.deleteMany({ createdBy: req.params.id });
        res.json({ message: "User and their projects deleted" });
    } catch (err) {
        console.error("DELETE PROFILE ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '_id email role');
        res.json(users);
    } catch (err) {
        console.error("GET USERS ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/users/search', async (req, res) => {
    try {
        const { q } = req.query;
        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('_id name email role');
        res.json(users);
    } catch (err) {
        console.error("SEARCH USER ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});



// GET NOTIFICATIONS for a user
app.get('/api/users/:id/notifications', async (req, res) => {
    try {
        const user = await User.findById(req.params.id, 'notifications');
        res.json(user.notifications);
    } catch (err) {
        console.error("GET NOTIFICATIONS ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/users/:id/notifications/read', async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.params.id },
            { $set: { 'notifications.$[].read': true } }  // $[] = all array elements
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- PROJECT ROUTES ---

// 1. GET all projects for a specific user
app.get('/api/projects/created/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ createdBy: req.params.userId });
        res.json(projects);
    } catch (err) {
        console.error("GET PROJECt ERROR:", err.message);   // ADD THIS
        res.status(500).json({ message: err.message });
    }
});


// Get projects assigned to user
app.get('/api/projects/assigned/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ assignedTo: req.params.userId });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. ADD a new project
app.post('/api/projects', async (req, res) => {
    try {
        console.log("ADD PROJECT BODY:", req.body);
        const newProject = new Project({
            ...req.body,
            activityLog: [{ action: `Project created`, timestamp: new Date() }]
        });
        const saved = await newProject.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("ADD PROJECT ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// EDIT a project — logs activity + notifies on status change
app.put('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const logEntry = { action: `Project updated`, timestamp: new Date() };

        // If status changed, log it and notify creator
        if (req.body.status && req.body.status !== project.status) {
            logEntry.action = `Status changed from "${project.status}" to "${req.body.status}"`;

            if (project.assignedTo.length > 0) {
                await User.updateOne(
                    { _id: project.createdBy },
                    {
                        $push: {
                            notifications: {
                                message: `Status of "${project.Title}" changed to "${req.body.status}"`,
                                projectId: project._id,
                                read: false,
                                createdAt: new Date()
                            }
                        }
                    }
                );
            }
        }

        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    Title: req.body.Title,
                    Description: req.body.Description,
                    status: req.body.status,
                    priority: req.body.priority,
                    tags: req.body.tags,
                    sprint: req.body.sprint,
                    date: req.body.date,
                },
                $push: { activityLog: logEntry }
            },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        console.error("EDIT PROJECT ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// DELETE a project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Project deleted" });
    } catch (err) {
        console.error("DELETE PROJECT ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// ASSIGN a project to a user
app.put('/api/projects/:id/assign', async (req, res) => {
    try {
        const { assignToUserId } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (!project.assignedTo.includes(assignToUserId)) {
            project.assignedTo.push(assignToUserId);
            project.activityLog.push({
                action: `Project assigned to user ${assignToUserId}`,
                timestamp: new Date()
            });
            await project.save();
        }

        // Notify the assigned user
        await User.updateOne(
            { _id: assignToUserId },
            {
                $push: {
                    notifications: {
                        message: `You have been assigned to project "${project.Title}"`,
                        projectId: project._id,
                        read: false,
                        createdAt: new Date()
                    }
                }
            }
        );

        res.json(project);
    } catch (err) {
        console.error("ASSIGN PROJECT ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});


// REMOVE an assignee from a project
app.delete('/api/projects/:id/assign/:userId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        project.assignedTo = project.assignedTo.filter(
            uid => String(uid) !== String(req.params.userId)
        );
        project.activityLog.push({
            action: `User removed from project`,
            timestamp: new Date()
        });
        await project.save();

        res.json(project);
    } catch (err) {
        console.error("REMOVE ASSIGNEE ERROR:", err.message);
        res.status(500).json({ message: err.message });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
