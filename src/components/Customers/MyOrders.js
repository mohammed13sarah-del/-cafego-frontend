import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle,
  FaTruck, FaBoxOpen, FaSync, FaShoppingBag, FaArrowRight,
  FaReceipt, FaCoffee, FaSearch, FaChevronDown, FaChevronUp,
  FaPrint, FaHourglass, FaBan,
} from 'react-icons/fa';
import {
  MdOutlineDeliveryDining, MdPendingActions, MdRestaurantMenu,
  MdClose, MdDoneAll,
} from 'react-icons/md';

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  Pending:         { ar: 'انتظار',      color: '#b76e00', bg: '#fff3d6', dot: '#f59e0b', icon: <MdPendingActions />,        step: 1 },
  Approved:        { ar: 'مقبول',       color: '#1565c0', bg: '#e3f2fd', dot: '#3b82f6', icon: <FaCheckCircle />,           step: 2 },
  Preparing:       { ar: 'تحضير',       color: '#1565c0', bg: '#e3f2fd', dot: '#3b82f6', icon: <MdRestaurantMenu />,        step: 2 },
  'جاري التوصيل': { ar: 'توصيل',       color: '#7c3aed', bg: '#ede9ff', dot: '#8b5cf6', icon: <MdOutlineDeliveryDining />, step: 3 },
  Delivering:      { ar: 'توصيل',       color: '#7c3aed', bg: '#ede9ff', dot: '#8b5cf6', icon: <MdOutlineDeliveryDining />, step: 3 },
  Delivered:       { ar: 'تم التسليم',  color: '#2e7d32', bg: '#e8f5e9', dot: '#22c55e', icon: <MdDoneAll />,              step: 4 },
  Completed:       { ar: 'مكتمل',       color: '#2e7d32', bg: '#e8f5e9', dot: '#22c55e', icon: <MdDoneAll />,              step: 4 },
  Done:            { ar: 'مكتمل',       color: '#2e7d32', bg: '#e8f5e9', dot: '#22c55e', icon: <MdDoneAll />,              step: 4 },
  Rejected:        { ar: 'مرفوض',       color: '#c62828', bg: '#fdecea', dot: '#ef4444', icon: <FaTimesCircle />,           step: 0 },
  Cancelled:       { ar: 'ملغي',        color: '#c62828', bg: '#fdecea', dot: '#ef4444', icon: <FaBan />,                  step: 0 },
};

const STEPS = [
  { label: 'تم الطلب',     icon: <FaReceipt size={11} /> },
  { label: 'قيد التحضير', icon: <MdRestaurantMenu style={{ fontSize: 12 }} /> },
  { label: 'في الطريق',    icon: <FaTruck size={11} /> },
  { label: 'تم التسليم',   icon: <MdDoneAll style={{ fontSize: 13 }} /> },
];

const FILTERS = [
  { key: 'all',        label: 'الكل',        icon: <FaClipboardList size={12} /> },
  { key: 'Pending',    label: 'انتظار',      icon: <FaHourglass size={12} /> },
  { key: 'Preparing',  label: 'تحضير',       icon: <MdRestaurantMenu style={{ fontSize: 14 }} /> },
  { key: 'Delivering', label: 'توصيل',       icon: <FaTruck size={12} /> },
  { key: 'Delivered',  label: 'تم التسليم',  icon: <MdDoneAll style={{ fontSize: 14 }} /> },
  { key: 'Cancelled',  label: 'ملغي',        icon: <FaBan size={12} /> },
];

