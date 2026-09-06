import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  FaShoppingBag, FaClock, FaUser, FaPhone, FaMapMarkerAlt,
  FaReceipt, FaSync, FaSearch, FaCheckCircle, FaTimesCircle,
  FaTruck, FaHourglass, FaClipboardList, FaBoxOpen, FaPrint,
} from 'react-icons/fa';
import {
  MdRestaurantMenu, MdPendingActions, MdDoneAll, MdCancel,
  MdOutlineDeliveryDining, MdClose,
} from 'react-icons/md';

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending:    { label: 'قيد الانتظار',  color: '#b76e00', bg: '#fff3d6', icon: <MdPendingActions />,        dot: '#f59e0b' },
  Preparing:  { label: 'قيد التحضير',   color: '#1d7afc', bg: '#e6f0ff', icon: <MdRestaurantMenu />,         dot: '#3b82f6' },
  Delivering: { label: 'جاري التوصيل',  color: '#7c3aed', bg: '#ede9ff', icon: <MdOutlineDeliveryDining />,  dot: '#8b5cf6' },
  Delivered:  { label: 'تم التسليم',    color: '#2e7d32', bg: '#e8f5e9', icon: <FaBoxOpen />,                dot: '#22c55e' },
  Cancelled:  { label: 'ملغي',          color: '#c62828', bg: '#fdecea', icon: <MdCancel />,                 dot: '#ef4444' },
};

const FILTER_TABS = [
  { key: '',           label: 'الكل',        icon: <FaClipboardList size={13} /> },
  { key: 'Pending',    label: 'انتظار',      icon: <FaHourglass size={13} /> },
  { key: 'Preparing',  label: 'تحضير',       icon: <MdRestaurantMenu /> },
  { key: 'Delivering', label: 'توصيل',       icon: <FaTruck size={13} /> },
  { key: 'Delivered',  label: 'تم التسليم',  icon: <FaCheckCircle size={13} /> },
  { key: 'Cancelled',  label: 'ملغي',        icon: <FaTimesCircle size={13} /> },
];

const NEXT_ACTIONS = {
  Pending: [
    { status: 'Preparing',  label: '✅ قبول وبدء التحضير',  color: '#fff',    bg: '#2e7d32' },
    { status: 'Cancelled',  label: '❌ رفض الطلب',           color: '#c62828', bg: '#fdecea' },
  ],
  Preparing: [
    { status: 'Delivering', label: '🚗 جاهز — أرسل للسائق', color: '#fff',    bg: '#1d7afc' },
  ],
  Delivering: [
    { status: 'Delivered',  label: '📦 تم التسليم للزبون',  color: '#fff',    bg: '#2e7d32' },
  ],
  Delivered: [],
  Cancelled: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso) => new Date(iso).toLocaleDateString('ar-PS', { day: 'numeric', month: 'short' });

