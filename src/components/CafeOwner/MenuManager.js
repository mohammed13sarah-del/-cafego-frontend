import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
  FaCamera, FaBoxOpen, FaSync, FaEyeSlash, FaEye,
  FaCoffee, FaSnowflake, FaGlassWhiskey, FaLeaf,
  FaBlender, FaWater, FaBreadSlice, FaMugHot,
} from 'react-icons/fa';
import { MdOutlineLocalCafe } from 'react-icons/md';

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

const CATEGORIES = [
  { key: 'hot',       label: 'مشروبات ساخنة',  icon: <FaMugHot /> },
  { key: 'cold',      label: 'مشروبات باردة',   icon: <FaSnowflake /> },
  { key: 'milkshake', label: 'ميلك شيك',        icon: <FaGlassWhiskey /> },
  { key: 'smoothie',  label: 'سموذي',            icon: <FaBlender /> },
  { key: 'juice',     label: 'مشروبات طبيعية',  icon: <FaLeaf /> },
  { key: 'mojito',    label: 'موهيتو',           icon: <FaWater /> },
  { key: 'coffee',    label: 'قهوة',             icon: <FaCoffee /> },
  { key: 'sweets',    label: 'حلو ومقبلات',     icon: <FaBreadSlice /> },
];

const SIZES = ['S', 'M', 'L'];
const EMPTY_FORM = {
  name: '', price: '', description: '',
  category: 'hot', imageUrl: '', isAvailable: true,
  sizes: { S: false, M: true, L: false },
};

const TrashSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="28" height="28" fill="#c62828">
  <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0h120.4c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416L394.8 467c-1.6 25.3-22.6 45-47.9 45H101.1c-25.3 0-46.3-19.7-47.9-45L32 128zm192 40c-8.8 0-16 7.2-16 16V424c0 8.8 7.2 16 16 16s16-7.2 16-16V184c0-8.8-7.2-16-16-16zm-80 0c-8.8 0-16 7.2-16 16V424c0 8.8 7.2 16 16 16s16-7.2 16-16V184c0-8.8-7.2-16-16-16zm160 0c-8.8 0-16 7.2-16 16V424c0 8.8 7.2 16 16 16s16-7.2 16-16V184c0-8.8-7.2-16-16-16z"/>
</svg>`;

const CheckSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="28" height="28" fill="#2e7d32">
  <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
</svg>`;

const Req = () => <span style={{ color: '#c62828', marginRight: 2 }}>*</span>;

const inp = {
  width: '100%', padding: '10px 13px', borderRadius: 10,
  border: `1px solid ${T.border}`, fontSize: 13,
  fontFamily: "'Cairo','Tajawal',sans-serif",
  background: T.cream, color: T.text,
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
};

const lbl = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: T.sub, marginBottom: 6, marginTop: 16,
};

