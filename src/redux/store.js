import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import accountsReducer from './slices/accountsSlice';
import templatesReducer from './slices/templatesSlice';
import emailsReducer from './slices/emailsSlice';
import bulkReducer from './slices/bulkSlice';
import notificationsReducer from './slices/notificationsSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    accounts: accountsReducer,
    templates: templatesReducer,
    emails: emailsReducer,
    bulk: bulkReducer,
    notifications: notificationsReducer,
  },
});

export default store;

