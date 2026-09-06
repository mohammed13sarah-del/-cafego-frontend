import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

import {
  FaCoffee, FaHome, FaStore, FaQuestionCircle, FaEnvelope,
  FaTimes, FaSignInAlt, FaUserPlus, FaRocket, FaSearch,
  FaShoppingCart, FaTruck, FaBolt, FaGift, FaMapMarkerAlt,
  FaCreditCard, FaStar, FaChartBar,
  FaFacebook, FaInstagram, FaTwitter,
  FaPhoneAlt, FaLock, FaCheckCircle, FaShieldAlt, FaFileAlt, FaScroll,
  FaThumbtack,
} from 'react-icons/fa';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose, navigate, user }) => {
  const role = user?.role || user?.Role;
  const [pinned, setPinned] = useState(() => localStorage.getItem('sidebar_pinned') === 'true');

  const handlePin = () => {
    const next = !pinned;
    setPinned(next);
    localStorage.setItem('sidebar_pinned', String(next));
  };

  const handleClose = () => { if (!pinned) onClose(); };

  const secondLink =
    role === 'Admin'     ? { label: 'لوحة التحكم',    icon: <FaChartBar size={16} />, path: '/admin/dashboard' } :
    role === 'CafeOwner' ? { label: 'داشبورد الكافيه', icon: <FaStore size={16} />,   path: '/owner/dashboard' } :
                           { label: 'تصفح الكافيهات', icon: <FaCoffee size={16} />,  path: '/home' };

  const links = [
    { label: 'الرئيسية',   icon: <FaHome size={16} />,           path: '/' },
    secondLink,
    { label: 'كيف يعمل؟',  icon: <FaQuestionCircle size={16} />, path: '#how-it-works' },
    ...(!user ? [{ label: 'انضم ككافيه', icon: <FaStore size={16} />, path: '/register' }] : []),
    { label: 'تواصل معنا', icon: <FaEnvelope size={16} />,       path: '#contact' },
  ];

  const handleNav = (path) => {
    if (path.startsWith('#')) {
      const el = document.querySelector(path);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else { navigate(path); }
    if (!pinned) onClose();
  };

  return (
    <>
      <div onClick={handleClose} style={{ position:'fixed', inset:0, zIndex:100, opacity:0, pointerEvents: isOpen && !pinned ? 'all' : 'none' }} />
      <div style={{ position:'fixed', top:0, right:0, height:'100vh', width:'280px', background:'linear-gradient(180deg,#1a110e 0%,#2d1b14 100%)', zIndex:101, transform:isOpen?'translateX(0)':'translateX(100%)', transition:'transform 0.35s cubic-bezier(0.4,0,0.2,1)', display:'flex', flexDirection:'column', direction:'rtl', boxShadow:'-8px 0 30px rgba(0,0,0,0.4)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 20px', borderBottom:'1px solid rgba(215,204,200,0.12)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'20px', fontWeight:'800', color:'#e8d5b0' }}>
            <FaCoffee size={20} color="#c8a882" /> Lavender
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button onClick={handlePin} title={pinned ? 'إلغاء التثبيت' : 'تثبيت القائمة'} style={{ background: pinned ? 'rgba(200,168,130,0.2)' : 'rgba(255,255,255,0.07)', border: pinned ? '1px solid rgba(200,168,130,0.4)' : 'none', color: pinned ? '#c8a882' : 'rgba(215,204,200,0.35)', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c8a882'}
              onMouseLeave={e => e.currentTarget.style.color = pinned ? '#c8a882' : 'rgba(215,204,200,0.35)'}>
              <FaThumbtack size={13} style={{ transform: pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'transform .2s' }} />
            </button>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'#d7ccc8', width:'36px', height:'36px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FaTimes size={14} />
            </button>
          </div>
        </div>
        <nav style={{ flex:1, padding:'16px 0' }}>
          {links.map((link, i) => (
            <div key={i} onClick={() => handleNav(link.path)} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 24px', cursor:'pointer', color:'#d7ccc8', fontSize:'15px', transition:'all 0.2s', borderRight:'3px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(215,204,200,0.08)'; e.currentTarget.style.borderRightColor='#c8a882'; e.currentTarget.style.color='#e8d5b0'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderRightColor='transparent'; e.currentTarget.style.color='#d7ccc8'; }}>
              <span style={{ opacity:0.8, display:'flex' }}>{link.icon}</span>
              <span style={{ fontWeight:'500' }}>{link.label}</span>
            </div>
          ))}
        </nav>
        {!user && (
          <div style={{ padding:'20px', borderTop:'1px solid rgba(215,204,200,0.12)', display:'flex', flexDirection:'column', gap:'10px' }}>
            <button onClick={() => { navigate('/login'); if (!pinned) onClose(); }} style={{ background:'transparent', color:'#d7ccc8', border:'1px solid rgba(215,204,200,0.4)', padding:'12px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <FaSignInAlt size={14} /> تسجيل الدخول
            </button>
            <button onClick={() => { navigate('/register'); if (!pinned) onClose(); }} style={{ background:'linear-gradient(135deg,#c8a882,#a0785a)', color:'#1a110e', border:'none', padding:'12px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'700', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <FaUserPlus size={14} /> إنشاء حساب جديد
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Login Guard Modal ────────────────────────────────────────────────────────
const LoginGuardModal = ({ onClose, navigate }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
    <div style={{ background:'#fff', borderRadius:'24px', padding:'44px 40px', maxWidth:'400px', width:'100%', textAlign:'center', direction:'rtl', boxShadow:'0 24px 80px rgba(0,0,0,0.25)', animation:'popIn 0.3s cubic-bezier(0.4,0,0.2,1)', position:'relative' }}>
      <button onClick={onClose} style={{ position:'absolute', top:16, left:16, background:'#f5f0eb', border:'none', width:32, height:32, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#7a6050' }}>
        <FaTimes size={12} />
      </button>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#c8a882,#a0785a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
        <FaLock size={30} color="#1a110e" />
      </div>
      <h2 style={{ fontSize:'22px', color:'#3e2723', fontWeight:'900', marginBottom:'10px' }}>تسجيل الدخول مطلوب</h2>
      <p style={{ color:'#7a6050', fontSize:'14px', lineHeight:'1.8', marginBottom:'28px' }}>
        لتتمكن من تصفح المنيو وتقديم الطلبات، يرجى تسجيل الدخول أولاً.
      </p>
      <div style={{ display:'flex', gap:'12px', justifyContent:'center' }}>
        <button onClick={() => navigate('/login')} style={{ background:'linear-gradient(135deg,#3e2723,#6d4c41)', color:'#fff', border:'none', padding:'12px 28px', borderRadius:'12px', cursor:'pointer', fontSize:'14px', fontWeight:'700', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'8px' }}>
          <FaSignInAlt size={13} /> تسجيل الدخول
        </button>
        <button onClick={onClose} style={{ background:'#f5f0eb', color:'#6d4c41', border:'none', padding:'12px 22px', borderRadius:'12px', cursor:'pointer', fontSize:'14px', fontFamily:'inherit' }}>
          لاحقاً
        </button>
      </div>
    </div>
  </div>
);

// ─── Policy Modal ─────────────────────────────────────────────────────────────
const PolicyModal = ({ type, onClose }) => {
  const content = {
    privacy: {
      title: 'سياسة الخصوصية',
      icon: <FaShieldAlt size={28} color="#c8a882" />,
      sections: [
        { title: 'المعلومات التي نجمعها', body: 'نجمع المعلومات التي تقدمها عند التسجيل مثل الاسم والبريد الإلكتروني ورقم الهاتف والعنوان، بالإضافة إلى بيانات الطلبات وتفضيلاتك داخل المنصة.' },
        { title: 'كيف نستخدم معلوماتك', body: 'تُستخدم بياناتك لمعالجة طلباتك، وتحسين تجربتك، وإرسال تحديثات الطلبات، وتقديم الدعم الفني. لن نبيع بياناتك لأي طرف ثالث.' },
        { title: 'حماية البيانات', body: 'نطبق معايير أمنية عالية لحماية بياناتك. جميع البيانات مشفرة أثناء النقل والتخزين.' },
        { title: 'حقوقك', body: 'يحق لك الاطلاع على بياناتك أو تعديلها أو طلب حذفها في أي وقت عبر التواصل معنا.' },
      ]
    },
    terms: {
      title: 'الشروط والأحكام',
      icon: <FaScroll size={28} color="#c8a882" />,
      sections: [
        { title: 'قبول الشروط', body: 'باستخدامك لمنصة Lavender فإنك توافق على هذه الشروط والأحكام. إذا لم توافق على أي بند، يُرجى التوقف عن استخدام المنصة.' },
        { title: 'استخدام المنصة', body: 'يُلزم المستخدم باستخدام المنصة للأغراض المشروعة فقط، وعدم محاولة اختراق النظام أو التلاعب بالبيانات.' },
        { title: 'الطلبات والمدفوعات', body: 'جميع الطلبات المقدمة عبر المنصة ملزمة. يحق للكافيه رفض الطلب في حالات استثنائية مع إعادة المبلغ كاملاً.' },
        { title: 'تعديل الشروط', body: 'تحتفظ Lavender بحق تعديل هذه الشروط في أي وقت مع إشعار المستخدمين مسبقاً.' },
      ]
    },
    usage: {
      title: 'سياسة الاستخدام',
      icon: <FaFileAlt size={28} color="#c8a882" />,
      sections: [
        { title: 'الاستخدام المقبول', body: 'المنصة مخصصة لطلب المشروبات والوجبات من الكافيهات المسجلة فقط. أي استخدام خارج هذا النطاق غير مسموح.' },
        { title: 'حساب المستخدم', body: 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك. في حال الاشتباه بأي نشاط غير مصرح به، يُرجى إبلاغنا فوراً.' },
        { title: 'المحتوى المحظور', body: 'يُحظر نشر أي محتوى مسيء أو مضلل في التقييمات والتعليقات. سيتم حذف أي محتوى مخالف وقد يُوقف الحساب.' },
        { title: 'الإبلاغ عن المشكلات', body: 'في حال واجهت أي مشكلة تقنية أو محتوى مخالف، يُرجى التواصل معنا عبر قسم الدعم الفني.' },
      ]
    }
  };

  const c = content[type];
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'#fff', borderRadius:'22px', width:'580px', maxWidth:'100%', maxHeight:'85vh', overflow:'hidden', direction:'rtl', boxShadow:'0 30px 80px rgba(0,0,0,0.22)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'28px 30px 20px', borderBottom:'1px solid #ede0d4', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:50, height:50, borderRadius:14, background:'#f5ede0', display:'flex', alignItems:'center', justifyContent:'center' }}>{c.icon}</div>
            <div>
              <h2 style={{ fontSize:17, fontWeight:900, color:'#3e2723', margin:0 }}>{c.title}</h2>
              <p style={{ fontSize:11, color:'#a0785a', margin:0, marginTop:3 }}>Lavender — آخر تحديث 2026</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#f5f0eb', border:'none', width:34, height:34, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#7a6050' }}>
            <FaTimes size={13} />
          </button>
        </div>
        <div style={{ overflowY:'auto', padding:'24px 30px 30px' }}>
          {c.sections.map((s, i) => (
            <div key={i} style={{ marginBottom:22 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#c8a882', flexShrink:0 }} />
                <h3 style={{ fontSize:14, fontWeight:800, color:'#3e2723', margin:0 }}>{s.title}</h3>
              </div>
              <p style={{ fontSize:13, color:'#6d4c41', lineHeight:1.85, margin:0, paddingRight:14 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <div style={{ padding:'16px 30px', borderTop:'1px solid #ede0d4', flexShrink:0 }}>
          <button onClick={onClose} style={{ width:'100%', background:'linear-gradient(135deg,#c8a882,#a0785a)', color:'#1a110e', border:'none', padding:12, borderRadius:12, cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:800 }}>
            فهمت، شكراً
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Landing Page ─────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [showLoginGuard, setShowLoginGuard] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const [policyModal,    setPolicyModal]    = useState(null);
  const [supportSettings, setSupportSettings] = useState({
    supportPhone: '+970 59 000 0000',
    supportEmail: 'support@lavender.ps',
  });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    api.get('/Settings').then(res => {
      const d = res.data?.data ?? res.data;
      if (d) setSupportSettings(prev => ({ ...prev, ...d }));
    }).catch(() => {});
  }, []);

  const staticCafes = [
    { name: 'فانيلا كافيه',   city: 'سلواد',   desc: 'مشروبات ساخنة وباردة مميزة',   rating: 4.8 },
    { name: 'Al Rayhan Cafe', city: 'رام الله', desc: 'أجواء هادئة ومشروبات فاخرة',   rating: 4.7 },
    { name: 'Coffee House',   city: 'رام الله', desc: 'Cozy place for work and study', rating: 4.9 },
    { name: 'Corner Cafe',    city: 'رام الله', desc: 'Cozy place for work and study', rating: 4.6 },
  ];

  const handleOrderNow = () => {
    if (!user) setShowLoginGuard(true);
    else navigate('/home');
  };

  const steps = [
    { icon: <FaSearch size={36} color="#c8a882" />,       title: 'اختر كافيهك',  desc: 'تصفح بين الكافيهات المتاحة في منطقتك مرتبة حسب التقييم والمسافة' },
    { icon: <FaShoppingCart size={36} color="#c8a882" />, title: 'أضف للسلة',    desc: 'اختر مشروباتك ووجباتك من المنيو وخصص طلبك بحسب ذوقك' },
    { icon: <FaTruck size={36} color="#c8a882" />,        title: 'تابع توصيلك', desc: 'تتبع طلبك لحظة بلحظة من الكافيه حتى يصل إلى بابك' },
  ];

  const features = [
    { icon: <FaBolt size={32} color="#c8a882" />,         title: 'توصيل سريع',      desc: 'نتابع طلبك من لحظة التحضير حتى الوصول لبابك' },
    { icon: <FaGift size={32} color="#c8a882" />,          title: 'كوبونات وخصومات', desc: 'استمتع بعروض حصرية وكوبونات خصم من كافيهاتك المفضلة' },
    { icon: <FaMapMarkerAlt size={32} color="#c8a882" />, title: 'تتبع فوري',        desc: 'اعرف أين طلبك في كل لحظة عبر نظام تتبع ذكي' },
    { icon: <FaCreditCard size={32} color="#c8a882" />,   title: 'دفع آمن',          desc: 'ادفع بالكاش أو البطاقة البنكية بكل أمان وسهولة' },
  ];

  const footerLinks = [
    { label: 'الرئيسية',        action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'تصفح الكافيهات', action: () => { if (!user) setShowLoginGuard(true); else navigate('/home'); } },
    { label: 'كيف يعمل؟',       action: () => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'تواصل معنا',      action: () => navigate('/support', { state: { scrollTo: 'contact-form' } }) },
  ];

  const cafeLinks = [
    { label: 'انضم ككافيه',    action: () => navigate('/register') },
    { label: 'شروط الانضمام', action: () => navigate('/terms-of-joining') },
    { label: 'الدعم الفني',    action: () => navigate('/support', { state: { scrollTo: 'complaint-form' } }) },
  ];

  const policyLinks = [
    { label: 'سياسة الخصوصية',  key: 'privacy', icon: <FaShieldAlt size={12} /> },
    { label: 'سياسة الاستخدام', key: 'usage',   icon: <FaFileAlt size={12} /> },
    { label: 'الشروط والأحكام', key: 'terms',   icon: <FaScroll size={12} /> },
  ];

  return (
    <div style={{ direction:'rtl', fontFamily:"'Cairo','Tajawal',sans-serif", backgroundColor:'#fcfaf8', minHeight:'100vh', overflowX:'hidden', marginRight: sidebarOpen ? '280px' : '0', transition: 'margin-right 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.88)}      to{opacity:1;transform:scale(1)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .hero-icon{animation:float 3.5s ease-in-out infinite}
        .fade-up-1{animation:fadeUp 0.7s ease both}
        .fade-up-2{animation:fadeUp 0.7s 0.15s ease both}
        .fade-up-3{animation:fadeUp 0.7s 0.3s ease both}
        .cafe-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(62,39,35,0.15)!important}
        .feature-card:hover{background:#fff!important;box-shadow:0 8px 24px rgba(62,39,35,0.12)!important}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(62,39,35,0.35)!important}
        .btn-outline:hover{background:rgba(255,255,255,0.12)!important}
        .footer-link:hover{color:#e8d5b0!important;cursor:pointer}
        .policy-link:hover{color:#c8a882!important;text-decoration:underline!important;cursor:pointer}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="landing-nav" style={{ position:'sticky', top:0, zIndex:50, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 48px', height:'68px', background:scrolled?'rgba(26,17,14,0.97)':'#1a110e', backdropFilter:'blur(12px)', boxShadow:scrolled?'0 4px 20px rgba(0,0,0,0.3)':'none', transition:'all 0.3s ease' }}>
        <div onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'22px', fontWeight:'900', color:'#e8d5b0', cursor:'pointer' }}>
          <FaCoffee size={22} color="#c8a882" /> Lavender
        </div>
        <div className="landing-nav-actions" style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {!user && (
            <>
              <button onClick={() => navigate('/login')} className="btn-outline" style={{ background:'transparent', color:'#d7ccc8', border:'1px solid rgba(215,204,200,0.35)', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'7px', transition:'all 0.2s' }}>
                <FaSignInAlt size={13} /> دخول
              </button>
              <button onClick={() => navigate('/register')} style={{ background:'linear-gradient(135deg,#c8a882,#a0785a)', color:'#1a110e', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'700', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'7px' }}>
                <FaUserPlus size={13} /> حساب جديد
              </button>
            </>
          )}
          <button onClick={() => setSidebarOpen(true)} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(215,204,200,0.2)', color:'#d7ccc8', width:'42px', height:'42px', borderRadius:'10px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'5px', transition:'all 0.2s' }}>
            <div style={{ width:'20px', height:'2px', background:'#d7ccc8', borderRadius:'2px' }} />
            <div style={{ width:'14px', height:'2px', background:'#d7ccc8', borderRadius:'2px' }} />
            <div style={{ width:'20px', height:'2px', background:'#d7ccc8', borderRadius:'2px' }} />
          </button>
        </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} navigate={navigate} user={user} />
      {showLoginGuard && <LoginGuardModal onClose={() => setShowLoginGuard(false)} navigate={navigate} />}
      {policyModal && <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />}

      {/* ── HERO ── */}
      <section className="landing-hero" style={{ minHeight:'90vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(160deg,#1a110e 0%,#2d1b14 45%,#3e2723 100%)', padding:'60px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'rgba(200,168,130,0.05)', top:'-100px', left:'-100px', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(200,168,130,0.06)', bottom:'-60px', right:'10%', pointerEvents:'none' }} />
        <div style={{ maxWidth:'780px', position:'relative', zIndex:1 }}>
          <div className="hero-icon" style={{ marginBottom:'28px', display:'flex', justifyContent:'center' }}>
            <FaCoffee size={90} color="#c8a882" />
          </div>
          <h1 className="fade-up-1 landing-hero-title" style={{ fontSize:'clamp(36px,6vw,60px)', fontWeight:'900', color:'#e8d5b0', lineHeight:'1.25', marginBottom:'20px' }}>
            قهوتك المفضلة،<br /><span style={{ color:'#c8a882' }}>بضغطة واحدة</span>
          </h1>
          <p className="fade-up-2" style={{ fontSize:'clamp(16px,2vw,20px)', color:'#bcaaa4', lineHeight:'1.85', marginBottom:'40px', maxWidth:'600px', margin:'0 auto 40px' }}>
            اكتشف أفضل الكافيهات في مدينتك، تصفح المنيو، واطلب مشروبك أو وجبتك المفضلة.
            نظام <strong style={{ color:'#e8d5b0' }}>Lavender</strong> يوفر لك تجربة استثنائية مع تتبع ذكي لطلباتك.
          </p>
          <div className="fade-up-3 landing-hero-btns" style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn-primary" onClick={handleOrderNow} style={{ background:'linear-gradient(135deg,#c8a882,#a0785a)', color:'#1a110e', border:'none', padding:'16px 44px', borderRadius:'50px', cursor:'pointer', fontSize:'17px', fontWeight:'800', fontFamily:'inherit', boxShadow:'0 6px 20px rgba(200,168,130,0.35)', transition:'all 0.25s ease', display:'flex', alignItems:'center', gap:'10px' }}>
              <FaRocket size={17} /> ابدأ الطلب الآن
            </button>
            <button className="btn-outline" onClick={() => navigate('/register')} style={{ background:'rgba(255,255,255,0.06)', color:'#e8d5b0', border:'1px solid rgba(232,213,176,0.3)', padding:'16px 36px', borderRadius:'50px', cursor:'pointer', fontSize:'17px', fontFamily:'inherit', transition:'all 0.25s ease', display:'flex', alignItems:'center', gap:'10px' }}>
              <FaStore size={17} /> انضم ككافيه
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding:'90px 24px', background:'#fff8f2' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', textAlign:'center' }}>
          <p style={{ color:'#c8a882', fontWeight:'700', fontSize:'13px', letterSpacing:'3px', marginBottom:'10px', textTransform:'uppercase' }}>كيف يعمل؟</p>
          <h2 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:'900', color:'#3e2723', marginBottom:'56px' }}>ثلاث خطوات بسيطة</h2>
          <div className="landing-steps" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'28px' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:'20px', padding:'36px 28px', boxShadow:'0 4px 16px rgba(62,39,35,0.08)', position:'relative', border:'1px solid rgba(200,168,130,0.2)' }}>
                <div style={{ position:'absolute', top:'-16px', right:'28px', background:'linear-gradient(135deg,#c8a882,#a0785a)', color:'#1a110e', width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'14px' }}>{i+1}</div>
                <div style={{ marginBottom:'18px', display:'flex', justifyContent:'center' }}>{step.icon}</div>
                <h3 style={{ fontSize:'19px', fontWeight:'800', color:'#3e2723', marginBottom:'10px' }}>{step.title}</h3>
                <p style={{ color:'#6d4c41', fontSize:'14px', lineHeight:'1.75' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CAFES ── */}
      <section style={{ padding:'90px 24px', background:'#fcfaf8' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'56px' }}>
            <p style={{ color:'#c8a882', fontWeight:'700', fontSize:'13px', letterSpacing:'3px', marginBottom:'10px' }}>أبرز الكافيهات</p>
            <h2 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:'900', color:'#3e2723' }}>اكتشف الأفضل بالقرب منك</h2>
          </div>
          <div className="landing-cafes" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:'24px' }}>
            {staticCafes.map((cafe, i) => (
              <div key={i} className="cafe-card" onClick={handleOrderNow} style={{ background:'#fff', borderRadius:'18px', padding:'28px 22px', boxShadow:'0 4px 16px rgba(62,39,35,0.08)', cursor:'pointer', border:'1px solid rgba(200,168,130,0.15)', transition:'all 0.3s ease', textAlign:'center' }}>
                <div style={{ background:'#fff8f2', borderRadius:'14px', padding:'16px', display:'inline-flex', marginBottom:'14px' }}>
                  <FaCoffee size={32} color="#c8a882" />
                </div>
                <h3 style={{ fontSize:'17px', fontWeight:'800', color:'#3e2723', marginBottom:'6px' }}>{cafe.name}</h3>
                <p style={{ color:'#a0785a', fontSize:'13px', marginBottom:'16px' }}>{cafe.desc}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'13px', color:'#6d4c41', display:'flex', alignItems:'center', gap:'5px' }}>
                    <FaMapMarkerAlt size={11} color="#a0785a" /> {cafe.city}
                  </span>
                  <span style={{ background:'linear-gradient(135deg,#c8a882,#a0785a)', color:'#1a110e', padding:'4px 10px', borderRadius:'20px', fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', gap:'4px' }}>
                    <FaStar size={11} /> {cafe.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'40px' }}>
            <button onClick={handleOrderNow} style={{ background:'transparent', color:'#3e2723', border:'2px solid #3e2723', padding:'12px 36px', borderRadius:'50px', cursor:'pointer', fontSize:'15px', fontWeight:'700', fontFamily:'inherit', transition:'all 0.2s', display:'inline-flex', alignItems:'center', gap:'8px' }}
              onMouseEnter={e => { e.currentTarget.style.background='#3e2723'; e.currentTarget.style.color='#e8d5b0'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#3e2723'; }}>
              <FaStore size={14} /> عرض كل الكافيهات
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding:'90px 24px', background:'#fff8f2' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', textAlign:'center' }}>
          <p style={{ color:'#c8a882', fontWeight:'700', fontSize:'13px', letterSpacing:'3px', marginBottom:'10px' }}>لماذا Lavender؟</p>
          <h2 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:'900', color:'#3e2723', marginBottom:'56px' }}>تجربة مختلفة في كل مرة</h2>
          <div className="landing-features" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:'24px' }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ background:'#fffaf6', borderRadius:'18px', padding:'32px 22px', border:'1px solid rgba(200,168,130,0.2)', boxShadow:'0 2px 8px rgba(62,39,35,0.05)', transition:'all 0.3s ease' }}>
                <div style={{ marginBottom:'16px', display:'flex', justifyContent:'center' }}>{f.icon}</div>
                <h3 style={{ fontSize:'17px', fontWeight:'800', color:'#3e2723', marginBottom:'8px' }}>{f.title}</h3>
                <p style={{ color:'#6d4c41', fontSize:'14px', lineHeight:'1.7' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN AS CAFE OWNER ── */}
      <section style={{ padding:'90px 24px', background:'linear-gradient(135deg,#1a110e 0%,#3e2723 100%)', textAlign:'center' }}>
        <div style={{ maxWidth:'700px', margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
            <FaStore size={52} color="#c8a882" />
          </div>
          <h2 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:'900', color:'#e8d5b0', marginBottom:'16px' }}>
            صاحب كافيه؟ وسّع نطاق عملك معنا
          </h2>
          <p style={{ color:'#bcaaa4', fontSize:'16px', lineHeight:'1.8', marginBottom:'36px' }}>
            انضم لمنصتنا واحصل على لوحة تحكم كاملة لإدارة منيو، طلباتك، ومبيعاتك — كل شيء في مكان واحد.
          </p>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ background:'linear-gradient(135deg,#c8a882,#a0785a)', color:'#1a110e', border:'none', padding:'16px 44px', borderRadius:'50px', cursor:'pointer', fontSize:'17px', fontWeight:'800', fontFamily:'inherit', boxShadow:'0 6px 20px rgba(200,168,130,0.3)', transition:'all 0.25s ease', display:'inline-flex', alignItems:'center', gap:'10px' }}>
            <FaCheckCircle size={17} /> سجّل كافيهك الآن
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="landing-footer" style={{ background:'#110b09', color:'#8d6e63', padding:'60px 48px 0' }}>
        <div className="landing-footer-grid" style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', flexWrap:'wrap', gap:'40px', paddingBottom:'48px', borderBottom:'1px solid rgba(141,110,99,0.15)', justifyContent:'space-between' }}>
          <div style={{ minWidth:180, flex:'1 1 180px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'20px', fontWeight:'900', color:'#e8d5b0', marginBottom:'14px' }}>
              <FaCoffee size={20} color="#c8a882" /> Lavender
            </div>
            <p style={{ fontSize:'13px', lineHeight:'1.8', color:'#6d4c41' }}>
              بوابتك السريعة لألذ المشروبات والحلويات. نربط بين الزبون والكافيه بسلاسة.
            </p>
          </div>
          <div style={{ minWidth:130, flex:'1 1 130px' }}>
            <h4 style={{ color:'#c8a882', fontSize:'14px', fontWeight:'700', marginBottom:'16px' }}>روابط سريعة</h4>
            {footerLinks.map((l, i) => (
              <p key={i} className="footer-link" onClick={l.action} style={{ marginBottom:'9px', fontSize:'13px', color:'#8d6e63', transition:'color 0.2s' }}>{l.label}</p>
            ))}
          </div>
          <div style={{ minWidth:150, flex:'1 1 150px' }}>
            <h4 style={{ color:'#c8a882', fontSize:'14px', fontWeight:'700', marginBottom:'16px' }}>سياسات الموقع</h4>
            {policyLinks.map((l, i) => (
              <p key={i} className="policy-link" onClick={() => setPolicyModal(l.key)} style={{ marginBottom:'10px', fontSize:'13px', color:'#8d6e63', transition:'color 0.2s', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'#a0785a' }}>{l.icon}</span> {l.label}
              </p>
            ))}
          </div>
          <div style={{ minWidth:130, flex:'1 1 130px' }}>
            <h4 style={{ color:'#c8a882', fontSize:'14px', fontWeight:'700', marginBottom:'16px' }}>للكافيهات</h4>
            {cafeLinks.map((l, i) => (
              <p key={i} className="footer-link" onClick={l.action} style={{ marginBottom:'9px', fontSize:'13px', color:'#8d6e63', transition:'color 0.2s' }}>{l.label}</p>
            ))}
          </div>
          <div style={{ minWidth:200, flex:'1 1 200px' }}>
            <h4 style={{ color:'#c8a882', fontSize:'14px', fontWeight:'700', marginBottom:'16px' }}>تواصل معنا</h4>
            <p style={{ fontSize:'13px', marginBottom:'9px', display:'flex', alignItems:'center', gap:'8px' }}>
              <FaEnvelope size={12} color="#a0785a" /> {supportSettings.supportEmail}
            </p>
            <p style={{ fontSize:'13px', marginBottom:'9px', display:'flex', alignItems:'center', gap:'8px' }}>
              <FaPhoneAlt size={12} color="#a0785a" /> {supportSettings.supportPhone}
            </p>
            <p style={{ fontSize:'13px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
              <FaMapMarkerAlt size={12} color="#a0785a" /> رام الله، فلسطين 🇵🇸
            </p>
            <div style={{ display:'flex', gap:'8px' }}>
              {[<FaFacebook size={14} />, <FaInstagram size={14} />, <FaTwitter size={14} />].map((ic, i) => (
                <div key={i} style={{ width:'32px', height:'32px', background:'rgba(200,168,130,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#c8a882', border:'1px solid rgba(200,168,130,0.15)' }}>
                  {ic}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'20px 0', textAlign:'center', fontSize:'13px', color:'#5d4037' }}>
          © {new Date().getFullYear()} Lavender — جميع الحقوق محفوظة | مشروع التخرج
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;