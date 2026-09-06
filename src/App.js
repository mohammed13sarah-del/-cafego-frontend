import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import api from './api';

import {
  FaCoffee, FaHome, FaStore, FaShoppingCart, FaClipboardList, FaUser,
  FaTachometerAlt, FaListAlt, FaBullhorn,
  FaUtensils, FaBox, FaTicketAlt, FaTruck, FaMapMarkerAlt, FaHistory,
  FaSignOutAlt, FaTimes, FaSearch, FaInfoCircle, FaPhoneAlt, FaUserShield,
  FaCog, FaThumbtack,
} from 'react-icons/fa';

import Login              from './components/Auth/Login';
import Register           from './components/Auth/Register';
import Home               from './components/Customers/Home';
import CafeMenu           from './components/Customers/CafeMenu';
import Cart               from './components/Customers/Cart';
import Checkout           from './components/Customers/Checkout';
import LandingPage        from './components/Customers/LandingPage';
import MyOrders           from './components/Customers/MyOrders';
import CustomerProfile    from './components/Customers/CustomerProfile';
import { ProfileAvatar }  from './components/Customers/CustomerProfile';

import CafeDashboard      from './components/CafeOwner/CafeDashboard';
import MenuManager        from './components/CafeOwner/MenuManager';
import OrdersManager      from './components/CafeOwner/OrdersManager';
import CafeOwnerProfile   from './components/CafeOwner/CafeOwnerProfile';
import InventoryManager   from './components/CafeOwner/InventoryManager';
import CafeSwitcher       from './components/CafeOwner/CafeSwitcher';

import AdminDashboard  from './components/Admin/AdminDashboard';
import AdminCafes      from './components/Admin/AdminCafes';
import AdminComplaints from './components/Admin/AdminComplaints';
import AdminSettings   from './components/Admin/AdminSettings';
import SupportPage     from './components/Customers/SupportPage';
import TermsOfJoining  from './components/Customers/TermsOfJoining';

import './styles/responsive.css';

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user?.loggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// ─── Avatar route per role ────────────────────────────────────────────────────
const avatarRoutes = {
  Customer:  '/profile',
  CafeOwner: '/owner/profile',
  Driver:    '/driver/deliveries',
  Admin:     '/admin/dashboard',
};

