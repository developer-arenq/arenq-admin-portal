import React, { useState } from "react";
import { BsHandbagFill } from "react-icons/bs";
import { FaPhotoVideo, FaRegStar, FaUsers } from "react-icons/fa";
import { MdCategory, MdDashboard, MdStickyNote2 } from "react-icons/md";
import { RiCouponFill } from "react-icons/ri";
import { SiBrandfolder } from "react-icons/si";
import Link from "next/link";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sb-aside {
    font-family: 'DM Sans', sans-serif;
    width: 270px;
    background: #ffffff;
    border-right: 1px solid #edf0e8;
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-shadow: 4px 0 24px rgba(45,80,22,0.05);
  }

  /* ── BRAND ── */
  .sb-brand {
    padding: 24px 22px 20px;
    border-bottom: 1px solid #f0f4ea;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .sb-brand-mark {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #4a8a28, #a3c47a);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(74,138,40,0.25);
    flex-shrink: 0;
  }
  .sb-brand-text {}
  .sb-brand-name {
    font-family: 'DM Serif Display', serif;
    font-size: 15px;
    color: #1a2414;
    line-height: 1.1;
    letter-spacing: 0.2px;
  }
  .sb-brand-sub {
    font-size: 10px;
    color: #a0a89a;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 1px;
  }

  /* ── SCROLL AREA ── */
  .sb-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px 12px 24px;
  }
  .sb-scroll::-webkit-scrollbar { width: 3px; }
  .sb-scroll::-webkit-scrollbar-track { background: transparent; }
  .sb-scroll::-webkit-scrollbar-thumb { background: #d4e0c8; border-radius: 4px; }

  /* ── SECTION LABEL ── */
  .sb-section-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: #c0c8b8;
    padding: 16px 12px 6px;
  }

  /* ── NAV ITEM ── */
  .sb-item {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 0;
    border-radius: 12px;
    margin-bottom: 2px;
    text-decoration: none;
    transition: all 0.15s ease;
    overflow: hidden;
    position: relative;
  }
  .sb-item-icon-wrap {
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 10px;
    font-size: 16px;
    margin: 5px 0 5px 6px;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .sb-item-label {
    flex: 1;
    font-size: 13.5px;
    font-weight: 500;
    padding: 11px 12px 11px 8px;
    transition: color 0.15s;
    white-space: nowrap;
  }
  .sb-item-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    margin-right: 10px;
    opacity: 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }

  /* DEFAULT state */
  .sb-item .sb-item-icon-wrap { background: transparent; color: #9aa090; }
  .sb-item .sb-item-label { color: #5a6452; }
  .sb-item .sb-item-dot { background: #a3c47a; }

  /* HOVER state */
  .sb-item:hover { background: #f4f8ee; }
  .sb-item:hover .sb-item-icon-wrap { background: #eaf4dc; color: #4a8a28; }
  .sb-item:hover .sb-item-label { color: #2d5016; }

  /* ACTIVE state */
  .sb-item.active { background: linear-gradient(135deg, #eaf4dc, #f0f8e8); }
  .sb-item.active .sb-item-icon-wrap { background: #4a8a28; color: #fff; box-shadow: 0 4px 12px rgba(74,138,40,0.3); }
  .sb-item.active .sb-item-label { color: #1c3a0d; font-weight: 600; }
  .sb-item.active .sb-item-dot { opacity: 1; }
  .sb-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 6px; bottom: 6px;
    width: 3px;
    background: #4a8a28;
    border-radius: 0 4px 4px 0;
  }

  /* ── DIVIDER ── */
  .sb-divider {
    height: 1px;
    background: #f0f4ea;
    margin: 10px 8px;
  }

  /* ── FOOTER ── */
  .sb-footer {
    padding: 14px 16px;
    border-top: 1px solid #f0f4ea;
    flex-shrink: 0;
  }
  .sb-footer-card {
    background: linear-gradient(135deg, #f0f8e8, #e8f4dc);
    border: 1px solid #d4e8bc;
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sb-footer-icon {
    font-size: 22px;
    flex-shrink: 0;
  }
  .sb-footer-text {}
  .sb-footer-title { font-size: 12px; font-weight: 600; color: #2d5016; margin-bottom: 1px; }
  .sb-footer-sub { font-size: 10px; color: #7a9460; }

  /* ── BACKDROP ── */
  .sb-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.2);
    backdrop-filter: blur(2px);
    z-index: 39;
    transition: opacity 0.3s;
  }

 /* ── RESPONSIVE ── */

.sb-wrapper {
  position: sticky;
  top: 60px;
  left: 0;
  z-index: 30;
  height: calc(100vh - 60px);
  flex-shrink: 0;
}

.sb-aside {
  width: 270px;
  height: calc(100vh - 60px);
  background: #fff;
  border-right: 1px solid #edf0e8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* MOBILE */
@media (max-width: 767px) {
  .sb-wrapper {
    position: fixed;
    top: 60px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sb-wrapper.open {
    transform: translateX(0);
  }
}
`;

const menuSections = [
  {
    label: "Main",
    items: [
      { href: "/", label: "Overview", icon: "📊", color: "#3b82f6" },
      { href: "/slider-manager", label: "Slider Manager", icon: "🖼️", color: "#8b5cf6" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/products", label: "Products", icon: "🛍️", color: "#f59e0b" },
      { href: "/orders", label: "Orders", icon: "📦", color: "#10b981" },
      { href: "/admin/abandoned-carts", label: "Abandoned Carts", icon: "🛒", color: "#ef4444" },
      { href: "/coupons", label: "Coupons", icon: "🎟️", color: "#ec4899" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/categories", label: "Categories", icon: "🗂️", color: "#f97316" },
      { href: "/brands", label: "Brands", icon: "🏷️", color: "#6366f1" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/blogs", label: "Blog", icon: "✍️", color: "#14b8a6" },
      { href: "/faqs", label: "FAQs", icon: "❓", color: "#84cc16" },
      { href: "/policies", label: "Policies", icon: "📋", color: "#64748b" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/users", label: "Users", icon: "👥", color: "#06b6d4" },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const [activeItem, setActiveItem] = useState("/");

  return (
    <>
      <style>{styles}</style>

      {/* Backdrop */}
      {isOpen && (
        <div className="sb-backdrop md:hidden" onClick={onClose} />
      )}

      {/* Sidebar wrapper */}
      <div className={`sb-wrapper ${isOpen ? "open" : ""}`}>
        <aside className="sb-aside">



          {/* ── SCROLLABLE MENU ── */}
          <div className="sb-scroll">
            {menuSections.map((section, si) => (
              <div key={section.label}>
                {si > 0 && <div className="sb-divider" />}
                <p className="sb-section-label">{section.label}</p>
                {section.items.map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`sb-item ${activeItem === href ? "active" : ""}`}
                    onClick={() => {
                      setActiveItem(href);
                      onClose();
                    }}
                  >
                    <div className="sb-item-icon-wrap">
                      <span style={{ fontSize: 17 }}>{icon}</span>
                    </div>
                    <span className="sb-item-label">{label}</span>
                    <span className="sb-item-dot" />
                  </Link>
                ))}
              </div>
            ))}
          </div>




        </aside>
      </div>
    </>
  );
};

export default Sidebar;