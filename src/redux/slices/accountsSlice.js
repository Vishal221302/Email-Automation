import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch accounts');
    }
  }
);

export const connectAccount = createAsyncThunk(
  'accounts/connect',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await api.post('/accounts/connect', accountData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to connect account');
    }
  }
);

export const setPrimaryAccount = createAsyncThunk(
  'accounts/setPrimary',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/accounts/primary/${id}`);
      dispatch(fetchAccounts()); // Reload updated order
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to set primary');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'accounts/refreshToken',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/accounts/refresh/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to refresh token');
    }
  }
);

export const syncAccount = createAsyncThunk(
  'accounts/syncAccount',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/accounts/sync/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to sync account');
    }
  }
);

export const disconnectAccount = createAsyncThunk(
  'accounts/disconnect',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete(`/accounts/${id}`);
      dispatch(fetchAccounts());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to disconnect account');
    }
  }
);

const initialState = {
  accounts: [],
  isLoading: false,
  error: null
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Accounts
    builder.addCase(fetchAccounts.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAccounts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.accounts = action.payload;
    });
    builder.addCase(fetchAccounts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Connect Account
    builder.addCase(connectAccount.fulfilled, (state, action) => {
      state.accounts.push(action.payload);
    });

    // Refresh Token
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      const index = state.accounts.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = action.payload;
      }
    });

    // Sync
    builder.addCase(syncAccount.fulfilled, (state, action) => {
      const index = state.accounts.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.accounts[index] = action.payload;
      }
    });
  }
});

export default accountsSlice.reducer;
