import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/projects";

// Async Actions
export const fetchProjects = createAsyncThunk("projects/fetchAll", async (userId) => {
    const res = await axios.get(`${API_URL}/${userId}`);
    return res.data; // Now returns data from MongoDB
});

export const addProjectDb = createAsyncThunk("projects/add", async (projectData) => {
    const res = await axios.post(API_URL, projectData);
    return res.data;
});

export const editProjectDb = createAsyncThunk("projects/edit", async ({ id, updatedData }) => {
    const res = await axios.put(`http://localhost:5000/api/projects/${id}`, updatedData);
    return res.data;
});

export const deleteProjectDb = createAsyncThunk("projects/delete", async (id) => {
    await axios.delete(`http://localhost:5000/api/projects/${id}`);
    return id; // Return the ID so we can remove it from state
});

const FORMSLICE = createSlice({
    name: 'registration',
    initialState: {
        Projects: [],
        mode: localStorage.getItem("theme") || "dark",
        status: 'idle' 
    },
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === "dark" ? "light" : "dark";
            localStorage.setItem("theme", state.mode);
        },

    },
    extraReducers: (builder) => {
    builder
        .addCase(fetchProjects.fulfilled, (state, action) => {
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

export const { toggleTheme } = FORMSLICE.actions;
export const store = configureStore({ reducer: { registration: FORMSLICE.reducer } });