import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Components/Login';
import Register from '../Components/Register';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes; 