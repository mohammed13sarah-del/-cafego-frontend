import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  FaBox, FaSync, FaExclamationTriangle, FaCheckCircle,
  FaSearch, FaEdit, FaSave, FaTimes, FaPlus, FaMinus,
  FaCoffee,
} from 'react-icons/fa';
import { MdInventory2, MdWarning } from 'react-icons/md';

const getStockStatus = (qty) => {
  if (qty === 0)   return { label: 'نفد المخزون',  color: '#c62828', bg: '#fdecea', icon: <FaTimes size={10} /> };
  if (qty <= 5)    return { label: 'مخزون منخفض',  color: '#b76e00', bg: '#fff3d6', icon: <MdWarning size={11} /> };
  if (qty <= 20)   return { label: 'متوفر',         color: '#1565c0', bg: '#e3f2fd', icon: <FaCheckCircle size={10} /> };
  return             { label: 'وفير',               color: '#2e7d32', bg: '#e8f5e9', icon: <FaCheckCircle size={10} /> };
};

const StockBadge = ({ qty }) => {
  const s = getStockStatus(qty);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg,
    }}>
      <span style={{ display: 'flex' }}>{s.icon}</span>
      {s.label}
    </span>
  );
};

const InventoryCard = ({ item, onEdit }) => {
  const status  = getStockStatus(item.stockQuantity ?? 0);
  const [tempQty, setTempQty] = useState(item.stockQuantity ?? 0);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTempQty(item.stockQuantity ?? 0);
    setEditing(false);
  }, [item.stockQuantity, item.productID ?? item.ProductID]);

  const handleSave   = () => { onEdit(item.productID ?? item.ProductID, tempQty); setEditing(false); };
  const handleCancel = () => { setTempQty(item.stockQuantity ?? 0); setEditing(false); };

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1px solid rgba(200,168,130,0.2)',
      borderRight: `4px solid ${status.color}`,
      padding: '14px 16px', transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(62,39,35,0.06)',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(62,39,35,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(62,39,35,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#3e2723', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name ?? item.Name ?? `منتج #${item.productID ?? item.ProductID}`}
          </div>
          <div style={{ fontSize: 11, color: '#a0785a' }}>
            {item.category ?? item.Category ?? 'بدون تصنيف'}
          </div>
        </div>
        <StockBadge qty={item.stockQuantity ?? 0} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ fontSize: 11, color: '#a0785a', fontWeight: 600 }}>الكمية المتاحة</span>
        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setTempQty(Math.max(0, tempQty - 1))} style={qtyBtn}><FaMinus size={9} /></button>
            <input
              type="number" value={tempQty} min={0}
              onChange={e => setTempQty(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: 52, textAlign: 'center', border: '1.5px dashed #c8a882',
                borderRadius: 8, padding: '4px 0', fontSize: 14, fontWeight: 900,
                color: '#3e2723', background: '#fdfaf8', fontFamily: "'Cairo',sans-serif", outline: 'none',
              }}
            />
            <button onClick={() => setTempQty(tempQty + 1)} style={qtyBtn}><FaPlus size={9} /></button>
            <button onClick={handleSave}   style={saveBtn}><FaSave size={10} /></button>
            <button onClick={handleCancel} style={cancelBtn}><FaTimes size={10} /></button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: status.color }}>{item.stockQuantity ?? 0}</span>
            <button onClick={() => setEditing(true)} style={{
              background: '#f5f0eb', border: '1px solid rgba(200,168,130,0.3)',
              borderRadius: 7, padding: '4px 8px', cursor: 'pointer',
              color: '#8d6e63', fontSize: 11,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <FaEdit size={10} /> تعديل
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ height: 4, background: '#f0e6de', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: `linear-gradient(90deg, ${status.color}80, ${status.color})`,
            width: `${Math.min(100, ((item.stockQuantity ?? 0) / 50) * 100)}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>
    </div>
  );
};

// ─── StatCard (قابل للضغط) ───────────────────────────────────────────────────
const StatCard = ({ label, value, color, bg, icon, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff', borderRadius: 14, padding: '14px 16px',
      border: active ? `2px solid ${color}` : '1px solid rgba(200,168,130,0.15)',
      boxShadow: active
        ? `0 0 0 3px ${color}22, 0 4px 16px ${color}22`
        : '0 2px 8px rgba(62,39,35,0.05)',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer',
      transform: active ? 'translateY(-2px)' : 'translateY(0)',
      transition: 'all 0.2s',
    }}
  >
    <div style={{
      width: 42, height: 42, borderRadius: 12, background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#3e2723', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#a0785a', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
const InventoryManager = () => {
  const { user } = useAuth();

  const [items,        setItems]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState('');
  const [toast,        setToast]        = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInventory = useCallback(async () => {
    const cafeId = user?.activeCafeID ?? user?.cafeID;
    if (!cafeId) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data } = await api.get(`/Products/ByCafe/${cafeId}`);
      setItems(data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.activeCafeID]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleEdit = async (productId, newQty) => {
    setSaving(true);
    try {
      const item = items.find(i => (i.productID ?? i.ProductID) === productId);
      await api.put(`/Products/${productId}`, {
        productID:     productId,
        name:          item.name          ?? item.Name          ?? '',
        price:         item.price         ?? item.Price         ?? 0,
        cafeID:        item.cafeID        ?? item.CafeID        ?? 0,
        description:   item.description   ?? item.Description   ?? '',
        category:      item.category      ?? item.Category      ?? '',
        imageUrl:      item.imageUrl      ?? item.ImageUrl      ?? '',
        isAvailable:   item.isAvailable   ?? item.IsAvailable   ?? true,
        sizes:         item.sizes         ?? item.Sizes         ?? '',
        stockQuantity: newQty,
      });
      setItems(prev => prev.map(i =>
        (i.productID ?? i.ProductID) === productId ? { ...i, stockQuantity: newQty } : i
      ));
      showToast('تم تحديث الكمية بنجاح ✓');
    } catch {
      showToast('حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── إحصائيات ─────────────────────────────────────────────────────────────
  const total   = items.length;
  const outOf   = items.filter(i => (i.stockQuantity ?? 0) === 0).length;
  const lowOn   = items.filter(i => { const q = i.stockQuantity ?? 0; return q > 0 && q <= 5; }).length;
  const healthy = items.filter(i => (i.stockQuantity ?? 0) > 5).length;

  // ─── فلترة حسب الكارت + البحث ────────────────────────────────────────────
  const displayed = items
    .filter(i => (i.name ?? i.Name ?? '').toLowerCase().includes(search.toLowerCase()))
    .filter(i => {
      const qty = i.stockQuantity ?? 0;
      if (activeFilter === 'out')     return qty === 0;
      if (activeFilter === 'available') return qty > 0 && qty <= 20;
      if (activeFilter === 'low')     return qty > 0 && qty <= 5;
      if (activeFilter === 'healthy') return qty > 5;
      return true; // 'all'
    });

  const handleCardClick = (key) => {
    setActiveFilter(prev => prev === key ? 'all' : key);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', fontFamily: "'Cairo',sans-serif", color: '#8d6e63' }}>
      <FaCoffee size={36} color="#c8a882" style={{ marginBottom: 10 }} />
      <p>جاري تحميل المخزون...</p>
    </div>
  );

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        @keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(12px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 12,
          background: toast.type === 'success' ? '#1b5e20' : '#b71c1c',
          color: '#fff', fontSize: 13, fontWeight: 700,
          boxShadow: '0 6px 24px rgba(0,0,0,.25)',
          fontFamily: "'Cairo',sans-serif", animation: 'slideUp .25s ease',
        }}>
          {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="inv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#3e2723', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdInventory2 color="#c8a882" /> إدارة المخزون
          </h1>
          <p style={{ fontSize: 12, color: '#8d6e63', margin: 0 }}>تحكم بكميات منتجاتك المتاحة — اضغط على كارت للفلترة</p>
        </div>
        <button onClick={fetchInventory} style={{
          background: '#f5f0eb', color: '#5d4037',
          border: '1px solid rgba(200,168,130,0.3)',
          padding: '8px 16px', borderRadius: 9, cursor: 'pointer',
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <FaSync size={11} /> تحديث
        </button>
      </div>

      {/* ── Stats (قابلة للضغط) ── */}
      <div className="inv-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard
          label="إجمالي المنتجات" value={total}
          color="#3e2723" bg="#f5f0eb" icon={<FaBox />}
          active={activeFilter === 'all'}
          onClick={() => handleCardClick('all')}
        />
        <StatCard
          label="متوفر بشكل جيد" value={healthy}
          color="#2e7d32" bg="#e8f5e9" icon={<FaCheckCircle />}
          active={activeFilter === 'healthy'}
          onClick={() => handleCardClick('healthy')}
        />
        <StatCard
          label="متوفر" value={items.filter(i => { const q = i.stockQuantity ?? 0; return q > 0 && q <= 20; }).length}
          color="#1565c0" bg="#e3f2fd" icon={<FaCheckCircle />}
          active={activeFilter === 'available'}
          onClick={() => handleCardClick('available')}
        />
        <StatCard
          label="مخزون منخفض" value={lowOn}
          color="#b76e00" bg="#fff3d6" icon={<MdWarning />}
          active={activeFilter === 'low'}
          onClick={() => handleCardClick('low')}
        />
        <StatCard
          label="نفد المخزون" value={outOf}
          color="#c62828" bg="#fdecea" icon={<FaExclamationTriangle />}
          active={activeFilter === 'out'}
          onClick={() => handleCardClick('out')}
        />
      </div>

      {outOf > 0 && (
        <div style={{
          marginBottom: 16, padding: '10px 16px', borderRadius: 12,
          background: '#fdecea', border: '1px solid rgba(198,40,40,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, color: '#c62828', fontWeight: 700,
        }}>
          <FaExclamationTriangle />
          {outOf} منتج نفد مخزونه — تحديث الكميات مطلوب
        </div>
      )}

      {/* ── Search ── */}
      <div className="inv-toolbar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FaSearch size={12} style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)', color: '#c8a882', pointerEvents: 'none',
          }} />
          <input
            type="text" placeholder="ابحث عن منتج..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 34px 9px 14px',
              borderRadius: 10, border: '1px solid rgba(200,168,130,0.3)',
              fontSize: 13, background: '#fff', color: '#3e2723',
              fontFamily: "'Cairo',sans-serif", outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {displayed.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#fff', borderRadius: 18,
          border: '2px dashed rgba(200,168,130,0.3)',
        }}>
          <FaBox size={36} color="#c8a882" style={{ opacity: 0.4, marginBottom: 12 }} />
          <p style={{ color: '#5d4037', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            {search ? 'لا توجد نتائج للبحث' : 'لا توجد منتجات في هذه الفئة'}
          </p>
          <p style={{ color: '#8d6e63', fontSize: 12 }}>
            {search ? 'جرّب كلمة بحث مختلفة' : 'اضغط على كارت آخر أو اضغط الكارت مرة ثانية للعودة للكل'}
          </p>
        </div>
      ) : (
        <div className="inv-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {displayed.map(item => (
            <InventoryCard
              key={item.productID ?? item.ProductID}
              item={item}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const qtyBtn = {
  width: 26, height: 26, borderRadius: 7,
  background: '#f5f0eb', border: '1px solid rgba(200,168,130,0.3)',
  color: '#5d4037', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const saveBtn = {
  width: 26, height: 26, borderRadius: 7,
  background: '#e8f5e9', border: '1px solid rgba(46,125,50,0.2)',
  color: '#2e7d32', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const cancelBtn = {
  width: 26, height: 26, borderRadius: 7,
  background: '#fdecea', border: '1px solid rgba(198,40,40,0.15)',
  color: '#c62828', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default InventoryManager;