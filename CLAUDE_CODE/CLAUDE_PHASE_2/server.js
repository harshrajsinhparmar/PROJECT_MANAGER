const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ DB Connected'))
    .catch(err => console.error('DB Error:', err));

const User = require('./models/User');
const Project = require('./models/Projects');

// ============================================================
// USER ROUTES
// ============================================================

// POST /api/users/signup
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

// POST /api/users/login
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

// GET /api/users/search?q=...
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

// GET /api/users/:id/notifications
app.get('/api/users/:id/notifications', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user?.notifications || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/users/:id/notifications/read
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

// PUT /api/users/:id
app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================================
// PROJECT ROUTES
// ============================================================

// GET /api/projects/created/:userId
app.get('/api/projects/created/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ createdBy: req.params.userId });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/projects/assigned/:userId
app.get('/api/projects/assigned/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ assignedTo: req.params.userId });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/projects/:id
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/projects
app.post('/api/projects', async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/projects/:id
app.put('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/projects/:id
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/projects/:id/assign
app.put('/api/projects/:id/assign', async (req, res) => {
    try {
        const { assignToUserId } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { assignedTo: assignToUserId } },
            { new: true }
        );
        await User.findByIdAndUpdate(assignToUserId, {
            $push: {
                notifications: {
                    message: `You were assigned to: ${project.Title}`,
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

// ============================================================
// PHASE 2 PATCH ROUTES
// ============================================================

// PATCH /api/projects/:id/status  — Kanban drag & drop
app.patch('/api/projects/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                $set: { status },
                $push: {
                    activityLog: {
                        action: `Status changed to "${status}"`,
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

// PATCH /api/projects/:id/subtasks
app.patch('/api/projects/:id/subtasks', async (req, res) => {
    try {
        const { action, subtaskId, title } = req.body;

        if (action === 'add') {
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { $push: { subtasks: { title, completed: false } } },
                { new: true }
            );
            return res.json(project);
        }

        if (action === 'toggle') {
            const project = await Project.findById(req.params.id);
            const subtask = project.subtasks.id(subtaskId);
            if (!subtask) return res.status(404).json({ message: 'Subtask not found' });
            subtask.completed = !subtask.completed;
            await project.save();
            return res.json(project);
        }

        if (action === 'delete') {
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { $pull: { subtasks: { _id: subtaskId } } },
                { new: true }
            );
            return res.json(project);
        }

        res.status(400).json({ message: 'Invalid action' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/projects/:id/checklist
app.patch('/api/projects/:id/checklist', async (req, res) => {
    try {
        const { action, itemId, item } = req.body;

        if (action === 'add') {
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { $push: { checklist: { item, done: false } } },
                { new: true }
            );
            return res.json(project);
        }

        if (action === 'toggle') {
            const project = await Project.findById(req.params.id);
            const entry = project.checklist.id(itemId);
            if (!entry) return res.status(404).json({ message: 'Checklist item not found' });
            entry.done = !entry.done;
            await project.save();
            return res.json(project);
        }

        if (action === 'delete') {
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { $pull: { checklist: { _id: itemId } } },
                { new: true }
            );
            return res.json(project);
        }

        res.status(400).json({ message: 'Invalid action' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/projects/:id/milestones
app.patch('/api/projects/:id/milestones', async (req, res) => {
    try {
        const { action, milestoneId, title, dueDate } = req.body;

        if (action === 'add') {
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { $push: { milestones: { title, dueDate, completed: false } } },
                { new: true }
            );
            return res.json(project);
        }

        if (action === 'toggle') {
            const project = await Project.findById(req.params.id);
            const milestone = project.milestones.id(milestoneId);
            if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
            milestone.completed = !milestone.completed;
            await project.save();
            return res.json(project);
        }

        if (action === 'delete') {
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { $pull: { milestones: { _id: milestoneId } } },
                { new: true }
            );
            return res.json(project);
        }

        res.status(400).json({ message: 'Invalid action' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
