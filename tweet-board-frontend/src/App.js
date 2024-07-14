import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import TweetsFeed from './components/TweetsFeed';
import Followers from './components/Followers';
import Following from './components/Following';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tweets/feed" element={<TweetsFeed />} />
          <Route path="/user/followers" element={<Followers />} />
          <Route path="/user/following" element={<Following />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