// ─── Navigation Card ──────────────────────────────────────────────────────────
const NavCard = ({ cat, count, onClick }) => (
  <div onClick={onClick} style={{
    flexShrink: 0, width: 110, padding: '14px 12px',
    background: count > 0 ? '#fff' : T.cream,
    border: `1px solid ${T.border}`,
    borderRadius: 14, cursor: count > 0 ? 'pointer' : 'default',
    textAlign: 'center', transition: 'all .2s',
    opacity: count > 0 ? 1 : 0.5,
    boxShadow: count > 0 ? '0 2px 8px rgba(62,39,35,0.06)' : 'none',
  }}
    onMouseEnter={e => { if (count > 0) { e.currentTarget.style.background = T.goldLight; e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
    onMouseLeave={e => { e.currentTarget.style.background = count > 0 ? '#fff' : T.cream; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{
      width: 38, height: 38, borderRadius: 11, margin: '0 auto 8px',
      background: count > 0 ? T.goldLight : T.cream,
      border: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: T.dark, fontSize: 16,
    }}>
      {cat.icon}
    </div>
    <div style={{ fontSize: 11, fontWeight: 800, color: T.text, marginBottom: 4, lineHeight: 1.3 }}>
      {cat.label}
    </div>
    <div style={{ fontSize: 10, fontWeight: 700, color: count > 0 ? T.sub : '#bcaaa4' }}>
      {count > 0 ? `${count} منتج` : 'فارغ'}
    </div>
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onEdit, onDelete, onToggle }) => {
  const sizes = (() => { try { return product.sizes ? JSON.parse(product.sizes) : {}; } catch { return {}; } })();
  const activeSizes = SIZES.filter(s => sizes[s]);

  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: '#fff', borderRadius: 16,
      border: `1px solid ${T.border}`,
      boxShadow: '0 2px 12px rgba(62,39,35,0.07)',
      overflow: 'hidden', transition: 'transform .22s, box-shadow .22s',
      display: 'flex', flexDirection: 'column',
      opacity: product.isAvailable ? 1 : 0.65,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(62,39,35,0.13)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(62,39,35,0.07)'; }}
    >
      <div style={{
        height: 125, position: 'relative',
        background: product.imageUrl
          ? `url(${product.imageUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, ${T.goldLight}, ${T.border})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!product.imageUrl && <MdOutlineLocalCafe size={36} color={T.gold} style={{ opacity: 0.4 }} />}
        {!product.isAvailable && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(30,20,15,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              color: '#fff', fontSize: 11, fontWeight: 800,
              background: 'rgba(0,0,0,0.5)', padding: '4px 13px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <FaEyeSlash size={10} /> مخفي
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '11px 13px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.text, flex: 1, lineHeight: 1.35 }}>
            {product.name}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 900, color: T.dark,
            background: T.goldLight, padding: '2px 9px', borderRadius: 20,
            flexShrink: 0, marginRight: 6, border: `1px solid ${T.border}`,
          }}>
            {product.price}₪
          </span>
        </div>

        {product.description && (
          <p style={{ fontSize: 10, color: T.sub, margin: 0, lineHeight: 1.55 }}>
            {product.description.length > 50 ? product.description.slice(0, 50) + '...' : product.description}
          </p>
        )}

        {activeSizes.length > 0 && (
          <div style={{ display: 'flex', gap: 4 }}>
            {activeSizes.map(s => (
              <span key={s} style={{
                fontSize: 9, fontWeight: 800, color: T.sub,
                background: T.cream, padding: '2px 8px',
                borderRadius: 20, border: `1px solid ${T.border}`,
              }}>{s}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 5, marginTop: 'auto', paddingTop: 4 }}>
          <button onClick={() => onEdit(product)} style={{
            flex: 1, background: T.goldLight, color: T.dark,
            border: `1px solid ${T.border}`, padding: '7px 0', borderRadius: 8,
            cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            transition: 'background .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.gold}
            onMouseLeave={e => e.currentTarget.style.background = T.goldLight}
          >
            <FaEdit size={10} /> تعديل
          </button>
          <button onClick={() => onToggle(product)} style={{
            flex: 1, background: T.cream, color: T.mid,
            border: `1px solid ${T.border}`, padding: '7px 0', borderRadius: 8,
            cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            {product.isAvailable ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
            {product.isAvailable ? 'إخفاء' : 'إظهار'}
          </button>
          <button onClick={() => onDelete(product)} style={{
            background: T.cream, color: '#c62828',
            border: `1px solid ${T.border}`, padding: '7px 9px', borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#fdecea'}
            onMouseLeave={e => e.currentTarget.style.background = T.cream}
          >
            <FaTrash size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const ProductModal = ({ form, setForm, onSubmit, onClose, submitting, isEdit }) => {
  const fileRef = useRef();

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'الصورة كبيرة جداً', text: 'الحد الأقصى 5MB', confirmButtonColor: T.gold });
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, imageUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(20,10,5,0.6)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 22, padding: '28px 26px',
        width: 480, maxWidth: '100%', maxHeight: '93vh', overflowY: 'auto',
        direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif",
        boxShadow: '0 30px 80px rgba(0,0,0,0.22)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              background: T.goldLight, border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.dark,
            }}>
              {isEdit ? <FaEdit size={14} /> : <FaPlus size={14} />}
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 900, color: T.text, margin: 0 }}>
                {isEdit ? 'تعديل المنتج' : 'منتج جديد'}
              </h2>
              <p style={{ fontSize: 11, color: T.sub, margin: 0 }}>
                {isEdit ? 'عدّل بيانات المنتج' : 'أضف منتجاً لقائمتك'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: T.cream, border: `1px solid ${T.border}`,
            width: 32, height: 32, borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.sub,
          }}>
            <FaTimes size={12} />
          </button>
        </div>

        <label style={lbl}>صورة المنتج</label>
        <div onClick={() => fileRef.current?.click()} style={{
          width: '100%', height: 135, borderRadius: 13,
          border: `2px dashed ${T.border}`, cursor: 'pointer',
          background: form.imageUrl ? `url(${form.imageUrl}) center/cover no-repeat` : T.cream,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 7, position: 'relative', overflow: 'hidden', transition: 'border-color .2s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
        >
          {form.imageUrl ? (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(20,10,5,0.32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13, gap: 7,
            }}>
              <FaCamera size={15} /> تغيير الصورة
            </div>
          ) : (
            <>
              <FaCamera size={24} color={T.gold} />
              <span style={{ fontSize: 12, color: T.sub, fontWeight: 700 }}>اختر صورة من جهازك</span>
              <span style={{ fontSize: 10, color: '#bcaaa4' }}>JPG · PNG · WEBP — حتى 5MB</span>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }} onChange={handleImagePick} />
        {form.imageUrl && (
          <button onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} style={{
            marginTop: 5, background: 'none', border: 'none', color: '#c62828',
            fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <FaTimes size={9} /> حذف الصورة
          </button>
        )}

        <label style={lbl}><Req />اسم المنتج</label>
        <input style={inp} value={form.name} placeholder="مثال: سبانش لاتيه"
          onChange={e => {
            const val = e.target.value.replace(/[0-9]/g, '');
            setForm(f => ({ ...f, name: val }));
          }}
          onFocus={e => e.target.style.borderColor = T.gold}
          onBlur={e => e.target.style.borderColor = T.border} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}><Req />السعر (₪)</label>
            <input style={inp} type="number" min="0" step="0.5"
              value={form.price} placeholder="15"
              onChange={e => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setForm(f => ({ ...f, price: val }));
              }}
              onKeyDown={e => { if (['e','E','+','-'].includes(e.key)) e.preventDefault(); }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>
          <div>
            <label style={lbl}><Req />القسم</label>
            <select style={{ ...inp, cursor: 'pointer' }} value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <label style={lbl}>الوصف</label>
        <textarea style={{ ...inp, resize: 'vertical', minHeight: 62 }}
          value={form.description} placeholder="وصف مختصر..."
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          onFocus={e => e.target.style.borderColor = T.gold}
          onBlur={e => e.target.style.borderColor = T.border} />

        <label style={lbl}>الأحجام المتاحة</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {SIZES.map(s => (
            <div key={s} onClick={() => setForm(f => ({ ...f, sizes: { ...f.sizes, [s]: !f.sizes[s] } }))} style={{
              flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer',
              textAlign: 'center', fontWeight: 800, fontSize: 14,
              border: `2px solid ${form.sizes[s] ? T.gold : T.border}`,
              background: form.sizes[s] ? `linear-gradient(135deg,${T.gold},${T.mid})` : T.cream,
              color: form.sizes[s] ? '#1a110e' : T.sub,
              transition: 'all .2s',
            }}>{s}</div>
          ))}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 15px', background: T.cream, borderRadius: 11,
          border: `1px solid ${T.border}`, marginBottom: 22,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>المنتج متاح للطلب</div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
              {form.isAvailable ? 'يظهر للزبائن' : 'مخفي عن الزبائن'}
            </div>
          </div>
          <div onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))} style={{
            width: 46, height: 25, borderRadius: 13, cursor: 'pointer',
            background: form.isAvailable ? T.dark : '#d7ccc8',
            position: 'relative', transition: 'background .25s', flexShrink: 0,
          }}>
            <span style={{
              position: 'absolute', top: 3, width: 19, height: 19, borderRadius: '50%',
              background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              left: form.isAvailable ? 24 : 3, transition: 'left .25s',
            }} />
          </div>
        </div>

        <button onClick={onSubmit} disabled={submitting} style={{
          width: '100%', border: 'none', padding: 13, borderRadius: 12,
          cursor: submitting ? 'not-allowed' : 'pointer',
          background: submitting ? '#d7ccc8' : `linear-gradient(135deg,${T.gold},${T.mid})`,
          color: submitting ? '#9e9e9e' : '#1a110e',
          fontFamily: 'inherit', fontSize: 14, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 9,
          boxShadow: submitting ? 'none' : '0 4px 14px rgba(160,120,90,0.3)',
        }}>
          <FaSave size={13} /> {submitting ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
        </button>
        <button onClick={onClose} style={{
          width: '100%', background: T.cream, color: T.sub,
          border: `1px solid ${T.border}`, padding: 11, borderRadius: 12,
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
        }}>إلغاء</button>
      </div>
    </div>
  );
};

// ─── Category Section ─────────────────────────────────────────────────────────
const CategorySection = ({ cat, products, sectionRef, onEdit, onDelete, onToggle }) => {
  if (products.length === 0) return null;
  return (
    <div ref={sectionRef} style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: T.goldLight, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.dark, fontSize: 15, flexShrink: 0,
        }}>
          {cat.icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: T.text }}>{cat.label}</h3>
          <span style={{ fontSize: 11, color: T.sub }}>{products.length} منتج</span>
        </div>
        <div style={{ flex: 1, height: 1, background: T.border }} />
      </div>
      <div className="menu-products-row" style={{
        display: 'flex', flexDirection: 'row',
        gap: 14, overflowX: 'auto', paddingBottom: 10,
        justifyContent: 'flex-start', direction: 'rtl',
      }}>
        {products.map(p => (
          <ProductCard key={p.productID} product={p}
            onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const MenuManager = () => {
  const { user } = useAuth();
  const cafeId = user?.cafeID;

  const [products, setProducts]      = useState([]);
  const [loading, setLoading]        = useState(true);
  const [showForm, setShowForm]      = useState(false);
  const [editingProduct, setEditing] = useState(null);
  const [submitting, setSubmitting]  = useState(false);
  const [form, setForm]              = useState(EMPTY_FORM);

  const sectionRefs = useRef({});

  const scrollToSection = (key) => {
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fetchProducts = async () => {
    if (!cafeId) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await api.get(`/Products/ByCafe/${cafeId}`);
      setProducts(res.data || []);
    } catch {
      Swal.fire({ icon: 'error', title: 'خطأ', text: 'تعذّر تحميل المنتجات', confirmButtonColor: T.gold });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [cafeId]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (p) => {
    const sizes = (() => { try { return p.sizes ? JSON.parse(p.sizes) : { S:false,M:true,L:false }; } catch { return { S:false,M:true,L:false }; } })();
    setEditing(p);
    setForm({ name:p.name||'', price:p.price||'', description:p.description||'', category:p.category||'hot', imageUrl:p.imageUrl||'', isAvailable:p.isAvailable??true, sizes });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price) {
      Swal.fire({ icon:'warning', title:'بيانات ناقصة', text:'اسم المنتج والسعر مطلوبان', confirmButtonColor:T.gold });
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name:form.name, price:parseFloat(form.price), description:form.description,
        category:form.category, imageUrl:form.imageUrl, isAvailable:form.isAvailable,
        sizes:JSON.stringify(form.sizes), cafeID:parseInt(cafeId), stockQuantity:25,
      };
      if (editingProduct) {
        await api.put(`/Products/${editingProduct.productID}`, { ...payload, productID:editingProduct.productID });
      } else {
        await api.post('/Products', payload);
      }
      setShowForm(false);
      await fetchProducts();
      Swal.fire({ icon:'success', title: editingProduct ? 'تم التعديل ✓' : 'تمت الإضافة ✓', timer:1800, showConfirmButton:false });
    } catch {
      Swal.fire({ icon:'error', title:'فشل الحفظ', confirmButtonColor:T.gold });
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (p) => {
    try {
      await api.put(`/Products/${p.productID}`, { ...p, isAvailable:!p.isAvailable, sizes:typeof p.sizes==='string'?p.sizes:JSON.stringify(p.sizes||{}) });
      await fetchProducts();
    } catch {
      Swal.fire({ icon:'error', title:'خطأ', confirmButtonColor:T.gold });
    }
  };

  const handleDelete = async (p) => {
    const r = await Swal.fire({
      html: `
        <div style="font-family:'Cairo','Tajawal',sans-serif;direction:rtl;text-align:center;padding:8px 0">
          <div style="width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#fdecea,#ffcdd2);border:2px solid #ef9a9a;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;">${TrashSVG}</div>
          <p style="font-size:16px;font-weight:900;color:#3e2723;margin:0 0 10px">هل أنت متأكد من الحذف؟</p>
          <p style="font-size:12px;color:#a0785a;margin:0;line-height:1.8">سيتم حذف <strong style="color:#c62828">"${p.name}"</strong> نهائياً<br/>ولن تتمكن من استرجاعه لاحقاً</p>
        </div>
      `,
      icon: undefined,
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      customClass: { popup: 'delete-popup', confirmButton: 'delete-confirm-btn', cancelButton: 'delete-cancel-btn' },
      didOpen: () => {
        const popup = document.querySelector('.delete-popup');
        if (popup) { popup.style.cssText += `border-radius:22px !important;padding:32px 28px !important;font-family:'Cairo','Tajawal',sans-serif !important;direction:rtl !important;box-shadow:0 30px 80px rgba(0,0,0,0.2) !important;max-width:360px !important;`; }
        const confirmBtn = document.querySelector('.delete-confirm-btn');
        if (confirmBtn) { confirmBtn.style.cssText += `background:linear-gradient(135deg,#e53935,#c62828) !important;color:#fff !important;border:none !important;padding:11px 28px !important;border-radius:12px !important;font-family:'Cairo','Tajawal',sans-serif !important;font-size:13px !important;font-weight:800 !important;box-shadow:0 4px 14px rgba(198,40,40,0.35) !important;cursor:pointer !important;`; }
        const cancelBtn = document.querySelector('.delete-cancel-btn');
        if (cancelBtn) { cancelBtn.style.cssText += `background:#f5ede0 !important;color:#6d4c41 !important;border:1px solid #ede0d4 !important;padding:11px 28px !important;border-radius:12px !important;font-family:'Cairo','Tajawal',sans-serif !important;font-size:13px !important;font-weight:700 !important;cursor:pointer !important;`; }
      },
    });

    if (!r.isConfirmed) return;
    try {
      await api.delete(`/Products/${p.productID}`);
      await fetchProducts();
      Swal.fire({
        html: `
          <div style="font-family:'Cairo','Tajawal',sans-serif;direction:rtl;text-align:center;padding:8px 0">
            <div style="width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border:2px solid #a5d6a7;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">${CheckSVG}</div>
            <p style="font-size:15px;font-weight:900;color:#3e2723;margin:0 0 6px">تم الحذف بنجاح</p>
            <p style="font-size:12px;color:#a0785a;margin:0">تم حذف "${p.name}" من المنيو</p>
          </div>
        `,
        icon: undefined, timer: 1800, showConfirmButton: false,
        didOpen: () => { const popup = document.querySelector('.swal2-popup'); if (popup) { popup.style.borderRadius = '22px'; popup.style.padding = '32px 28px'; } },
      });
    } catch {
      Swal.fire({ icon: 'error', title: 'فشل الحذف', confirmButtonColor: T.gold });
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:280, flexDirection:'column', gap:12, color:T.sub, fontFamily:"'Cairo',sans-serif" }}>
      <MdOutlineLocalCafe size={40} color={T.gold} />
      <span style={{ fontSize:14, fontWeight:700 }}>جاري تحميل المنيو...</span>
    </div>
  );

  return (
    <div style={{ direction:'ltr', fontFamily:"'Cairo','Tajawal',sans-serif" }}>
      <div style={{ direction:'rtl' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.cream}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: ${T.gold}; border-radius: 10px; }
      `}</style>

      {/* ── Header ── */}
      <div className="menu-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:900, color:T.text, margin:'0 0 4px', display:'flex', alignItems:'center', gap:9 }}>
            <MdOutlineLocalCafe size={22} color={T.gold} /> إدارة المنيو
          </h1>
          <p style={{ fontSize:12, color:T.sub, margin:0 }}>
            {products.length} منتج · {products.filter(p=>p.isAvailable).length} متاح · {products.filter(p=>!p.isAvailable).length} مخفي
          </p>
        </div>
        <div style={{ display:'flex', gap:9 }}>
          <button onClick={fetchProducts} style={{
            background:'#fff', border:`1px solid ${T.border}`, color:T.sub,
            padding:'10px 14px', borderRadius:11, cursor:'pointer',
            display:'flex', alignItems:'center', gap:6, fontSize:12, fontFamily:'inherit',
          }}>
            <FaSync size={11} /> تحديث
          </button>
          <button onClick={openAdd} style={{
            background:`linear-gradient(135deg,${T.gold},${T.mid})`,
            color:'#1a110e', border:'none', padding:'10px 20px',
            borderRadius:11, cursor:'pointer', fontSize:13, fontWeight:800,
            fontFamily:'inherit', display:'flex', alignItems:'center', gap:7,
            boxShadow:'0 4px 14px rgba(160,120,90,0.28)',
          }}>
            <FaPlus size={12} /> إضافة منتج
          </button>
        </div>
      </div>

      {/* ── Navigation Cards ── */}
      {products.length > 0 && (
        <div style={{
          background:'#fff', borderRadius:16, padding:'16px 18px',
          border:`1px solid ${T.border}`, marginBottom:28,
          boxShadow:'0 2px 8px rgba(62,39,35,0.05)',
        }}>
          <p style={{ fontSize:11, fontWeight:700, color:T.sub, margin:'0 0 12px' }}>تصفح الأقسام</p>
          <div className="menu-nav-cards" style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
            {CATEGORIES.map(cat => (
              <NavCard
                key={cat.key} cat={cat}
                count={products.filter(p => p.category === cat.key).length}
                onClick={() => scrollToSection(cat.key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── المحتوى ── */}
      {products.length === 0 ? (
        <div style={{ textAlign:'center', padding:'70px 20px', background:'#fff', borderRadius:16, border:`2px dashed ${T.border}` }}>
          <FaBoxOpen size={38} color={T.gold} style={{ marginBottom:12, opacity:0.5 }} />
          <p style={{ color:T.sub, fontSize:14, fontWeight:700, margin:'0 0 16px' }}>لا توجد منتجات بعد</p>
          <button onClick={openAdd} style={{
            background:`linear-gradient(135deg,${T.gold},${T.mid})`,
            color:'#1a110e', border:'none', padding:'11px 24px',
            borderRadius:11, cursor:'pointer', fontSize:13, fontWeight:800, fontFamily:'inherit',
          }}>
            <FaPlus size={12} style={{ marginLeft:6 }} /> إضافة أول منتج
          </button>
        </div>
      ) : (
        CATEGORIES.map(cat => (
          <CategorySection
            key={cat.key} cat={cat}
            products={products.filter(p => p.category === cat.key)}
            sectionRef={el => sectionRefs.current[cat.key] = el}
            onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle}
          />
        ))
      )}

      {showForm && (
        <ProductModal form={form} setForm={setForm}
          onSubmit={handleSubmit} onClose={() => setShowForm(false)}
          submitting={submitting} isEdit={!!editingProduct} />
      )}
      </div>
    </div>
  );
};

export default MenuManager;