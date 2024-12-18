import React, { useState } from 'react';
import './index.css'; // Ensure to include your CSS styles

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h3 className="brand">
          <i className="fas fa-anchor"></i>
          <span>MyApp</span>
        </h3>
        <div className="toggle-btn" onClick={toggleSidebar}>
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} toggle-icon`}></i>
        </div>
      </div>
      <ul className="nav-links">
        <li>
          <a href="#" className="nav-item">
          <span className="nav-icon"><i className></i></span>
            <span>Home</span>
          </a>
        </li>

        <li>
          <a href="#" className="nav-item">
            <span className="nav-icon"><i className></i></span>
            <span>My Day</span>
          </a>
        </li>

        <li>
          <a href="#" className="nav-item">
            <span className="nav-icon"><i className></i></span>
            <span>My Calendar</span>
          </a>
        </li>

        <li>
          <a href="#" className="nav-item">
            <span className="nav-icon"><i className></i></span>
            <span>My Diary</span>
          </a>
        </li>

        <li>
          <a href="#" className="nav-item">
            <span className="nav-icon"><i className></i></span>
            <span>My Archive</span>
          </a>
        </li>

        <li className={`dropdown ${activeDropdown === 0 ? 'active' : ''}`}>
          <a href="#" className="nav-item dropdown-toggle" onClick={() => toggleDropdown(0)}>
            <div>
              <span className="nav-icon"><i className></i></span>
              <span>My List</span>
            </div>
            <i className={`fas ${activeDropdown === 0 ? 'fa-chevron-down' : 'fa-chevron-right'} dropdown-icon`}></i>
          </a>
          <ul className="dropdown-menu">
            <li><a href="#" className="dropdown-item">Personal</a></li>
            <li><a href="#" className="dropdown-item">Work</a></li>
            <li><a href="#" className="dropdown-item">School</a></li>
          </ul>
        </li>

      </ul>
    </div>
  );
};

export default Sidebar;