import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get('/products', { params });
  return data;
});

export const createProduct = createAsyncThunk('products/create', async (product) => {
  const { data } = await apiClient.post('/products', product);
  return data;
});

export const recordStockMovement = createAsyncThunk('products/recordMovement', async (movement) => {
  const { data } = await apiClient.post('/stock/movements', movement);
  return data;
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  }
});

export default productsSlice.reducer;
