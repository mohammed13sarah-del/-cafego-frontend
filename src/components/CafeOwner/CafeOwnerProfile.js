import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import {
  FaCamera, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaEdit, FaSave, FaTimes, FaSignOutAlt, FaShieldAlt,
  FaChevronLeft, FaLock, FaSpinner, FaChevronDown,
  FaKey, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle,
  FaCoffee, FaAlignLeft, FaImage, FaGlobe, FaClock, FaSync,
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { FiPackage, FiDollarSign, FiList } from 'react-icons/fi';

// ─── localStorage keys ────────────────────────────────────────────────────────
const avatarKey    = (id) => `Lavender_avatar_${id ?? 'guest'}`;
const cafeImgKey   = (id) => `Lavender_cafe_img_${id ?? 'guest'}`;
const cafeDataKey  = (id) => `Lavender_cafe_data_${id ?? 'guest'}`;
const ownerDataKey = (id) => `Lavender_owner_data_${id ?? 'guest'}`;

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Section ──────────────────────────────────────────────────────────────────
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
        fontSize: 10, fontWeight: 800, color: '#a0785a',
        letterSpacing: 1.2, textTransform: 'uppercase',
      }}>
        {title}
      </div>
    )}
    <div style={noPad ? {} : { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {children}
    </div>
  </div>
);

// ─── FieldRow ─────────────────────────────────────────────────────────────────
const FieldRow = ({ icon, label, value, editKey, editing, onChange, type = 'text', locked, multiline, readOnly }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '9px 12px', borderRadius: 11,
    background: locked || readOnly ? '#f9f6f4' : '#fdfaf8',
    border: `1px solid ${locked || readOnly ? 'rgba(200,168,130,0.08)' : 'rgba(200,168,130,0.15)'}`,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
      background: locked ? 'linear-gradient(135deg,#d7ccc8,#bcaaa4)' : 'linear-gradient(135deg,#c8a882,#a0785a)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, color: '#1a110e',
    }}>
      {locked ? <FaLock size={11} /> : icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a882', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      {editing && !locked && !readOnly ? (
        multiline ? (
          <textarea value={value ?? ''} onChange={e => onChange(editKey, e.target.value)} rows={3}
            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#3e2723', fontFamily: "'Cairo',sans-serif", outline: 'none', resize: 'vertical', borderBottom: '1.5px dashed #c8a882' }} />
        ) : (
          <input type={type} value={value ?? ''} onChange={e => onChange(editKey, e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#3e2723', fontFamily: "'Cairo',sans-serif", outline: 'none', borderBottom: '1.5px dashed #c8a882', paddingBottom: 1 }} />
        )
      ) : (
        <div style={{ fontSize: 13, fontWeight: 700, color: value ? '#3e2723' : '#bdbdbd', whiteSpace: 'pre-wrap' }}>
          {locked ? '••••••••' : (value || '—')}
        </div>
      )}
    </div>
    {(locked || readOnly) && (
      <span style={{ fontSize: 9, color: '#bcaaa4', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {locked ? 'مقفل' : 'للقراءة'}
      </span>
    )}
  </div>
);

// ─── TimeRow ──────────────────────────────────────────────────────────────────
const TimeRow = ({ openTime, closeTime, editing, onChange }) => (
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
      <FaClock size={11} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a882', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
        ساعات الدوام
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#a0785a', marginBottom: 3 }}>من</div>
          {editing ? (
            <input type="time" value={openTime ?? ''} onChange={e => onChange('openTime', e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#3e2723', fontFamily: "'Cairo',sans-serif", outline: 'none', borderBottom: '1.5px dashed #c8a882' }} />
          ) : (
            <div style={{ fontSize: 13, fontWeight: 700, color: openTime ? '#3e2723' : '#bdbdbd' }}>
              {openTime || '—'}
            </div>
          )}
        </div>
        <div style={{ color: '#c8a882', fontWeight: 900, fontSize: 16 }}>→</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#a0785a', marginBottom: 3 }}>إلى</div>
          {editing ? (
            <input type="time" value={closeTime ?? ''} onChange={e => onChange('closeTime', e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#3e2723', fontFamily: "'Cairo',sans-serif", outline: 'none', borderBottom: '1.5px dashed #c8a882' }} />
          ) : (
            <div style={{ fontSize: 13, fontWeight: 700, color: closeTime ? '#3e2723' : '#bdbdbd' }}>
              {closeTime || '—'}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── ActionRow ────────────────────────────────────────────────────────────────
const ActionRow = ({ icon, label, sublabel, color, onClick, last }) => (
  <button onClick={onClick} style={{
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', background: 'transparent', border: 'none',
    borderBottom: last ? 'none' : '1px solid rgba(200,168,130,.1)',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', transition: 'background .12s',
  }}
  onMouseEnter={e => e.currentTarget.style.background = '#fdf8f5'}
  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: `${color}14`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#3e2723' }}>{label}</div>
      {sublabel && <div style={{ fontSize: 10, color: '#a0785a', marginTop: 1 }}>{sublabel}</div>}
    </div>
    <FaChevronLeft size={10} style={{ color: '#d7ccc8' }} />
  </button>
);

// ─── PwField ──────────────────────────────────────────────────────────────────
const PwField = ({ label, value, onChange, name }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, background: '#fdfaf8', border: '1px solid rgba(200,168,130,0.15)' }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#c8a882,#a0785a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#1a110e' }}>
        <FaKey size={11} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a882', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(name, e.target.value)} placeholder="••••••••"
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#3e2723', fontFamily: "'Cairo',sans-serif", outline: 'none', borderBottom: '1.5px dashed #c8a882', paddingBottom: 1 }} />
      </div>
      <button onClick={() => setShow(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8a882', fontSize: 14, padding: 4, flexShrink: 0 }}>
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

// ─── SelectRow ────────────────────────────────────────────────────────────────
const SelectRow = ({ icon, label, value, editKey, editing, onChange, options }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 11, background: '#fdfaf8', border: '1px solid rgba(200,168,130,0.15)' }}>
    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#c8a882,#a0785a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#1a110e' }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a882', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      {editing ? (
        <div style={{ position: 'relative' }}>
          <select value={value ?? ''} onChange={e => onChange(editKey, e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#3e2723', fontFamily: "'Cairo',sans-serif", outline: 'none', borderBottom: '1.5px dashed #c8a882', appearance: 'none', WebkitAppearance: 'none', paddingLeft: 20, cursor: 'pointer' }}>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <FaChevronDown size={10} style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', color: '#c8a882', pointerEvents: 'none' }} />
        </div>
      ) : (
        <div style={{ fontSize: 13, fontWeight: 700, color: value ? '#3e2723' : '#bdbdbd' }}>
          {options.find(o => o.value === value)?.label || value || '—'}
        </div>
      )}
    </div>
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ emoji, value, label }) => (
  <div style={{ padding: '8px 6px', borderRadius: 12, textAlign: 'center', background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(4px)' }}>
    <div style={{ fontSize: 15 }}>{emoji}</div>
    <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>{label}</div>
  </div>
);

// ─── Button styles ────────────────────────────────────────────────────────────
const ghostBtn = { height: 32, padding: '0 12px', borderRadius: 9, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: "'Cairo',sans-serif", display: 'flex', alignItems: 'center', gap: 5 };
const goldBtn  = { height: 32, padding: '0 14px', borderRadius: 9, background: '#c8a882', border: 'none', color: '#1a110e', cursor: 'pointer', fontWeight: 800, fontSize: 11, fontFamily: "'Cairo',sans-serif", display: 'flex', alignItems: 'center', gap: 5 };
const cancelBtnStyle = { flex: 1, padding: '9px', borderRadius: 10, background: '#f5f0eb', border: '1px solid rgba(200,168,130,.2)', color: '#5d4037', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Cairo',sans-serif" };
const purpleBtnStyle = { flex: 2, padding: '9px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: "'Cairo',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 };

// ─── Main Component ───────────────────────────────────────────────────────────
const CafeOwnerProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate   = useNavigate();
  const avatarRef  = useRef();
  const cafeImgRef = useRef();

  const AVATAR_KEY    = avatarKey(user?.id);
  const CAFE_IMG_KEY  = cafeImgKey(user?.id);
  const CAFE_DATA_KEY = cafeDataKey(user?.id);
  const OWNER_KEY     = ownerDataKey(user?.id);

  const savedCafeData  = (() => { try { return JSON.parse(localStorage.getItem(CAFE_DATA_KEY)) || null; } catch { return null; } })();
  const savedOwnerData = (() => { try { return JSON.parse(localStorage.getItem(OWNER_KEY)) || null; } catch { return null; } })();

  const [profile, setProfile] = useState({
    firstName:   savedOwnerData?.firstName   ?? '',
    lastName:    savedOwnerData?.lastName    ?? '',
    email:       savedOwnerData?.email       ?? '',
    phone:       savedOwnerData?.phone       ?? '',
    address:     savedOwnerData?.address     ?? '',
    cafeID:      savedCafeData?.cafeID       ?? null,
    cafeName:    savedCafeData?.cafeName     ?? '',
    cafeAddress: savedCafeData?.cafeAddress  ?? '',
    cafeCity:    savedCafeData?.cafeCity     ?? '',
    cafeCategory:savedCafeData?.cafeCategory ?? '',
    cafePhone:   savedCafeData?.cafePhone    ?? '',
    cafeDesc:    savedCafeData?.cafeDesc     ?? '',
    cafeStatus:  savedCafeData?.cafeStatus   ?? '',
    openTime:    savedCafeData?.openTime     ?? '',
    closeTime:   savedCafeData?.closeTime    ?? '',
    avatar:  localStorage.getItem(AVATAR_KEY)   ?? null,
    cafeImg: localStorage.getItem(CAFE_IMG_KEY) ?? null,
  });

  const [draft,       setDraft]       = useState({});
  const [editing,     setEditing]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [pageLoading, setPageLoading] = useState(!savedCafeData);
  const [refreshing,  setRefreshing]  = useState(false);

  const [pendingAvatar,  setPendingAvatar]  = useState(null);
  const [pendingCafeImg, setPendingCafeImg] = useState(null);
  const [avatarLoading,  setAvatarLoading]  = useState(false);
  const [cafeImgLoading, setCafeImgLoading] = useState(false);

  const [showPwSection, setShowPwSection] = useState(false);
  const [pwStep,    setPwStep]    = useState('idle');
  const [pwCode,    setPwCode]    = useState('');
  const [pwNext,    setPwNext]    = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving,  setPwSaving]  = useState(false);

  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0 });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async (silent = false) => {
    if (!user?.id) { setPageLoading(false); return; }
    if (!silent) setPageLoading(true);
    else setRefreshing(true);

    try {
      const { data: acc } = await api.get(`/Account/profile/${user.id}`);
      const { data: cafesData } = await api.get(`/Cafes/by-owner/${user.id}`);
      const cafesList = Array.isArray(cafesData) ? cafesData : [cafesData];
      const activeCafeId = user.activeCafeID ?? user.cafeID;
      const cafeData = cafesList.find(c => c.cafeID === activeCafeId) ?? cafesList[0];

      const ownerData = {
        firstName: acc.firstName ?? '',
        lastName:  acc.lastName  ?? '',
        email:     acc.email     ?? '',
        phone:     acc.phone     ?? '',
        address:   acc.address   ?? '',
      };

      const cafeInfo = {
        cafeID:      cafeData?.cafeID      ?? null,
        cafeName:    cafeData?.name        ?? '',
        cafeAddress: cafeData?.address     ?? '',
        cafeCity:    cafeData?.city        ?? '',
        cafeCategory:cafeData?.category    ?? '',
        cafePhone:   cafeData?.phone       ?? '',
        cafeDesc:    cafeData?.description ?? '',
        cafeStatus:  cafeData?.status      ?? '',
        openTime:    cafeData?.openTime    ?? '',
        closeTime:   cafeData?.closeTime   ?? '',
      };

      localStorage.setItem(OWNER_KEY,     JSON.stringify(ownerData));
      localStorage.setItem(CAFE_DATA_KEY, JSON.stringify(cafeInfo));

      setProfile(prev => ({ ...prev, ...ownerData, ...cafeInfo }));
      updateUser(ownerData);

      if (cafeData) {
        setStats(prev => ({ ...prev, totalProducts: cafeData.products?.length ?? 0 }));
      }
    } catch {
      if (!silent) showToast('تعذّر تحميل البيانات', 'error');
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, [user?.id, user?.activeCafeID]);

  const startEdit  = () => { setDraft({ ...profile }); setEditing(true); };
  const cancelEdit = () => { setDraft({}); setEditing(false); setPendingAvatar(null); setPendingCafeImg(null); };
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

      if (profile.cafeID) {
        await api.put(`/Cafes/${profile.cafeID}`, {
          cafeID:      profile.cafeID,
          name:        draft.cafeName,
          address:     draft.cafeAddress,
          city:        draft.cafeCity,
          category:    draft.cafeCategory,
          phone:       draft.cafePhone,
          description: draft.cafeDesc,
          status:      draft.cafeStatus,
          openTime:    draft.openTime,
          closeTime:   draft.closeTime,
          ownerID:     user.id,
        });
      }

      let newAvatar  = profile.avatar;
      let newCafeImg = profile.cafeImg;

      if (pendingAvatar) {
        try { localStorage.setItem(AVATAR_KEY, pendingAvatar.base64); } catch {}
        newAvatar = pendingAvatar.base64;
        window.dispatchEvent(new Event('Lavender_avatar_updated'));
        setPendingAvatar(null);
      }
      if (pendingCafeImg) {
        try { localStorage.setItem(CAFE_IMG_KEY, pendingCafeImg.base64); } catch {}
        newCafeImg = pendingCafeImg.base64;
        setPendingCafeImg(null);
      }

      const updatedCafeInfo = {
        cafeID: profile.cafeID, cafeName: draft.cafeName,
        cafeAddress: draft.cafeAddress, cafeCity: draft.cafeCity,
        cafeCategory: draft.cafeCategory, cafePhone: draft.cafePhone,
        cafeDesc: draft.cafeDesc, cafeStatus: draft.cafeStatus,
        openTime: draft.openTime, closeTime: draft.closeTime,
      };
      localStorage.setItem(CAFE_DATA_KEY, JSON.stringify(updatedCafeInfo));
      localStorage.setItem(OWNER_KEY, JSON.stringify({
        firstName: draft.firstName, lastName: draft.lastName,
        email: draft.email, phone: draft.phone, address: draft.address,
      }));

      const updated = { ...draft, avatar: newAvatar, cafeImg: newCafeImg };
      setProfile(updated);
      updateUser({ firstName: draft.firstName, lastName: draft.lastName, email: draft.email, avatar: newAvatar });
      setEditing(false);
      showToast('تم حفظ المعلومات بنجاح ✓');
    } catch {
      showToast('حدث خطأ أثناء الحفظ', 'error');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleImagePick = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast('الصورة كبيرة جداً، الحد الأقصى 10MB', 'error'); return; }
    const setLoading = type === 'avatar' ? setAvatarLoading : setCafeImgLoading;
    const setPending = type === 'avatar' ? setPendingAvatar : setPendingCafeImg;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPending({ url: URL.createObjectURL(file), base64: ev.target.result });
      setLoading(false);
      if (!editing) { setDraft({ ...profile }); setEditing(true); }
    };
    reader.onerror = () => { showToast('فشل قراءة الصورة', 'error'); setLoading(false); };
    reader.readAsDataURL(file);
  };

  const handleSendCode = async () => {
    setPwSaving(true);
    try {
      await api.post('/Account/forgot-password', { email: profile.email });
      setPwStep('codeSent');
      showToast('تم إرسال الكود على إيميلك ✓');
    } catch { showToast('فشل إرسال الكود', 'error'); }
    finally { setPwSaving(false); }
  };

  const handlePwSave = async () => {
    if (!pwCode.trim())       return showToast('أدخل الكود المرسل لإيميلك', 'error');
    if (pwNext.length < 6)    return showToast('كلمة المرور قصيرة (6 أحرف على الأقل)', 'error');
    if (pwNext !== pwConfirm) return showToast('كلمتا المرور غير متطابقتين', 'error');
    setPwSaving(true);
    try {
      await api.post('/Account/reset-password', { email: profile.email, code: pwCode.trim(), newPassword: pwNext });
      showToast('تم تغيير كلمة المرور بنجاح ✓');
      setPwCode(''); setPwNext(''); setPwConfirm('');
      setPwStep('idle'); setShowPwSection(false);
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'الكود غير صحيح أو منتهي الصلاحية', 'error');
    } finally { setPwSaving(false); }
  };

  const cancelPw = () => { setShowPwSection(false); setPwStep('idle'); setPwCode(''); setPwNext(''); setPwConfirm(''); };

  const display    = editing ? draft : profile;
  const avatarSrc  = pendingAvatar  ? pendingAvatar.url  : profile.avatar;
  const cafeImgSrc = pendingCafeImg ? pendingCafeImg.url : profile.cafeImg;

  if (pageLoading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: "'Cairo',sans-serif", color: '#8d6e63' }}>
      <FaSpinner size={32} color="#c8a882" style={{ animation: 'spin .8s linear infinite', marginBottom: 12 }} />
      <p style={{ margin: 0, fontWeight: 700 }}>جاري تحميل بياناتك...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="owner-profile-page" style={{ direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif", maxWidth: 500, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(12px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Hero ── */}
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 14, background: 'linear-gradient(135deg,#1a110e 0%,#3e2723 55%,#6d4c41 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '22px 22px' }} />
        {cafeImgSrc && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cafeImgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }} />
        )}

        <div style={{ padding: '20px 18px 16px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: pendingAvatar ? '3px solid #c8a882' : '3px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.12)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .3s' }}>
                {avatarLoading
                  ? <FaSpinner size={22} color="rgba(255,255,255,.6)" style={{ animation: 'spin .8s linear infinite' }} />
                  : avatarSrc
                    ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{profile.firstName?.charAt(0)?.toUpperCase() || '?'}</span>
                }
              </div>
              {pendingAvatar && (
                <div style={{ position: 'absolute', top: -4, right: -4, background: '#c8a882', color: '#1a110e', fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 8, border: '2px solid #3e2723' }}>معلقة</div>
              )}
              <button onClick={() => avatarRef.current?.click()} style={{ position: 'absolute', bottom: 1, left: 1, width: 26, height: 26, borderRadius: '50%', background: '#c8a882', border: '2.5px solid #3e2723', color: '#1a110e', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.25)', transition: 'transform .15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#b8906a'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';   e.currentTarget.style.background = '#c8a882'; }}>
                <FaCamera />
              </button>
              <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleImagePick(e, 'avatar')} />
            </div>

            {/* Name + badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <h2 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'صاحب الكافيه'}
                </h2>
                <MdVerified style={{ color: '#c8a882', flexShrink: 0, fontSize: 14 }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 5 }}>{profile.email || '—'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {profile.cafeName && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, background: 'rgba(200,168,130,.25)', fontSize: 11, color: '#f5deb3', fontWeight: 700 }}>
                    <FaCoffee size={9} /> {profile.cafeName}
                  </span>
                )}
                {profile.cafeStatus && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: profile.cafeStatus === 'Open' ? 'rgba(46,125,50,.35)' : 'rgba(198,40,40,.35)', color: profile.cafeStatus === 'Open' ? '#a5d6a7' : '#ef9a9a' }}>
                    {profile.cafeStatus === 'Open' ? '🟢 مفتوح' : '🔴 مغلق'}
                  </span>
                )}
                {profile.openTime && profile.closeTime && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, background: 'rgba(255,255,255,.1)', fontSize: 10, color: '#f5deb3' }}>
                    <FaClock size={9} /> {profile.openTime} — {profile.closeTime}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 20, background: 'rgba(255,255,255,.1)', fontSize: 10, color: '#f5deb3' }}>
                  <FaShieldAlt size={9} /> مالك الكافيه
                </span>
              </div>
            </div>

            {/* Buttons */}
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
                  <button onClick={() => fetchAll(true)} disabled={refreshing} title="تحديث" style={{ ...ghostBtn, padding: '0 10px' }}>
                    <FaSync size={11} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
                  </button>
                  <button onClick={startEdit} style={ghostBtn}><FaEdit size={11} /> تعديل</button>
                </>
              )}
            </div>
          </div>

          {/* Cafe image picker */}
          <div style={{ marginBottom: 12, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {cafeImgSrc ? (
                <img src={cafeImgSrc} alt="cafe" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(200,168,130,.4)' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cafeImgLoading ? <FaSpinner size={14} color="rgba(255,255,255,.6)" style={{ animation: 'spin .8s linear infinite' }} /> : <FaImage size={14} color="rgba(255,255,255,.5)" />}
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f5deb3' }}>
                  {cafeImgSrc ? (pendingCafeImg ? 'صورة جديدة معلقة' : 'صورة الكافيه') : 'لم تُضَف صورة للكافيه'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>تظهر كخلفية للبروفايل</div>
              </div>
            </div>
            <button onClick={() => cafeImgRef.current?.click()} style={{ background: 'rgba(200,168,130,.25)', border: '1px solid rgba(200,168,130,.4)', borderRadius: 8, color: '#f5deb3', fontSize: 10, fontWeight: 700, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <FaCamera size={10} /> تغيير
            </button>
            <input ref={cafeImgRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleImagePick(e, 'cafe')} />
          </div>

          {/* Stats */}
          <div className="owner-profile-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            <StatCard emoji="📦" value={stats.totalOrders}              label="طلب وارد" />
            <StatCard emoji="₪"  value={stats.totalRevenue.toFixed(0)}  label="المبيعات" />
            <StatCard emoji="🍽️" value={stats.totalProducts}            label="منتج في المنيو" />
          </div>
        </div>
      </div>

      {/* ── المعلومات الشخصية ── */}
      <Section title="المعلومات الشخصية">
        <FieldRow icon={<FaUser />}         label="الاسم الأول"       editKey="firstName" value={display.firstName} editing={editing} onChange={handleChange} />
        <FieldRow icon={<FaUser />}         label="الاسم الأخير"      editKey="lastName"  value={display.lastName}  editing={editing} onChange={handleChange} />
        <FieldRow icon={<FaEnvelope />}     label="البريد الإلكتروني" editKey="email"     value={display.email}     editing={editing} onChange={handleChange} type="email" />
        <FieldRow icon={<FaPhone />}        label="رقم الجوال"        editKey="phone"     value={display.phone}     editing={editing} onChange={handleChange} type="tel" />
        <FieldRow icon={<FaMapMarkerAlt />} label="عنوان السكن"       editKey="address"   value={display.address}   editing={editing} onChange={handleChange} />
      </Section>

      {/* ── معلومات الكافيه ── */}
      <Section title="معلومات الكافيه">
        <FieldRow icon={<FaCoffee />}       label="اسم الكافيه"    editKey="cafeName"    value={display.cafeName}    editing={editing} onChange={handleChange} />
        <FieldRow icon={<FaMapMarkerAlt />} label="عنوان الكافيه"  editKey="cafeAddress" value={display.cafeAddress} editing={editing} onChange={handleChange} />
        <FieldRow icon={<FaGlobe />}        label="المدينة"         editKey="cafeCity"    value={display.cafeCity}    editing={editing} onChange={handleChange} />
        <FieldRow icon={<FaPhone />}        label="هاتف الكافيه"   editKey="cafePhone"   value={display.cafePhone}   editing={editing} onChange={handleChange} type="tel" />
        <FieldRow icon={<FaAlignLeft />}    label="وصف الكافيه"    editKey="cafeDesc"    value={display.cafeDesc}    editing={editing} onChange={handleChange} multiline />
        <TimeRow openTime={display.openTime} closeTime={display.closeTime} editing={editing} onChange={handleChange} />
        <SelectRow icon={<FaCheckCircle />} label="حالة الكافيه" editKey="cafeStatus" value={display.cafeStatus} editing={editing} onChange={handleChange}
          options={[{ value: 'Open', label: '🟢 مفتوح' }, { value: 'Closed', label: '🔴 مغلق' }]} />
      </Section>

      {/* ── كلمة المرور ── */}
      <Section title="كلمة المرور" noPad>
        <div>
          <button onClick={() => setShowPwSection(s => !s)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', transition: 'background .12s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fdf8f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: '#7c3aed14', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}><FaKey /></div>
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

      {/* ── روابط سريعة ── */}
      <Section title="روابط سريعة" noPad>
        <div>
          <ActionRow icon={<FiPackage />}    label="إدارة الطلبات"  sublabel="استعرض وتابع الطلبات الواردة" color="#1d7afc" onClick={() => navigate('/owner/orders')} />
          <ActionRow icon={<FiList />}       label="إدارة المنيو"   sublabel="أضف أو عدّل منتجات الكافيه"   color="#b76e00" onClick={() => navigate('/owner/menu')} />
          <ActionRow icon={<FiDollarSign />} label="تقرير المبيعات" sublabel="إيرادات وإحصائيات مفصّلة"     color="#2e7d32" onClick={() => navigate('/owner/reports')} last />
        </div>
      </Section>

      {/* ── تسجيل الخروج ── */}
      <button onClick={() => { logout?.(); navigate('/login'); }} style={{ width: '100%', padding: '12px', borderRadius: 14, marginTop: 4, background: '#fdecea', border: '1px solid rgba(198,40,40,.15)', color: '#c62828', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .15s' }}
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

export default CafeOwnerProfile;