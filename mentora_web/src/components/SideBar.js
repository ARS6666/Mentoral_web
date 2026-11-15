import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  CalendarDays,
  Bot,
  BarChart3,
  UserCircle2,
  BookMarked,
  ClipboardCheck,
  Hourglass,
  X,
  TextIcon,
  ShoppingBasket,
  NotebookTabs,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import SideAd from "./SideAd";
import SideAd2 from "./SideAd2";

export default function AppSidebar({ open, onClose }) {
  const { profile } = useApp();
  const isAdmin = Boolean(profile?.isAdmin);
  const isPremium = Boolean(profile?.subscriptionActive);
  useEffect(() => {
    if (window.innerWidth < 992) {
      document.body.style.overflow = open ? "hidden" : "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const menuItems = [
    { key: "/home", label: "خانه", icon: <House size={18} /> },
    {
      key: "/today",
      label: "برنامه امروز",
      icon: <ClipboardCheck size={18} />,
    },
    {
      key: "/planningassistant",
      label: "برنامه‌ریزی",
      icon: <CalendarDays size={18} />,
    },
    { key: "/tutor", label: "مربی هوشمند", icon: <Bot size={18} /> },
    {
      key: "/practice",
      label: "تمرین و آزمون",
      icon: <BookMarked size={18} />,
    },
    { key: "/reports", label: "گزارش‌ها", icon: <BarChart3 size={18} /> },
    { key: "/exams", label: "نهایی", icon: <NotebookTabs size={18} /> },
    { key: "/focustimer", label: "تایمر فوکوس", icon: <Hourglass size={18} /> },
    { key: "/blog", label: "بلاگ", icon: <TextIcon size={18} /> },
    {
      key: "/subscription",
      label: "اشتراک",
      icon: <ShoppingBasket size={18} />,
    },
    ...(isAdmin
      ? [
          {
            key: "/admin-console",
            label: "کنسول ادمین",
            icon: <ShieldCheck size={18} />,
          },
        ]
      : []),
    { key: "/profile", label: "پروفایل", icon: <UserCircle2 size={18} /> },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 992) {
      onClose?.();
    }
  };

  return (
    <>
      <style>
        {`
        .app-sidebar {
          direction: rtl;
          font-family: 'Vazir', 'Vazirmatn', system-ui, -apple-system, sans-serif;
          background: #182523;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), padding 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @media (min-width: 992px) {
          .app-sidebar {
            width: var(--sidebar-width);
            min-height: 100vh;
            padding: var(--sidebar-padding);
            position: sticky; 
            top: 0;  
            height: 100vh;
            z-index: 1020;
          }
        }

        @media (max-width: 991.98px) {
          .app-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 270px;
            height: 100vh;
            padding: 22px 18px;
            border-left: none;
            z-index: 2000;
            transform: translateX(100%);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            box-shadow: -10px 0 30px rgba(0, 0, 0, 0.35);
          }

          .app-sidebar.open {
            transform: translateX(0);
          }

          .app-sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(18, 26, 24, 0.6);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 1500;
          }
        }

        .app-sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          text-decoration: none;
          color: rgba(245, 246, 243, 0.72);
          background: transparent;
          font-size: 13.5px;
          font-weight: 700;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .app-sidebar-nav-item:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.07);
          transform: translateX(-2px);
        }

        .app-sidebar-nav-item.active {
          color: #FFFFFF;
          background: #3A8778;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(58, 135, 120, 0.35);
        }
        `}
      </style>

      {open && (
        <div className="app-sidebar-overlay d-lg-none" onClick={onClose} />
      )}

      <aside
        className={`app-sidebar ${open ? "open" : ""}`}
        style={{
          "--sidebar-width": open ? "260px" : "0px",
          "--sidebar-padding": open ? "20px 16px" : "0px",
        }}
      >
        <div
          style={{
            minWidth: "220px",
            opacity: open ? 1 : 0,
            transition: "opacity 0.2s ease",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Mobile Header in Drawer */}
          <div className="d-flex d-lg-none align-items-center justify-content-between mb-3">
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#FFFFFF",
                }}
              >
                منوی اصلی منتورا
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(245, 246, 243, 0.65)",
                  marginTop: "3px",
                }}
              >
                مسیرهای داشبورد
              </div>
            </div>
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose && onClose();
              }}
              aria-label="بستن منو"
              className="btn d-flex align-items-center justify-content-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#FFFFFF",
                padding: 0,
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Inspirational Micro-Card */}
          <div
            className="d-none d-lg-block text-center"
            style={{
              background: "#1F2E2A",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "12px 14px",
              marginBottom: "16px",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 800,
                color: "#E7F1EE",
                letterSpacing: "-0.2px",
              }}
            >
              مسیر موفقیت تو شروع شده ✨
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(245, 246, 243, 0.6)",
                marginTop: "3px",
              }}
            >
              مطالعه هوشمند و بابرنامه
            </div>
          </div>

          {/* Nav Items */}
          <div className="d-flex flex-column gap-1" style={{ flex: 1, overflowY: "auto" }}>
            {menuItems.map((item, i) => (
              <NavLink
                key={i}
                to={item.key}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `app-sidebar-nav-item ${isActive ? "active" : ""}`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </aside>

      <SideAd isSidebarOpen={open} isPremium={isPremium} />
      <SideAd2 isSidebarOpen={open} isPremium={isPremium} />
    </>
  );
}
