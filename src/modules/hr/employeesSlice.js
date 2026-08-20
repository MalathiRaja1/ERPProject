import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (params = {}) => {
  const { data } = await apiClient.get('/employees', { params });
  return data;
});

export const createEmployee = createAsyncThunk('employees/create', async (employee) => {
  const { data } = await apiClient.post('/employees', employee);
  return data;
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, ...employee }) => {
  await apiClient.put(`/employees/${id}`, employee);
  return { id, ...employee };
});

const employeesSlice = createSlice({
  name: 'employees',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  }
});

export default employeesSlice.reducer;
