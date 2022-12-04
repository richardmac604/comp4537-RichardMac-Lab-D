import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import FilteredPagination from './FilteredPagination'
import Search from './Search'
import axios from 'axios'
import Login from './Login'
import {
  BrowserRouter as Router
} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <h1>
      <Router>
        <Login />
      </Router>
    </h1>
    <div>
    <Search types={types} checkedState={checkedState} setCheckedState={setCheckedState} />
    <FilteredPagination types={types} checkedState={checkedState} />
    </div>
  </React.StrictMode>
);