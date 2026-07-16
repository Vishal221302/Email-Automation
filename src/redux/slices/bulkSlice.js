import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fileName: '',
  candidates: [],
  validCount: 0,
  invalidCount: 0,
  parseStatus: 'idle', // 'idle' | 'parsing' | 'success' | 'failed'
  isSending: false,
  sendProgress: 0,
  sentBatchIds: []
};

const bulkSlice = createSlice({
  name: 'bulk',
  initialState,
  reducers: {
    startParsing(state) {
      state.parseStatus = 'parsing';
    },
    setCSVData(state, action) {
      // payload: { fileName, candidates }
      const { fileName, candidates } = action.payload;
      state.fileName = fileName;
      state.candidates = candidates;
      
      let valid = 0;
      let invalid = 0;
      // Simple validation checking for emails and names
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      state.candidates = candidates.map(candidate => {
        const isValidEmail = candidate.email && emailRegex.test(candidate.email.trim());
        const isValid = isValidEmail && candidate.candidate_name && candidate.company_name;
        
        if (isValid) valid++;
        else invalid++;

        return {
          ...candidate,
          isValid,
          errors: {
            email: !isValidEmail ? 'Invalid email format' : null,
            name: !candidate.candidate_name ? 'Candidate name is required' : null,
            company: !candidate.company_name ? 'Company name is required' : null
          }
        };
      });

      state.validCount = valid;
      state.invalidCount = invalid;
      state.parseStatus = 'success';
    },
    parsingFailed(state) {
      state.parseStatus = 'failed';
    },
    startSending(state) {
      state.isSending = true;
      state.sendProgress = 0;
    },
    updateSendProgress(state, action) {
      // payload: progress (number)
      state.sendProgress = action.payload;
      if (action.payload >= 100) {
        state.isSending = false;
      }
    },
    completeSending(state) {
      state.isSending = false;
      state.sendProgress = 100;
    },
    resetBulkState(state) {
      return initialState;
    }
  }
});

export const {
  startParsing,
  setCSVData,
  parsingFailed,
  startSending,
  updateSendProgress,
  completeSending,
  resetBulkState
} = bulkSlice.actions;

export default bulkSlice.reducer;
