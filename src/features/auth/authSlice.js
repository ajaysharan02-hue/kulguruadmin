import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('accessToken');

const initialState = {
    user: user || null,
    token: token || null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
};

// Login user
export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        const response = await api.post('/auth/login', credentials);
        const { user, accessToken } = response.data.data;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);

        return response.data.data;
    } catch (error) {
        const message =
            error.response?.data?.message || error.message || 'Login failed';
        return thunkAPI.rejectWithValue(message);
    }
});

// Logout user – always clear local state and storage
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        await api.post('/auth/logout');
    } catch (_) {
        // Ignore API errors (e.g. network); still clear client state
    } finally {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    }
    return null;
});

// Get current user profile
export const getMe = createAsyncThunk('auth/me', async (_, thunkAPI) => {
    try {
        const response = await api.get('/auth/me');
        const me = response.data.data;
        localStorage.setItem('user', JSON.stringify(me));
        return me;
    } catch (error) {
        const message =
            error.response?.data?.message || error.message || 'Failed to get user profile';
        return thunkAPI.rejectWithValue(message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload.user;
                state.token = action.payload.accessToken;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                state.token = null;
            })
            // Logout – clear auth state when fulfilled (always called after finally)
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isLoading = false;
                state.isError = false;
                state.message = '';
            })
            .addCase(logout.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.isLoading = false;
            })
            // Get Me
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(getMe.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
