import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductDetails = () => {
    // سنستخدم بيانات افتراضية، وفي مشروعك الحقيقي ستجلبها من الـ API عبر الـ ID
    const product = { 
        id: 1, name: 'سبانش لاتيه', 
        description: 'قهوة باردة منعشة مع حليب مكثف', 
        ingredients: 'إسبريسو، حليب طازج، حليب مكثف محلى' 
    };

    // تعريف الأسعار لكل حجم
    const prices = { S: 8, M: 10, L: 12 };
    
    const [size, setSize] = useState('M'); // الحجم الافتراضي M بسعر 10
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // حساب السعر النهائي بناءً على الحجم والكمية
    const totalPrice = prices[size] * quantity;

    const handleAddToCart = () => {
        addToCart({ 
            ...product, 
            size, 
            quantity, 
            price: prices[size] // نرسل السعر الخاص بالحجم المختار للسلة
        });
        alert(`تم إضافة ${product.name} (حجم ${size}) للسلة!`);
        navigate(-1);
    };

    return (
        <div className="product-details-container">
            <button className="back-btn" onClick={() => navigate(-1)}>← العودة للمنيو</button>
            
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p><strong>المكونات:</strong> {product.ingredients}</p>

            <div className="selection-area">
                <label>اختر الحجم:</label>
                <select value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="S">صغير (S) - 8 شيكل</option>
                    <option value="M">وسط (M) - 10 شيكل</option>
                    <option value="L">كبير (L) - 12 شيكل</option>
                </select>
            </div>

            <div className="quantity-area">
                <label>الكمية:</label>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>

            <div className="total-price">
                <h3>السعر الإجمالي: {totalPrice} شيكل</h3>
            </div>

            <button className="add-to-cart-btn" onClick={handleAddToCart}>
                أضف إلى السلة
            </button>
        </div>
    );
};

export default ProductDetails;