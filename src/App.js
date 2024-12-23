import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Sidebar from "./Navigation/Sidebar";
import ArchiveComponent from "./Components/ArchiveComponent";
import MyDiary from "./Components/MyDiary";
import Login from "./Components/Login";
import Register from "./Components/Register";
import ErrorBoundary from "./Components/ErrorBoundary";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="App">
      <Router>
        <ErrorBoundary>
          <Routes>
            {!isAuthenticated ? (
              <>
                <Route path="/" element={<Login />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/Sidebar" element={<Sidebar />} />
                <Route path="/Archive" element={<ArchiveComponent />} />
                <Route path="/MyDiary" element={<MyDiary />} />
              </>
            )}
          </Routes>
        </ErrorBoundary>
      </Router>
    </div>
  );
}

export default App;