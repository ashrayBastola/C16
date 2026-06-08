import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/auths";

// ---------------- LOGIN USER ----------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, thunkAPI) => {
    try {
      const response = await axios.post(`${BASE_URL}/login/`, { username, password });
      const data = response.data;

      // Save tokens and user info
      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify({
        username: data.username,
        full_name: data.full_name,
        role: data.role,
      }));

      // Set default Authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.tokens.access}`;

      return {
        username: data.username,
        full_name: data.full_name,
        role: data.role,
      };
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || "Login failed";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

// ---------------- REGISTER USER ----------------
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ username, full_name, password }, thunkAPI) => {
    try {
      const response = await axios.post(`${BASE_URL}/register/`, {
        username,
        full_name,
        password,
      });
      const data = response.data;

      localStorage.setItem("accessToken", data.tokens.access);
      localStorage.setItem("refreshToken", data.tokens.refresh);
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username,
          full_name: data.full_name,
          role: data.role,
        })
      );

      axios.defaults.headers.common["Authorization"] = `Bearer ${data.tokens.access}`;

      return {
        username: data.username,
        full_name: data.full_name,
        role: data.role,
      };
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Signup failed";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

// ---------------- CREATE USER ------------------
export const createUser = createAsyncThunk(
  "auth/createUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${BASE_URL}/users/create/`, userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || "Create user failed";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

// ---------------- FETCH ALL USERS ----------------
export const fetchAllUsers = createAsyncThunk(
  "auth/fetchAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message || "Fetch users failed";
      return thunkAPI.rejectWithValue(errMsg);
    }
  }
);

// ---------------- AUTH SLICE ----------------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    error: null,
    createUserLoading: false,
    createUserError: null,
    createUserSuccess: null,
    allUsers: [], // Store for all registered users
    allUsersLoading: false,
    allUsersError: null,
    registerLoading: false,
    registerError: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.allUsers = [];
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete axios.defaults.headers.common["Authorization"];
    },
    clearCreateUserState: (state) => {
      state.createUserError = null;
      state.createUserSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
      })

      // CREATE USER
      .addCase(createUser.pending, (state) => {
        state.createUserLoading = true;
        state.createUserError = null;
        state.createUserSuccess = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.createUserLoading = false;
        state.createUserSuccess = "User created successfully!";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserLoading = false;
        state.createUserError = action.payload;
      })

      // FETCH ALL USERS
      .addCase(fetchAllUsers.pending, (state) => {
        state.allUsersLoading = true;
        state.allUsersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsersLoading = false;
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.allUsersLoading = false;
        state.allUsersError = action.payload;
      });
  },
});

export const { logout, clearCreateUserState } = authSlice.actions;
export default authSlice.reducer;
