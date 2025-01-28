import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Sidebar from "./Navigation/Sidebar";
import ArchiveComponent from "./Components/ArchiveComponent";
import MyDiary from "./Components/MyDiary";
import MyDay from "./Components/MyDay";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Landing from "./Components/Landing";
import ErrorBoundary from "./Components/ErrorBoundary";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import ListComponent from './Components/ListComponent';
import MyCalendar from './Components/MyCalendar';
import VerifyEmail from './Components/VerifyEmail';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Landing page route first */}
              <Route exact path="/" element={<Landing />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Protected routes */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/archivecomponent" element={
                <ProtectedRoute>
                  <ArchiveComponent />
                </ProtectedRoute>
              } />
              <Route path="/myday" element={
                <ProtectedRoute>
                  <MyDay />
                </ProtectedRoute>
              } />
              <Route path="/mydiary" element={
                <ProtectedRoute>
                  <MyDiary />
                </ProtectedRoute>
              } />
              <Route path="/mycalendar" element={
                <ProtectedRoute>
                  <MyCalendar />
                </ProtectedRoute>
              } />
              <Route path="/lists/:listType" element={
                <ProtectedRoute>
                  <ListComponent />
                </ProtectedRoute>
              } />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;