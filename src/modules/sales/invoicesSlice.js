import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get('/invoices', { params });
  return data;
});

export const createInvoice = createAsyncThunk('invoices/create', async ({ salesOrderId, dueDate }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/invoices', { salesOrderId, dueDate });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const recordPayment = createAsyncThunk('invoices/recordPayment', async (payment, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/payments', payment);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      });
  }
});

export default invoicesSlice.reducer;
