import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cafeId,    setCafeId]    = useState(null);

    // ─── إضافة منتج للسلة ────────────────────────────────────────────────────
    const addToCart = (product) => {
        if (product.cafeID || product.cafeId) {
            setCafeId(product.cafeID || product.cafeId);
        }
        setCartItems(prevItems => {
            const productId   = product.productId || product.id;
            const productSize = product.size || 'M';
            const chosenQty   = product.quantity || 1;

            const isExist = prevItems.find(item =>
                (item.productId === productId || item.id === productId) &&
                item.size === productSize
            );

            if (isExist) {
                return prevItems.map(item =>
                    ((item.productId === productId || item.id === productId) && item.size === productSize)
                        ? { ...item, quantity: item.quantity + chosenQty }
                        : item
                );
            }

            return [...prevItems, { ...product, productId, size: productSize, quantity: chosenQty }];
        });
    };

    // ─── تعديل الكمية بدون تغيير الترتيب ✅ ──────────────────────────────────
    const updateQuantity = (productId, size, newQty) => {
        setCartItems(prev => prev.map(item => {
            const itemId = item.productId || item.id;
            if (itemId === productId && item.size === size) {
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    // ─── حذف منتج ────────────────────────────────────────────────────────────
    const removeFromCart = (id, size) => {
        setCartItems(prev => prev.filter(item => {
            const itemId = item.productId || item.id;
            if (size) return !(itemId === id && item.size === size);
            return itemId !== id;
        }));
    };

    // ─── مسح السلة ───────────────────────────────────────────────────────────
    const clearCart = () => {
        setCartItems([]);
        setCafeId(null);
    };

    return (
        <CartContext.Provider value={{ cartItems, cafeId, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);