import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  FaShoppingCart, FaTrash, FaStore, FaCreditCard,
  FaTimesCircle, FaTag, FaBoxOpen,
} from 'react-icons/fa';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  // ── Empty State ────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
        fontFamily: "'Cairo', 'Tajawal', sans-serif", direction: 'rtl',
        gap: '20px',
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>

        <div style={{
          width: '110px', height: '110px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #fff8f2, #f5ebe0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(62,39,35,0.1)',
        }}>
          <FaBoxOpen size={48} color="#c8a882" />
        </div>

        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#3e2723', marginBottom: '8px' }}>
            السلة فارغة!
          </h2>
          <p style={{ color: '#8d6e63', fontSize: '15px' }}>
            لم تضف أي منتجات بعد، تصفح الكافيهات وابدأ طلبك.
          </p>
        </div>

        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'linear-gradient(135deg, #c8a882, #a0785a)',
            color: '#1a110e', border: 'none', padding: '14px 36px',
            borderRadius: '50px', cursor: 'pointer', fontSize: '16px',
            fontWeight: '700', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 6px 18px rgba(200,168,130,0.35)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <FaStore size={16} /> تصفح الكافيهات
        </button>
      </div>
    );
  }

  // ── Cart with items ────────────────────────────────────────────────────────
  return (
    <div style={{
      direction: 'rtl', fontFamily: "'Cairo', 'Tajawal', sans-serif",
      maxWidth: '960px', margin: '0 auto',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        .cart-row { transition: background 0.2s; }
        .cart-row:hover { background: #fffaf6 !important; }
        .remove-btn:hover { background: #b71c1c !important; transform: scale(1.05); }
        .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(62,39,35,0.3) !important; }
        .browse-btn:hover { background: rgba(200,168,130,0.12) !important; }
        .clear-btn:hover { color: #b71c1c !important; border-color: #b71c1c !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #c8a882, #a0785a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaShoppingCart size={20} color="#1a110e" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#3e2723', margin: 0 }}>
              سلة المشتريات
            </h2>
            <p style={{ fontSize: '13px', color: '#8d6e63', margin: 0 }}>
              {cartItems.length} {cartItems.length === 1 ? 'منتج' : 'منتجات'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="browse-btn"
          style={{
            background: 'transparent', color: '#a0785a',
            border: '1px solid rgba(200,168,130,0.5)', padding: '10px 20px',
            borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
            fontFamily: 'inherit', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
          }}
        >
          <FaStore size={14} /> متابعة التسوق
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(62,39,35,0.08)',
        border: '1px solid rgba(200,168,130,0.15)',
        overflow: 'hidden', marginBottom: '24px',
      }}>
        {/* Table Head */}
        <div className="cart-table-head" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 80px 100px 60px 100px 70px',
          padding: '14px 24px',
          background: 'linear-gradient(135deg, #1a110e, #2d1b14)',
          color: '#c8a882', fontSize: '13px', fontWeight: '700', gap: '8px',
        }}>
          <span>المنتج</span>
          <span style={{ textAlign: 'center' }}>الحجم</span>
          <span style={{ textAlign: 'center' }}>السعر</span>
          <span style={{ textAlign: 'center' }}>الكمية</span>
          <span style={{ textAlign: 'center' }}>المجموع</span>
          <span style={{ textAlign: 'center' }}>حذف</span>
        </div>

        {/* Rows */}
        {cartItems.map((item, idx) => {
          const pId = item.productId || item.id;
          const isLast = idx === cartItems.length - 1;
          return (
            <div
              key={`${pId}-${item.size}`}
              className="cart-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 80px 100px 60px 100px 70px',
                padding: '16px 24px', gap: '8px', alignItems: 'center',
                borderBottom: isLast ? 'none' : '1px solid rgba(200,168,130,0.12)',
                background: '#fff',
              }}
            >
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #fff8f2, #f5ebe0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FaTag size={14} color="#c8a882" />
                </div>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#3e2723' }}>
                  {item.name}
                </span>
              </div>

              {/* Size */}
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #c8a882, #a0785a)',
                  color: '#1a110e', padding: '3px 12px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: '700',
                }}>
                  {item.size || 'M'}
                </span>
              </div>

              {/* Price */}
              <div style={{ textAlign: 'center', fontSize: '14px', color: '#6d4c41', fontWeight: '600' }}>
                {item.price} ILS
              </div>

              {/* Qty */}
              <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: '700', color: '#3e2723' }}>
                ×{item.quantity}
              </div>

              {/* Subtotal */}
              <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: '800', color: '#3e2723' }}>
                {item.price * item.quantity} ILS
              </div>

              {/* Remove */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => removeFromCart(pId, item.size)}
                  className="remove-btn"
                  style={{
                    background: '#c62828', color: 'white', border: 'none',
                    width: '34px', height: '34px', borderRadius: '8px',
                    cursor: 'pointer', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <FaTrash size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Summary ── */}
      <div style={{
        background: '#fff', borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(62,39,35,0.08)',
        border: '1px solid rgba(200,168,130,0.15)',
        padding: '24px 28px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '20px',
      }}>
        {/* Total */}
        <div>
          <p style={{ fontSize: '13px', color: '#8d6e63', margin: '0 0 4px' }}>المجموع الكلي</p>
          <p style={{ fontSize: '28px', fontWeight: '900', color: '#3e2723', margin: 0 }}>
            {totalAmount}{' '}
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#8d6e63' }}>ILS</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="cart-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={clearCart}
            className="clear-btn"
            style={{
              background: 'transparent', color: '#8d6e63',
              border: '1px solid rgba(141,110,99,0.4)', padding: '12px 22px',
              borderRadius: '12px', cursor: 'pointer', fontSize: '14px',
              fontFamily: 'inherit', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
            }}
          >
            <FaTimesCircle size={14} /> مسح السلة
          </button>

          <button
            onClick={() => navigate('/checkout')}
            className="checkout-btn"
            style={{
              background: 'linear-gradient(135deg, #3e2723, #6d4c41)',
              color: 'white', border: 'none', padding: '13px 32px',
              borderRadius: '12px', cursor: 'pointer', fontSize: '15px',
              fontWeight: '700', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 4px 16px rgba(62,39,35,0.25)', transition: 'all 0.25s ease',
            }}
          >
            <FaCreditCard size={15} /> إتمام الطلب
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;