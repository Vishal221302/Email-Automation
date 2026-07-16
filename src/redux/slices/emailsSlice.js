import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchSentEmails = createAsyncThunk(
  'emails/fetchSent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/emails/sent');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch sent history');
    }
  }
);

export const fetchScheduledEmails = createAsyncThunk(
  'emails/fetchScheduled',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/emails/scheduled');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch scheduled queue');
    }
  }
);

export const sendEmailNow = createAsyncThunk(
  'emails/sendNow',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await api.post('/emails/send-now', emailData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to send email');
    }
  }
);

export const scheduleEmail = createAsyncThunk(
  'emails/schedule',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await api.post('/emails/schedule', emailData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to schedule email');
    }
  }
);

export const pauseScheduledEmail = createAsyncThunk(
  'emails/pauseScheduled',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/emails/scheduled/pause/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to pause scheduled email');
    }
  }
);

export const resumeScheduledEmail = createAsyncThunk(
  'emails/resumeScheduled',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/emails/scheduled/resume/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to resume scheduled email');
    }
  }
);

export const cancelScheduledEmail = createAsyncThunk(
  'emails/cancelScheduled',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/emails/scheduled/cancel/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to cancel scheduled email');
    }
  }
);

export const rescheduleEmail = createAsyncThunk(
  'emails/reschedule',
  async ({ id, scheduledAt, timezone }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/emails/scheduled/reschedule/${id}`, { scheduledAt, timezone });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to reschedule email');
    }
  }
);

export const sendScheduledNow = createAsyncThunk(
  'emails/sendScheduledNow',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/emails/scheduled/send-now/${id}`);
      dispatch(fetchScheduledEmails());
      return response.data; // Newly created sent email
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to send scheduled email now');
    }
  }
);

export const deleteScheduledEmail = createAsyncThunk(
  'emails/deleteScheduled',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/emails/scheduled/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete scheduled email');
    }
  }
);

const initialState = {
  sentEmails: [],
  scheduledEmails: [],
  currentComposeEmail: null,
  isLoading: false,
  error: null
};

const emailsSlice = createSlice({
  name: 'emails',
  initialState,
  reducers: {
    setCurrentCompose(state, action) {
      state.currentComposeEmail = action.payload;
    },
    clearCurrentCompose(state) {
      state.currentComposeEmail = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Sent
    builder.addCase(fetchSentEmails.fulfilled, (state, action) => {
      state.sentEmails = action.payload;
    });

    // Fetch Scheduled
    builder.addCase(fetchScheduledEmails.fulfilled, (state, action) => {
      state.scheduledEmails = action.payload;
    });

    // Send Now
    builder.addCase(sendEmailNow.fulfilled, (state, action) => {
      state.sentEmails.unshift(action.payload);
    });

    // Schedule
    builder.addCase(scheduleEmail.fulfilled, (state, action) => {
      state.scheduledEmails.unshift(action.payload);
    });

    // Pause
    builder.addCase(pauseScheduledEmail.fulfilled, (state, action) => {
      const index = state.scheduledEmails.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.scheduledEmails[index].status = action.payload.status;
      }
    });

    // Resume
    builder.addCase(resumeScheduledEmail.fulfilled, (state, action) => {
      const index = state.scheduledEmails.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.scheduledEmails[index].status = action.payload.status;
      }
    });

    // Cancel
    builder.addCase(cancelScheduledEmail.fulfilled, (state, action) => {
      const index = state.scheduledEmails.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.scheduledEmails[index].status = action.payload.status;
      }
    });

    // Reschedule
    builder.addCase(rescheduleEmail.fulfilled, (state, action) => {
      const index = state.scheduledEmails.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.scheduledEmails[index] = action.payload;
      }
    });

    // Send Scheduled Now (adds to sent list)
    builder.addCase(sendScheduledNow.fulfilled, (state, action) => {
      state.sentEmails.unshift(action.payload);
    });

    // Delete
    builder.addCase(deleteScheduledEmail.fulfilled, (state, action) => {
      state.scheduledEmails = state.scheduledEmails.filter(s => s.id !== action.payload);
    });
  }
});

export const { setCurrentCompose, clearCurrentCompose } = emailsSlice.actions;
export default emailsSlice.reducer;
