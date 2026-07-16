import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'dark',
  defaultAccount: 'alex.harrison.dev@gmail.com',
  defaultTemplate: 'tpl_1',
  timezone: 'Asia/Kolkata',
  language: 'en-US',
  signature: '',
  autoAttachResume: false,
  attachedResumes: [],
  notifications: {
    emailSent: true,
    emailFailed: true,
    scheduleReminder: true,
    accountExpired: true
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      // Update HTML root element
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem('theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    updateSettings(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },
    toggleNotificationSetting(state, action) {
      const key = action.payload;
      if (state.notifications[key] !== undefined) {
        state.notifications[key] = !state.notifications[key];
      }
    },
    addResume(state, action) {
      state.attachedResumes.push(action.payload);
    },
    removeResume(state, action) {
      state.attachedResumes = state.attachedResumes.filter(
        resume => resume.name !== action.payload
      );
    },
    setDefaultResume(state, action) {
      state.attachedResumes = state.attachedResumes.map(resume => ({
        ...resume,
        isDefault: resume.name === action.payload
      }));
    }
  }
});

export const {
  toggleTheme,
  setTheme,
  updateSettings,
  toggleNotificationSetting,
  addResume,
  removeResume,
  setDefaultResume
} = settingsSlice.actions;

export default settingsSlice.reducer;
