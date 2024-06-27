import React from 'react';
// import logo from './logo.svg'; // uncomment this when we have our own logo.svg
import './App.css';
import TrendsDashboard from './components/TrendsDashboard';

function App() {
  const env = process.env.REACT_APP_ENV;
  console.log(env)
  return (
    <TrendsDashboard/>
  );
}

export default App;
