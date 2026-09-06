import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import api from '../../api';

/* ─── Tabler Icons via CDN (inject once) ─── */
const TablerIconsLink = () => {
  useEffect(() => {
    if (!document.getElementById('tabler-icons-css')) {
      const link = document.createElement('link');
      link.id   = 'tabler-icons-css';
      link.rel  = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/tabler-icons.min.css';
      document.head.appendChild(link);
    }
  }, []);
  return null;
};

/* ─── Helpers ─── */
const fullName  = u => `${u.firstName ?? u.FirstName ?? ''} ${u.lastName ?? u.LastName ?? ''}`.trim() || '—';
const getId     = u => u.customerID ?? u.CustomerID;
const getCafeId = c => c.cafeID ?? c.CafeID;

/* ─── Role Badge ─── */
const ALL_ROLES = {
  CafeOwner: { label: 'صاحب كافيه', color: '#854F0B', bg: '#FAEEDA' },
  Admin:     { label: 'مشرف',       color: '#534AB7', bg: '#EEEDFE' },
};
const RoleBadge = ({ role }) => {
  const r = ALL_ROLES[role] || { label: role, color: '#5F5E5A', bg: '#F1EFE8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      color: r.color, background: r.bg, whiteSpace: 'nowrap',
    }}>
      {role === 'Admin'
        ? <i className="ti ti-shield-check" style={{ fontSize: 12 }} />
        : <i className="ti ti-building-store" style={{ fontSize: 12 }} />
      }
      {r.label}
    </span>
  );
};

