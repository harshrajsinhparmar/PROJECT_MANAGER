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

export const updateProfile = createAsyncThunk("users/update", async ({ id, updatedData }) => {
    const res = await axios.put(`${USERS_URL}/${id}`, updatedData);
    return res.data;
});

export const deleteProfile = createAsyncThunk("users/delete", async (id) => {
    await axios.delete(`${USERS_URL}/${id}`);
    return id;
});

// --- PROJECT THUNKS ---

export const fetchUserProjects = createAsyncThunk("projects/fetchAll", async (userId) => {
    const res = await axios.get(`${API_URL}/${userId}`);
    return res.data; // Now returns data from MongoDB
});

export const addProjectDb = createAsyncThunk("projects/add", async (projectData) => {
    const res = await axios.post(API_URL, projectData);
    return res.data;
});

export const editProjectDb = createAsyncThunk("projects/edit", async ({ id, updatedData }) => {
    const res = await axios.put(`${API_URL}/${id}`, updatedData);
    return res.data;
});

export const deleteProjectDb = createAsyncThunk("projects/delete", async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id; // Return the ID so we can remove it from state
});

const FORMSLICE = createSlice({
    name: 'registration',
    initialState: {
        Projects: [],
        currentUser: JSON.parse(localStorage.getItem("CURRENTUSER"))?.[0] || null, // ✅ add this
        mode: localStorage.getItem("theme") || "dark",
        status: 'idle'
    },
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === "dark" ? "light" : "dark";
            localStorage.setItem("theme", state.mode);
        }, logoutUser: (state) => {           // NEW
            state.currentUser = null;
            localStorage.removeItem("CURRENTUSER");
        }

    },
    extraReducers: (builder) => {
        builder
            // User cases
            .addCase(signupUser.fulfilled, (state, action) => {
                // Just signed up, don't log in automatically
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
                state.Projects = [];
                localStorage.removeItem("CURRENTUSER");
            })
            // Project cases
            .addCase(fetchUserProjects.fulfilled, (state, action) => {
                state.Projects = action.payload;
            })
            .addCase(addProjectDb.fulfilled, (state, action) => {
                state.Projects.push(action.payload);
            })
            .addCase(editProjectDb.fulfilled, (state, action) => {
                const index = state.Projects.findIndex(p => p._id === action.payload._id);
                if (index !== -1) state.Projects[index] = action.payload;
            })
            .addCase(deleteProjectDb.fulfilled, (state, action) => {
                state.Projects = state.Projects.filter(p => p._id !== action.payload);
            });
    }
});

export const { toggleTheme, logoutUser } = FORMSLICE.actions;
export const store = configureStore({ reducer: { registration: FORMSLICE.reducer } });