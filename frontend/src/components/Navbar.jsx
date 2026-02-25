import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/components/_navbar.scss';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">{'</>'}</span>
          <span className="navbar__logo-text">CipherSQLStudio</span>
        </Link>

        <div className="navbar__actions">
          {user ? (
            <>
              <span className="navbar__user">👤 {user.name}</span>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">Login</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
