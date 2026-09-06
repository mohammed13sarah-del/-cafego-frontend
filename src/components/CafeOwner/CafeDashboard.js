import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import './CafeDashboard.css';

import { 
    FaRedo, 
    FaBox, 
    FaClock, 
    FaHourglassHalf, 
    FaUtensils, 
    FaCoins, 
    FaExclamationTriangle, 
    FaCoffee, 
    FaInbox, 
    FaMotorcycle, 
    FaCheck 
} from 'react-icons/fa';

// ─── StatCard (قابل للضغط) ───────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, active, onClick }) => (
    <div
        className={`stat-card stat-card--${color}${active ? ' stat-card--active' : ''}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
        <div className="stat-card__icon">{icon}</div>
        <div className="stat-card__body">
            <span className="stat-card__value">{value ?? '—'}</span>
            <span className="stat-card__label">{label}</span>
            {sub && <span className="stat-card__sub">{sub}</span>}
        </div>
    </div>
);

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        Pending:        { ar: 'قيد الانتظار', cls: 'badge--pending' },
        Approved:       { ar: 'مقبول',        cls: 'badge--approved' },
        Rejected:       { ar: 'مرفوض',        cls: 'badge--rejected' },
        'جاري التوصيل': { ar: 'جاري التوصيل', cls: 'badge--delivering' },
        Delivered:      { ar: 'تم التوصيل',   cls: 'badge--done' },
        Completed:      { ar: 'مكتمل',        cls: 'badge--done' },
    };
    const info = map[status] || { ar: status, cls: 'badge--pending' };
    return <span className={`badge ${info.cls}`}>{info.ar}</span>;
};

// ─── CafeDashboard ───────────────────────────────────────────────────────────
const CafeDashboard = () => {
    const { user } = useAuth();
    const cafeId = user?.cafeID;

    const [cafe, setCafe]             = useState(null);
    const [orders, setOrders]         = useState([]);
    const [products, setProducts]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    // ── الفلتر النشط: 'all' | 'today' | 'pending' | 'products' | 'revenue' ──
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchAll = async () => {
        if (!cafeId) {
            setLoading(false);
            setError('لم يتم التعرف على معرّف الكافيه — يرجى إعادة تسجيل الدخول.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const [cafeRes, ordersRes, productsRes] = await Promise.all([
                api.get(`/Cafes/${cafeId}`),
                api.get(`/Orders/all-orders`),
                api.get(`/Products/ByCafe/${cafeId}`),
            ]);
            setCafe(cafeRes.data);
            const cafeOrders = (ordersRes.data || []).filter(
                o => o.cafeID === Number(cafeId) || o.CafeID === Number(cafeId)
            );
            setOrders(cafeOrders);
            setProducts(productsRes.data || []);
        } catch (err) {
            setError('تعذّر تحميل البيانات — تحقق من الـ API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, [cafeId]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId);
            await api.put(`/Orders/update-status/${orderId}`, JSON.stringify(newStatus), {
                headers: { 'Content-Type': 'application/json' }
            });
            setOrders(prev =>
                prev.map(o =>
                    (o.orderID ?? o.OrderID) === orderId
                        ? { ...o, status: newStatus, Status: newStatus }
                        : o
                )
            );
        } catch {
            alert('فشل تحديث الحالة');
        } finally {
            setUpdatingId(null);
        }
    };

    // ─── إحصائيات ─────────────────────────────────────────────────────────────
    const todayStr    = new Date().toDateString();
    const todayOrders = orders.filter(o => {
        const d = o.orderDate ?? o.OrderDate;
        return d && new Date(d).toDateString() === todayStr;
    });
    const totalRevenue = orders
        .filter(o => ['Completed', 'Delivered'].includes(o.status ?? o.Status))
        .reduce((sum, o) => sum + (o.totalAmount ?? o.TotalAmount ?? 0), 0);
    const pendingCount = orders.filter(o => (o.status ?? o.Status) === 'Pending').length;

    // ─── فلترة الجدول حسب الكارت المضغوط ────────────────────────────────────
    const filteredOrders = (() => {
        if (activeFilter === 'today')   return todayOrders;
        if (activeFilter === 'pending') return orders.filter(o => (o.status ?? o.Status) === 'Pending');
        if (activeFilter === 'revenue') return orders.filter(o => ['Completed', 'Delivered'].includes(o.status ?? o.Status));
        return orders; // 'all' أو 'products'
    })();

    const handleCardClick = (filter) => {
        // لو ضغط على نفس الفلتر — يرجع للكل
        setActiveFilter(prev => prev === filter ? 'all' : filter);
    };

    if (loading) return (
        <div className="dash-loader">
            <div className="dash-loader__spinner" />
            <p>جاري تحميل لوحة التحكم...</p>
        </div>
    );

    if (error) return (
        <div className="dash-error">
            <span><FaExclamationTriangle /></span>
            <p>{error}</p>
            <button onClick={fetchAll}>إعادة المحاولة</button>
        </div>
    );

    return (
        <div className="dashboard" dir="rtl">

            {/* ── Header ── */}
            <header className="dash-header">
                <div className="dash-header__text">
                    <h1>مرحباً، {cafe?.name ?? cafe?.Name ?? 'مالك الكافيه'} <FaCoffee style={{ marginRight: '8px' }} /></h1>
                    <p>{new Date().toLocaleDateString('ar-EG', {
                        weekday: 'long', year: 'numeric',
                        month: 'long', day: 'numeric',
                    })}</p>
                </div>
                <button className="refresh-btn" onClick={fetchAll} title="تحديث"><FaRedo /></button>
            </header>

            {/* ── إحصائيات (كل كارت قابل للضغط) ── */}
            <section className="stats-grid">
                <StatCard
                    icon={<FaBox />} label="إجمالي الطلبات" value={orders.length} color="blue"
                    active={activeFilter === 'all'}
                    onClick={() => handleCardClick('all')}
                />
                <StatCard
                    icon={<FaClock />} label="طلبات اليوم" value={todayOrders.length} color="orange"
                    active={activeFilter === 'today'}
                    onClick={() => handleCardClick('today')}
                />
                <StatCard
                    icon={<FaHourglassHalf />} label="طلبات معلّقة" value={pendingCount} color="yellow" sub="تحتاج موافقة"
                    active={activeFilter === 'pending'}
                    onClick={() => handleCardClick('pending')}
                />
                <StatCard
                    icon={<FaUtensils />} label="المنتجات" value={products.length} color="green"
                    active={activeFilter === 'products'}
                    onClick={() => handleCardClick('products')}
                />
                <StatCard
                    icon={<FaCoins />} label="إجمالي المبيعات" value={`${totalRevenue.toFixed(2)} ₪`} color="purple"
                    active={activeFilter === 'revenue'}
                    onClick={() => handleCardClick('revenue')}
                />
            </section>

            {/* ── جدول الطلبات ── */}
            <section className="orders-section">
                <div className="section-header">
                    <h2>
                        {activeFilter === 'all'      && 'الطلبات الواردة'}
                        {activeFilter === 'today'    && 'طلبات اليوم'}
                        {activeFilter === 'pending'  && 'الطلبات المعلّقة'}
                        {activeFilter === 'products' && 'الطلبات الواردة'}
                        {activeFilter === 'revenue'  && 'الطلبات المكتملة'}
                    </h2>
                    <span className="orders-count">{filteredOrders.length} طلب</span>
                </div>

                {activeFilter === 'products' ? (
                    <div className="empty-orders">
                        <p><FaUtensils style={{ marginLeft: '8px' }} /> عدد المنتجات: {products.length}</p>
                        <p style={{ fontSize: 13, marginTop: 8, color: '#a0785a' }}>لإدارة المنتجات اذهب لصفحة إدارة المنيو</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <p><FaInbox style={{ marginLeft: '8px' }} /> لا توجد طلبات في هذه الفئة</p>
                    </div>
                ) : (
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ</th>
                                    <th>نوع التوصيل</th>
                                    <th>الحالة</th>
                                    <th>إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => {
                                    const oId      = order.orderID    ?? order.OrderID;
                                    const status   = order.status     ?? order.Status;
                                    const amount   = order.totalAmount ?? order.TotalAmount ?? 0;
                                    const date     = order.orderDate  ?? order.OrderDate;
                                    const delType  = order.deliveryType ?? order.DeliveryType ?? '—';
                                    const isUpdating = updatingId === oId;

                                    return (
                                        <tr key={oId} className={isUpdating ? 'row--updating' : ''}>
                                            <td className="order-id">#{oId}</td>
                                            <td>{date ? new Date(date).toLocaleDateString('ar-EG') : '—'}</td>
                                            <td className="amount">{amount.toFixed(2)} ₪</td>
                                            <td>{delType}</td>
                                            <td><StatusBadge status={status} /></td>
                                            <td className="actions-cell">
                                                {status === 'Pending' && (
                                                    <button
                                                        className="action-btn action-btn--approve"
                                                        disabled={isUpdating}
                                                        onClick={() => handleStatusChange(oId, 'Approved')}
                                                    >
                                                        {isUpdating ? '...' : <><FaCheck style={{ marginLeft: '4px' }} /> قبول</>}
                                                    </button>
                                                )}
                                                {status === 'Approved' && (
                                                    <button
                                                        className="action-btn action-btn--deliver"
                                                        disabled={isUpdating}
                                                        onClick={() => handleStatusChange(oId, 'جاري التوصيل')}
                                                    >
                                                        {isUpdating ? '...' : <><FaMotorcycle style={{ marginLeft: '4px' }} /> إرسال</>}
                                                    </button>
                                                )}
                                                {status === 'جاري التوصيل' && (
                                                    <button
                                                        className="action-btn action-btn--approve"
                                                        disabled={isUpdating}
                                                        onClick={() => handleStatusChange(oId, 'Delivered')}
                                                    >
                                                        {isUpdating ? '...' : <><FaCheck style={{ marginLeft: '4px' }} /> تم التسليم</>}
                                                    </button>
                                                )}
                                                {['Completed', 'Delivered', 'Rejected'].includes(status) && (
                                                    <span className="action-done">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CafeDashboard;