const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String },
    status: { type: String, enum: ['active', 'completed', 'hold'], default: 'active' },
    date: { type: String, required: true },
    // FIX: user_id stored as String because frontend uses Date.now() numeric IDs, not ObjectIds
    user_id: { type: String, required: true },
    // FIX #9: Store a separate createdAt ISO string so GanttView can use it as a real date
    startDate: { type: String, default: () => new Date().toISOString().substring(0, 10) }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);