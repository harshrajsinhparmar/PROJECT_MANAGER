import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const USERS_URL = "http://localhost:5000/api/users";
const API_URL = "http://localhost:5000/api/projects";


// --- USER THUNKS ---
export const signupUser = createAsyncThunk("users/signup", async (userData, { rejectWithValue }) => {
    try {
        const res = await axios.post(`${USERS_URL}/signup`, userData);
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Signup failed";  // ✅
        return rejectWithValue(message);
    }
});

export const loginUser = createAsyncThunk("users/login", async (credentials, { rejectWithValue }) => {
    try {
        const res = await axios.post(`${USERS_URL}/login`, credentials);
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Login failed";  // ✅
        return rejectWithValue(message);
    }
});

export const updateProfile = createAsyncThunk("users/update", async ({ id, updatedData }, { rejectWithValue }) => {
    try {
        const res = await axios.put(`${USERS_URL}/${id}`, updatedData);
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Update failed";
        return rejectWithValue(message);
    }
});

export const deleteProfile = createAsyncThunk("users/delete", async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${USERS_URL}/${id}`);
        return id;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Delete failed";
        return rejectWithValue(message);
    }
});


export const fetchNotifications = createAsyncThunk(
    "users/fetchNotifications",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${USERS_URL}/${userId}/notifications`);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            return rejectWithValue(message);
        }
    }
);

export const markNotificationsRead = createAsyncThunk("users/markNotificationsRead", async (userId, { rejectWithValue }) => {
    try {
        await axios.put(`${USERS_URL}/${userId}/notifications/read`);
        return true;
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        return rejectWithValue(message);
    }
});
// NEW — search users by email query
export const searchUsers = createAsyncThunk("users/search", async (q, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${USERS_URL}/search`, { params: { q } });
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Search failed";
        return rejectWithValue(message);
    }
});

// --- PROJECT THUNKS ---
// Update fetchUserProjects to fetch both created and assigned
export const fetchCreatedProjects = createAsyncThunk("projects/fetchCreated", async (userId, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${API_URL}/created/${userId}`);
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Fetch failed";
        return rejectWithValue(message);
    }
});

export const fetchAssignedProjects = createAsyncThunk("projects/fetchAssigned", async (userId, { rejectWithValue }) => {
    try {
        const res = await axios.get(`${API_URL}/assigned/${userId}`);
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Fetch failed";
        return rejectWithValue(message);
    }
});



export const addProjectDb = createAsyncThunk("projects/add", async (projectData, { rejectWithValue }) => {
    try {
        const res = await axios.post(API_URL, projectData);
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Add failed";
        return rejectWithValue(message);
    }
});

export const editProjectDb = createAsyncThunk("projects/edit", async ({ id, updatedData }, { rejectWithValue }) => {
    try {
        const res = await axios.put(`${API_URL}/${id}`, updatedData);
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Edit failed";
        return rejectWithValue(message);
    }
});

export const deleteProjectDb = createAsyncThunk("projects/delete", async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
        return id;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Delete failed";
        return rejectWithValue(message);
    }
});

export const assignProjectDb = createAsyncThunk("projects/assign", async ({ projectId, assignToUserId }, { rejectWithValue }) => {
    try {
        const res = await axios.put(`${API_URL}/${projectId}/assign`, { assignToUserId });
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Assign failed";
        return rejectWithValue(message);
    }
});

// NEW — remove a user from a project's assignedTo
export const removeAssigneeDb = createAsyncThunk("projects/removeAssignee", async ({ projectId, userId }, { rejectWithValue }) => {
    try {
        const res = await axios.delete(`${API_URL}/${projectId}/assign/${userId}`);
        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Remove failed";
        return rejectWithValue(message);
    }
});

const FORMSLICE = createSlice({
    name: 'registration',
    initialState: {
        createdProjects: [],    // projects I created
        assignedProjects: [],   // projects assigned to me
        currentUser: JSON.parse(localStorage.getItem("CURRENTUSER"))?.[0] || null,
        notifications: [],
        userSearchResults: [],
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
            console.log("START OF LOGOUT");
            state.currentUser = null;
            state.createdProjects = [];
            state.assignedProjects = [];
            state.notifications = [];
            state.userSearchResults = [];
            localStorage.removeItem("CURRENTUSER");
            console.log("END OF LOGOUT");
        }, clearUserSearch: (state) => {
            state.userSearchResults = [];
        }

    },
    extraReducers: (builder) => {
        builder
            // User cases
            .addCase(loginUser.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                localStorage.setItem("CURRENTUSER", JSON.stringify([action.payload]));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.error = action.payload;
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
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload;
            })
            .addCase(markNotificationsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map(n => ({ ...n, read: true }));
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.userSearchResults = action.payload;
            })

            // Project cases
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
                // Update in createdProjects
                const createdIndex = state.createdProjects.findIndex(p => p._id === action.payload._id);
                if (createdIndex !== -1) state.createdProjects[createdIndex] = action.payload;

                // Update in assignedProjects too if it exists there
                const assignedIndex = state.assignedProjects.findIndex(p => p._id === action.payload._id);
                if (assignedIndex !== -1) state.assignedProjects[assignedIndex] = action.payload;
            })
            .addCase(deleteProjectDb.fulfilled, (state, action) => {
                state.createdProjects = state.createdProjects.filter(p => p._id !== action.payload);
                state.assignedProjects = state.assignedProjects.filter(p => p._id !== action.payload)
            })
            .addCase(assignProjectDb.fulfilled, (state, action) => {
                const index = state.createdProjects.findIndex(p => p._id === action.payload._id);
                if (index !== -1) state.createdProjects[index] = action.payload;
            }).addCase(removeAssigneeDb.fulfilled, (state, action) => {
                const index = state.createdProjects.findIndex(p => p._id === action.payload._id);
                if (index !== -1) state.createdProjects[index] = action.payload;
            });
    }
});

export const { toggleTheme, logoutUser, clearUserSearch } = FORMSLICE.actions;
export const store = configureStore({ reducer: { registration: FORMSLICE.reducer } });
