import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_NOTIFICATIONS } from '../../constants/mockData';

const initialState = {
  notifications: [],
  unreadCount: 0
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action) {
      // payload: { type, title, message }
      const newNtf = {
        id: `ntf_${Date.now()}`,
        type: action.payload.type || 'info', // 'success' | 'danger' | 'warning' | 'info'
        title: action.payload.title,
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      state.notifications.unshift(newNtf);
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
    markAsRead(state, action) {
      // payload: id
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = state.notifications.filter(n => !n.isRead).length;
      }
    },
    markAllRead(state) {
      state.notifications = state.notifications.map(n => ({
        ...n,
        isRead: true
      }));
      state.unreadCount = 0;
    },
    removeNotification(state, action) {
      // payload: id
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
    clearAll(state) {
      state.notifications = [];
      state.unreadCount = 0;
    }
  }
});

export const {
  addNotification,
  markAsRead,
  markAllRead,
  removeNotification,
  clearAll
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
