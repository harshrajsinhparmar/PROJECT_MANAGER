const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB Connect ───────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ DB Connected'))
    .catch(err => console.error('DB Error:', err));

// ─── Models ───────────────────────────────────────────────────────────────────
const User = require('./models/User');
const Project = require('./models/Projects');

// ═════════════════════════════════════════════════════════════════════════════
// USER ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// Signup
app.post('/api/users/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });
        const user = new User({ name, email, password, role: role || 'member' });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search users by name or email
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
        res.status(500).json({ message: err.message });
    }
});

// Get notifications
app.get('/api/users/:id/notifications', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user?.notifications || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark notifications read
app.put('/api/users/:id/notifications/read', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            $set: { 'notifications.$[].read': true }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ═════════════════════════════════════════════════════════════════════════════
// PROJECT ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// Get projects created by user
app.get('/api/projects/created/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ createdBy: req.params.userId });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get projects assigned to user
app.get('/api/projects/assigned/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ assignedTo: req.params.userId });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create project
app.post('/api/projects', async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update project (full)
app.put('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Assign project to user
app.put('/api/projects/:id/assign', async (req, res) => {
    try {
        const { assignToUserId } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { assignedTo: assignToUserId } },
            { new: true }
        );
        // Notify assigned user
        await User.findByIdAndUpdate(assignToUserId, {
            $push: {
                notifications: {
                    message: `You were assigned to project: ${project.Title}`,
                    read: false,
                    createdAt: new Date()
                }
            }
        });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Phase 2 PATCH Routes ─────────────────────────────────────────────────────

// Update status only (Kanban drag)
app.patch('/api/projects/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                $set: { status },
                $push: {
                    activityLog: {
                        action: `Status changed to ${status}`,
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        );
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Subtasks — add / toggle / delete
app.patch('/api/projects/:id/subtasks', async (req, res) => {
    try {
        const { action, subtaskId, title, completed } = req.body;
        let update = {};

        if (action === 'add') {
            update = { $push: { subtasks: { title, completed: false } } };
        } else if (action === 'toggle') {
            const project = await Project.findById(req.params.id);
            const subtask = project.subtasks.id(subtaskId);
            subtask.completed = !subtask.completed;
            await project.save();
            return res.json(project);
        } else if (action === 'delete') {
            update = { $pull: { subtasks: { _id: subtaskId } } };
        }

        const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Checklist — add / toggle / delete
app.patch('/api/projects/:id/checklist', async (req, res) => {
    try {
        const { action, itemId, item, done } = req.body;
        let update = {};

        if (action === 'add') {
            update = { $push: { checklist: { item, done: false } } };
        } else if (action === 'toggle') {
            const project = await Project.findById(req.params.id);
            const entry = project.checklist.id(itemId);
            entry.done = !entry.done;
            await project.save();
            return res.json(project);
        } else if (action === 'delete') {
            update = { $pull: { checklist: { _id: itemId } } };
        }

        const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Milestones — add / toggle / delete
app.patch('/api/projects/:id/milestones', async (req, res) => {
    try {
        const { action, milestoneId, title, dueDate } = req.body;
        let update = {};

        if (action === 'add') {
            update = { $push: { milestones: { title, dueDate, completed: false } } };
        } else if (action === 'toggle') {
            const project = await Project.findById(req.params.id);
            const milestone = project.milestones.id(milestoneId);
            milestone.completed = !milestone.completed;
            await project.save();
            return res.json(project);
        } else if (action === 'delete') {
            update = { $pull: { milestones: { _id: milestoneId } } };
        }

        const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
