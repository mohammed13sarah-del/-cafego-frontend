import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
  FaShoppingBag, FaUser, FaPhone, FaMapMarkerAlt,
  FaMoneyBillWave, FaCreditCard, FaCheckCircle,
  FaArrowRight, FaTruck, FaStore, FaLock,
  FaBolt, FaStar, FaListAlt, FaClipboardCheck,
} from 'react-icons/fa';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, clearCart, cafeId } = useCart();
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    fullName:      '',
    phone:         '',
    address:       '',
    paymentMethod: 'Cash',
    deliveryType:  'Home Delivery',
  });

  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [orderId,    setOrderId]    = useState(null);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address) return;
    setSubmitting(true);
    try {
      const payload = {
        customerID:   Number(user?.id || user?.customerID || 0),
        cafeID:       Number(cafeId),
        totalAmount:  subtotal,
        deliveryType: form.deliveryType,
        fullName:     form.fullName,
        phone:        form.phone,
        address:      form.address,
        orderItems:   cartItems.map(i => ({
          productID: i.productId || i.id,
          quantity:  i.quantity,
          price:     i.price,
        })),
      };
      const { data } = await api.post('/Orders/place-order', payload);
      setOrderId(data.orderId);
      clearCart();
      setDone(true);
    } catch (err) {
      console.error('Order error:', err.response?.data);
      alert('حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Empty cart ───────────────────────────────────────────────────────────
  if (cartItems.length === 0 && !done) {
    return (
      <div className="checkout-empty">
        <FaShoppingBag size={52} color="#c8a882" style={{ marginBottom: '16px' }} />
        <p className="checkout-empty-title">السلة فارغة!</p>
        <p className="checkout-empty-sub">أضف منتجات من المنيو أولاً</p>
        <button className="btn-coffee" onClick={() => navigate('/home')}>
          <FaArrowRight size={13} /> تصفح الكافيهات
        </button>
      </div>
    );
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="checkout-empty">
        <div className="success-circle">
          <FaCheckCircle size={38} color="#fff" />
        </div>
        <h2 className="success-title">تم تأكيد طلبك!</h2>
        {orderId && (
          <p className="success-order-id">
            <FaListAlt size={14} style={{ marginLeft: 6, color: '#a0785a' }} />
            رقم الطلب: <strong>#{orderId}</strong>
          </p>
        )}
        <p className="success-sub">
          <FaTruck size={13} style={{ marginLeft: 6, color: '#a0785a' }} />
          سيتم التواصل معك قريبا
        </p>
        <div className="success-actions">
          <button className="btn-coffee" onClick={() => navigate('/my-orders')}>
            <FaClipboardCheck size={14} /> متابعة طلباتي
          </button>
          <button className="btn-outline" onClick={() => navigate('/home')}>
            <FaArrowRight size={13} /> طلب جديد
          </button>
        </div>
      </div>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="checkout-page">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>

      <div className="checkout-header">
        <h1>إتمام الطلب</h1>
        <p>راجع طلبك وأدخل معلومات التوصيل</p>
      </div>

      <div className="checkout-container">

        {/* ── ملخص الطلب ── */}
        <div className="order-summary-box">
          <h3>
            <FaShoppingBag className="card-title-icon" />
            ملخص الطلب
            <span className="items-count">{cartItems.length} منتج</span>
          </h3>

          <div className="summary-items">
            {cartItems.map((item, i) => (
              <div key={i} className="summary-item">
                <div className="summary-item-left">
                  <div className="item-qty-badge">{item.quantity}×</div>
                  <div>
                    <div className="item-name">{item.name}</div>
                    {item.size && <div className="item-size">حجم: {item.size}</div>}
                  </div>
                </div>
                <span className="item-price">₪{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <hr />

          <div className="price-lines">
            <PriceLine label="المجموع الفرعي" value={`₪${subtotal.toFixed(2)}`} />
            <div className="price-divider" />
            <PriceLine label="الإجمالي" value={`₪${subtotal.toFixed(2)}`} bold />
            <PriceLine label="طريقة الدفع" value={form.paymentMethod === 'Cash' ? 'نقداً عند الاستلام' : 'بطاقة ائتمان'} />
            <PriceLine label="نوع التوصيل" value={form.deliveryType === 'Home Delivery' ? 'توصيل للمنزل' : 'استلام من الكافيه'} />
          </div>

          <div className="trust-badges">
            {[
              { icon: <FaLock size={20} color="#a0785a" />,  text: 'دفع آمن' },
              { icon: <FaBolt size={20} color="#a0785a" />,  text: 'توصيل سريع' },
              { icon: <FaStar size={20} color="#a0785a" />,  text: 'جودة مضمونة' },
            ].map((b, i) => (
              <div key={i} className="trust-badge">
                {b.icon}
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* ── الفورم ── */}
        <form className="checkout-form" onSubmit={handleSubmit}>

          <h3><FaMapMarkerAlt className="card-title-icon" /> معلومات التوصيل</h3>

          {/* الاسم — أحرف فقط */}
          <FormField label="الاسم الكامل" icon={<FaUser />} required>
            <input
              className="checkout-input"
              placeholder="الاسم الكامل"
              value={form.fullName}
              required
              onChange={e => {
                const val = e.target.value.replace(/[0-9]/g, '');
                setForm({ ...form, fullName: val });
              }}
            />
          </FormField>

          {/* الهاتف — أرقام فقط */}
          <FormField label="رقم الهاتف" icon={<FaPhone />} required>
            <input
              className="checkout-input"
              type="tel"
              placeholder="05xxxxxxxx"
              value={form.phone}
              required
              inputMode="numeric"
              onChange={e => {
                const val = e.target.value.replace(/[^0-9+]/g, '');
                setForm({ ...form, phone: val });
              }}
            />
          </FormField>

          {/* العنوان — حروف فقط */}
          <FormField label="العنوان بالتفصيل" icon={<FaMapMarkerAlt />} required>
            <input
              className="checkout-input"
              placeholder="المدينة، الشارع، البناية..."
              value={form.address}
              required
              onChange={e => {
                const val = e.target.value.replace(/[0-9]/g, '');
                setForm({ ...form, address: val });
              }}
            />
          </FormField>

          {/* نوع التوصيل */}
          <h3 style={{ marginTop: '1.5rem' }}>
            <FaTruck className="card-title-icon" /> نوع التوصيل
          </h3>
          <div className="payment-options">
            {[
              { value: 'Home Delivery', label: 'توصيل للمنزل',     sub: 'سيصلك الطلب لبابك',          icon: <FaTruck size={18} /> },
              { value: 'Pickup',        label: 'استلام من الكافيه', sub: 'توجّه للكافيه لاستلام طلبك', icon: <FaStore size={18} /> },
            ].map(opt => (
              <label key={opt.value} className={`payment-card ${form.deliveryType === opt.value ? 'payment-card--active' : ''}`}>
                <input type="radio" name="deliveryType" value={opt.value}
                  checked={form.deliveryType === opt.value}
                  onChange={e => setForm({ ...form, deliveryType: e.target.value })}
                  style={{ display: 'none' }} />
                <div className={`payment-icon ${form.deliveryType === opt.value ? 'payment-icon--active' : ''}`}>{opt.icon}</div>
                <div className="payment-text">
                  <span className="payment-label">{opt.label}</span>
                  <span className="payment-sub">{opt.sub}</span>
                </div>
                <div className={`payment-radio ${form.deliveryType === opt.value ? 'payment-radio--active' : ''}`}>
                  {form.deliveryType === opt.value && <div className="payment-radio-dot" />}
                </div>
              </label>
            ))}
          </div>

          {/* طريقة الدفع */}
          <h3 style={{ marginTop: '1.5rem' }}>
            <FaMoneyBillWave className="card-title-icon" /> طريقة الدفع
          </h3>
          <div className="payment-options">
            {[
              { value: 'Cash', label: 'نقداً عند الاستلام', sub: 'ادفع عند وصول الطلب', icon: <FaMoneyBillWave size={18} /> },
              { value: 'Visa', label: 'بطاقة ائتمان',       sub: 'Visa • Mastercard',   icon: <FaCreditCard size={18} /> },
            ].map(opt => (
              <label key={opt.value} className={`payment-card ${form.paymentMethod === opt.value ? 'payment-card--active' : ''}`}>
                <input type="radio" name="paymentMethod" value={opt.value}
                  checked={form.paymentMethod === opt.value}
                  onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                  style={{ display: 'none' }} />
                <div className={`payment-icon ${form.paymentMethod === opt.value ? 'payment-icon--active' : ''}`}>{opt.icon}</div>
                <div className="payment-text">
                  <span className="payment-label">{opt.label}</span>
                  <span className="payment-sub">{opt.sub}</span>
                </div>
                <div className={`payment-radio ${form.paymentMethod === opt.value ? 'payment-radio--active' : ''}`}>
                  {form.paymentMethod === opt.value && <div className="payment-radio-dot" />}
                </div>
              </label>
            ))}
          </div>

          <button type="submit" className="confirm-order-btn"
            disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
            <FaCheckCircle size={16} />
            {submitting ? 'جارٍ تأكيد الطلب...' : `تأكيد الطلب — ₪${subtotal.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FormField = ({ label, icon, children, required }) => (
  <div className="input-group">
    <label>
      <span className="field-icon">{icon}</span>
      {label}
      {required && <span style={{ color: '#c62828', marginRight: 3 }}>*</span>}
    </label>
    {children}
  </div>
);

const PriceLine = ({ label, value, bold, green }) => (
  <div className={`price-line ${bold ? 'price-line--bold' : ''}`}>
    <span>{label}</span>
    <span style={{ color: green ? '#2e7d32' : undefined }}>{value}</span>
  </div>
);

export default Checkout;