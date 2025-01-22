import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="space-y-2">
      <Link to="/lists/personal" className={`sidebar-item ${location.pathname === '/lists/personal' ? 'active' : ''}`}>
        Personal
      </Link>
      <Link to="/lists/work" className={`sidebar-item ${location.pathname === '/lists/work' ? 'active' : ''}`}>
        Work
      </Link>
      <Link to="/lists/school" className={`sidebar-item ${location.pathname === '/lists/school' ? 'active' : ''}`}>
        School
      </Link>
    </div>
  );
};

export default Sidebar; 