const STAT_CARDS = [
  { key: 'all',        label: 'كل الطلبات',  icon: <FaClipboardList size={16} />, color: '#a0785a', bg: '#fdf1e8' },
  { key: 'Pending',    label: 'انتظار',       icon: <FaHourglass size={16} />,     color: '#b76e00', bg: '#fff3d6' },
  { key: 'Preparing',  label: 'تحضير',        icon: <MdRestaurantMenu style={{ fontSize: 18 }} />, color: '#1565c0', bg: '#e3f2fd' },
  { key: 'Delivering', label: 'توصيل',        icon: <MdOutlineDeliveryDining style={{ fontSize: 18 }} />, color: '#7c3aed', bg: '#ede9ff' },
  { key: 'Delivered',  label: 'تم التسليم',   icon: <MdDoneAll style={{ fontSize: 18 }} />, color: '#2e7d32', bg: '#e8f5e9' },
  { key: 'Cancelled',  label: 'ملغي',         icon: <FaBan size={16} />,           color: '#c62828', bg: '#fdecea' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatus = o => o.status      ?? o.Status      ?? 'Pending';
const getAmount = o => o.totalAmount ?? o.TotalAmount ?? 0;
const getDate   = o => o.orderDate   ?? o.OrderDate;
const getItems  = o => o.invoiceItems ?? o.orderItems ?? [];
const getId     = o => o.orderID     ?? o.OrderID;

const fmtDate = iso =>
  iso ? new Date(iso).toLocaleDateString('ar-PS', { day: 'numeric', month: 'short' }) : '—';
const fmtTime = iso =>
  iso ? new Date(iso).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '';

// ─── Print Invoice ────────────────────────────────────────────────────────────
const printInvoice = (order) => {
  const items  = getItems(order);
  const amount = getAmount(order);
  const date   = getDate(order);
  const win = window.open('', '_blank');
  win.document.write(`
    <html dir="rtl">
    <head>
      <title>فاتورة #${getId(order)}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:Arial,sans-serif; padding:40px; color:#222; background:#fff; }
        .header { text-align:center; margin-bottom:24px; border-bottom:2px solid #3e2723; padding-bottom:16px; }
        .header h2 { font-size:24px; color:#3e2723; margin-bottom:4px; }
        .header p  { color:#888; font-size:13px; }
        table { width:100%; border-collapse:collapse; margin-bottom:16px; }
        th { background:#3e2723; color:#fff; padding:10px 14px; font-size:13px; }
        td { padding:9px 14px; border-bottom:1px solid #f0e6de; font-size:14px; }
        tr:nth-child(even) td { background:#fdfaf8; }
        .total-row { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:linear-gradient(135deg,#3e2723,#6d4c41); border-radius:10px; color:#fff; margin-top:8px; }
        .footer { text-align:center; margin-top:30px; font-size:12px; color:#aaa; border-top:1px solid #eee; padding-top:16px; }
        @media print { body { padding:20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>فاتورة طلب</h2>
        <p>رقم الطلب: #${getId(order)} &nbsp;·&nbsp; ${fmtDate(date)} ${fmtTime(date)}</p>
      </div>
      <table>
        <thead>
          <tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
        </thead>
        <tbody>
          ${items.map(i => {
            const name     = i.itemName ?? i.product?.name ?? 'منتج';
            const qty      = i.quantity ?? 1;
            const price    = i.unitPrice ?? i.price ?? 0;
            const subtotal = i.subTotal ?? (qty * price);
            return `
              <tr>
                <td>${name}</td>
                <td style="text-align:center">${qty}</td>
                <td>₪${Number(price).toFixed(2)}</td>
                <td style="color:#2e7d32;font-weight:700">₪${Number(subtotal).toFixed(2)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div class="total-row">
        <span style="font-size:15px;opacity:.85">الإجمالي الكلي</span>
        <span style="font-size:24px;font-weight:900">₪${Number(amount).toFixed(2)}</span>
      </div>
      <div class="footer">
        شكراً لطلبك<br/>
        تم إصدار الفاتورة: ${new Date().toLocaleString('ar')}
      </div>
    </body>
    </html>
  `);
  win.document.close();
  win.print();
};

// ─── Dot Badge ────────────────────────────────────────────────────────────────
const DotBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.Pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px 2px 6px',
      borderRadius: 20, fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg, whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: s.dot, flexShrink: 0,
        boxShadow: `0 0 0 2px ${s.dot}33`,
      }} />
      {s.ar}
    </span>
  );
};

// ─── Order Modal ──────────────────────────────────────────────────────────────
const OrderModal = ({ order, onClose }) => {
  const status = getStatus(order);
  const amount = getAmount(order);
  const date   = getDate(order);
  const items  = getItems(order);
  const s      = STATUS_MAP[status] || STATUS_MAP.Pending;
  const step   = s.step;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,5,0,0.55)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', direction: 'rtl',
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 22,
        width: '100%', maxWidth: 460,
        maxHeight: '88vh', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(62,39,35,0.22)',
        animation: 'modalIn .2s ease',
      }}>
        <style>{`
          @keyframes modalIn {
            from { opacity:0; transform:translateY(14px) scale(.97); }
            to   { opacity:1; transform:translateY(0) scale(1); }
          }
        `}</style>

        {/* رأس النافذة */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #f5ede8',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
          borderRadius: '22px 22px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: s.bg, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#3e2723' }}>
                تفاصيل الطلب #{getId(order)}
              </div>
              <div style={{ fontSize: 10, color: '#a0785a', marginTop: 2 }}>
                {fmtDate(date)} · {fmtTime(date)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DotBadge status={status} />
            <button onClick={onClose} style={{
              background: '#f5ede8', border: 'none', borderRadius: 8,
              width: 30, height: 30, cursor: 'pointer', color: '#8d6e63',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MdClose size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* شريط التقدم */}
          {step > 0 && (
            <div style={{ position: 'relative', paddingTop: 4 }}>
              <div style={{
                position: 'absolute', top: 19, right: 14, left: 14,
                height: 2, background: '#f0e6de', borderRadius: 4,
              }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: 'linear-gradient(90deg,#c8a882,#a0785a)',
                  width: `${((step - 1) / 3) * 100}%`,
                  transition: 'width .5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {STEPS.map((st, i) => {
                  const done = i + 1 <= step;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: done ? 'linear-gradient(135deg,#c8a882,#a0785a)' : '#f0e6de',
                        color: done ? '#1a110e' : '#c8a882',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: i + 1 === step ? '0 0 0 3px rgba(200,168,130,0.3)' : 'none',
                        fontSize: 11,
                      }}>
                        {st.icon}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: done ? 700 : 400, color: done ? '#3e2723' : '#b0978a', textAlign: 'center' }}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* الإجمالي */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px',
            background: 'linear-gradient(135deg,#3e2723,#6d4c41)',
            borderRadius: 13, color: '#fff',
          }}>
            <div>
              <div style={{ fontSize: 10, opacity: .75, marginBottom: 2 }}>إجمالي الطلب</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>₪{Number(amount).toFixed(2)}</div>
            </div>
            <FaReceipt size={28} style={{ opacity: .2 }} />
          </div>

          {/* المنتجات */}
          <div>
            <p style={{
              fontSize: 10, fontWeight: 800, color: '#c8a882',
              letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase',
            }}>
              المنتجات ({items.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.length > 0 ? items.map((item, i) => {
                const name     = item.itemName ?? item.product?.name ?? item.product?.Name ?? `منتج #${i + 1}`;
                const qty      = item.quantity ?? 1;
                const subtotal = item.subTotal ?? ((item.unitPrice ?? item.price ?? 0) * qty);
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 12px',
                    background: '#fdfaf8', borderRadius: 11,
                    border: '1px solid rgba(200,168,130,0.15)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7,
                        background: 'linear-gradient(135deg,#c8a882,#a0785a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 900, color: '#1a110e', flexShrink: 0,
                      }}>
                        {qty}×
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#3e2723' }}>{name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#2e7d32' }}>
                      ₪{Number(subtotal).toFixed(0)}
                    </span>
                  </div>
                );
              }) : (
                <p style={{ textAlign: 'center', color: '#a0785a', fontSize: 12 }}>لا توجد تفاصيل</p>
              )}
            </div>
          </div>

          {/* زر الطباعة */}
          <button
            onClick={() => printInvoice(order)}
            style={{
              width: '100%', padding: '11px', borderRadius: 12,
              border: '1px solid rgba(200,168,130,0.3)',
              background: '#f5f0eb', color: '#5d4037',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ede5dc'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5f0eb'}
          >
            <FaPrint size={13} /> طباعة الفاتورة / حفظ PDF
          </button>

          {/* زر الإغلاق */}
          <button onClick={onClose} style={{
            width: '100%', padding: '10px', borderRadius: 12,
            background: '#fff', border: '1px solid #f0e6de',
            color: '#a0785a', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Expandable Row ───────────────────────────────────────────────────────────
const OrderRow = ({ order, isEven, onOpenModal }) => {
  const [expanded, setExpanded] = useState(false);
  const status = getStatus(order);
  const amount = getAmount(order);
  const date   = getDate(order);
  const items  = getItems(order);
  const s      = STATUS_MAP[status] || STATUS_MAP.Pending;
  const step   = s.step;

  return (
    <div style={{ borderBottom: '1px solid rgba(200,168,130,0.12)' }}>

      {/* ── الصف الرئيسي ── */}
      <div
        className="order-row"
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 90px 1fr auto 74px 28px',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          background: isEven ? '#fdfaf8' : '#fff',
          cursor: 'pointer',
          transition: 'background .12s',
          userSelect: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f5ede8'}
        onMouseLeave={e => e.currentTarget.style.background = isEven ? '#fdfaf8' : '#fff'}
        onClick={() => setExpanded(p => !p)}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: `${s.color}15`, color: s.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>
          {s.icon}
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#3e2723', lineHeight: 1.2 }}>
            #{getId(order)}
          </div>
          <div style={{ fontSize: 10, color: '#a0785a', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FaClock size={8} /> {fmtDate(date)}
          </div>
        </div>

        <div style={{
          fontSize: 11, color: '#8d6e63',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {items.length > 0
            ? items.map(i => i.itemName ?? i.product?.name ?? '').filter(Boolean).join(' · ')
            : <span style={{ color: '#d7ccc8' }}>—</span>
          }
          <span style={{ color: '#c8a882', marginRight: 4 }}>({items.length})</span>
        </div>

        <DotBadge status={status} />

        <div style={{ fontSize: 13, fontWeight: 900, color: '#2e7d32', textAlign: 'left', whiteSpace: 'nowrap' }}>
          ₪{Number(amount).toFixed(0)}
        </div>

        <div style={{ color: '#c8a882', display: 'flex', justifyContent: 'center', fontSize: 11 }}>
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {/* ── التفاصيل المنسدلة ── */}
      {expanded && (
        <div style={{
          padding: '10px 14px 14px',
          background: '#fdf8f4',
          borderTop: '1px solid rgba(200,168,130,0.12)',
          animation: 'fadeSlide .15s ease',
        }}>
          <style>{`@keyframes fadeSlide { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }`}</style>

          {/* شريط التقدم */}
          {step > 0 && (
            <div style={{ marginBottom: 12, position: 'relative', paddingTop: 4 }}>
              <div style={{
                position: 'absolute', top: 19, right: 12, left: 12,
                height: 2, background: '#f0e6de', borderRadius: 4,
              }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: 'linear-gradient(90deg, #c8a882, #a0785a)',
                  width: `${((step - 1) / 3) * 100}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {STEPS.map((st, i) => {
                  const done = i + 1 <= step;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: done ? 'linear-gradient(135deg, #c8a882, #a0785a)' : '#f0e6de',
                        color: done ? '#1a110e' : '#c8a882',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: i + 1 === step ? '0 0 0 3px rgba(200,168,130,0.3)' : 'none',
                        fontSize: 10,
                      }}>
                        {st.icon}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: done ? 700 : 400, color: done ? '#3e2723' : '#b0978a', textAlign: 'center' }}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* المنتجات */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
            {items.length > 0 ? items.map((item, i) => {
              const name     = item.itemName ?? item.product?.name ?? item.product?.Name ?? `منتج #${i + 1}`;
              const qty      = item.quantity ?? 1;
              const subtotal = item.subTotal ?? ((item.unitPrice ?? item.price ?? 0) * qty);
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '5px 10px', background: '#fff', borderRadius: 8,
                  border: '1px solid rgba(200,168,130,0.15)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: 5,
                      background: '#c8a88222', color: '#7c5a3e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 900,
                    }}>{qty}×</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#3e2723' }}>{name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#2e7d32' }}>₪{Number(subtotal).toFixed(0)}</span>
                </div>
              );
            }) : (
              <p style={{ fontSize: 12, color: '#a0785a', textAlign: 'center', margin: 0 }}>لا توجد تفاصيل</p>
            )}
          </div>

          {/* الإجمالي + زر التفاصيل */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'linear-gradient(135deg, #3e2723, #6d4c41)',
              borderRadius: 10, color: '#fff',
            }}>
              <span style={{ fontSize: 11, opacity: .8 }}>الإجمالي</span>
              <span style={{ fontSize: 15, fontWeight: 900 }}>₪{Number(amount).toFixed(2)}</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onOpenModal(order); }}
              style={{
                padding: '6px 14px', borderRadius: 10,
                background: 'linear-gradient(135deg,#c8a882,#a0785a)',
                border: 'none',
                color: '#1a110e', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <FaReceipt size={10} /> تفاصيل الطلب
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const MyOrders = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data } = await api.get(`/Orders/my-orders/${user.id}`);
      setOrders(data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const displayed = orders.filter(o => {
    const matchFilter = filter === 'all' || getStatus(o) === filter;
    const matchSearch = !search || String(getId(o)).includes(search);
    return matchFilter && matchSearch;
  });

  const countFor = key => key === 'all'
    ? orders.length
    : orders.filter(o => getStatus(o) === key).length;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', fontFamily: "'Cairo', sans-serif", color: '#8d6e63' }}>
      <FaCoffee size={32} color="#c8a882" style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 13 }}>جاري تحميل طلباتك...</p>
    </div>
  );

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#3e2723', margin: '0 0 2px' }}>طلباتي</h1>
          <p style={{ fontSize: 11, color: '#8d6e63', margin: 0 }}>{orders.length} طلب</p>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={fetchOrders} style={{
            background: '#f5f0eb', color: '#5d4037',
            border: '1px solid rgba(200,168,130,0.3)',
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <FaSync size={10} /> تحديث
          </button>
          <button onClick={() => navigate('/home')} style={{
            background: 'linear-gradient(135deg, #c8a882, #a0785a)',
            color: '#1a110e', border: 'none',
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <FaShoppingBag size={11} /> طلب جديد
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div
        className="orders-stat-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 10, marginBottom: 18,
        }}
      >
        {STAT_CARDS.map(card => {
          const count    = countFor(card.key);
          const isActive = filter === card.key;
          return (
            <div
              key={card.key}
              onClick={() => setFilter(card.key)}
              style={{
                background: '#fff',
                border: `1.5px solid ${isActive ? card.color : '#f0e6de'}`,
                borderRadius: 14, padding: '12px 14px',
                cursor: 'pointer', transition: 'all .15s',
                boxShadow: isActive ? `0 0 0 3px ${card.color}22` : '0 1px 4px rgba(62,39,35,.06)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = card.color; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#f0e6de'; }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: card.bg, color: card.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, marginBottom: 8,
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#3e2723', lineHeight: 1 }}>
                {count}
              </div>
              <div style={{ fontSize: 11, color: '#a0785a', marginTop: 4 }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Filters + Search ── */}
      <div
        className="orders-filters"
        style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}
      >
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px', borderRadius: 16,
              cursor: 'pointer', fontSize: 11, fontWeight: active ? 800 : 500,
              fontFamily: 'inherit', transition: 'all .12s',
              background: active ? 'linear-gradient(135deg, #3e2723, #6d4c41)' : '#fff',
              color: active ? '#fff' : '#5d4037',
              boxShadow: active ? '0 2px 8px rgba(62,39,35,.2)' : '0 1px 3px rgba(62,39,35,.07)',
              border: active ? 'none' : '1px solid rgba(200,168,130,0.2)',
            }}>
              {f.icon}
              {f.label}
              <span style={{
                background: active ? 'rgba(255,255,255,.2)' : '#f5ede8',
                color: active ? '#fff' : '#a0785a',
                fontSize: 9, fontWeight: 800,
                padding: '1px 5px', borderRadius: 16,
              }}>
                {countFor(f.key)}
              </span>
            </button>
          );
        })}

        <div style={{ position: 'relative', marginRight: 'auto' }}>
          <FaSearch style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: '#c8a882', fontSize: 10 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="رقم الطلب..."
            style={{
              padding: '5px 28px 5px 10px', borderRadius: 16,
              border: '1px solid rgba(200,168,130,0.3)',
              fontSize: 11, fontFamily: 'inherit', color: '#3e2723',
              background: '#fff', outline: 'none', width: 110,
            }}
          />
        </div>
      </div>

      {/* ── الجدول ── */}
      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '45px 20px', background: '#fff', borderRadius: 14, border: '2px dashed rgba(200,168,130,0.3)' }}>
          <FaClipboardList size={30} color="#c8a882" style={{ opacity: .4, marginBottom: 8 }} />
          <p style={{ color: '#5d4037', fontSize: 14, fontWeight: 700, marginBottom: 3 }}>لا توجد طلبات</p>
          <p style={{ color: '#8d6e63', fontSize: 11, marginBottom: 12 }}>اطلب قهوتك المفضلة الآن!</p>
          <button onClick={() => navigate('/home')} style={{
            background: 'linear-gradient(135deg, #c8a882, #a0785a)',
            color: '#1a110e', border: 'none', padding: '8px 20px',
            borderRadius: 50, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <FaArrowRight size={11} /> تصفح الكافيهات
          </button>
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 14,
          border: '1px solid rgba(200,168,130,0.2)',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(62,39,35,0.06)',
        }}>
          {/* رأس الجدول */}
          <div
            className="orders-table-head"
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 90px 1fr auto 74px 28px',
              gap: 10, padding: '7px 14px',
              background: '#fdf8f5',
              borderBottom: '1px solid rgba(200,168,130,0.18)',
            }}
          >
            {['', 'الطلب', 'المنتجات', 'الحالة', 'المبلغ', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 9, fontWeight: 800, color: '#c8a882', letterSpacing: 1, textTransform: 'uppercase' }}>
                {h}
              </div>
            ))}
          </div>

          {displayed.map((order, i) => (
            <OrderRow
              key={getId(order)}
              order={order}
              isEven={i % 2 === 1}
              onOpenModal={setSelected}
            />
          ))}

          <div style={{ padding: '6px 14px', background: '#fdf8f5', borderTop: '1px solid rgba(200,168,130,0.12)', fontSize: 10, color: '#a0785a', fontWeight: 600 }}>
            عرض {displayed.length} من {orders.length} طلب
          </div>
        </div>
      )}

      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default MyOrders;