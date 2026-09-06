import React, { useEffect, useMemo, useState } from 'react';
import {
  FaChartBar,
  FaCheckCircle,
  FaClipboardList,
  FaCoffee,
  FaDownload,
  FaRedo,
  FaStar,
  FaStore,
  FaTimesCircle,
} from 'react-icons/fa';
import './AdminPages.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://localhost:5001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ── قيم افتراضية فارغة ── */
const EMPTY_SUMMARY = {
  totalSales:             0,
  totalOrders:            0,
  averageRating:          0,
  resolvedComplaintsRate: 0,
  monthlyOrders:          [],
  months:                 [],
  topCafes:               [],
};

function AdminReports() {
  const [summary,      setSummary]      = useState(EMPTY_SUMMARY);
  const [cafes,        setCafes]        = useState([]);       // /api/Cafes
  const [complaints,   setComplaints]   = useState([]);       // /api/Complaints
  const [orderStats,   setOrderStats]   = useState(null);     // /api/Orders/dashboard-stats
  const [loading,      setLoading]      = useState(true);
  const [errors,       setErrors]       = useState([]);

  /* ══ جلب جميع البيانات بالتوازي ══ */
  const fetchAll = async () => {
    setLoading(true);
    setErrors([]);
    const newErrors = [];

    /* helper — يُرجع البيانات أو null مع تسجيل الخطأ */
    const safeFetch = async (url, label) => {
      try {
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`${label}: خطأ ${res.status}`);
        return await res.json();
      } catch (err) {
        newErrors.push(err.name === 'TypeError'
          ? `${label}: تعذّر الاتصال بالسيرفر`
          : err.message);
        return null;
      }
    };

    const [summaryData, cafesData, complaintsData, orderData] = await Promise.all([
      safeFetch(`${API_BASE}/Reports/admin-summary`,    'ملخص التقارير'),
      safeFetch(`${API_BASE}/Cafes`,                    'قائمة الكافيهات'),
      safeFetch(`${API_BASE}/Complaints`,               'الشكاوى'),
      safeFetch(`${API_BASE}/Orders/dashboard-stats`,   'إحصائيات الطلبات'),
    ]);

    /* ── معالجة ملخص التقارير ── */
    if (summaryData) {
      setSummary({
        totalSales:             summaryData.totalSales             ?? 0,
        totalOrders:            summaryData.totalOrders            ?? 0,
        averageRating:          summaryData.averageRating          ?? 0,
        resolvedComplaintsRate: summaryData.resolvedComplaintsRate ?? 0,
        monthlyOrders:          summaryData.monthlyOrders          ?? [],
        months:                 summaryData.months                 ?? [],
        topCafes:               summaryData.topCafes               ?? [],
      });
    }

    /* ── معالجة الكافيهات ── */
    if (cafesData) {
      const list = Array.isArray(cafesData) ? cafesData : cafesData.data ?? cafesData.items ?? [];
      setCafes(list);
    }

    /* ── معالجة الشكاوى لحساب معدل الحل ── */
    if (complaintsData) {
      const list = Array.isArray(complaintsData) ? complaintsData : complaintsData.data ?? [];
      setComplaints(list);
    }

    /* ── إحصائيات الطلبات ── */
    if (orderData) setOrderStats(orderData);

    setErrors(newErrors);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  /* ══ حسابات مشتقة ══ */

  /* معدل حل الشكاوى المحسوب من البيانات الحقيقية */
  const resolvedRate = useMemo(() => {
    if (complaints.length === 0) return summary.resolvedComplaintsRate;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    return Math.round((resolved / complaints.length) * 100);
  }, [complaints, summary.resolvedComplaintsRate]);

  /* إجمالي الطلبات — من orderStats إن وُجد، وإلا من summary */
  const totalOrders = orderData => {
    if (orderStats) return orderStats.totalOrders ?? orderStats.total ?? summary.totalOrders;
    return summary.totalOrders;
  };

  /* إجمالي المبيعات */
  const totalSales = useMemo(() => {
    if (orderStats?.totalRevenue != null) return orderStats.totalRevenue;
    if (orderStats?.totalSales   != null) return orderStats.totalSales;
    return summary.totalSales;
  }, [orderStats, summary.totalSales]);

  /* الكافيهات مع بياناتها — تجمع قائمة /api/Cafes مع topCafes من التقرير */
  const enrichedCafes = useMemo(() => {
    if (summary.topCafes.length > 0) return summary.topCafes;
    // إذا لم يرجع التقرير topCafes نعرض الكافيهات المسجلة
    return cafes.map((c) => ({
      cafeName: c.name ?? c.cafeName ?? 'كافيه',
      orders:   c.totalOrders ?? 0,
      sales:    c.totalSales  ?? 0,
      rating:   c.rating      ?? 0,
    }));
  }, [summary.topCafes, cafes]);

  const maxOrders = useMemo(
    () => Math.max(...(summary.monthlyOrders.length ? summary.monthlyOrders : [1]), 1),
    [summary.monthlyOrders]
  );

  const topSales = useMemo(
    () => Math.max(...(enrichedCafes.length ? enrichedCafes.map((c) => c.sales ?? 0) : [1]), 1),
    [enrichedCafes]
  );

  /* ── تصدير CSV ── */
  const exportCsv = () => {
    const rows = [
      ['اسم الكافيه', 'عدد الطلبات', 'المبيعات (₪)', 'التقييم'],
      ...enrichedCafes.map((c) => [c.cafeName, c.orders, c.sales, c.rating]),
    ];
    const csv  = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `تقرير_النظام_${new Date().toLocaleDateString('ar')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ══════════════════════════════════════════════ */
  return (
    <div className="admin-page" dir="rtl">

      {/* ─── الهيدر ─── */}
      <div className="admin-page-header">
        <div>
          <span className="admin-kicker"><FaChartBar /> لوحة التقارير الذكية</span>
          <h1>التحليلات والمبيعات العامة</h1>
          <p>راقب أداء الكافيهات المشتركة وحجم الإيرادات وتدفق الطلبات بشكل فوري.</p>
        </div>
        <div className="admin-actions">
          <button className="admin-light-btn" onClick={fetchAll} disabled={loading}>
            <FaRedo className={loading ? 'spin-icon' : ''} />
            {loading ? 'جاري التحديث...' : 'تحديث'}
          </button>
          <button className="admin-dark-btn" onClick={exportCsv} disabled={loading || enrichedCafes.length === 0}>
            <FaDownload /> تحميل CSV
          </button>
        </div>
      </div>

      {/* ─── رسائل الأخطاء ─── */}
      {errors.length > 0 && (
        <div className="admin-alert">
          <FaTimesCircle />
          <div>
            <strong>بعض البيانات لم تُحمَّل بنجاح:</strong>
            <ul style={{ margin: '6px 0 0', paddingRight: 18, fontSize: 13 }}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* ─── الإحصائيات ─── */}
      <div className="admin-stats-grid">
        <div className="admin-stat green BoxCard">
          <FaChartBar />
          <span>إجمالي مبيعات المنصة</span>
          <strong>{Number(totalSales).toLocaleString('en-US')} ₪</strong>
        </div>
        <div className="admin-stat blue BoxCard">
          <FaClipboardList />
          <span>الطلبات المكتملة</span>
          <strong>
            {Number(
              orderStats?.totalOrders ?? orderStats?.total ?? summary.totalOrders
            ).toLocaleString('en-US')}
          </strong>
        </div>
        <div className="admin-stat amber BoxCard">
          <FaStar />
          <span>رضا العملاء</span>
          <strong>{Number(summary.averageRating).toFixed(1)} / 5</strong>
        </div>
        <div className="admin-stat green BoxCard">
          <FaCheckCircle />
          <span>معدل حل الشكاوى</span>
          <strong>{resolvedRate}%</strong>
        </div>
      </div>

      {/* ─── الشارت + الكافيهات ─── */}
      <div className="reports-grid">

        {/* الشارت البياني للطلبات الشهرية */}
        <section className="admin-panel BoxCard">
          <div className="panel-title">
            <h2>نمو حركة الطلبات الشهرية</h2>
            <span className="badge-trend">مباشر</span>
          </div>
          <div className="orders-chart">
            {loading ? (
              <p className="admin-empty" style={{ width: '100%' }}>جاري تحميل البيانات...</p>
            ) : summary.monthlyOrders.length === 0 ? (
              <p className="admin-empty" style={{ width: '100%' }}>لا توجد بيانات شهرية مسجلة بعد.</p>
            ) : (
              summary.monthlyOrders.map((value, index) => (
                <div className="chart-column" key={index}>
                  <div className="chart-value-tooltip">{value}</div>
                  <div
                    className="chart-bar"
                    style={{ height: `${Math.max((value / maxOrders) * 180, 4)}px` }}
                  />
                  <small className="chart-label">
                    {summary.months[index] ?? `شهر ${index + 1}`}
                  </small>
                </div>
              ))
            )}
          </div>
        </section>

        {/* قائمة الكافيهات */}
        <section className="admin-panel BoxCard">
          <div className="panel-title">
            <h2>الكافيهات المسجلة في النظام</h2>
            <span>
              <FaStore /> {cafes.length > 0 ? `${cafes.length} كافيه` : ''}
            </span>
          </div>

          <div className="top-cafes-list">
            {loading ? (
              <p className="admin-empty">جاري التحميل...</p>
            ) : enrichedCafes.length === 0 ? (
              <p className="admin-empty">لا توجد كافيهات مسجلة في النظام حالياً.</p>
            ) : (
              enrichedCafes.map((cafe, index) => (
                <div className="top-cafe" key={index}>
                  <div className="top-cafe-row">
                    <strong>{index + 1}. {cafe.cafeName}</strong>
                    <span>
                      {cafe.sales > 0
                        ? `${Number(cafe.sales).toLocaleString('en-US')} ₪`
                        : '—'}
                    </span>
                  </div>
                  {/* شريط التقدم — يظهر فقط لو في مبيعات */}
                  {topSales > 1 && (
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.max((cafe.sales / topSales) * 100, 3)}%` }}
                      />
                    </div>
                  )}
                  <div className="top-cafe-meta">
                    <span>{cafe.orders > 0 ? `${cafe.orders} طلب` : 'لا توجد طلبات بعد'}</span>
                    {cafe.rating > 0 && (
                      <span><FaStar className="star-icon" /> {cafe.rating}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminReports;