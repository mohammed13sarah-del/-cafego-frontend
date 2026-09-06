import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useCart } from '../../context/CartContext';
import {
  FaShoppingCart, FaCheckCircle, FaBan,
  FaCoffee, FaLeaf, FaSnowflake, FaGlassWhiskey, FaBlender,
  FaWater, FaBreadSlice, FaMugHot,
  FaSearch, FaMapMarkerAlt, FaTimes, FaTrash, FaPlus, FaMinus,
} from 'react-icons/fa';
import { MdOutlineLocalCafe } from 'react-icons/md';
import './CafeMenu.css';


const T = {
  dark:      '#3e2723',
  mid:       '#6d4c41',
  gold:      '#c8a882',
  goldLight: '#f5ede0',
  cream:     '#fdf9f5',
  border:    '#ede0d4',
  text:      '#3e2723',
  sub:       '#a0785a',
};

const ANIM_DURATION = 2800; // ← وقت الأنيميشن الكامل بالـ ms

const CATEGORIES_META = [
  { key: 'hot',       label: 'مشروبات ساخنة',  icon: <FaMugHot /> },
  { key: 'cold',      label: 'مشروبات باردة',   icon: <FaSnowflake /> },
  { key: 'milkshake', label: 'ميلك شيك',        icon: <FaGlassWhiskey /> },
  { key: 'smoothie',  label: 'سموذي',            icon: <FaBlender /> },
  { key: 'juice',     label: 'مشروبات طبيعية',  icon: <FaLeaf /> },
  { key: 'mojito',    label: 'موهيتو',           icon: <FaWater /> },
  { key: 'coffee',    label: 'قهوة',             icon: <FaCoffee /> },
  { key: 'sweets',    label: 'حلو ومقبلات',     icon: <FaBreadSlice /> },
];

const getCatMeta = (key) =>
  CATEGORIES_META.find(c => c.key === key) || { key, label: key, icon: <FaCoffee /> };

const calcPrice = (base, size) => {
  if (size === 'S') return Math.max(1, base - 2);
  if (size === 'L') return base + 2;
  return base;
};

// ─── NavCard ──────────────────────────────────────────────────────────────────
const NavCard = ({ meta, count, onClick }) => (
  <div onClick={count > 0 ? onClick : undefined} style={{
    flexShrink: 0, width: 105, padding: '13px 10px',
    background: count > 0 ? '#fff' : T.cream,
    border: `1.5px solid ${T.border}`, borderRadius: 16,
    cursor: count > 0 ? 'pointer' : 'default', textAlign: 'center',
    transition: 'all .22s', opacity: count > 0 ? 1 : 0.45,
    boxShadow: count > 0 ? '0 2px 10px rgba(62,39,35,0.07)' : 'none',
  }}
    onMouseEnter={e => { if (count > 0) { e.currentTarget.style.background = T.goldLight; e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
    onMouseLeave={e => { e.currentTarget.style.background = count > 0 ? '#fff' : T.cream; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ width: 38, height: 38, borderRadius: 11, margin: '0 auto 8px', background: count > 0 ? T.goldLight : T.cream, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.dark, fontSize: 15 }}>
      {meta.icon}
    </div>
    <div style={{ fontSize: 10.5, fontWeight: 800, color: T.text, marginBottom: 4, lineHeight: 1.35 }}>{meta.label}</div>
    <div style={{ fontSize: 10, fontWeight: 700, color: count > 0 ? T.sub : '#bcaaa4' }}>{count > 0 ? `${count} منتج` : 'فارغ'}</div>
  </div>
);

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
const CartSidebar = ({ isOpen, onClose, cartItems, onRemove, onUpdateQty, onGoToCart }) => {
  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 998 }} />}
      <div style={{
        position: 'fixed', top: 0, left: isOpen ? 0 : '-340px', width: 320, height: '100vh',
        background: '#fff', zIndex: 999,
        boxShadow: isOpen ? '4px 0 32px rgba(62,39,35,0.18)' : 'none',
        transition: 'left .3s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column', direction: 'rtl',
        fontFamily: "'Cairo','Tajawal',sans-serif",
        borderRight: `2px solid ${T.border}`,
      }}>
        <div style={{ background: `linear-gradient(135deg, ${T.dark}, ${T.mid})`, padding: '20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaShoppingCart size={18} color={T.gold} />
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>سلة الطلبات</span>
            {cartItems.length > 0 && (
              <span style={{ background: T.gold, color: T.dark, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                {cartItems.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <FaTimes size={13} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 14, opacity: 0.5 }}>
              <FaShoppingCart size={42} color={T.gold} />
              <p style={{ color: T.sub, fontSize: 13, fontWeight: 700, margin: 0 }}>السلة فارغة</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cartItems.map((item, idx) => (
                <div key={`${item.productId || item.id}-${item.size}`} style={{ background: T.cream, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '12px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, background: item.imageUrl ? `url(${item.imageUrl}) center/cover no-repeat` : `linear-gradient(135deg,${T.goldLight},${T.border})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!item.imageUrl && <MdOutlineLocalCafe size={18} color={T.gold} style={{ opacity: 0.4 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: T.text, marginBottom: 2 }}>{item.name ?? item.Name}</div>
                    <div style={{ fontSize: 10, color: T.sub, marginBottom: 6 }}>حجم {item.size} · ₪{item.price.toFixed(2)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => onUpdateQty(idx, -1)} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.sub }}>
                        <FaMinus size={8} />
                      </button>
                      <span style={{ fontSize: 12, fontWeight: 800, color: T.text, minWidth: 18, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => onUpdateQty(idx, 1)} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.sub }}>
                        <FaPlus size={8} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: T.dark }}>₪{(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => onRemove(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e57373', padding: 4 }}>
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ padding: '16px 18px', borderTop: `2px solid ${T.border}`, background: T.cream }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.sub }}>المجموع</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: T.dark }}>₪{total.toFixed(2)}</span>
            </div>
            <button onClick={onGoToCart} style={{
              width: '100%', background: `linear-gradient(135deg,${T.gold},${T.mid})`,
              color: '#fff', border: 'none', borderRadius: 12, padding: '12px',
              fontSize: 14, fontWeight: 900, cursor: 'pointer',
              fontFamily: "'Cairo','Tajawal',sans-serif",
              boxShadow: '0 4px 14px rgba(160,120,90,0.28)',
            }}>
              عرض السلة  
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── بطاقة منتج ───────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAdd, justAdded }) => {
  const pID         = product.productID ?? product.ProductID;
  const name        = product.name        ?? product.Name        ?? '';
  const price       = product.price       ?? product.Price       ?? 0;
  const description = product.description ?? product.Description ?? '';
  const imageUrl    = product.imageUrl    ?? product.ImageUrl    ?? '';
  const stock       = product.stockQuantity ?? product.StockQuantity ?? 0;
  const isOOS       = stock === 0;

  const [size, setSize] = useState('M');
  const [qty,  setQty]  = useState(1);
  const finalPrice      = calcPrice(price, size);

  const sizesRaw = (() => { try { return product.sizes ? JSON.parse(product.sizes) : {}; } catch { return {}; } })();
  const availSizes = ['S', 'M', 'L'].filter(s => sizesRaw[s] !== false);
  const sizes = availSizes.length > 0 ? availSizes : ['S', 'M', 'L'];

  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: `1.5px solid ${T.border}`,
      boxShadow: '0 2px 14px rgba(62,39,35,0.07)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: 380,
      transition: 'transform .22s, box-shadow .22s',
      opacity: isOOS ? 0.62 : 1, direction: 'rtl',
    }}
      onMouseEnter={e => { if (!isOOS) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(62,39,35,0.13)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(62,39,35,0.07)'; }}
    >
      <div style={{ width: '100%', height: 160, flexShrink: 0, position: 'relative', background: imageUrl ? `url(${imageUrl}) center/cover no-repeat` : `linear-gradient(135deg,${T.goldLight},${T.border})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!imageUrl && <MdOutlineLocalCafe size={32} color={T.gold} style={{ opacity: 0.35 }} />}
        {isOOS && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,20,15,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 800, background: 'rgba(0,0,0,0.5)', padding: '4px 13px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
              <FaBan size={10} /> غير متوفر
            </span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: T.text, lineHeight: 1.3, flex: 1 }}>{name}</h3>
            <span style={{ fontSize: 12, fontWeight: 900, color: T.dark, background: T.goldLight, padding: '2px 8px', borderRadius: 20, flexShrink: 0, border: `1px solid ${T.border}` }}>
              {isOOS ? '—' : `₪${(finalPrice * qty).toFixed(1)}`}
            </span>
          </div>
          {description && (
            <p style={{ margin: 0, fontSize: 10.5, color: T.sub, lineHeight: 1.4, height: 38, overflow: 'hidden' }}>
              {description.length > 50 ? description.slice(0, 50) + '…' : description}
            </p>
          )}
        </div>

        {!isOOS && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.sub }}>الحجم</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSize(s)} style={{
                      width: 23, height: 23, borderRadius: 6,
                      border: `1.5px solid ${size === s ? T.gold : T.border}`,
                      background: size === s ? `linear-gradient(135deg,${T.gold},${T.mid})` : T.cream,
                      color: size === s ? '#1a110e' : T.sub,
                      fontWeight: 800, fontSize: 9, cursor: 'pointer', transition: 'all .18s', fontFamily: 'inherit',
                    }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.sub }}>الكمية</span>
                <div style={{ display: 'flex', alignItems: 'center', background: T.cream, borderRadius: 6, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 20, height: 20, background: 'none', border: 'none', cursor: 'pointer', color: T.sub, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ width: 16, textAlign: 'center', fontSize: 11, fontWeight: 800, color: T.text }}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: 20, height: 20, background: 'none', border: 'none', cursor: 'pointer', color: T.sub, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
            </div>

            <button
              onClick={() => { if (!justAdded) onAdd(product, size, qty); }}
              style={{
                width: '100%', minHeight: 38,
                background: justAdded ? '#263238' : `linear-gradient(135deg,${T.gold},${T.mid})`,
                color: '#fff', border: 'none', padding: '10px 0', borderRadius: 8,
                cursor: justAdded ? 'default' : 'pointer',
                fontSize: 12, fontWeight: 800, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'visible',
                transition: 'background 0.3s ease, transform 0.1s ease',
                boxShadow: '0 4px 12px rgba(160,120,90,0.22)',
              }}
              onMouseDown={e => { if (!justAdded) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {justAdded ? (
                <>
                  {/* السلة تدخل من اليمين وتطير لليسار */}
                  <FaShoppingCart
                    className="cart-slide"
                    size={20}
                    style={{ position: 'absolute', color: '#fff', zIndex: 2 }}
                  />
                  {/* القهوة تنط فوق */}
                  <FaMugHot
                    className="mug-jump"
                    size={16}
                    style={{ position: 'absolute', zIndex: 3 }}
                  />
                  {/* نص "تمت الإضافة" يظهر في النهاية */}
                  <span className="text-pop" style={{
                    position: 'absolute',
                    fontWeight: 800, fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 5,
                    opacity: 0, zIndex: 4,
                    color: '#4caf50',
                  }}>
                    <FaCheckCircle size={12} /> تمت الإضافة
                  </span>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaShoppingCart size={16} />
                  <span>أضف للسلة</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── قسم المنتجات ─────────────────────────────────────────────────────────────
const CategorySection = ({ meta, products, sectionRef, onAdd, addedMap }) => {
  if (products.length === 0) return null;
  return (
    <div ref={sectionRef} style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: T.goldLight, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.dark, fontSize: 16, flexShrink: 0 }}>
          {meta.icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: T.text }}>{meta.label}</h3>
          <span style={{ fontSize: 11, color: T.sub }}>{products.length} منتج</span>
        </div>
        <div style={{ flex: 1, height: 1.5, background: `linear-gradient(to left, transparent, ${T.border})` }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
        {products.map(p => {
          const pID = p.productID ?? p.ProductID;
          return <ProductCard key={pID} product={p} justAdded={addedMap[pID]} onAdd={onAdd} />;
        })}
      </div>
    </div>
  );
};

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
const CafeMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, removeFromCart } = useCart();

  const [products,  setProducts]  = useState([]);
  const [cafeData,  setCafeData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [addedMap,  setAddedMap]  = useState({});
  const [search,    setSearch]    = useState('');
  const [cartOpen,  setCartOpen]  = useState(false);

  const sectionRefs = useRef({});

  const scrollToSection = (key) => {
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!id) return;
    api.get(`/Cafes/${id}`).then(res => setCafeData(res.data)).catch(() => setCafeData({ name: 'الكافيه' }));
  }, [id]);

  useEffect(() => {
    if (!id || id === 'undefined') { setError('معرّف الكافيه غير موجود'); setLoading(false); return; }
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/Products/ByCafe/${id}`);
        setProducts(res.data || []);
      } catch { setError('تعذّر تحميل المنيو'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAdd = (product, size, qty) => {
    const pID   = product.productID ?? product.ProductID;
    const price = product.price ?? product.Price ?? 0;
    addToCart({ ...product, productId: pID, cafeID: Number(id), size, quantity: qty, price: calcPrice(price, size) });
    setAddedMap(prev => ({ ...prev, [pID]: true }));
    // ✅ الإصلاح: خلّي الـ timeout يساوي وقت الأنيميشن كامل (2800ms)
    // عشان الأنيميشن يكمل لـ "تمت الإضافة" قبل ما يرجع للزر الأصلي
    setTimeout(() => setAddedMap(prev => ({ ...prev, [pID]: false })), ANIM_DURATION);
  };

  const handleRemove = (idx) => {
    const item = cartItems[idx];
    removeFromCart(item.productId || item.id, item.size);
  };

  const handleUpdateQty = (idx, delta) => {
    const item   = cartItems[idx];
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) {
      removeFromCart(item.productId || item.id, item.size);
    } else {
      removeFromCart(item.productId || item.id, item.size);
      addToCart({ ...item, quantity: newQty });
    }
  };

  const cafeName   = cafeData?.name   ?? cafeData?.Name   ?? 'الكافيه';
  const cafeStatus = cafeData?.status ?? cafeData?.Status ?? '';
  const cafeCity   = cafeData?.city   ?? cafeData?.City   ?? '';
  const isOpen     = cafeStatus === 'Open';
  const cartCount  = (cartItems || []).reduce((s, i) => s + (i.quantity || 1), 0);

  const visibleProducts = products
    .filter(p => (p.isAvailable ?? p.IsAvailable ?? true))
    .filter(p => (p.name ?? p.Name ?? '').toLowerCase().includes(search.toLowerCase()));

  const activeCats  = CATEGORIES_META.filter(meta => visibleProducts.some(p => (p.category ?? p.Category ?? '') === meta.key));
  const knownKeys   = new Set(CATEGORIES_META.map(c => c.key));
  const unknownKeys = [...new Set(visibleProducts.map(p => p.category ?? p.Category ?? '').filter(k => k && !knownKeys.has(k)))];
  const allSections = [...activeCats, ...unknownKeys.map(k => getCatMeta(k))];

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 14, fontFamily: "'Cairo','Tajawal',sans-serif", color: T.sub }}>
      <MdOutlineLocalCafe size={44} color={T.gold} />
      <span style={{ fontSize: 14, fontWeight: 700 }}>جاري تحضير القائمة...</span>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 12, fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <FaBan size={36} color="#c62828" />
      <p style={{ color: '#c62828', fontWeight: 700 }}>{error}</p>
    </div>
  );

  if (products.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 12, fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <FaCoffee size={36} color={T.gold} />
      <p style={{ color: T.sub, fontWeight: 700 }}>لا توجد منتجات بعد في هذا الكافيه</p>
    </div>
  );

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif", background: T.cream, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.cream}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: ${T.gold}; border-radius: 10px; }

        @keyframes cartSlide {
          0%   { transform: translateX(60px);   opacity: 1; }
          25%  { transform: translateX(0px);    opacity: 1; }
          65%  { transform: translateX(0px);    opacity: 1; }
          88%  { transform: translateX(-120px); opacity: 0; }
          100% { transform: translateX(-120px); opacity: 0; }
        }

        @keyframes mugJump {
          0%   { transform: translate(0px, 0px);   opacity: 0; }
          22%  { transform: translate(0px, 0px);   opacity: 0; }
          28%  { transform: translate(0px, 6px);   opacity: 1; }
          48%  { transform: translate(0px, -55px); opacity: 1; }
          60%  { transform: translate(0px, -55px); opacity: 1; }
          65%  { transform: translate(0px, 6px);   opacity: 1; }
          70%  { transform: translate(0px, 6px);   opacity: 0; }
          100% { transform: translate(0px, 6px);   opacity: 0; }
        }

        @keyframes textPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }

        /* ✅ الإصلاح الرئيسي: animation-duration يطابق ANIM_DURATION */
        .cart-slide {
          animation: cartSlide ${ANIM_DURATION}ms cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .mug-jump {
          animation: mugJump ${ANIM_DURATION}ms cubic-bezier(0.4,0,0.2,1) forwards;
        }
        /* textPop يبدأ بعد 82% من الوقت = 2296ms ويكمل الـ 500ms الباقية */
        .text-pop {
          animation: textPop 500ms ease ${Math.round(ANIM_DURATION * 0.82)}ms forwards;
        }
      `}</style>

      <CartSidebar
        isOpen={cartOpen} onClose={() => setCartOpen(false)}
        cartItems={cartItems || []}
        onRemove={handleRemove} onUpdateQty={handleUpdateQty}
        onGoToCart={() => { setCartOpen(false); navigate('/cart'); }}
      />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg, ${T.dark} 0%, ${T.mid} 100%)`, borderRadius: 22, padding: '28px 26px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 8px 32px rgba(62,39,35,0.22)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, left: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(200,168,130,0.09)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(200,168,130,0.07)', pointerEvents: 'none' }} />
          <div style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0, background: 'rgba(200,168,130,0.18)', border: '1.5px solid rgba(200,168,130,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaCoffee size={28} color={T.gold} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 900, color: '#fff' }}>{cafeName}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {cafeCity && <span style={{ fontSize: 12, fontWeight: 700, color: T.gold, display: 'flex', alignItems: 'center', gap: 4 }}><FaMapMarkerAlt size={10} /> {cafeCity}</span>}
              <span style={{ fontSize: 11, fontWeight: 800, background: isOpen ? 'rgba(76,175,80,0.2)' : 'rgba(198,40,40,0.2)', color: isOpen ? '#a5d6a7' : '#ef9a9a', padding: '3px 11px', borderRadius: 20, border: `1px solid ${isOpen ? 'rgba(76,175,80,0.3)' : 'rgba(198,40,40,0.3)'}` }}>
                {isOpen ? '● مفتوح الآن' : '● مغلق'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{products.length} منتج</span>
            </div>
          </div>
          <button onClick={() => setCartOpen(true)} style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 15, background: 'rgba(200,168,130,0.18)', border: '1.5px solid rgba(200,168,130,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,168,130,0.32)'; e.currentTarget.style.transform = 'scale(1.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,168,130,0.18)'; e.currentTarget.style.transform = 'scale(1)'; }}>
            <FaShoppingCart size={20} color={T.gold} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#e53935', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, border: '2px solid #3e2723' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* بحث */}
        <div style={{ background: '#fff', border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, boxShadow: '0 2px 8px rgba(62,39,35,0.05)' }}>
          <FaSearch size={13} color={T.gold} style={{ flexShrink: 0 }} />
          <input type="text" placeholder="ابحث في القائمة..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: "'Cairo','Tajawal',sans-serif", color: T.text, background: 'transparent', direction: 'rtl' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.sub, fontSize: 12, padding: 0 }}>✕</button>}
        </div>

        {/* بطاقات الأقسام */}
        {allSections.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', border: `1.5px solid ${T.border}`, marginBottom: 28, boxShadow: '0 2px 10px rgba(62,39,35,0.05)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.sub, margin: '0 0 13px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdOutlineLocalCafe size={14} color={T.gold} /> تصفح الأقسام
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {CATEGORIES_META.map(meta => {
                const count = visibleProducts.filter(p => (p.category ?? p.Category ?? '') === meta.key).length;
                return <NavCard key={meta.key} meta={meta} count={count} onClick={() => scrollToSection(meta.key)} />;
              })}
            </div>
          </div>
        )}

        {/* المنتجات */}
        {visibleProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 18, border: `2px dashed ${T.border}` }}>
            <FaCoffee size={36} color={T.gold} style={{ opacity: 0.45, marginBottom: 12 }} />
            <p style={{ color: T.sub, fontSize: 14, fontWeight: 700, margin: 0 }}>لا توجد نتائج للبحث</p>
          </div>
        ) : (
          allSections.map(meta => (
            <CategorySection key={meta.key} meta={meta}
              products={visibleProducts.filter(p => (p.category ?? p.Category ?? '') === meta.key)}
              sectionRef={el => sectionRefs.current[meta.key] = el}
              onAdd={handleAdd} addedMap={addedMap} />
          ))
        )}
      </div>
    </div>
  );
};

export default CafeMenu;