import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import api from '../../api';
import {
  FaUsers, FaSync, FaSearch, FaTrash, FaEdit, FaCheckCircle,
  FaTimesCircle, FaUserShield, FaStore, FaCoffee,
  FaPhone, FaEnvelope, FaStar, FaShoppingBag, FaEye,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { MdVerified, MdClose } from 'react-icons/md';

/* ─── Config ─── */
const ALLOWED_ROLES = {
  CafeOwner: { ar: 'صاحب كافيه', color: '#b76e00', bg: '#fff3d6', icon: <FaStore size={11} /> },
};

const ALL_ROLES = {
  ...ALLOWED_ROLES,
  Admin: { ar: 'أدمن', color: '#7c3aed', bg: '#ede9ff', icon: <FaUserShield size={11} /> },
};

const RoleBadge = ({ role }) => {
  const r = ALL_ROLES[role] || { ar: role, color: '#a0785a', bg: '#fdf1e8', icon: <FaStore size={11} /> };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      color: r.color, background: r.bg, whiteSpace: 'nowrap',
    }}>
      {r.icon} {r.ar}
    </span>
  );
};

const fullName = u =>
  `${u.firstName ?? u.FirstName ?? ''} ${u.lastName ?? u.LastName ?? ''}`.trim() || '—';
const getId = u => u.customerID ?? u.CustomerID;

/* ─── StatCard ─── */
const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '14px 16px',
    border: '1px solid rgba(200,168,130,0.15)',
    boxShadow: '0 2px 8px rgba(62,39,35,.05)',
    display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 19, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#3e2723', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#a0785a', marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