// ─── Sidebar Drawer ───────────────────────────────────────────────────────────
const SidebarDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [pinned, setPinned] = useState(() => localStorage.getItem('sidebar_pinned') === 'true');

  const handlePin = () => {
    const next = !pinned;
    setPinned(next);
    localStorage.setItem('sidebar_pinned', String(next));
  };

  const handleClose = () => { if (!pinned) onClose(); };

  useEffect(() => {
    if (user?.role !== 'Admin') return;
    const fetchCount = async () => {
      try {
        const res = await api.get('/Complaints');
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setComplaintsCount(data.filter(c => c.status?.toLowerCase() === 'pending').length);
      } catch { }
    };
    fetchCount();
  }, [user, isOpen]);

  const handleLogout = () => { logout(); navigate('/login'); onClose(); };
  const go = (path) => { navigate(path); if (!pinned) onClose(); };

  const customerLinks = [
    { path: '/',          icon: <FaHome size={16} />,          label: 'الرئيسية' },
    { path: '/home',      icon: <FaStore size={16} />,         label: 'تصفح الكافيهات' },
    { path: '/cart',      icon: <FaShoppingCart size={16} />,  label: 'سلة المشتريات' },
    { path: '/my-orders', icon: <FaClipboardList size={16} />, label: 'طلباتي' },
    { path: '/profile',   icon: <FaUser size={16} />,          label: 'بروفايلي' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard',  icon: <FaTachometerAlt size={16} />, label: 'لوحة التحكم' },
    { path: '/admin/cafes',      icon: <FaListAlt size={16} />,       label: 'إدارة الكافيهات' },
    { path: '/admin/complaints', icon: <FaBullhorn size={16} />,      label: 'الشكاوى والدعم', badge: complaintsCount },
    { path: '/admin/settings',   icon: <FaCog size={16} />,           label: 'الإعدادات العامة' },
  ];

  const cafeOwnerLinks = [
    { path: '/owner/dashboard', icon: <FaTachometerAlt size={16} />, label: 'داشبورد' },
    { path: '/owner/menu',      icon: <FaUtensils size={16} />,      label: 'إدارة المنيو' },
    { path: '/owner/orders',    icon: <FaClipboardList size={16} />, label: 'الطلبات' },
    { path: '/owner/inventory', icon: <FaBox size={16} />,           label: 'المخزون' },
    { path: '/owner/profile',   icon: <FaUser size={16} />,          label: 'بروفايلي' },
  ];

  const driverLinks = [
    { path: '/driver/deliveries', icon: <FaTruck size={16} />,        label: 'التوصيلات المتاحة' },
    { path: '/driver/active',     icon: <FaMapMarkerAlt size={16} />, label: 'الطلب الحالي' },
    { path: '/driver/history',    icon: <FaHistory size={16} />,      label: 'سجلي' },
  ];

  const userRole = user?.role || 'Customer';
  const links =
    userRole === 'Admin'     ? adminLinks     :
    userRole === 'CafeOwner' ? cafeOwnerLinks :
    userRole === 'Driver'    ? driverLinks    :
    customerLinks;

  const roleMap = {
    Admin:     { label: 'الإدارة العليا', icon: <FaUserShield size={11} /> },
    CafeOwner: { label: 'صاحب الكافيه',   icon: <FaStore size={11} /> },
    Driver:    { label: 'السائق',          icon: <FaTruck size={11} /> },
    Customer:  { label: 'الزبون',          icon: <FaUser size={11} /> },
  };
  const role = roleMap[userRole] || roleMap.Customer;

  return (
    <>
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        opacity: 0, pointerEvents: isOpen && !pinned ? 'all' : 'none',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(220px, 65vw)',
        background: 'linear-gradient(180deg, #1a110e 0%, #150d0b 100%)',
        zIndex: 1300,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', direction: 'rtl',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 18px', borderBottom: '1px solid rgba(215,204,200,0.1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 900, color: '#e8d5b0' }}>
              <FaCoffee size={19} color="#c8a882" /> Lavender
            </div>
            <div style={{ fontSize: 11, color: '#c8a882', marginTop: 5, background: 'rgba(200,168,130,0.12)', padding: '3px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {role.icon} {role.label}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={handlePin} title={pinned ? 'إلغاء التثبيت' : 'تثبيت القائمة'} style={{
              background: pinned ? 'rgba(200,168,130,0.2)' : 'rgba(255,255,255,0.07)',
              border: pinned ? '1px solid rgba(200,168,130,0.4)' : 'none',
              color: pinned ? '#c8a882' : 'rgba(215,204,200,0.35)',
              width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#c8a882'}
            onMouseLeave={e => e.currentTarget.style.color = pinned ? '#c8a882' : 'rgba(215,204,200,0.35)'}
            >
              <FaThumbtack size={13} style={{ transform: pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'transform .2s' }} />
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: '#d7ccc8', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaTimes size={13} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {links.map((link, i) => {
            const isActive = location.pathname === link.path;
            return (
              <div key={i} onClick={() => go(link.path)} style={{
                display: 'flex', alignItems: 'center', gap: 13,
                padding: '13px 20px', cursor: 'pointer',
                color: isActive ? '#1a110e' : '#d7ccc8',
                background: isActive ? 'linear-gradient(135deg, #c8a882, #a0785a)' : 'transparent',
                borderRadius: isActive ? '0 10px 10px 0' : '0',
                margin: isActive ? '2px 12px 2px 0' : '1px 0',
                transition: 'all 0.2s ease',
                fontSize: 15, fontWeight: isActive ? 700 : 400,
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(200,168,130,0.1)'; e.currentTarget.style.color = '#e8d5b0'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d7ccc8'; } }}>
                <span style={{ opacity: isActive ? 1 : 0.75, display: 'flex' }}>{link.icon}</span>
                <span style={{ flex: 1 }}>{link.label}</span>
                {link.badge !== undefined && (
                  <span style={{ background: link.badge > 0 ? '#c62828' : 'rgba(200,168,130,0.2)', color: link.badge > 0 ? '#fff' : '#a0785a', fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: 20, minWidth: 20, textAlign: 'center', transition: 'all 0.2s' }}>
                    {link.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 18px', borderTop: '1px solid rgba(215,204,200,0.1)', background: 'rgba(0,0,0,0.25)' }}>
          {user && (
            <div onClick={() => go(avatarRoutes[userRole] ?? '/')} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 12px', background: 'rgba(200,168,130,0.08)', borderRadius: 10, border: '1px solid rgba(200,168,130,0.15)', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,168,130,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,168,130,0.08)'}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #c8a882, #a0785a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaUser size={15} color="#1a110e" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#e8d5b0', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || 'مستخدم'}</div>
                <div style={{ color: '#8d6e63', fontSize: 11 }}>{user.role || ''}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{ width: '100%', background: 'linear-gradient(135deg, #b71c1c, #c62828)', color: '#fff', border: 'none', padding: 12, borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <FaSignOutAlt size={14} /> تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────
const MainLayout = ({ children, search, setSearch, filter, setFilter }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const fullscreenPages = ['/login', '/register', '/', '/support', '/terms-of-joining'];
  if (fullscreenPages.includes(location.pathname)) return <>{children}</>;

  const pageMeta = {
    '/home':             { label: 'تصفح الكافيهات',  icon: <FaStore size={13} /> },
    '/cart':             { label: 'سلة المشتريات',    icon: <FaShoppingCart size={13} /> },
    '/checkout':         { label: 'إتمام الطلب',       icon: <FaClipboardList size={13} /> },
    '/my-orders':        { label: 'طلباتي',           icon: <FaClipboardList size={13} /> },
    '/profile':          { label: 'بروفايلي',         icon: <FaUser size={13} /> },
    '/owner/dashboard':  { label: 'داشبورد الكافيه',  icon: <FaTachometerAlt size={13} /> },
    '/owner/menu':       { label: 'إدارة المنيو',      icon: <FaUtensils size={13} /> },
    '/owner/orders':     { label: 'الطلبات',           icon: <FaClipboardList size={13} /> },
    '/owner/inventory':  { label: 'المخزون',           icon: <FaBox size={13} /> },
    '/owner/profile':    { label: 'بروفايل الكافيه',  icon: <FaUser size={13} /> },
    '/admin/dashboard':  { label: 'لوحة الإدارة',     icon: <FaTachometerAlt size={13} /> },
    '/admin/cafes':      { label: 'إدارة الكافيهات',  icon: <FaListAlt size={13} /> },
    '/admin/complaints': { label: 'الشكاوى والدعم',    icon: <FaBullhorn size={13} /> },
    '/admin/settings':   { label: 'الإعدادات العامة', icon: <FaCog size={13} /> },
  };

  const meta = pageMeta[location.pathname] ||
    (location.pathname.includes('/cafe-menu/') ? { label: 'قائمة المنيو', icon: <FaUtensils size={13} /> } :
     location.pathname.includes('/admin')       ? { label: 'لوحة الإدارة', icon: <FaTachometerAlt size={13} /> } :
     { label: '', icon: null });

  const isOwnerPage = location.pathname.startsWith('/owner');

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      direction: 'rtl', fontFamily: "'Cairo', 'Tajawal', sans-serif",
      backgroundColor: '#f5f0eb', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        main::-webkit-scrollbar { width: 8px; }
        main::-webkit-scrollbar-track { background: #f5f0eb; border-radius: 10px; }
        main::-webkit-scrollbar-thumb { background: #c8a882; border-radius: 10px; }
        main::-webkit-scrollbar-thumb:hover { background: #a0785a; }

        /* ── Responsive Header ── */
        @media (max-width: 768px) {
          .app-header-meta { display: none !important; }
          .app-header-sep  { display: none !important; }
          .app-header-search { display: none !important; }
          .app-header { padding: 0 12px !important; height: 54px !important; }
          .app-main   { padding: 14px 12px !important; }
          .app-footer { padding: 10px 12px !important; flex-direction: column !important; gap: 4px !important; font-size: 11px !important; text-align: center !important; }
        }
        @media (max-width: 425px) {
          .app-header { padding: 0 8px !important; height: 50px !important; }
          .app-main   { padding: 10px 8px !important; }
          .app-footer { padding: 8px !important; font-size: 10px !important; }
        }
        @media (min-width: 1440px) {
          .app-main { padding: 36px 48px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="app-header" style={{
        backgroundColor: '#1c1917', padding: '0 24px', height: 64,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '2px solid #fbbf24', zIndex: 1100, flexShrink: 0,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        marginRight: sidebarOpen ? 'min(200px, 55vw)' : '0',
        transition: 'margin-right 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 0 }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 900, color: '#fbbf24', cursor: 'pointer', flexShrink: 0 }}>
            <FaCoffee size={19} color="#fbbf24" /> Lavender
          </div>
          <span className="app-header-sep" style={{ color: '#374151', flexShrink: 0 }}>|</span>
          <span className="app-header-meta" style={{ fontSize: 14, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {meta.icon} {meta.label}
          </span>

          {location.pathname === '/home' && (
            <div className="app-header-search" style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 420, flex: 1 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FaSearch size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                <input type="text" placeholder="ابحث عن كافيه..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 34px 8px 14px', borderRadius: 8, border: '1px solid #374151', fontSize: 14, background: '#2d2a28', color: '#fff', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              {[{ key: 'all', label: 'الكل' }, { key: 'open', label: 'المفتوحة' }].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: '8px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: filter === f.key ? '#fbbf24' : '#2d2a28', color: filter === f.key ? '#1c1917' : '#9ca3af' }}>{f.label}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {user?.role === 'CafeOwner' && isOwnerPage && <CafeSwitcher />}
          {user && user.role !== 'Admin' && (
            <ProfileAvatar size={36} userId={user?.id ?? user?.customerID} name={user?.name ?? user?.Name ?? ''} onClick={() => navigate(avatarRoutes[user.role] ?? '/')} />
          )}
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(251,191,36,0.25)', width: 42, height: 42, borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 2, background: '#fbbf24', borderRadius: 2 }} />
            <div style={{ width: 14, height: 2, background: '#fbbf24', borderRadius: 2 }} />
            <div style={{ width: 20, height: 2, background: '#fbbf24', borderRadius: 2 }} />
          </button>
        </div>
      </header>

      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main ── */}
      <main className="app-main" style={{
        flex: 1, overflowY: 'auto', padding: '28px 32px', direction: 'ltr',
        marginRight: sidebarOpen ? 'min(200px, 55vw)' : '0',
        transition: 'margin-right 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ direction: 'rtl' }}>
          {children}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer" style={{
        backgroundColor: '#fff', borderTop: '1px solid #e5e0da',
        padding: '12px 32px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: 13, color: '#5d4037', flexShrink: 0,
        marginRight: sidebarOpen ? 'min(200px, 55vw)' : '0',
        transition: 'margin-right 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaCoffee size={13} color="#a0785a" />
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
          <strong style={{ color: '#3e2723' }}> Lavender</strong>
          <span style={{ color: '#bcaaa4' }}>🇵🇸</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span onClick={() => setShowAbout(true)} style={{ cursor: 'pointer', color: '#8d6e63', display: 'flex', alignItems: 'center', gap: 5 }}>
            <FaInfoCircle size={13} /> حول النظام
          </span>
          <span style={{ color: '#d7ccc8' }}>•</span>
          <span onClick={() => navigate('/support')} style={{ cursor: 'pointer', color: '#8d6e63', display: 'flex', alignItems: 'center', gap: 5 }}>
            <FaPhoneAlt size={13} /> الدعم الفني
          </span>
        </div>
      </footer>

      {/* ── About Modal ── */}
      {showAbout && (
        <div onClick={() => setShowAbout(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 420, width: '100%', direction: 'rtl', fontFamily: "'Cairo',sans-serif", boxShadow: '0 24px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setShowAbout(false)} style={{ position: 'absolute', top: 16, left: 16, background: '#f5f0eb', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a6050' }}>
              <FaTimes size={12} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#3e2723,#6d4c41)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <FaCoffee size={28} color="#c8a882" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#3e2723', margin: '0 0 6px' }}>Lavender</h2>
              <p style={{ fontSize: 12, color: '#a0785a', margin: 0 }}>نظام إدارة وطلب الكافيهات الذكي</p>
            </div>
            {[
              { label: 'الإصدار',  value: 'v1.0.0 — 2026' },
              { label: 'النوع',    value: 'مشروع تخرج' },
              { label: 'التقنيات', value: 'React + ASP.NET Core' },
              { label: 'التواصل', value: 'support@lavender.ps' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid #f0e6de' : 'none' }}>
                <span style={{ fontSize: 13, color: '#a0785a', fontWeight: 700 }}>{item.label}</span>
                <span style={{ fontSize: 13, color: '#3e2723', fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
            <p style={{ textAlign: 'center', fontSize: 11, color: '#bcaaa4', marginTop: 20 }}>
              صُنع بـ ❤️ في فلسطين 🇵🇸
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── App Content ──────────────────────────────────────────────────────────────
function AppContent() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <MainLayout search={search} setSearch={setSearch} filter={filter} setFilter={setFilter}>
      <Routes>
        {/* Public */}
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<Login key="login" />} />
        <Route path="/register"      element={<Register key="register" />} />

        {/* Customer */}
        <Route path="/home"          element={<Home search={search} filter={filter} />} />
        <Route path="/cafe-menu/:id" element={<CafeMenu />} />
        <Route path="/cart"          element={<Cart />} />
        <Route path="/checkout"      element={<Checkout />} />
        <Route path="/my-orders"     element={<ProtectedRoute allowedRoles={['Customer']}><MyOrders /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute allowedRoles={['Customer']}><CustomerProfile /></ProtectedRoute>} />

        {/* Cafe Owner */}
        <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={['CafeOwner']}><CafeDashboard /></ProtectedRoute>} />
        <Route path="/owner/menu"      element={<ProtectedRoute allowedRoles={['CafeOwner']}><MenuManager /></ProtectedRoute>} />
        <Route path="/owner/orders"    element={<ProtectedRoute allowedRoles={['CafeOwner']}><OrdersManager /></ProtectedRoute>} />
        <Route path="/owner/profile"   element={<ProtectedRoute allowedRoles={['CafeOwner']}><CafeOwnerProfile /></ProtectedRoute>} />
        <Route path="/owner/inventory" element={<ProtectedRoute allowedRoles={['CafeOwner']}><InventoryManager /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard"  element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/cafes"      element={<ProtectedRoute allowedRoles={['Admin']}><AdminCafes /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['Admin']}><AdminComplaints /></ProtectedRoute>} />
        <Route path="/admin/settings"   element={<ProtectedRoute allowedRoles={['Admin']}><AdminSettings /></ProtectedRoute>} />

        {/* Redirects */}
        <Route path="/admin/users"      element={<Navigate to="/admin/cafes" replace />} />
        <Route path="/support"          element={<SupportPage />} />
        <Route path="/terms-of-joining" element={<TermsOfJoining />} />
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;