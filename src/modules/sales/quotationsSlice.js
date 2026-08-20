import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const fetchQuotations = createAsyncThunk('quotations/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get('/quotations', { params });
  return data;
});

export const createQuotation = createAsyncThunk('quotations/create', async (quotation) => {
  const { data } = await apiClient.post('/quotations', quotation);
  return data;
});

export const updateQuotationStatus = createAsyncThunk('quotations/updateStatus', async ({ id, status }) => {
  await apiClient.patch(`/quotations/${id}/status`, { status });
  return { id, status };
});

export const convertToOrder = createAsyncThunk('quotations/convert', async (id) => {
  const { data } = await apiClient.post(`/quotations/${id}/convert-to-order`);
  return { id, order: data };
});

const quotationsSlice = createSlice({
  name: 'quotations',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotations.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  }
});

export default quotationsSlice.reducer;