/* ─── User Detail Drawer ─── */
const UserDrawer = ({ user, orders, onClose }) => {
  const name   = fullName(user);
  const role   = user.role ?? user.Role ?? 'CafeOwner';
  const isAdmin= role === 'Admin';
  const email  = user.email  ?? user.Email  ?? '—';
  const phone  = user.phone  ?? user.Phone  ?? '—';
  const points = user.loyaltyPoints ?? user.LoyaltyPoints ?? 0;

  const userOrders = orders.filter(o =>
    (o.customerID ?? o.CustomerID ?? o.customer?.customerID) === getId(user)
  );
  const totalSpent = userOrders.reduce((s, o) => s + (o.totalAmount ?? o.TotalAmount ?? 0), 0);

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(10,5,0,.5)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'flex-end',
      fontFamily: "'Cairo',sans-serif", direction: 'rtl',
    }}>
      <div style={{
        width: '100%', maxWidth: 420, height: '100%',
        background: '#fff', overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(0,0,0,.2)',
        animation: 'slideIn .25s ease',
      }}>
        <div style={{
          padding: '16px 18px',
          background: 'linear-gradient(135deg,#3e2723,#6d4c41)',
          position: 'sticky', top: 0, zIndex: 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>تفاصيل صاحب الكافيه</div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8,
              width: 30, height: 30, cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><MdClose size={15} /></button>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              width: 70, height: 70, borderRadius: '50%', margin: '0 auto 10px',
              background: isAdmin
                ? 'linear-gradient(135deg,#7c3aed,#5b21b6)'
                : 'linear-gradient(135deg,#c8a882,#a0785a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#fff',
              boxShadow: '0 4px 16px rgba(62,39,35,.2)',
            }}>
              {(user.firstName ?? user.FirstName ?? '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#3e2723', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {name}
              {isAdmin && <MdVerified style={{ color: '#7c3aed', fontSize: 16 }} />}
            </div>
            <div style={{ marginTop: 6 }}><RoleBadge role={role} /></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[
              { icon: <FaEnvelope size={12} />, label: 'البريد الإلكتروني', value: email },
              { icon: <FaPhone size={12} />,    label: 'رقم الجوال',        value: phone },
              { icon: <FaStore size={12} />,    label: 'رقم المستخدم',      value: `#${getId(user)}` },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10,
                background: '#fdfaf8', border: '1px solid rgba(200,168,130,.12)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: 'linear-gradient(135deg,#c8a882,#a0785a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a110e',
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#c8a882', letterSpacing: 1, textTransform: 'uppercase' }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#3e2723' }}>{f.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Role Modal ─── */
const EditRoleModal = ({ user, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const name = fullName(user);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/Account/user/${getId(user)}/role`, { role: 'CafeOwner' });
      onSave(getId(user), 'CafeOwner');
      onClose();
      Swal.fire({
        icon: 'success', title: 'تم التحديث',
        text: 'تم تأكيد دور صاحب الكافيه بنجاح.',
        timer: 1800, showConfirmButton: false,
        iconColor: '#15803d',
      });
    } catch {
      Swal.fire({
        icon: 'error', title: 'فشل التحديث',
        text: 'حدث خطأ أثناء تحديث الدور.',
        confirmButtonColor: '#1f130f', confirmButtonText: 'حسناً',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(10,5,0,.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', direction: 'rtl', fontFamily: "'Cairo',sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 22, width: '100%', maxWidth: 400,
        boxShadow: '0 32px 80px rgba(62,39,35,.22)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 20px',
          background: 'linear-gradient(135deg,#3e2723,#6d4c41)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaEdit color="#c8a882" /> تأكيد دور صاحب الكافيه
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8,
            width: 30, height: 30, cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><MdClose size={15} /></button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
            padding: '12px 14px', borderRadius: 12,
            background: '#fdf8f5', border: '1px solid rgba(200,168,130,.15)',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'linear-gradient(135deg,#c8a882,#a0785a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 900, color: '#1a110e', flexShrink: 0,
            }}>
              {(user.firstName ?? user.FirstName ?? '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#3e2723' }}>{name}</div>
              <div style={{ fontSize: 12, color: '#a0785a' }}>{user.email ?? user.Email}</div>
            </div>
          </div>

          <div style={{
            padding: '12px 14px', borderRadius: 12, marginBottom: 18,
            background: '#fff3d6', border: '1px solid #ffe082',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <FaStore color="#b76e00" />
            <span style={{ fontSize: 13, color: '#b76e00', fontWeight: 700 }}>
              الدور: صاحب كافيه
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '10px', borderRadius: 11,
              background: '#f5f0eb', border: '1px solid rgba(200,168,130,.25)',
              color: '#5d4037', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            }}>إلغاء</button>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 2, padding: '10px', borderRadius: 11,
              background: 'linear-gradient(135deg,#c8a882,#a0785a)',
              border: 'none', color: '#1a110e', cursor: 'pointer',
              fontSize: 13, fontWeight: 800, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: saving ? .7 : 1,
            }}>
              {saving ? 'جاري الحفظ...' : '💾 تأكيد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── User Row ─── */
const UserRow = ({ user, onEdit, onDelete, onView, isEven }) => {
  const role    = user.role ?? user.Role ?? 'CafeOwner';
  const isAdmin = role === 'Admin';
  const name    = fullName(user);
  const email   = user.email ?? user.Email ?? '—';
  const phone   = user.phone ?? user.Phone ?? '—';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '44px 1fr 150px 110px 72px',
      alignItems: 'center', gap: 10,
      padding: '9px 16px',
      background: isEven ? '#fdfaf8' : '#fff',
      borderBottom: '1px solid rgba(200,168,130,.1)',
      transition: 'background .12s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#f5ede8'}
    onMouseLeave={e => e.currentTarget.style.background = isEven ? '#fdfaf8' : '#fff'}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: isAdmin
          ? 'linear-gradient(135deg,#7c3aed,#5b21b6)'
          : 'linear-gradient(135deg,#c8a882,#a0785a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900, color: '#fff',
      }}>
        {(user.firstName ?? user.FirstName ?? '?').charAt(0).toUpperCase()}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#3e2723', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
          {isAdmin && <MdVerified style={{ color: '#7c3aed', fontSize: 12, flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: 10, color: '#a0785a', display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <FaEnvelope size={8} /> {email}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#5d4037', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
        <FaPhone size={9} color="#c8a882" /> {phone}
      </div>

      <RoleBadge role={role} />

      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        <button onClick={() => onView(user)} title="عرض التفاصيل" style={{
          width: 28, height: 28, borderRadius: 7,
          background: '#e3f2fd', border: '1px solid rgba(21,101,192,.15)',
          color: '#1565c0', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#1565c0'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#e3f2fd'; e.currentTarget.style.color = '#1565c0'; }}
        ><FaEye size={10} /></button>

        {!isAdmin && (
          <button onClick={() => onDelete(user)} title="حذف" style={{
            width: 28, height: 28, borderRadius: 7,
            background: '#fdecea', border: '1px solid rgba(198,40,40,.15)',
            color: '#c62828', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#c62828'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fdecea'; e.currentTarget.style.color = '#c62828'; }}
          ><FaTrash size={10} /></button>
        )}
      </div>
    </div>
  );
};

/* ─── Main ─── */
const AdminUsers = () => {
  const [users,        setUsers]        = useState([]);
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [editingUser,  setEditingUser]  = useState(null);
  const [viewingUser,  setViewingUser]  = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, ordersRes] = await Promise.all([
        api.get('/Account/all-users'),
        api.get('/Orders/all-orders').catch(() => ({ data: [] })),
      ]);
      // فلتر: أصحاب الكافيهات والأدمن فقط (استبعاد الزبائن)
      const allUsers = usersRes.data || [];
      const filtered = allUsers.filter(u => {
        const role = u.role ?? u.Role ?? '';
        return role === 'CafeOwner' || role === 'Admin';
      });
      setUsers(filtered);
      setOrders(ordersRes.data || []);
    } catch {
      Swal.fire({
        icon: 'error', title: 'خطأ في التحميل',
        text: 'تعذّر تحميل بيانات المستخدمين.',
        confirmButtonColor: '#1f130f', confirmButtonText: 'حسناً',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRoleSave = (id, newRole) => {
    setUsers(prev => prev.map(u => getId(u) === id ? { ...u, role: newRole, Role: newRole } : u));
  };

  const handleDelete = async (user) => {
    const name = fullName(user);
    const result = await Swal.fire({
      icon: 'warning',
      title: `حذف "${name}"؟`,
      html: `
        <p style="font-family:'Cairo',sans-serif; font-size:13px; color:#5d4037; margin:0; text-align:right">
          سيتم حذف صاحب الكافيه وجميع بياناته نهائياً.<br/>
          <strong style="color:#b91c1c">هذا الإجراء لا يمكن التراجع عنه.</strong>
        </p>
      `,
      showCancelButton:   true,
      confirmButtonColor: '#b91c1c',
      cancelButtonColor:  '#f5f0eb',
      confirmButtonText:  'نعم، احذف',
      cancelButtonText:   'إلغاء',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/Account/user/${getId(user)}`);
      setUsers(prev => prev.filter(u => getId(u) !== getId(user)));
      Swal.fire({
        icon: 'success', title: 'تم الحذف',
        text: `تم حذف "${name}" بنجاح.`,
        timer: 2000, showConfirmButton: false, iconColor: '#15803d',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error', title: 'فشل الحذف',
        text: err?.response?.data?.message ?? 'حدث خطأ أثناء الحذف.',
        confirmButtonColor: '#1f130f', confirmButtonText: 'حسناً',
      });
    }
  };

  const displayed = users.filter(u => {
    const name  = fullName(u).toLowerCase();
    const email = (u.email ?? u.Email ?? '').toLowerCase();
    return !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const counts = {
    total:     users.length,
    cafeOwner: users.filter(u => (u.role ?? u.Role) === 'CafeOwner').length,
    admin:     users.filter(u => (u.role ?? u.Role) === 'Admin').length,
  };

  const totalSpent = orders
    .filter(o => ['Completed','Delivered','Done'].includes(o.status ?? o.Status))
    .reduce((s, o) => s + (o.totalAmount ?? o.TotalAmount ?? 0), 0);

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
        .swal2-popup { font-family: 'Cairo', sans-serif !important; direction: rtl !important; }
        .swal2-title, .swal2-html-container { text-align: right !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#3e2723', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaStore color="#c8a882" /> أصحاب الكافيهات
          </h1>
          <p style={{ fontSize: 12, color: '#8d6e63', margin: 0 }}>
            {counts.cafeOwner} صاحب كافيه مسجل في النظام
          </p>
        </div>
        <button onClick={fetchAll} style={{
          background: '#f5f0eb', color: '#5d4037',
          border: '1px solid rgba(200,168,130,0.3)',
          padding: '8px 14px', borderRadius: 9, cursor: 'pointer',
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <FaSync size={11} /> تحديث
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard icon={<FaStore />}        label="أصحاب الكافيهات"   value={counts.cafeOwner}            color="#b76e00" bg="#fff3d6" />
        <StatCard icon={<FaUserShield />}   label="الأدمن"             value={counts.admin}                color="#7c3aed" bg="#ede9ff" />
        <StatCard icon={<FaShoppingBag />}  label="إجمالي الطلبات"    value={orders.length}               color="#2e7d32" bg="#e8f5e9" />
        <StatCard icon={<FaMoneyBillWave />} label="إجمالي المبيعات"  value={`₪${totalSpent.toFixed(0)}`} color="#1565c0" bg="#e3f2fd" />
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <FaSearch size={11} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#c8a882', pointerEvents: 'none' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الإيميل..."
            style={{
              width: '100%', padding: '8px 32px 8px 12px', borderRadius: 10,
              border: '1px solid rgba(200,168,130,.3)', fontSize: 12,
              background: '#fff', color: '#3e2723', fontFamily: "'Cairo',sans-serif",
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#8d6e63' }}>
          <FaCoffee size={36} color="#c8a882" style={{ marginBottom: 10 }} />
          <p>جاري تحميل البيانات...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 18, border: '2px dashed rgba(200,168,130,.3)' }}>
          <FaUsers size={34} color="#c8a882" style={{ opacity: .4, marginBottom: 10 }} />
          <p style={{ color: '#5d4037', fontSize: 15, fontWeight: 700 }}>لا توجد نتائج</p>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid rgba(200,168,130,.2)',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(62,39,35,.06)',
        }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '44px 1fr 150px 110px 72px',
            gap: 10, padding: '9px 16px',
            background: 'linear-gradient(135deg,#1a110e,#2d1b14)',
          }}>
            {['', 'صاحب الكافيه', 'الجوال', 'الدور', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 10, fontWeight: 800, color: '#c8a882', letterSpacing: 1, textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {displayed.map((user, i) => (
            <UserRow
              key={getId(user)}
              user={user}
              orders={orders}
              isEven={i % 2 === 1}
              onEdit={setEditingUser}
              onDelete={handleDelete}
              onView={setViewingUser}
            />
          ))}

          <div style={{
            padding: '7px 16px', background: '#fdf8f5',
            borderTop: '1px solid rgba(200,168,130,.12)',
            fontSize: 11, color: '#a0785a', fontWeight: 600,
          }}>
            عرض {displayed.length} من {users.length} مستخدم
          </div>
        </div>
      )}

      {editingUser && <EditRoleModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleRoleSave} />}
      {viewingUser && <UserDrawer   user={viewingUser} orders={orders} onClose={() => setViewingUser(null)} />}
    </div>
  );
};

export default AdminUsers;