/* ─── Status Badge ─── */
const StatusBadge = ({ status, isBlocked }) => {
  if (isBlocked)
    return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#FCEBEB', color: '#A32D2D', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <i className="ti ti-lock" style={{ fontSize: 11 }} /> موقوف
    </span>;
  if (status === 'pending')
    return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#FAEEDA', color: '#854F0B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <i className="ti ti-clock" style={{ fontSize: 11 }} /> قيد الانتظار
    </span>;
  if (status === 'rejected')
    return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#F1EFE8', color: '#5F5E5A', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <i className="ti ti-x" style={{ fontSize: 11 }} /> مرفوض
    </span>;
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#E1F5EE', color: '#0F6E56', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <i className="ti ti-circle-check" style={{ fontSize: 11 }} /> نشط
  </span>;
};

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '16px 18px',
    border: '1px solid rgba(200,168,130,0.18)',
    boxShadow: '0 1px 6px rgba(62,39,35,.06)',
    display: 'flex', alignItems: 'center', gap: 14,
  }}>
    <div style={{
      width: 46, height: 46, borderRadius: 13, background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <i className={icon} style={{ fontSize: 20 }} />
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#3e2723', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#a0785a', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

/* ─── Add Cafe Modal ─── */
const AddCafeModal = ({ onClose, onAdd }) => {
  const [form, setForm]   = useState({ Name: '', City: '', Phone: '', Category: '', Address: '', Description: '', OwnerID: '' });
  const [loading, setLoading] = useState(false);
  const MAX_DESC = 500;

  const handleSubmit = async () => {
    if (!form.Name || !form.City || !form.Category) {
      Swal.fire({ icon: 'warning', title: 'بيانات ناقصة', text: 'يرجى تعبئة الاسم والمدينة والفئة على الأقل.', confirmButtonColor: '#3e2723', confirmButtonText: 'حسناً' });
      return;
    }
    setLoading(true);
    try {
      await onAdd({ ...form, OwnerID: form.OwnerID ? parseInt(form.OwnerID) : null });
      onClose();
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'Name',        label: 'اسم الكافيه *',   type: 'text',     placeholder: 'مثال: كافيه الأصالة',  icon: 'ti-building-store' },
    { key: 'City',        label: 'المدينة *',        type: 'text',     placeholder: 'مثال: رام الله',        icon: 'ti-map-pin' },
    { key: 'Category',    label: 'الفئة *',          type: 'text',     placeholder: 'مثال: قهوة، حلويات',    icon: 'ti-tag' },
    { key: 'Phone',       label: 'رقم الهاتف',       type: 'text',     placeholder: '05xxxxxxxx',            icon: 'ti-phone' },
    { key: 'Address',     label: 'العنوان',          type: 'text',     placeholder: 'العنوان التفصيلي',      icon: 'ti-map' },
    { key: 'OwnerID',     label: 'رقم المالك',       type: 'number',   placeholder: 'اختياري',              icon: 'ti-user' },
    { key: 'Description', label: 'الوصف',            type: 'textarea', placeholder: 'وصف مختصر...',         icon: 'ti-notes' },
  ];

  const inputStyle = {
    width: '100%', padding: '9px 38px 9px 12px', borderRadius: 10,
    border: '1.5px solid #e8e0d8', fontSize: 13, fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none', direction: 'rtl', color: '#3e2723',
    transition: 'border-color .15s',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', direction: 'rtl', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        {/* Modal Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0ebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '20px 20px 0 0' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3e2723', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-plus" style={{ fontSize: 16, color: '#0F6E56' }} />
            </div>
            إضافة كافيه جديد
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e8e0d8', background: '#fafaf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#5d4037', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <i className={`ti ${f.icon}`} style={{ position: 'absolute', right: 11, top: f.type === 'textarea' ? 11 : '50%', transform: f.type === 'textarea' ? 'none' : 'translateY(-50%)', fontSize: 14, color: '#c8a882', pointerEvents: 'none' }} />
                {f.type === 'textarea' ? (
                  <>
                    <textarea value={form[f.key]} onChange={e => { if (e.target.value.length <= MAX_DESC) setForm(p => ({ ...p, [f.key]: e.target.value })); }}
                      placeholder={f.placeholder} rows={3} maxLength={MAX_DESC}
                      style={{ ...inputStyle, paddingBottom: 26, resize: 'none' }} />
                    <span style={{ position: 'absolute', bottom: 7, left: 10, fontSize: 11, color: form[f.key].length >= MAX_DESC ? '#E24B4A' : '#bbb' }}>{form[f.key].length} / {MAX_DESC}</span>
                  </>
                ) : (
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputStyle} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid #f0ebe6', display: 'flex', gap: 10 }}>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '11px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg,#3e2723,#6d4c41)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading ? <><i className="ti ti-loader-2" style={{ fontSize: 14 }} /> جارٍ الإضافة...</> : <><i className="ti ti-plus" style={{ fontSize: 14 }} /> إضافة الكافيه</>}
          </button>
          <button onClick={onClose} style={{ padding: '11px 20px', borderRadius: 11, border: '1.5px solid #e8e0d8', background: '#fff', color: '#5d4037', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Owner Drawer ─── */
const OwnerDrawer = ({ user, cafes, onClose }) => {
  const name    = fullName(user);
  const role    = user.role ?? user.Role ?? 'CafeOwner';
  const isAdmin = role === 'Admin';
  const email   = user.email ?? user.Email ?? '—';
  const phone   = user.phone ?? user.Phone ?? '—';

  const userCafes = cafes.filter(c => {
    const ownerId = c.ownerID ?? c.OwnerID ?? c.owner?.customerID;
    return ownerId === getId(user);
  });

  const infoRows = [
    { icon: 'ti-mail',   label: 'البريد الإلكتروني', value: email },
    { icon: 'ti-phone',  label: 'الهاتف',             value: phone },
    { icon: 'ti-hash',   label: 'رقم المستخدم',       value: `#${getId(user)}` },
  ];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(10,5,0,.45)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'flex-start',
      fontFamily: 'inherit', direction: 'rtl',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, height: '100%',
        background: '#fff', overflowY: 'auto',
        boxShadow: '8px 0 40px rgba(0,0,0,.15)',
        animation: 'slideInRTL .25s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg,#3e2723,#6d4c41)', position: 'sticky', top: 0, zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-user-circle" style={{ fontSize: 18 }} />
              تفاصيل صاحب الكافيه
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-x" style={{ fontSize: 15 }} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
              background: isAdmin ? 'linear-gradient(135deg,#534AB7,#3C3489)' : 'linear-gradient(135deg,#c8a882,#a0785a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: '#fff',
              boxShadow: '0 4px 20px rgba(62,39,35,.2)',
            }}>
              {(user.firstName ?? user.FirstName ?? '؟').charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#3e2723' }}>{name}</div>
            <div style={{ marginTop: 7 }}><RoleBadge role={role} /></div>
          </div>

          {/* Info Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {infoRows.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: '#fdfaf8', border: '1px solid rgba(200,168,130,.15)' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: '#f0ebe6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${f.icon}`} style={{ fontSize: 14, color: '#a0785a' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#c8a882', textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#3e2723', marginTop: 1 }}>{f.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Cafes */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#3e2723', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-building-store" style={{ fontSize: 14, color: '#c8a882' }} />
              الكافيهات ({userCafes.length})
            </div>
            {userCafes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#a0785a', fontSize: 13, background: '#fdfaf8', borderRadius: 12, border: '1.5px dashed rgba(200,168,130,.3)' }}>
                <i className="ti ti-building-off" style={{ fontSize: 24, display: 'block', marginBottom: 6, opacity: .5 }} />
                لا توجد كافيهات مرتبطة
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {userCafes.map(cafe => {
                  const status  = (cafe.status ?? cafe.Status ?? '').toLowerCase();
                  const blocked = cafe.isBlockedByAdmin ?? cafe.IsBlockedByAdmin ?? false;
                  return (
                    <div key={getCafeId(cafe)} style={{ padding: '10px 14px', borderRadius: 12, background: '#fdfaf8', border: '1px solid rgba(200,168,130,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#3e2723' }}>{cafe.name ?? cafe.Name ?? '—'}</div>
                        <div style={{ fontSize: 11, color: '#a0785a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="ti ti-map-pin" style={{ fontSize: 11 }} />
                          {cafe.city ?? cafe.City ?? ''}
                        </div>
                      </div>
                      <StatusBadge status={status} isBlocked={blocked} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const AdminCafes = () => {
  const [activeTab,     setActiveTab]     = useState('cafes');
  const [cafes,         setCafes]         = useState([]);
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [viewingUser,   setViewingUser]   = useState(null);

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cafesRes, usersRes] = await Promise.all([
        api.get('/Admin/cafes'),
        api.get('/Account/all-users').catch(() => ({ data: [] })),
      ]);
      setCafes(Array.isArray(cafesRes.data) ? cafesRes.data : []);
      const allUsers = usersRes.data || [];
      setUsers(allUsers.filter(u => { const r = u.role ?? u.Role ?? ''; return r === 'CafeOwner' || r === 'Admin'; }));
    } catch {
      Swal.fire({ icon: 'error', title: 'خطأ', text: 'فشل تحميل البيانات.', confirmButtonColor: '#3e2723', confirmButtonText: 'حسناً' });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Actions ── */
  const handleApprove = async (cafe) => {
    const id = getCafeId(cafe), name = cafe.name ?? cafe.Name ?? 'الكافيه';
    const result = await Swal.fire({ icon: 'question', title: `قبول "${name}"؟`, text: 'سيتم تفعيل الكافيه وسيتمكن المالك من استخدام النظام.', showCancelButton: true, confirmButtonColor: '#0F6E56', cancelButtonColor: '#f5f5f5', confirmButtonText: 'نعم، قبول', cancelButtonText: 'إلغاء' });
    if (!result.isConfirmed) return;
    try {
      setActionLoading(id);
      await api.put(`/Admin/cafes/${id}/approve`);
      setCafes(prev => prev.map(c => getCafeId(c) === id ? { ...c, status: 'approved', Status: 'approved', isBlockedByAdmin: false } : c));
      Swal.fire({ icon: 'success', title: 'تم القبول', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشل الإجراء', text: err?.response?.data?.message ?? 'حدث خطأ ما.', confirmButtonColor: '#3e2723', confirmButtonText: 'حسناً' });
    } finally { setActionLoading(null); }
  };

  const handleReject = async (cafe) => {
    const id = getCafeId(cafe), name = cafe.name ?? cafe.Name ?? 'الكافيه';
    const result = await Swal.fire({ icon: 'warning', title: `رفض "${name}"؟`, text: 'سيتم رفض طلب انضمام هذا الكافيه.', showCancelButton: true, confirmButtonColor: '#A32D2D', cancelButtonColor: '#f5f5f5', confirmButtonText: 'نعم، رفض', cancelButtonText: 'إلغاء' });
    if (!result.isConfirmed) return;
    try {
      setActionLoading(id);
      await api.put(`/Admin/cafes/${id}/reject`);
      setCafes(prev => prev.map(c => getCafeId(c) === id ? { ...c, status: 'rejected', Status: 'rejected' } : c));
      Swal.fire({ icon: 'success', title: 'تم الرفض', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشل الإجراء', text: err?.response?.data?.message ?? 'حدث خطأ ما.', confirmButtonColor: '#3e2723', confirmButtonText: 'حسناً' });
    } finally { setActionLoading(null); }
  };

  const handleSuspend = async (cafe) => {
    const id = getCafeId(cafe), name = cafe.name ?? cafe.Name ?? 'الكافيه';
    const { value: reason, isConfirmed } = await Swal.fire({
      icon: 'warning', title: `إيقاف "${name}"`,
      html: `<p style="font-size:13px;color:#555;margin:0 0 12px;text-align:right">سيتم إيقاف الكافيه ومنع المالك من إدارته.</p>
             <textarea id="swal-reason" placeholder="اكتب سبب الإيقاف..." style="width:100%;min-height:90px;padding:10px 12px;border:1.5px solid #e0d5cc;border-radius:10px;font-size:13px;color:#3e2723;resize:none;direction:rtl;outline:none;box-sizing:border-box;"></textarea>`,
      showCancelButton: true, confirmButtonColor: '#A32D2D', cancelButtonColor: '#f5f5f5',
      confirmButtonText: 'إيقاف', cancelButtonText: 'إلغاء', focusConfirm: false,
      preConfirm: () => { const val = document.getElementById('swal-reason')?.value?.trim(); if (!val) { Swal.showValidationMessage('يرجى كتابة سبب الإيقاف'); return false; } return val; },
    });
    if (!isConfirmed || !reason) return;
    try {
      setActionLoading(id);
      await api.put(`/Admin/cafes/${id}/suspend`, { reason });
      setCafes(prev => prev.map(c => getCafeId(c) === id ? { ...c, isBlockedByAdmin: true, suspensionReason: reason } : c));
      Swal.fire({ icon: 'success', title: 'تم الإيقاف', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشل الإيقاف', text: err?.response?.data?.message ?? 'حدث خطأ ما.', confirmButtonColor: '#3e2723', confirmButtonText: 'حسناً' });
    } finally { setActionLoading(null); }
  };

  const handleUnsuspend = async (cafe) => {
    const id = getCafeId(cafe), name = cafe.name ?? cafe.Name ?? 'الكافيه';
    const result = await Swal.fire({ icon: 'question', title: `تفعيل "${name}"؟`, text: 'سيتم رفع الإيقاف وسيتمكن المالك من استخدام النظام.', showCancelButton: true, confirmButtonColor: '#0F6E56', cancelButtonColor: '#f5f5f5', confirmButtonText: 'نعم، تفعيل', cancelButtonText: 'إلغاء' });
    if (!result.isConfirmed) return;
    try {
      setActionLoading(id);
      await api.put(`/Admin/cafes/${id}/unsuspend`);
      setCafes(prev => prev.map(c => getCafeId(c) === id ? { ...c, isBlockedByAdmin: false, suspensionReason: null } : c));
      Swal.fire({ icon: 'success', title: 'تم التفعيل', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشل التفعيل', text: err?.response?.data?.message ?? 'حدث خطأ ما.', confirmButtonColor: '#3e2723', confirmButtonText: 'حسناً' });
    } finally { setActionLoading(null); }
  };

  const handleAddCafe = async (formData) => {
    try {
      const res = await api.post('/Admin/cafes', formData);
      await fetchAll();
      Swal.fire({ icon: 'success', title: 'تمت الإضافة بنجاح', text: `تمت إضافة الكافيه برقم #${res.data?.cafeID ?? ''}`, timer: 2500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشلت الإضافة', text: err?.response?.data?.message ?? 'حدث خطأ ما.', confirmButtonColor: '#3e2723', confirmButtonText: 'حسناً' });
      throw err;
    }
  };

  const handleDeleteUser = async (user) => {
    const name = fullName(user);
    const result = await Swal.fire({
      icon: 'warning', title: `حذف "${name}"؟`,
      html: `<p style="font-size:13px;color:#5d4037;margin:0;text-align:right">سيتم حذف صاحب الكافيه وجميع بياناته بشكل دائم.<br/><strong style="color:#b91c1c">لا يمكن التراجع عن هذا الإجراء.</strong></p>`,
      showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#f5f0eb',
      confirmButtonText: 'نعم، احذف', cancelButtonText: 'إلغاء',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/Account/user/${getId(user)}`);
      setUsers(prev => prev.filter(u => getId(u) !== getId(user)));
      Swal.fire({ icon: 'success', title: 'تم الحذف', text: `تم حذف "${name}" بنجاح.`, timer: 2000, showConfirmButton: false, iconColor: '#15803d' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشل الحذف', text: err?.response?.data?.message ?? 'حدث خطأ ما.', confirmButtonColor: '#1f130f', confirmButtonText: 'حسناً' });
    }
  };

  /* ── Counts & Filters ── */
  const cafeCounts = {
    all:       cafes.length,
    pending:   cafes.filter(c => (c.status ?? c.Status ?? '').toLowerCase() === 'pending').length,
    approved:  cafes.filter(c => (c.status ?? c.Status ?? '').toLowerCase() === 'approved' && !(c.isBlockedByAdmin ?? false)).length,
    suspended: cafes.filter(c => c.isBlockedByAdmin ?? c.IsBlockedByAdmin ?? false).length,
    rejected:  cafes.filter(c => (c.status ?? c.Status ?? '').toLowerCase() === 'rejected').length,
  };

  const filteredCafes = cafes.filter(c => {
    const name    = (c.name ?? c.Name ?? '').toLowerCase();
    const city    = (c.city ?? c.City ?? '').toLowerCase();
    const status  = (c.status ?? c.Status ?? '').toLowerCase();
    const blocked = c.isBlockedByAdmin ?? c.IsBlockedByAdmin ?? false;
    const matchSearch = !search || name.includes(search.toLowerCase()) || city.includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all'       ? true :
      statusFilter === 'pending'   ? status === 'pending' :
      statusFilter === 'approved'  ? (status === 'approved' && !blocked) :
      statusFilter === 'suspended' ? blocked :
      statusFilter === 'rejected'  ? status === 'rejected' : true;
    return matchSearch && matchStatus;
  });

  const filteredUsers = users.filter(u => {
    const name  = fullName(u).toLowerCase();
    const email = (u.email ?? u.Email ?? '').toLowerCase();
    return !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const userCounts = {
    cafeOwner: users.filter(u => (u.role ?? u.Role) === 'CafeOwner').length,
    admin:     users.filter(u => (u.role ?? u.Role) === 'Admin').length,
  };

  /* ── Shared Styles ── */
  const thStyle = {
    padding: '11px 16px', fontSize: 11, fontWeight: 700, color: '#c8a882',
    textAlign: 'right', borderBottom: '1px solid rgba(200,168,130,.2)',
    whiteSpace: 'nowrap', background: '#1e120f', letterSpacing: 0.4,
  };
  const tdStyle = {
    padding: '12px 16px', fontSize: 13, color: '#2d1b14',
    borderBottom: '1px solid #f5f0eb', verticalAlign: 'middle', textAlign: 'right',
  };
  const actionBtn = (bg, color, border) => ({
    padding: '5px 12px', borderRadius: 8, border: `1px solid ${border}`,
    background: bg, color, fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
    transition: 'opacity .15s',
  });

  const statusFilters = [
    { key: 'all',       label: 'الكل',     count: cafeCounts.all },
    { key: 'pending',   label: 'انتظار',   count: cafeCounts.pending },
    { key: 'approved',  label: 'نشط',      count: cafeCounts.approved },
    { key: 'suspended', label: 'موقوف',    count: cafeCounts.suspended },
    { key: 'rejected',  label: 'مرفوض',    count: cafeCounts.rejected },
  ];

  return (
    <div dir="rtl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <TablerIconsLink />
      <style>{`
        @keyframes slideInRTL { from { transform:translateX(-100%); } to { transform:translateX(0); } }
        .swal2-popup { font-family: system-ui,-apple-system,sans-serif !important; direction: rtl !important; }
        .swal2-title, .swal2-html-container { text-align: right !important; }
        .ac-row:hover td { background: #fdf8f5 !important; }
        .ac-action-btn:hover { opacity: 0.8; }
      `}</style>

      {showAddModal && <AddCafeModal onClose={() => setShowAddModal(false)} onAdd={handleAddCafe} />}
      {viewingUser  && <OwnerDrawer user={viewingUser} cafes={cafes} onClose={() => setViewingUser(null)} />}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#3e2723', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fdf3e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-building-store" style={{ fontSize: 18, color: '#a0785a' }} />
            </div>
            إدارة الكافيهات
          </h1>
          <p style={{ fontSize: 12, color: '#8d6e63', margin: 0, paddingRight: 46 }}>
            {cafes.length} كافيه — {cafeCounts.pending} قيد الانتظار — {userCounts.cafeOwner} صاحب كافيه
          </p>
        </div>
        <button onClick={fetchAll} style={{ background: '#fff', color: '#5d4037', border: '1px solid rgba(200,168,130,0.35)', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <i className="ti ti-refresh" style={{ fontSize: 14 }} /> تحديث
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 3, background: '#f0ebe6', borderRadius: 13, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {[
          { key: 'cafes',  label: 'الكافيهات',      icon: 'ti-building-store', count: cafes.length },
          { key: 'owners', label: 'أصحاب الكافيهات', icon: 'ti-users',          count: userCounts.cafeOwner },
        ].map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setSearch(''); setStatusFilter('all'); }} style={{
            padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, fontFamily: 'inherit',
            background: activeTab === t.key ? '#fff' : 'transparent',
            color: activeTab === t.key ? '#3e2723' : '#8d6e63',
            boxShadow: activeTab === t.key ? '0 1px 6px rgba(62,39,35,.1)' : 'none',
            display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s',
          }}>
            <i className={`ti ${t.icon}`} style={{ fontSize: 14 }} />
            {t.label}
            <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: activeTab === t.key ? '#fdf3e3' : 'rgba(0,0,0,0.06)', color: activeTab === t.key ? '#854F0B' : '#8d6e63' }}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#8d6e63' }}>
          <i className="ti ti-coffee" style={{ fontSize: 40, color: '#c8a882', display: 'block', marginBottom: 12 }} />
          <p style={{ fontWeight: 600, margin: 0 }}>جارٍ تحميل البيانات...</p>
        </div>
      ) : (
        <>
          {/* ════ TAB: CAFES ════ */}
          {activeTab === 'cafes' && (
            <>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 22 }}>
                <StatCard icon="ti-building-store" label="إجمالي الكافيهات" value={cafeCounts.all}       color="#a0785a" bg="#fdf3e3" />
                <StatCard icon="ti-circle-check"   label="نشطة"             value={cafeCounts.approved}  color="#0F6E56" bg="#E1F5EE" />
                <StatCard icon="ti-clock"          label="قيد الانتظار"     value={cafeCounts.pending}   color="#854F0B" bg="#FAEEDA" />
                <StatCard icon="ti-lock"           label="موقوفة"           value={cafeCounts.suspended} color="#A32D2D" bg="#FCEBEB" />
                <StatCard icon="ti-x"              label="مرفوضة"           value={cafeCounts.rejected}  color="#5F5E5A" bg="#F1EFE8" />
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <i className="ti ti-search" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#c8a882', pointerEvents: 'none' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="البحث باسم الكافيه أو المدينة..."
                    style={{ width: '100%', padding: '8px 36px 8px 12px', borderRadius: 10, border: '1px solid rgba(200,168,130,.3)', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', direction: 'rtl', color: '#3e2723' }} />
                </div>
                <div style={{ display: 'flex', gap: 3, background: '#f0ebe6', borderRadius: 10, padding: 3, flexWrap: 'wrap' }}>
                  {statusFilters.map(f => (
                    <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{
                      padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                      fontSize: 11, fontWeight: statusFilter === f.key ? 700 : 500, fontFamily: 'inherit',
                      background: statusFilter === f.key ? '#fff' : 'transparent',
                      color: statusFilter === f.key ? '#3e2723' : '#8d6e63',
                      boxShadow: statusFilter === f.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {f.label}
                      <span style={{ fontSize: 10, background: statusFilter === f.key ? '#fdf3e3' : 'rgba(0,0,0,0.06)', color: statusFilter === f.key ? '#854F0B' : '#8d6e63', padding: '0 5px', borderRadius: 10 }}>{f.count}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#3e2723', color: '#f5e6d3', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  <i className="ti ti-plus" style={{ fontSize: 14 }} /> إضافة كافيه
                </button>
              </div>

              {/* Table */}
              {filteredCafes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '2px dashed rgba(200,168,130,.3)' }}>
                  <i className="ti ti-building-off" style={{ fontSize: 36, color: '#c8a882', display: 'block', marginBottom: 10, opacity: .5 }} />
                  <p style={{ color: '#8d6e63', fontSize: 14, margin: 0 }}>لا توجد كافيهات تطابق بحثك</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(200,168,130,.2)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(62,39,35,.06)' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>{['#', 'اسم الكافيه', 'المدينة', 'الهاتف', 'تاريخ الانضمام', 'الحالة', 'الإجراءات'].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {filteredCafes.map((cafe) => {
                          const id      = getCafeId(cafe);
                          const name    = cafe.name ?? cafe.Name ?? '—';
                          const city    = cafe.city ?? cafe.City ?? '—';
                          const phone   = cafe.phone ?? cafe.Phone ?? '—';
                          const date    = cafe.createdAt ?? cafe.CreatedAt;
                          const status  = (cafe.status ?? cafe.Status ?? '').toLowerCase();
                          const blocked = cafe.isBlockedByAdmin ?? cafe.IsBlockedByAdmin ?? false;
                          const reason  = cafe.suspensionReason ?? cafe.SuspensionReason;
                          const isLoading = actionLoading === id;
                          return (
                            <tr key={id} className="ac-row" style={{ transition: 'background .12s' }}>
                              <td style={{ ...tdStyle, fontWeight: 700, color: '#c8a882', fontSize: 12 }}>#{id}</td>
                              <td style={{ ...tdStyle, fontWeight: 700, color: '#3e2723' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0ebe6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className="ti ti-building-store" style={{ fontSize: 14, color: '#a0785a' }} />
                                  </div>
                                  {name}
                                </div>
                              </td>
                              <td style={{ ...tdStyle, color: '#5d4037' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <i className="ti ti-map-pin" style={{ fontSize: 12, color: '#c8a882' }} /> {city}
                                </div>
                              </td>
                              <td style={{ ...tdStyle, color: '#5d4037', direction: 'ltr', textAlign: 'right' }}>{phone}</td>
                              <td style={{ ...tdStyle, color: '#5d4037', fontSize: 12 }}>{date ? new Date(date).toLocaleDateString('ar-EG') : '—'}</td>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                                  <StatusBadge status={status} isBlocked={blocked} />
                                  {blocked && reason && (
                                    <div style={{ fontSize: 10, color: '#A32D2D', display: 'flex', alignItems: 'center', gap: 4, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={reason}>
                                      <i className="ti ti-alert-triangle" style={{ fontSize: 10, flexShrink: 0 }} /> {reason}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                  {status === 'pending' && (
                                    <>
                                      <button className="ac-action-btn" onClick={() => handleApprove(cafe)} disabled={isLoading} style={{ ...actionBtn('#E1F5EE', '#0F6E56', '#9FE1CB'), opacity: isLoading ? 0.5 : 1 }}>
                                        <i className="ti ti-check" style={{ fontSize: 11 }} /> قبول
                                      </button>
                                      <button className="ac-action-btn" onClick={() => handleReject(cafe)} disabled={isLoading} style={{ ...actionBtn('#FCEBEB', '#A32D2D', '#F7C1C1'), opacity: isLoading ? 0.5 : 1 }}>
                                        <i className="ti ti-x" style={{ fontSize: 11 }} /> رفض
                                      </button>
                                    </>
                                  )}
                                  {status === 'approved' && !blocked && (
                                    <button className="ac-action-btn" onClick={() => handleSuspend(cafe)} disabled={isLoading} style={{ ...actionBtn('#FAEEDA', '#854F0B', '#FAC775'), opacity: isLoading ? 0.5 : 1 }}>
                                      <i className="ti ti-lock" style={{ fontSize: 11 }} /> إيقاف
                                    </button>
                                  )}
                                  {blocked && (
                                    <button className="ac-action-btn" onClick={() => handleUnsuspend(cafe)} disabled={isLoading} style={{ ...actionBtn('#E1F5EE', '#0F6E56', '#9FE1CB'), opacity: isLoading ? 0.5 : 1 }}>
                                      <i className="ti ti-lock-open" style={{ fontSize: 11 }} /> تفعيل
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ════ TAB: OWNERS ════ */}
          {activeTab === 'owners' && (
            <>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <i className="ti ti-search" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#c8a882', pointerEvents: 'none' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="البحث باسم المستخدم أو البريد..."
                    style={{ width: '100%', padding: '8px 36px 8px 12px', borderRadius: 10, border: '1px solid rgba(200,168,130,.3)', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', direction: 'rtl', color: '#3e2723' }} />
                </div>
              </div>

              {/* Table */}
              {filteredUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16, border: '2px dashed rgba(200,168,130,.3)' }}>
                  <i className="ti ti-users-group" style={{ fontSize: 36, color: '#c8a882', display: 'block', marginBottom: 10, opacity: .5 }} />
                  <p style={{ color: '#8d6e63', fontSize: 14, margin: 0 }}>لا يوجد مستخدمون يطابقون بحثك</p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(200,168,130,.2)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(62,39,35,.06)' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>{['#', 'الاسم', 'البريد الإلكتروني', 'الدور', 'الإجراءات'].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => {
                          const id    = getId(user);
                          const name  = fullName(user);
                          const email = user.email ?? user.Email ?? '—';
                          const role  = user.role ?? user.Role ?? 'CafeOwner';
                          const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                          return (
                            <tr key={id} className="ac-row" style={{ transition: 'background .12s' }}>
                              <td style={{ ...tdStyle, fontWeight: 700, color: '#c8a882', fontSize: 12 }}>#{id}</td>
                              <td style={{ ...tdStyle, fontWeight: 700, color: '#3e2723' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: role === 'Admin' ? 'linear-gradient(135deg,#534AB7,#3C3489)' : 'linear-gradient(135deg,#c8a882,#a0785a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {initials || <i className="ti ti-user" style={{ fontSize: 14 }} />}
                                  </div>
                                  {name}
                                </div>
                              </td>
                              <td style={{ ...tdStyle, color: '#5d4037' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <i className="ti ti-mail" style={{ fontSize: 13, color: '#c8a882' }} /> {email}
                                </div>
                              </td>
                              <td style={tdStyle}><RoleBadge role={role} /></td>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  <button className="ac-action-btn" onClick={() => setViewingUser(user)} style={actionBtn('#f0ebe6', '#5d4037', '#e0d5cc')}>
                                    <i className="ti ti-eye" style={{ fontSize: 11 }} /> تفاصيل
                                  </button>
                                  <button className="ac-action-btn" onClick={() => handleDeleteUser(user)} style={actionBtn('#FCEBEB', '#A32D2D', '#F7C1C1')}>
                                    <i className="ti ti-trash" style={{ fontSize: 11 }} /> حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCafes;