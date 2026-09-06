import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  FaCamera, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaEdit, FaSave, FaTimes, FaShoppingBag, FaStar, FaHeart,
  FaSignOutAlt, FaShieldAlt, FaChevronLeft,
  FaLock, FaSpinner, FaKey, FaEye, FaEyeSlash,
  FaCheckCircle, FaExclamationCircle, FaSync,
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';

// ─── localStorage keys ────────────────────────────────────────────────────────
const avatarKey  = (id) => `Lavender_avatar_${id ?? localStorage.getItem('Lavender_persistent_uid') ?? 'guest'}`;
const profileKey = (id) => `Lavender_profile_${id ?? localStorage.getItem('Lavender_persistent_uid') ?? 'guest'}`;

// ─── Toast notification ───────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <div style={{
    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 12,
    background: type === 'success' ? '#1b5e20' : '#b71c1c',
    color: '#fff', fontSize: 13, fontWeight: 700,
    boxShadow: '0 6px 24px rgba(0,0,0,.25)',
    fontFamily: "'Cairo',sans-serif",
    animation: 'slideUp .25s ease',
  }}>
    {type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
    {msg}
  </div>
);

// ─── Exported Avatar — used in navbar ────────────────────────────────────────
export const ProfileAvatar = ({ size = 38, onClick, userId, name }) => {
  const [src, setSrc] = useState(() => localStorage.getItem(avatarKey(userId)) ?? null);

  useEffect(() => {
    const handler = () => setSrc(localStorage.getItem(avatarKey(userId)) ?? null);
    window.addEventListener('Lavender_avatar_updated', handler);
    return () => window.removeEventListener('Lavender_avatar_updated', handler);
  }, [userId]);

  const initials = name
    ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <button onClick={onClick} title="الملف الشخصي" style={{
      width: size, height: size, borderRadius: '50%',
      border: '2px solid rgba(200,168,130,0.5)',
      background: src ? 'transparent' : 'linear-gradient(135deg,#c8a882,#a0785a)',
      cursor: 'pointer', padding: 0, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, transition: 'border-color .2s, box-shadow .2s',
      boxShadow: '0 1px 6px rgba(62,39,35,.15)',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#a0785a'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(62,39,35,.25)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,168,130,0.5)'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(62,39,35,.15)'; }}
    >
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: size * 0.36, fontWeight: 800, color: '#1a110e', fontFamily: "'Cairo',sans-serif" }}>{initials}</span>
      }
    </button>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children, noPad }) => (
  <div style={{
    background: '#fff', borderRadius: 16,
    border: '1px solid rgba(200,168,130,0.2)',
    overflow: 'hidden', marginBottom: 12,
    boxShadow: '0 2px 10px rgba(62,39,35,.05)',
  }}>
    {title && (
      <div style={{
        padding: '9px 14px', background: '#fdf8f5',
        borderBottom: '1px solid rgba(200,168,130,.12)',
        fontSize: 10, fontWeight: 800, color: '#a0785a', letterSpacing: 1.2, textTransform: 'uppercase',
      }}>
        {title}
      </div>
    )}
    <div style={noPad ? {} : { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {children}
    </div>
  </div>
);

// ─── Field row ────────────────────────────────────────────────────────────────
const FieldRow = ({ icon, label, value, editKey, editing, onChange, type = 'text', disabled, locked }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 11,
    background: locked ? '#f9f6f4' : '#fdfaf8',
    border: `1px solid ${locked ? 'rgba(200,168,130,0.08)' : 'rgba(200,168,130,0.15)'}`,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
      background: locked
        ? 'linear-gradient(135deg,#d7ccc8,#bcaaa4)'
        : 'linear-gradient(135deg,#c8a882,#a0785a)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, color: '#1a110e',
    }}>
      {locked ? <FaLock size={11} /> : icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a882', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      {editing && !locked ? (
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(editKey, e.target.value)}
          style={{
            width: '100%', border: 'none', background: 'transparent',
            fontSize: 13, fontWeight: 700, color: '#3e2723',
            fontFamily: "'Cairo',sans-serif", outline: 'none',
            borderBottom: '1.5px dashed #c8a882', paddingBottom: 1,
          }}
        />
      ) : (
        <div style={{ fontSize: 13, fontWeight: 700, color: value ? '#3e2723' : '#bdbdbd' }}>
          {locked ? '••••••••' : (value || '—')}
        </div>
      )}
    </div>
    {locked && (
      <span style={{ fontSize: 9, color: '#bcaaa4', fontWeight: 600, whiteSpace: 'nowrap' }}>مقفل</span>
    )}
  </div>
);

// ─── Password field with show/hide ────────────────────────────────────────────
const PwField = ({ label, value, onChange, name }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 11,
      background: '#fdfaf8', border: '1px solid rgba(200,168,130,0.15)',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg,#c8a882,#a0785a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: '#1a110e',
      }}>
        <FaKey size={11} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a882', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>
          {label}
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder="••••••••"
          style={{
            width: '100%', border: 'none', background: 'transparent',
            fontSize: 13, fontWeight: 700, color: '#3e2723',
            fontFamily: "'Cairo',sans-serif", outline: 'none',
            borderBottom: '1.5px dashed #c8a882', paddingBottom: 1,
          }}
        />
      </div>
      <button onClick={() => setShow(s => !s)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#c8a882', fontSize: 14, padding: 4, flexShrink: 0,
      }}>
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef  = useRef();
  const KEY         = avatarKey(user?.id);
  const PROFILE_KEY = profileKey(user?.id);

  // ── Profile state — يبدأ من localStorage لو موجود ──────────────────────────
  const savedProfile = (() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; } catch { return null; }
  })();

  const [profile, setProfile] = useState({
    firstName: savedProfile?.firstName ?? user?.firstName ?? user?.FirstName ?? (user?.name ?? user?.Name ?? '').split(' ')[0] ?? '',
    lastName:  savedProfile?.lastName  ?? user?.lastName  ?? user?.LastName  ?? (user?.name ?? user?.Name ?? '').split(' ').slice(1).join(' ') ?? '',
    email:     savedProfile?.email     ?? user?.email     ?? user?.Email     ?? '',
    phone:     savedProfile?.phone     ?? user?.phone     ?? user?.Phone     ?? '',
    address:   savedProfile?.address   ?? user?.address   ?? user?.Address   ?? '',
    avatar:    localStorage.getItem(KEY) ?? user?.avatar ?? user?.Avatar ?? null,
  });
  const [draft,    setDraft]   = useState({});
  const [editing,  setEditing] = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [loading,  setLoading] = useState(false);

  // ── Avatar state ───────────────────────────────────────────────────────────
  const [pendingAvatar,  setPendingAvatar]  = useState(null);
  const [avatarLoading,  setAvatarLoading]  = useState(false);

  // ── Password state ────────────────────────────────────────────────────────
  const [showPwSection, setShowPwSection] = useState(false);
  const [pwStep,    setPwStep]    = useState('idle');
  const [pwCode,    setPwCode]    = useState('');
  const [pwNext,    setPwNext]    = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving,  setPwSaving]  = useState(false);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ orders: 0, spent: 0 });

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── جلب البيانات من الباك وحفظها بـ localStorage ───────────────────────────
  const fetchProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/Account/profile/${user.id}`);
      const d   = res.data;
      const updated = {
        firstName: d.firstName ?? d.FirstName ?? '',
        lastName:  d.lastName  ?? d.LastName  ?? '',
        email:     d.email     ?? d.Email     ?? '',
        phone:     d.phone     ?? d.Phone     ?? '',
        address:   d.address   ?? d.Address   ?? '',
      };
      // ✅ حفظ بـ localStorage عشان تضل ثابتة
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfile(prev => ({ ...prev, ...updated }));
      updateUser(updated);
    } catch {
      // لو فشل الباك نستخدم اللي محفوظ محلياً
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
    if (!user?.id) return;
    api.get(`/Orders/my-orders/${user.id}`)
      .then(({ data }) => {
        const orders = data || [];
        const spent  = orders.reduce((s, o) => s + (o.totalAmount ?? o.TotalAmount ?? 0), 0);
        setStats({ orders: orders.length, spent });
      })
      .catch(() => {});
  }, [user?.id]);

  // ── Edit info ──────────────────────────────────────────────────────────────
  const startEdit    = () => { setDraft({ ...profile }); setEditing(true); };
  const cancelEdit   = () => { setDraft({}); setEditing(false); setPendingAvatar(null); };
  const handleChange = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/Account/profile/update/${user.id}`, {
        firstName: draft.firstName,
        lastName:  draft.lastName,
        email:     draft.email,
        phone:     draft.phone,
        address:   draft.address,
      });

      if (pendingAvatar) {
        try { localStorage.setItem(KEY, pendingAvatar.base64); } catch {
          showToast('مساحة التخزين ممتلئة، الصورة لم تُحفظ', 'error');
        }
        setProfile({ ...draft, avatar: pendingAvatar.base64 });
        window.dispatchEvent(new Event('Lavender_avatar_updated'));
        setPendingAvatar(null);
      } else {
        setProfile({ ...draft });
      }

      // ✅ حفظ بـ localStorage
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        firstName: draft.firstName,
        lastName:  draft.lastName,
        email:     draft.email,
        phone:     draft.phone,
        address:   draft.address,
      }));

      updateUser({
        firstName: draft.firstName,
        lastName:  draft.lastName,
        email:     draft.email,
        phone:     draft.phone,
        address:   draft.address,
      });
      setEditing(false);
      showToast('تم حفظ المعلومات بنجاح ✓');
    } catch {
      showToast('حدث خطأ أثناء الحفظ، تم الحفظ محلياً', 'error');
      if (pendingAvatar) {
        try { localStorage.setItem(KEY, pendingAvatar.base64); } catch {}
        setProfile({ ...draft, avatar: pendingAvatar.base64 });
        window.dispatchEvent(new Event('Lavender_avatar_updated'));
        setPendingAvatar(null);
      } else {
        setProfile({ ...draft });
      }
      // ✅ حفظ محلي كـ fallback
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        firstName: draft.firstName,
        lastName:  draft.lastName,
        email:     draft.email,
        phone:     draft.phone,
        address:   draft.address,
      }));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar pick ────────────────────────────────────────────────────────────
  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast('الصورة كبيرة جداً، الحد الأقصى 10MB', 'error');
      return;
    }
    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      const previewUrl = URL.createObjectURL(file);
      setPendingAvatar({ url: previewUrl, base64 });
      setAvatarLoading(false);
      if (!editing) { setDraft({ ...profile }); setEditing(true); }
    };
    reader.onerror = () => { showToast('فشل قراءة الصورة', 'error'); setAvatarLoading(false); };
    reader.readAsDataURL(file);
  };

  // ── Password ──────────────────────────────────────────────────────────────
  const handleSendCode = async () => {
    setPwSaving(true);
    try {
      await api.post('/Account/forgot-password', { email: profile.email });
      setPwStep('codeSent');
      showToast('تم إرسال الكود على إيميلك ✓');
    } catch { showToast('فشل إرسال الكود، تحقق من الإيميل', 'error'); }
    finally { setPwSaving(false); }
  };

  const handlePwSave = async () => {
    if (!pwCode.trim())       return showToast('أدخل الكود المرسل لإيميلك', 'error');
    if (pwNext.length < 6)    return showToast('كلمة المرور قصيرة (6 أحرف على الأقل)', 'error');
    if (pwNext !== pwConfirm) return showToast('كلمتا المرور غير متطابقتين', 'error');
    setPwSaving(true);
    try {
      await api.post('/Account/reset-password', {
        email: profile.email, code: pwCode.trim(), newPassword: pwNext,
      });
      showToast('تم تغيير كلمة المرور بنجاح ✓');
      setPwCode(''); setPwNext(''); setPwConfirm('');
      setPwStep('idle'); setShowPwSection(false);
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'الكود غير صحيح أو منتهي الصلاحية', 'error');
    } finally { setPwSaving(false); }
  };

  const cancelPw = () => {
    setShowPwSection(false); setPwStep('idle');
    setPwCode(''); setPwNext(''); setPwConfirm('');
  };

  const avatarSrc = pendingAvatar ? pendingAvatar.url : profile.avatar;
  const display   = editing ? draft : profile;

  return (
    <div className="profile-page" style={{ direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif", maxWidth: 500, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes slideUp  { from { opacity:0; transform: translateX(-50%) translateY(12px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Hero ── */}
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 14, background: 'linear-gradient(135deg,#3e2723 0%,#5d4037 55%,#a0785a 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '22px 22px' }} />

        <div style={{ padding: '20px 18px 16px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                border: pendingAvatar ? '3px solid #c8a882' : '3px solid rgba(255,255,255,.3)',
                background: 'rgba(255,255,255,.12)', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color .3s',
              }}>
                {avatarLoading ? (
                  <FaSpinner size={22} color="rgba(255,255,255,.6)" style={{ animation: 'spin .8s linear infinite' }} />
                ) : avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>
                    {profile.firstName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>

              {pendingAvatar && (
                <div style={{ position: 'absolute', top: -4, right: -4, background: '#c8a882', color: '#1a110e', fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 8, border: '2px solid #3e2723' }}>
                  معلقة
                </div>
              )}

              <button onClick={() => fileRef.current?.click()} title="اختر صورة" style={{
                position: 'absolute', bottom: 1, left: 1,
                width: 26, height: 26, borderRadius: '50%',
                background: '#c8a882', border: '2.5px solid #3e2723',
                color: '#1a110e', cursor: 'pointer', fontSize: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,.25)',
                transition: 'transform .15s, background .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#b8906a'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';   e.currentTarget.style.background = '#c8a882'; }}
              >
                <FaCamera />
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={handleAvatarPick} />
            </div>

            {/* Name + email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'اسم المستخدم'}
                </h2>
                <MdVerified style={{ color: '#c8a882', flexShrink: 0, fontSize: 14 }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>{profile.email || '—'}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, background: 'rgba(255,255,255,.12)', fontSize: 10, color: '#f5deb3' }}>
                <FaShieldAlt size={9} /> زبون مميز
              </div>
            </div>

            {/* Edit / Save / Cancel + Refresh */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button onClick={cancelEdit} style={ghostBtn}><FaTimes size={12} /></button>
                  <button onClick={handleSave} disabled={saving} style={goldBtn}>
                    {saving ? <FaSpinner size={11} style={{ animation: 'spin .8s linear infinite' }} /> : <FaSave size={11} />}
                    {saving ? '...' : 'حفظ'}
                  </button>
                </>
              ) : (
                <>
                  {/* ✅ زر تحديث من الباك */}
                  <button onClick={fetchProfile} disabled={loading} title="تحديث البيانات" style={{ ...ghostBtn, padding: '0 10px' }}>
                    <FaSync size={11} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                  </button>
                  <button onClick={startEdit} style={ghostBtn}>
                    <FaEdit size={11} /> تعديل
                  </button>
                </>
              )}
            </div>
          </div>

          {pendingAvatar && (
            <div style={{ marginBottom: 10, padding: '6px 10px', borderRadius: 8, background: 'rgba(200,168,130,.2)', fontSize: 10, color: '#f5deb3', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaCamera size={10} />
              صورة جديدة محددة — اضغط <strong>حفظ</strong> لتأكيدها
            </div>
          )}

          {/* Stats */}
          <div className="profile-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { icon: <FaShoppingBag size={15} color="#c8a882" />, value: stats.orders,           label: 'طلب' },
              { icon: <FaStar        size={15} color="#c8a882" />, value: stats.spent.toFixed(0), label: 'إجمالي ₪' },
              { icon: <FaHeart       size={15} color="#c8a882" />, value: '0',                    label: 'تقييم' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '8px 6px', borderRadius: 12, textAlign: 'center', background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(4px)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Account info ── */}
      <Section title="معلومات الحساب">
        <FieldRow icon={<FaUser />}         label="الاسم الأول"       editKey="firstName" value={display.firstName} editing={editing} onChange={handleChange} />
        <FieldRow icon={<FaUser />}         label="الاسم الأخير"      editKey="lastName"  value={display.lastName}  editing={editing} onChange={handleChange} />
        <FieldRow icon={<FaEnvelope />}     label="البريد الإلكتروني" editKey="email"     value={display.email}     editing={editing} onChange={handleChange} type="email" />
        <FieldRow icon={<FaPhone />}        label="رقم الجوال"        editKey="phone"     value={display.phone}     editing={editing} onChange={handleChange} type="tel" />
        <FieldRow icon={<FaMapMarkerAlt />} label="عنوان التوصيل"    editKey="address"   value={display.address}   editing={editing} onChange={handleChange} />
      </Section>

      {/* ── Password ── */}
      <Section title="كلمة المرور" noPad>
        <div>
          <button onClick={() => setShowPwSection(s => !s)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', background: 'transparent', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', transition: 'background .12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fdf8f5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: '#c8a88214', color: '#c8a882', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
              <FaKey size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3e2723' }}>تغيير كلمة المرور</div>
              <div style={{ fontSize: 10, color: '#a0785a', marginTop: 1 }}>اضغط لتعديل كلمة المرور</div>
            </div>
            <FaChevronLeft size={10} style={{ color: '#d7ccc8', transform: showPwSection ? 'rotate(-90deg)' : 'none', transition: 'transform .2s' }} />
          </button>

          {showPwSection && (
            <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(200,168,130,.1)' }}>
              {pwStep === 'idle' ? (
                <>
                  <div style={{ padding: '9px 12px', borderRadius: 11, background: '#fdf8f5', border: '1px solid rgba(200,168,130,.15)', fontSize: 12, color: '#5d4037', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaEnvelope size={13} style={{ color: '#c8a882', flexShrink: 0 }} />
                    سيتم إرسال كود التحقق على: <strong>{profile.email}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={cancelPw} style={cancelBtnStyle}>إلغاء</button>
                    <button onClick={handleSendCode} disabled={pwSaving} style={purpleBtnStyle}>
                      {pwSaving ? <FaSpinner size={12} style={{ animation: 'spin .8s linear infinite' }} /> : <FaEnvelope size={12} />}
                      {pwSaving ? 'جاري الإرسال...' : 'إرسال الكود'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ padding: '8px 12px', borderRadius: 10, background: '#e8f5e9', border: '1px solid #a5d6a7', fontSize: 11, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaCheckCircle size={11} /> تم إرسال الكود على إيميلك
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, background: '#fdfaf8', border: '1px solid rgba(200,168,130,0.15)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#c8a882,#a0785a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#1a110e' }}><FaKey size={11} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a882', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>كود التحقق</div>
                      <input type="text" value={pwCode} onChange={e => setPwCode(e.target.value)} placeholder="أدخل الكود"
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#3e2723', fontFamily: "'Cairo',sans-serif", outline: 'none', borderBottom: '1.5px dashed #c8a882' }} />
                    </div>
                  </div>
                  <PwField label="كلمة المرور الجديدة" value={pwNext}    onChange={(_, v) => setPwNext(v)}    name="next" />
                  <PwField label="تأكيد كلمة المرور"   value={pwConfirm} onChange={(_, v) => setPwConfirm(v)} name="confirm" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={cancelPw} style={cancelBtnStyle}>إلغاء</button>
                    <button onClick={handlePwSave} disabled={pwSaving} style={purpleBtnStyle}>
                      {pwSaving ? <FaSpinner size={12} style={{ animation: 'spin .8s linear infinite' }} /> : <FaSave size={12} />}
                      {pwSaving ? 'جاري الحفظ...' : 'تأكيد وحفظ'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* ── Logout ── */}
      <button onClick={() => { logout?.(); navigate('/login'); }} style={{
        width: '100%', padding: '12px', borderRadius: 14, marginTop: 4,
        background: '#fdecea', border: '1px solid rgba(198,40,40,.15)',
        color: '#c62828', cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 13, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#fbd8d5'}
      onMouseLeave={e => e.currentTarget.style.background = '#fdecea'}>
        <FaSignOutAlt /> تسجيل الخروج
      </button>

      <p style={{ textAlign: 'center', fontSize: 10, color: '#d7ccc8', marginTop: 16 }}>
        Lavender © {new Date().getFullYear()} 🇵🇸
      </p>
    </div>
  );
};

// ─── Button styles ────────────────────────────────────────────────────────────
const cancelBtnStyle = {
  flex: 1, padding: '9px', borderRadius: 10,
  background: '#f5f0eb', border: '1px solid rgba(200,168,130,.2)',
  color: '#5d4037', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Cairo',sans-serif",
};
const purpleBtnStyle = {
  flex: 2, padding: '9px', borderRadius: 10,
  background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
  border: 'none', color: '#fff',
  cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: "'Cairo',sans-serif",
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
};
const ghostBtn = {
  height: 32, padding: '0 12px', borderRadius: 9,
  background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)',
  color: '#fff', cursor: 'pointer', fontWeight: 700,
  fontSize: 11, fontFamily: "'Cairo',sans-serif",
  display: 'flex', alignItems: 'center', gap: 5,
};
const goldBtn = {
  height: 32, padding: '0 14px', borderRadius: 9,
  background: '#c8a882', border: 'none',
  color: '#1a110e', cursor: 'pointer', fontWeight: 800,
  fontSize: 11, fontFamily: "'Cairo',sans-serif",
  display: 'flex', alignItems: 'center', gap: 5,
};

export default CustomerProfile;