import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get('/salesorders', { params });
  return data;
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }) => {
  await apiClient.patch(`/salesorders/${id}/status`, { status });
  return { id, status };
});

export const fulfillOrder = createAsyncThunk('orders/fulfill', async ({ id, warehouseId }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post(`/salesorders/${id}/fulfill`, { warehouseId });
    return { id, data };
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      });
  }
});

export default ordersSlice.reducer;
