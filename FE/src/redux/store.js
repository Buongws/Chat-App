// import { configureStore } from "@reduxjs/toolkit";

// const store = configureStore({});

// export default store;
import { configureStore } from '@reduxjs/toolkit';
import { composeWithDevTools } from '@redux-devtools/extension';
import { thunk }  from 'redux-thunk';
import rootReducer from '../reducers';

const middleware = [thunk ];

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}).concat(middleware),
  devTools: composeWithDevTools,
});

export default store;