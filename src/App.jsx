import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './Components/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import VerifyEmail from './Components/VerifyEmail';
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import MyDiary from './Components/MyDiary';
import PrivateRoute from './Components/PrivateRoute';
import Landing from './Components/Landing';
import MyDay from './Components/MyDay';
import MyCalendar from './Components/MyCalendar';
import ArchiveComponent from './Components/ArchiveComponent';
import ListComponent from './Components/ListComponent';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Private Routes */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/MyDiary" element={<PrivateRoute><MyDiary /></PrivateRoute>} />
        <Route path="/MyDay" element={<PrivateRoute><MyDay /></PrivateRoute>} />
        <Route path="/MyCalendar" element={<PrivateRoute><MyCalendar /></PrivateRoute>} />
        <Route path="/ArchiveComponent" element={<PrivateRoute><ArchiveComponent /></PrivateRoute>} />
        <Route path="/lists/:listType" element={<PrivateRoute><ListComponent /></PrivateRoute>} />
        
        {/* Catch-all route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <p>The requested route was not found.</p>
              <p className="mt-2">Current path: {window.location.pathname}</p>
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App; 