// ─── Print Invoice ────────────────────────────────────────────────────────────
const printInvoice = (order) => {
  const win = window.open('', '_blank');
  win.document.write(`
    <html dir="rtl">
    <head>
      <title>فاتورة #${order.orderID}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #222; background: #fff; }
        .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #3e2723; padding-bottom: 16px; }
        .header h2 { font-size: 24px; color: #3e2723; margin-bottom: 4px; }
        .header p  { color: #888; font-size: 13px; }
        .info { background: #fdf8f5; padding: 14px 16px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; line-height: 2; border: 1px solid #f0e6de; }
        .info span { color: #a0785a; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #3e2723; color: #fff; padding: 10px 14px; font-size: 13px; }
        td { padding: 9px 14px; border-bottom: 1px solid #f0e6de; font-size: 14px; }
        tr:nth-child(even) td { background: #fdfaf8; }
        .total-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: linear-gradient(135deg, #3e2723, #6d4c41); border-radius: 10px; color: #fff; margin-top: 8px; }
        .total-row .label { font-size: 15px; opacity: 0.85; }
        .total-row .amount { font-size: 24px; font-weight: 900; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>☕ Lavender — فاتورة طلب</h2>
        <p>رقم الطلب: #${order.orderID} &nbsp;·&nbsp; ${fmtDate(order.orderDate)} ${fmtTime(order.orderDate)}</p>
      </div>
      <div class="info">
        <span>👤 الاسم:</span> ${order.customer?.fullName || '—'}<br/>
        <span>📞 الهاتف:</span> ${order.customer?.phone || '—'}<br/>
        <span>📍 العنوان:</span> ${order.customer?.address || '—'}<br/>
        <span>🚚 نوع التوصيل:</span> ${order.deliveryType === 'Home Delivery' ? 'توصيل للمنزل' : 'استلام'}
      </div>
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${order.orderItems?.map(i => `
            <tr>
              <td>${i.product?.name || 'منتج'}</td>
              <td style="text-align:center">${i.quantity}</td>
              <td>₪${i.price?.toFixed(2)}</td>
              <td style="color:#2e7d32; font-weight:700">₪${(i.quantity * i.price).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total-row">
        <span class="label">الإجمالي الكلي</span>
        <span class="amount">₪${Number(order.totalAmount).toFixed(2)}</span>
      </div>
      <div class="footer">
        شكراً لطلبك من Lavender 🇵🇸<br/>
        تم إصدار الفاتورة: ${new Date().toLocaleString('ar')}
      </div>
    </body>
    </html>
  `);
  win.document.close();
  win.print();
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 700,
      color: c.color, background: c.bg,
    }}>
      <span style={{ fontSize: 15, display: 'flex' }}>{c.icon}</span>
      {c.label}
    </span>
  );
};

const InfoRow = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
    <span style={{ color: '#a0785a', fontSize: 15, display: 'flex' }}>{icon}</span>
    <span style={{ fontSize: 14, color: '#3e2723' }}>{text}</span>
  </div>
);

// ─── Order Modal ──────────────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const c    = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const acts = NEXT_ACTIONS[order.status]  || [];

  const changeStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/Orders/update-status/${order.orderID}`, JSON.stringify(newStatus));
      onStatusChange(order.orderID, newStatus);
      onClose();
    } catch {
      alert('فشل تحديث الحالة');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,5,0,.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 24,
        width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflowY: 'auto',
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        boxShadow: '0 32px 80px rgba(62,39,35,.22)',
        direction: 'rtl',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f5ede8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #fdfaf8 0%, #fff 100%)',
          borderRadius: '24px 24px 0 0',
          position: 'sticky', top: 0, zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: c.bg, color: c.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#3e2723' }}>طلب #{order.orderID}</div>
              <div style={{ fontSize: 12, color: '#a0785a', marginTop: 2 }}>
                {fmtDate(order.orderDate)} · {fmtTime(order.orderDate)}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: '#f5ede8', borderRadius: 10,
            width: 34, height: 34, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#8d6e63',
          }}>
            <MdClose />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#8d6e63', fontWeight: 600 }}>حالة الطلب</span>
            <StatusBadge status={order.status} />
          </div>

          {/* Customer */}
          <div style={{
            background: '#fdf8f5', borderRadius: 14, padding: '1rem',
            border: '1px solid #f0e6de',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#c8a882', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
              معلومات الزبون
            </div>
            <InfoRow icon={<FaUser />}        text={order.customer?.fullName || '—'} />
            <InfoRow icon={<FaPhone />}        text={order.customer?.phone   || '—'} />
            <InfoRow icon={<FaMapMarkerAlt />} text={order.customer?.address || '—'} />
          </div>

          {/* Items */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#c8a882', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              تفاصيل الطلب
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {order.orderItems?.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 13px', background: '#fdf8f5', borderRadius: 12,
                  border: '1px solid #f0e6de',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 9,
                      background: 'linear-gradient(135deg, #c8a882, #a0785a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: '#1a110e',
                    }}>
                      {item.quantity}×
                    </div>
                    <span style={{ fontSize: 14, color: '#3e2723', fontWeight: 600 }}>
                      {item.product?.name || 'منتج'}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#2e7d32' }}>
                    ₪{(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '13px 18px',
            background: 'linear-gradient(135deg, #3e2723 0%, #6d4c41 100%)',
            borderRadius: 14, color: '#fff',
          }}>
            <span style={{ fontSize: 14, opacity: .85, fontWeight: 600 }}>الإجمالي</span>
            <span style={{ fontSize: 22, fontWeight: 900 }}>₪{Number(order.totalAmount).toFixed(2)}</span>
          </div>

          {/* Print */}
          <button
            onClick={() => printInvoice(order)}
            style={{
              width: '100%', padding: '11px', borderRadius: 13, border: '1px solid rgba(200,168,130,0.3)',
              background: '#f5f0eb', color: '#5d4037', cursor: 'pointer',
              fontSize: 14, fontWeight: 700, fontFamily: "'Cairo', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ede5dc'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5f0eb'}
          >
            <FaPrint size={14} /> 🖨️ طباعة الفاتورة
          </button>

          {/* Actions */}
          {acts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {acts.map((a) => (
                <button
                  key={a.status}
                  onClick={() => changeStatus(a.status)}
                  disabled={updating}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 18px', borderRadius: 13, border: 'none',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Cairo', sans-serif",
                    background: a.bg, color: a.color,
                    opacity: updating ? .6 : 1,
                    transition: 'opacity .15s',
                    boxShadow: `0 4px 14px ${a.bg}88`,
                  }}
                >
                  {updating ? 'جارٍ التحديث...' : a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, onSelect }) => {
  const c = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const itemsLabel = order.orderItems?.map((i) => i.product?.name).join(' · ') || '';

  return (
    <div
      onClick={() => onSelect(order)}
      style={{
        background: '#fff', borderRadius: 18,
        border: '1px solid #f0e6de',
        padding: '1rem 1.125rem',
        cursor: 'pointer',
        transition: 'box-shadow .2s, transform .2s',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(160,120,90,.15)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 5,
        background: c.dot, borderRadius: '0 18px 18px 0',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#3e2723' }}>#{order.orderID}</div>
          <div style={{ fontSize: 12, color: '#a0785a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaClock size={11} />
            {fmtTime(order.orderDate)} — {fmtDate(order.orderDate)}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{
        fontSize: 13, color: '#8d6e63',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <MdRestaurantMenu style={{ color: '#c8a882', flexShrink: 0, fontSize: 15 }} />
        {itemsLabel}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#8d6e63' }}>
          <FaUser size={12} />
          {order.customer?.fullName || '—'}
        </div>
        <div style={{
          fontWeight: 900, fontSize: 15, color: '#2e7d32',
          background: '#e8f5e9', padding: '2px 10px', borderRadius: 20,
        }}>
          ₪{Number(order.totalAmount).toFixed(0)}
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const OrdersManager = () => {
  const { user } = useAuth();
  const cafeId   = user?.cafeID;

  const [orders,       setOrders]       = useState([]);
  const [allOrders,    setAllOrders]    = useState([]);  // كل الطلبات بدون فلتر — للإحصائيات
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [selected,     setSelected]     = useState(null);
  const [stats,        setStats]        = useState({});

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (cafeId) params.cafeId = cafeId;

      // ✅ نجلب كل الطلبات دايماً بدون فلتر حالة
      const { data } = await api.get('/Orders/all-orders', { params });
      setOrders(data);
      setAllOrders(data);  // نحفظ نسخة كاملة للإحصائيات

      // ✅ الإحصائيات تُحسب من كل الطلبات دايماً
      const s = {};
      data.forEach((o) => { s[o.status] = (s[o.status] || 0) + 1; });
      s.all = data.length;
      setStats(s);
    } catch {
      setOrders([]);
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  }, [cafeId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleStatusChange = (id, ns) =>
    setOrders((prev) => prev.map((o) => o.orderID === id ? { ...o, status: ns } : o));

  // ✅ الفلترة على الـ client side — الأرقام ما تتأثر
  const filtered = orders.filter((o) => {
    const ms = !activeFilter || o.status === activeFilter;
    const mq = !search ||
      String(o.orderID).includes(search) ||
      o.customer?.fullName?.includes(search);
    return ms && mq;
  });

  const STAT_CARDS = [
    { key: 'all',        label: 'إجمالي الطلبات', icon: <FaReceipt size={17} />,                      color: '#a0785a', bg: '#fdf1e8' },
    { key: 'Pending',    label: 'قيد الانتظار',   icon: <FaHourglass size={17} />,                    color: '#b76e00', bg: '#fff3d6' },
    { key: 'Preparing',  label: 'قيد التحضير',    icon: <MdRestaurantMenu style={{fontSize:18}} />,   color: '#1d7afc', bg: '#e6f0ff' },
    { key: 'Delivering', label: 'جاري التوصيل',   icon: <FaTruck size={17} />,                        color: '#7c3aed', bg: '#ede9ff' },
    { key: 'Delivered',  label: 'تم التسليم',      icon: <MdDoneAll style={{fontSize:18}} />,          color: '#2e7d32', bg: '#e8f5e9' },
  ];

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo', 'Tajawal', sans-serif", minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>

      {/* ── Header ── */}
      <div className="orders-mgr-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#3e2723', margin: '0 0 4px' }}>
            إدارة الطلبات
          </h1>
          <p style={{ fontSize: 13, color: '#a0785a', margin: 0 }}>
            {filtered.length} طلب · استقبال ومتابعة حالة الطلبات
          </p>
        </div>
        <button onClick={loadOrders} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '10px 20px', borderRadius: 12, border: '1px solid #e0d5cc',
          background: '#fff', color: '#5d4037', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, fontFamily: "'Cairo', sans-serif",
          boxShadow: '0 1px 4px rgba(62,39,35,.08)',
        }}>
          <FaSync size={13} /> تحديث
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="orders-mgr-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))',
        gap: '1rem', marginBottom: '1.75rem',
      }}>
        {STAT_CARDS.map((s) => {
          const isActive = activeFilter === s.key || (s.key === 'all' && !activeFilter);
          return (
            <div key={s.key} onClick={() => setActiveFilter(s.key === 'all' ? '' : s.key)} style={{
              background: '#fff',
              border: `1.5px solid ${isActive ? s.color : '#f0e6de'}`,
              borderRadius: 18, padding: '1rem 1.125rem',
              cursor: 'pointer',
              transition: 'border-color .15s, box-shadow .15s',
              boxShadow: isActive ? `0 0 0 3px ${s.color}22` : '0 1px 4px rgba(62,39,35,.06)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
              }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#3e2723', lineHeight: 1 }}>
                {stats[s.key] ?? 0}
              </div>
              <div style={{ fontSize: 12, color: '#a0785a', marginTop: 4 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="orders-mgr-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <FaSearch style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#c8a882', fontSize: 14, pointerEvents: 'none',
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الطلب أو اسم الزبون..."
            style={{
              width: '100%', padding: '10px 36px 10px 14px',
              border: '1px solid #e0d5cc', borderRadius: 12,
              fontSize: 14, fontFamily: "'Cairo', sans-serif",
              background: '#fff', color: '#3e2723', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div className="orders-mgr-tabs" style={{ display: 'flex', background: '#f5ede8', borderRadius: 12, padding: 4, gap: 2, flexWrap: 'wrap' }}>
          {FILTER_TABS.map((t) => {
            const isActive = activeFilter === t.key;
            return (
              <button key={t.key} onClick={() => setActiveFilter(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 9, border: 'none',
                fontSize: 13, fontFamily: "'Cairo', sans-serif", cursor: 'pointer',
                fontWeight: isActive ? 800 : 500,
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? '#3e2723' : '#8d6e63',
                boxShadow: isActive ? '0 1px 5px rgba(62,39,35,.1)' : 'none',
                transition: 'all .15s',
              }}>
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{
          textAlign: 'center', padding: '4rem',
          background: '#fff', borderRadius: 20, border: '1px solid #f0e6de',
          color: '#a0785a',
        }}>
          <FaShoppingBag size={40} style={{ marginBottom: 12, opacity: .3 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>جارٍ تحميل الطلبات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem',
          background: '#fff', borderRadius: 20,
          border: '2px dashed rgba(200,168,130,.3)',
          color: '#a0785a',
        }}>
          <FaBoxOpen size={44} style={{ marginBottom: 12, opacity: .35 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: '#5d4037' }}>لا توجد طلبات في هذه الفئة</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>جرّب تغيير الفلتر أو انتظر طلبات جديدة</p>
        </div>
      ) : (
        <div className="orders-mgr-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((o) => (
            <OrderCard key={o.orderID} order={o} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <OrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default OrdersManager;