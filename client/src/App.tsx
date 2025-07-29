import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import SignIn from './auth/sign-in';
import { useEffect } from 'react';
import { getUser, useUserStore } from './lib/store/user';
import SignUp from './auth/sign-up';
import Home from './Home';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}

export default App;