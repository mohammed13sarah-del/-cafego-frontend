import React, { useState, useEffect } from 'react';
import {
  FaCog, FaSave, FaCheckCircle, FaTimesCircle,
  FaPhoneAlt, FaEnvelope, FaInfoCircle,
  FaShieldAlt, FaMoneyBillWave, FaTruck,
} from 'react-icons/fa';
import api from '../../api';

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: type === 'success' ? '#2e7d32' : '#c62828',
      color: '#fff', padding: '12px 28px', borderRadius: 12,
      fontSize: 14, fontWeight: 700, zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: "'Cairo','Tajawal',sans-serif",
    }}>
      {type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />} {msg}
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ title, icon, desc, children }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: '24px 28px',
    border: '1px solid #e8e0d8', marginBottom: 22,
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  }}>
    <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0ebe4' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #c8a882, #a0785a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {React.cloneElement(icon, { size: 16, color: '#1a110e' })}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#3e2723' }}>{title}</h3>
          {desc && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#8d6e63' }}>{desc}</p>}
        </div>
      </div>
    </div>
    {children}
  </div>
);

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, hint, value, onChange, type = 'text', prefix, suffix }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5d4037', marginBottom: 7 }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{
          position: 'absolute', right: 13, color: '#a0785a', fontSize: 13, pointerEvents: 'none',
        }}>{prefix}</span>
      )}
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={hint}
        style={{
          width: '100%', padding: `10px ${prefix ? '36px' : '14px'} 10px ${suffix ? '50px' : '14px'}`,
          borderRadius: 10, border: '1px solid #e0d6cc', fontSize: 14,
          background: '#fdf9f5', color: '#3e2723', outline: 'none',
          fontFamily: "'Cairo','Tajawal',sans-serif", boxSizing: 'border-box',
          transition: 'border-color .2s',
        }}
        onFocus={e => e.target.style.borderColor = '#c8a882'}
        onBlur={e => e.target.style.borderColor = '#e0d6cc'}
      />
      {suffix && (
        <span style={{
          position: 'absolute', left: 13, color: '#a0785a', fontSize: 13,
          fontWeight: 700, pointerEvents: 'none',
        }}>{suffix}</span>
      )}
    </div>
  </div>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ label, desc, value, onChange, danger }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 18px',
    background: value && danger ? '#fff5f5' : '#fdf9f5',
    borderRadius: 12,
    border: `1px solid ${value && danger ? '#ffcdd2' : '#ede0d4'}`,
    marginBottom: 12, transition: 'all .2s',
  }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: value && danger ? '#c62828' : '#3e2723' }}>
        {label}
      </div>
      {desc && <div style={{ fontSize: 12, color: '#8d6e63', marginTop: 4 }}>{desc}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
        background: value ? (danger ? '#c62828' : '#c8a882') : '#d7ccc8',
        position: 'relative', transition: 'background .25s', flexShrink: 0,
        outline: 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        left: value ? 28 : 4, transition: 'left .25s',
      }} />
    </button>
  </div>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
    <div style={{ flex: 1, height: 1, background: '#f0ebe4' }} />
    <span style={{ fontSize: 11, color: '#bcaaa4', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: '#f0ebe4' }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const AdminSettings = () => {
  const [settings, setSettings] = useState({
    commissionPercentage: 0,
    deliveryFeeType: 'fixed',
    deliveryFeeValue: 0,
    supportPhone: '',
    supportEmail: '',
    aboutText: '',
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ── Load ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/Settings');
        const d = res.data?.data ?? res.data;
        if (d) setSettings(prev => ({ ...prev, ...d }));
      } catch {
        // استخدم القيم الافتراضية
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Save All ──
  const save = async () => {
    setSaving(true);
    try {
      await api.put('/Settings', {
        commissionPercentage: settings.commissionPercentage,
        deliveryFeeType:      settings.deliveryFeeType,
        deliveryFeeValue:     settings.deliveryFeeValue,
        supportPhone:         settings.supportPhone,
        supportEmail:         settings.supportEmail,
        aboutText:            settings.aboutText,
        maintenanceMode:      settings.maintenanceMode,
      });
      showToast('تم حفظ الإعدادات بنجاح ✓', 'success');
    } catch {
      showToast('فشل الحفظ، تحقق من الاتصال', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Maintenance (endpoint مخصص) ──
  const toggleMaintenance = async (val) => {
    // نحدث الـ state فوراً للـ UX
    setSettings(s => ({ ...s, maintenanceMode: val }));
    try {
      await api.put('/Settings/maintenance', { isActive: val });
      showToast(val ? 'تم تفعيل وضع الصيانة' : 'تم إيقاف وضع الصيانة', 'success');
    } catch {
      // نرجع القيمة القديمة لو فشل
      setSettings(s => ({ ...s, maintenanceMode: !val }));
      showToast('فشل تحديث وضع الصيانة', 'error');
    }
  };

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#a0785a', fontFamily: "'Cairo','Tajawal',sans-serif", fontSize: 15 }}>
      جاري تحميل الإعدادات...
    </div>
  );

  return (
<div className="admin-settings-page" 
style={{ direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif", maxWidth: 760, margin: '0 auto' }}>   
   {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#3e2723', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaCog size={20} color="#a0785a" /> الإعدادات العامة
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#8d6e63' }}>
          التحكم بالثوابت والمتغيرات التشغيلية للنظام ككل
        </p>
      </div>

      {/* ══════════════════════════════════════════
          CARD 1 — المنظومة المالية
      ══════════════════════════════════════════ */}
      <Card
        title="المنظومة المالية"
        icon={<FaMoneyBillWave />}
        desc="العمولات وتكاليف التوصيل"
      >
        <Field
          label="نسبة عمولة النظام"
          hint="مثال: 10"
          value={settings.commissionPercentage}
          onChange={v => set('commissionPercentage', v)}
          type="number"
          suffix="%"
        />

        <Divider label="تكلفة التوصيل" />

        {/* تكلفة ثابتة بس — المتغيرة في الفيوتشر */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          padding: '10px 14px', background: '#fdf6ef', borderRadius: 10,
          border: '1px solid #e8ddd4',
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid #c8a882', background: '#c8a882',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5d4037' }}>
            <FaTruck size={12} style={{ marginLeft: 6, color: '#a0785a' }} />
            تكلفة ثابتة لكل الطلبات
          </span>
        </div>

        <Field
          label="قيمة التوصيل الثابتة"
          hint="مثال: 10"
          value={settings.deliveryFeeValue}
          onChange={v => set('deliveryFeeValue', v)}
          type="number"
          suffix="₪"
        />

      
      </Card>

      {/* ══════════════════════════════════════════
          CARD 2 — بيانات التواصل
      ══════════════════════════════════════════ */}
      <Card
        title="بيانات التواصل العامة"
        icon={<FaPhoneAlt />}
        desc="تنعكس تلقائياً في واجهات الزبائن والكافيهات"
      >
        <Field
          label="رقم هاتف الدعم الفني"
          hint="+970 59 000 0000"
          value={settings.supportPhone}
          onChange={v => set('supportPhone', v)}
          prefix={<FaPhoneAlt size={12} />}
        />
        <Field
          label="البريد الإلكتروني للمنصة"
          hint="support@lavender.com"
          value={settings.supportEmail}
          onChange={v => set('supportEmail', v)}
          prefix={<FaEnvelope size={12} />}
        />

        <div style={{ marginBottom: 0 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#5d4037', marginBottom: 7 }}>
            <FaInfoCircle size={12} style={{ marginLeft: 6, color: '#a0785a' }} />
            نص "حول التطبيق"
          </label>
          <textarea
            value={settings.aboutText ?? ''}
            onChange={e => set('aboutText', e.target.value)}
            placeholder="اكتب نبذة عن المنصة تظهر للمستخدمين..."
            rows={4}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              border: '1px solid #e0d6cc', fontSize: 14, resize: 'vertical',
              background: '#fdf9f5', color: '#3e2723', outline: 'none',
              fontFamily: "'Cairo','Tajawal',sans-serif", boxSizing: 'border-box',
              lineHeight: 1.8, transition: 'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = '#c8a882'}
            onBlur={e => e.target.style.borderColor = '#e0d6cc'}
          />
        </div>
      </Card>

      {/* ══════════════════════════════════════════
          CARD 3 — وضع الصيانة
      ══════════════════════════════════════════ */}
      <Card
        title="إدارة النظام"
        icon={<FaShieldAlt />}
        desc="التحكم بحالة النظام"
      >
        <Toggle
          label="وضع الصيانة"
          desc={settings.maintenanceMode
            ? '⚠️ النظام الآن موقوف للمستخدمين — يعمل فقط للأدمن'
            : 'عند التفعيل: يُغلق النظام أمام الزبائن والكافيهات مؤقتاً'
          }
          value={settings.maintenanceMode}
          onChange={toggleMaintenance}
          danger={true}
        />

        {settings.maintenanceMode && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: '#fff3e0', border: '1px solid #ffe0b2',
            fontSize: 13, color: '#e65100', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
          }}>
            ⚠️ الزبائن يرون الآن: "النظام تحت الصيانة المؤقتة، سنعود قريباً"
          </div>
        )}
      </Card>

      {/* ── Save Button ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 32 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            background: saving ? '#d7ccc8' : 'linear-gradient(135deg, #c8a882, #a0785a)',
            color: saving ? '#9e9e9e' : '#1a110e',
            border: 'none', padding: '13px 36px', borderRadius: 12,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: "'Cairo','Tajawal',sans-serif",
            fontSize: 15, fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: 9,
            boxShadow: saving ? 'none' : '0 4px 14px rgba(160,120,90,0.35)',
            transition: 'all .2s',
          }}
        >
          <FaSave size={15} />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;