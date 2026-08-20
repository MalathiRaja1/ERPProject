import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productsReducer from '../modules/inventory/productsSlice';
import employeesReducer from '../modules/hr/employeesSlice';
import quotationsReducer from '../modules/sales/quotationsSlice';
import ordersReducer from '../modules/sales/ordersSlice';
import invoicesReducer from '../modules/sales/invoicesSlice';
// Finance slices will be added here once that module is built

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    employees: employeesReducer,
    quotations: quotationsReducer,
    orders: ordersReducer,
    invoices: invoicesReducer
  }
});
