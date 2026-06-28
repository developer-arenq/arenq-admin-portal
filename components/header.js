import React from "react";
import { FaBars } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .adm-header {
    position: sticky;
    top: 0;
    z-index: 30;
    font-family: 'DM Sans', sans-serif;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #edf0e8;
    box-shadow: 0 2px 16px rgba(45, 80, 22, 0.06);
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* ── LEFT ── */
  .adm-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .adm-hamburger {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 10px;
    background: transparent;
    border: 1px solid #edf0e8;
    color: #7a9460;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .adm-hamburger:hover {
    background: #f0f8e8;
    border-color: #c4dfa8;
    color: #2d5016;
  }

  .adm-logo-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .adm-logo-img {
    border-radius: 8px;
    object-fit: contain;
  }
  .adm-logo-texts {}
  .adm-logo-name {
    font-family: 'DM Serif Display', serif;
    font-size: 15px;
    color: #1a2414;
    line-height: 1.1;
  }
  .adm-logo-tag {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #a0a89a;
    line-height: 1;
    margin-top: 1px;
  }

  /* ── SEPARATOR ── */
  .adm-sep {
    width: 1px;
    height: 24px;
    background: #e4e8dc;
    flex-shrink: 0;
  }

  /* ── PAGE LABEL ── */
  .adm-page-label {
    font-size: 12px;
    font-weight: 500;
    color: #a0a89a;
    letter-spacing: 0.3px;
    display: none;
  }
  @media (min-width: 640px) {
    .adm-page-label { display: block; }
  }

  /* ── RIGHT ── */
  .adm-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Status pill */
  .adm-status-pill {
    display: none;
    align-items: center;
    gap: 6px;
    background: #f0f8e8;
    border: 1px solid #c4dfa8;
    border-radius: 20px;
    padding: 5px 12px 5px 8px;
  }
  @media (min-width: 640px) {
    .adm-status-pill { display: flex; }
  }
  .adm-status-dot {
    width: 6px; height: 6px;
    background: #4a8a28;
    border-radius: 50%;
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
  }
  .adm-status-text {
    font-size: 11px;
    font-weight: 600;
    color: #2d5016;
    letter-spacing: 0.3px;
  }

  /* Avatar + email */
  .adm-user-wrap {
    display: none;
    align-items: center;
    gap: 8px;
    padding: 5px 12px 5px 6px;
    border-radius: 20px;
    background: #fafbf8;
    border: 1px solid #edf0e8;
    transition: all 0.15s;
    cursor: default;
  }
  .adm-user-wrap:hover {
    background: #f4f8ee;
    border-color: #d4e8bc;
  }
  @media (min-width: 768px) {
    .adm-user-wrap { display: flex; }
  }
  .adm-avatar {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, #4a8a28, #a3c47a);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(74,138,40,0.25);
    text-transform: uppercase;
  }
  .adm-user-email {
    font-size: 12px;
    font-weight: 500;
    color: #5a6452;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Logout button */
  .adm-logout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1px solid #e4e8dc;
    border-radius: 10px;
    padding: 8px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #5a6452;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }
  .adm-logout-btn:hover {
    background: #fff0f0;
    border-color: #fca5a5;
    color: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220,38,38,0.1);
  }
  .adm-logout-btn:active {
    transform: translateY(0);
  }
  .adm-logout-icon {
    font-size: 13px;
    transition: transform 0.15s;
  }
  .adm-logout-btn:hover .adm-logout-icon {
    transform: translateX(2px);
  }
`;

const Header = ({ onToggleSidebar }) => {
  const { data, status } = useSession();

  const emailInitial = data?.user?.email?.[0]?.toUpperCase() || "A";
  const userEmail = data?.user?.email || "";

  return (
    <>
      <style>{styles}</style>
      <header className="adm-header">

        {/* ── LEFT ── */}
        <div className="adm-left">

          {/* Hamburger — mobile only */}
          <button
            className="adm-hamburger md:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>

          {/* Logo */}
          <div className="adm-logo-wrap">
            <Image
              src="/images/logo/logo.png"
              width={34}
              height={34}
              alt="Arenq logo"
              className="adm-logo-img"
            />
            <div className="adm-logo-texts">
              <p className="adm-logo-name">Arenq</p>
              <p className="adm-logo-tag">Admin Panel</p>
            </div>
          </div>

          <div className="adm-sep" />

          <span className="adm-page-label">Dashboard</span>

        </div>

        {/* ── RIGHT ── */}
        {status === "authenticated" && (
          <div className="adm-right">

            {/* Live status */}
            <div className="adm-status-pill">
              <span className="adm-status-dot" />
              <span className="adm-status-text">Live</span>
            </div>

            {/* User pill */}
            <div className="adm-user-wrap">
              <div className="adm-avatar">{emailInitial}</div>
              <span className="adm-user-email">{userEmail}</span>
            </div>

            {/* Logout */}
            <button className="adm-logout-btn" onClick={() => signOut()}>
              <span className="adm-logout-icon">→</span>
              Logout
            </button>

          </div>
        )}

      </header>
    </>
  );
};

export default Header;