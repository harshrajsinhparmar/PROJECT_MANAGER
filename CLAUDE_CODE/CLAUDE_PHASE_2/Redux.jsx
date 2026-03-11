import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const USERS_URL = "http://localhost:5000/api/users";
const API_URL = "http://localhost:5000/api/projects";

// ============================================================
// USER THUNKS
// ============================================================

export const signupUser = createAsyncThunk("users/signup", async (userData, { rejectWithValue }) => {
    try {
        const res = await axios.post(`${USERS_URL}/signup`, userData);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
});

export const loginUser = createAsyncThunk("users/login", async (credentials, { rejectWithValue }) => {
    try {
        const res = await axios.post(`${USERS_URL}/login`, credentials);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Login failed");
    }
});

export const updateProfile = createAsyncThunk("users/update", async ({ id, updatedData }, { rejectWithValue }) => {
    try {
        const res = await axios.put(`${USERS_URL}/${id}`, updatedData);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Update failed");
    }
});

export const deleteProfile = createAsyncThunk("users/delete", async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${USERS_URL}/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
});

export const fetchNotifications = createAsyncThunk("users/fetchNotifications", async (userId, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${USERS_URL}/${userId}/notifications`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to fetch notifications");
    }
});

export const markNotificationsRead = createAsyncThunk("users/markNotificationsRead", async (userId, { rejectWithValue }) => {
    try {
        await axios.put(`${USERS_URL}/${userId}/notifications/read`);
        return true;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to mark read");
    }
});

// ============================================================
// PROJECT THUNKS
// ============================================================

export const fetchCreatedProjects = createAsyncThunk("projects/fetchCreated", async (userId, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${API_URL}/created/${userId}`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const fetchAssignedProjects = createAsyncThunk("projects/fetchAssigned", async (userId, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${API_URL}/assigned/${userId}`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const addProjectDb = createAsyncThunk("projects/add", async (projectData, { rejectWithValue }) => {
    try {
        const res = await axios.post(API_URL, projectData);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const editProjectDb = createAsyncThunk("projects/edit", async ({ id, updatedData }, { rejectWithValue }) => {
    try {
        const res = await axios.put(`${API_URL}/${id}`, updatedData);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const deleteProjectDb = createAsyncThunk("projects/delete", async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const assignProjectDb = createAsyncThunk("projects/assign", async ({ projectId, assignToUserId }, { rejectWithValue }) => {
    try {
        const res = await axios.put(`${API_URL}/${projectId}/assign`, { assignToUserId });
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

// Phase 2 thunks

export const updateProjectStatus = createAsyncThunk("projects/updateStatus", async ({ id, status }, { rejectWithValue }) => {
    try {
        const res = await axios.patch(`${API_URL}/${id}/status`, { status });
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const updateSubtasks = createAsyncThunk("projects/updateSubtasks", async (payload, { rejectWithValue }) => {
    try {
        const { id, ...rest } = payload;
        const res = await axios.patch(`${API_URL}/${id}/subtasks`, rest);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const updateChecklist = createAsyncThunk("projects/updateChecklist", async (payload, { rejectWithValue }) => {
    try {
        const { id, ...rest } = payload;
        const res = await axios.patch(`${API_URL}/${id}/checklist`, rest);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const updateMilestones = createAsyncThunk("projects/updateMilestones", async (payload, { rejectWithValue }) => {
    try {
        const { id, ...rest } = payload;
        const res = await axios.patch(`${API_URL}/${id}/milestones`, rest);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

// ============================================================
// HELPER — sync updated project into both arrays
// ============================================================
const syncProject = (state, updated) => {
    const ci = state.createdProjects.findIndex(p => p._id === updated._id);
    if (ci !== -1) state.createdProjects[ci] = updated;
    const ai = state.assignedProjects.findIndex(p => p._id === updated._id);
    if (ai !== -1) state.assignedProjects[ai] = updated;
};

// ============================================================
// SLICE
// ============================================================
const FORMSLICE = createSlice({
    name: 'registration',
    initialState: {
        createdProjects: [],
        assignedProjects: [],
        currentUser: JSON.parse(localStorage.getItem("CURRENTUSER"))?.[0] || null,
        notifications: [],
        mode: localStorage.getItem("theme") || "dark",
        status: 'idle',
        error: null
    },
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === "dark" ? "light" : "dark";
            localStorage.setItem("theme", state.mode);
        },
        logoutUser: (state) => {
            state.currentUser = null;
            state.createdProjects = [];
            state.assignedProjects = [];
            state.notifications = [];
            localStorage.removeItem("CURRENTUSER");
        }
    },
    extraReducers: (builder) => {
        builder
            // Auth
            .addCase(signupUser.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                localStorage.setItem("CURRENTUSER", JSON.stringify([action.payload]));
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                localStorage.setItem("CURRENTUSER", JSON.stringify([action.payload]));
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                localStorage.setItem("CURRENTUSER", JSON.stringify([action.payload]));
            })
            .addCase(deleteProfile.fulfilled, (state) => {
                state.currentUser = null;
                state.createdProjects = [];
                state.assignedProjects = [];
                state.notifications = [];
                localStorage.removeItem("CURRENTUSER");
            })
            // Notifications
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload;
            })
            .addCase(markNotificationsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map(n => ({ ...n, read: true }));
            })
            // Projects
            .addCase(fetchCreatedProjects.fulfilled, (state, action) => {
                state.createdProjects = action.payload;
            })
            .addCase(fetchAssignedProjects.fulfilled, (state, action) => {
                state.assignedProjects = action.payload;
            })
            .addCase(addProjectDb.fulfilled, (state, action) => {
                state.createdProjects.push(action.payload);
            })
            .addCase(editProjectDb.fulfilled, (state, action) => {
                syncProject(state, action.payload);
            })
            .addCase(deleteProjectDb.fulfilled, (state, action) => {
                state.createdProjects = state.createdProjects.filter(p => p._id !== action.payload);
            })
            .addCase(assignProjectDb.fulfilled, (state, action) => {
                syncProject(state, action.payload);
            })
            // Phase 2
            .addCase(updateProjectStatus.fulfilled, (state, action) => {
                syncProject(state, action.payload);
            })
            .addCase(updateSubtasks.fulfilled, (state, action) => {
                syncProject(state, action.payload);
            })
            .addCase(updateChecklist.fulfilled, (state, action) => {
                syncProject(state, action.payload);
            })
            .addCase(updateMilestones.fulfilled, (state, action) => {
                syncProject(state, action.payload);
            });
    }
});

export const { toggleTheme, logoutUser } = FORMSLICE.actions;
export const store = configureStore({ reducer: { registration: FORMSLICE.reducer } });
