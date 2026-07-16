import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch templates');
    }
  }
);

export const addTemplate = createAsyncThunk(
  'templates/addTemplate',
  async (tplData, { rejectWithValue }) => {
    try {
      const response = await api.post('/templates', tplData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create template');
    }
  }
);

export const editTemplate = createAsyncThunk(
  'templates/editTemplate',
  async ({ id, ...tplData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/templates/${id}`, tplData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update template');
    }
  }
);

export const duplicateTemplate = createAsyncThunk(
  'templates/duplicate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/templates/duplicate/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to duplicate template');
    }
  }
);

export const toggleFavoriteTemplate = createAsyncThunk(
  'templates/toggleFavorite',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/templates/favorite/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to favorite template');
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/templates/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete template');
    }
  }
);

const initialState = {
  templates: [],
  filterCategory: 'All',
  searchQuery: '',
  viewMode: 'grid',
  isLoading: false,
  error: null
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setCategoryFilter(state, action) {
      state.filterCategory = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setViewMode(state, action) {
      state.viewMode = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchTemplates.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchTemplates.fulfilled, (state, action) => {
      state.isLoading = false;
      state.templates = action.payload;
    });
    builder.addCase(fetchTemplates.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Add
    builder.addCase(addTemplate.fulfilled, (state, action) => {
      state.templates.unshift(action.payload);
    });

    // Edit
    builder.addCase(editTemplate.fulfilled, (state, action) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    });

    // Duplicate
    builder.addCase(duplicateTemplate.fulfilled, (state, action) => {
      state.templates.unshift(action.payload);
    });

    // Favorite
    builder.addCase(toggleFavoriteTemplate.fulfilled, (state, action) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index].isFavorite = action.payload.isFavorite;
      }
    });

    // Delete
    builder.addCase(deleteTemplate.fulfilled, (state, action) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
    });
  }
});

export const { setCategoryFilter, setSearchQuery, setViewMode } = templatesSlice.actions;
export default templatesSlice.reducer;
