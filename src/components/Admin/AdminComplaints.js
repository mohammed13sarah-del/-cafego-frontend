import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  FaBullhorn, FaCheckCircle, FaClock, FaEnvelope,
  FaExclamationTriangle, FaFilter, FaSearch, FaSync, FaReply, FaEye, FaTrash
} from 'react-icons/fa';
import './AdminPages.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://localhost:7203/api';

const STATUS_LABELS = {
  pending:      'قيد الانتظار',
  under_review: 'قيد المراجعة',
  resolved:     'تم الحل',
};

const PRIORITY_LABELS = {
  High:   'عالية',
  Medium: 'متوسطة',
  Low:    'منخفضة',
};

const normalizeComplaint = (item) => ({
  id:           item.id ?? item.complaintID ?? item.complaintId,
  customerName: item.customerName ?? 'مستخدم غير معروف',
  cafeName:     item.cafeName      ?? 'غير محدد',
  subject:      item.subject       ?? 'شكوى بدون عنوان',
  description:  item.description  ?? '',
  status:       item.status        ?? 'pending',
  priority:     item.priority     ?? 'Medium',
  orderId:      item.orderId      ?? null, 
  adminResponse:item.adminResponse ?? null,
  createdAt:    item.createdAt    ?? new Date().toISOString(),
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

function AdminComplaints() {
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'complaints') {
        const res = await fetch(`${API_BASE}/Complaints`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`خطأ في جلب الشكاوى (${res.status})`);
        const data = await res.json();
        setComplaints(data.map(normalizeComplaint));
      } else {
        const res = await fetch(`${API_BASE}/Contact/all`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`خطأ في جلب الرسائل (${res.status})`);
        const data = await res.json();
        setContactMessages(data);
      }
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'تعذّر تحميل البيانات',
        text: err.message,
        confirmButtonColor: '#1f130f',
        confirmButtonText: 'حسناً',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const updateComplaintStatus = async (complaintId, nextStatus) => {
    const label = STATUS_LABELS[nextStatus] ?? nextStatus;
    const previous = complaints;

    setComplaints(items =>
      items.map(item => item.id === complaintId ? { ...item, status: nextStatus } : item)
    );

    try {
      const res = await fetch(`${API_BASE}/Complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(`فشل التحديث (${res.status})`);

      Swal.fire({
        icon: 'success',
        title: 'تم تحديث الحالة',
        text: `تم تغيير الحالة إلى "${label}" بنجاح.`,
        timer: 1500, showConfirmButton: false,
      });
    } catch (err) {
      setComplaints(previous);
      Swal.fire({ icon: 'error', title: 'خطأ', text: err.message, confirmButtonColor: '#1f130f' });
    }
  };

  const handleAdminResponse = async (complaintId) => {
    const { value: text } = await Swal.fire({
      title: 'كتابة رد الإدارة الموثوق',
      input: 'textarea',
      inputPlaceholder: 'اكتب تفاصيل الرد هنا... سيتم إرساله بريدياً للمستخدم وإغلاق الشكوى فوراً.',
      showCancelButton: true,
      confirmButtonColor: '#1f130f',
      cancelButtonColor: '#d33',
      confirmButtonText: 'إرسال الرد وإغلاق التذكرة',
      cancelButtonText: 'إلغاء',
      customClass: { popup: 'cairo-font' }
    });

    if (!text) return;

    try {
      const res = await fetch(`${API_BASE}/Complaints/${complaintId}/admin-response`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ response: text }),
      });
      if (!res.ok) throw new Error('فشل إرسال الرد للسيرفر');

      Swal.fire({
        icon: 'success',
        title: 'تم الرد والحل!',
        text: 'تم إرسال الرد للمستخدم وإغلاق الشكوى تلقائياً.',
        timer: 2000, showConfirmButton: false,
      });
      fetchData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: err.message, confirmButtonColor: '#1f130f' });
    }
  };

  const viewOrderDetailsDetails = async (orderId) => {
    if (!orderId) return;
    try {
      const res = await fetch(`${API_BASE}/Orders/all-orders`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      const orders = await res.json();
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        Swal.fire({ icon: 'warning', title: 'تنبيه', text: 'لم يتم العثور على بيانات هذا الطلب.', confirmButtonColor: '#1f130f' });
        return;
      }

      Swal.fire({
        title: `تفاصيل الطلب المرتبط #${orderId}`,
        html: `
          <div style="text-align: right; font-family: 'Cairo', sans-serif; line-height: 2;">
            <p>⏳ <b>تاريخ ووقت الطلب:</b> ${new Date(order.createdAt || order.orderDate).toLocaleString('ar-EG')}</p>
            <p>📦 <b>الحالة العامة للطلب:</b> <span style="color:#1565c0; font-weight:bold;">${order.status || 'غير محدد'}</span></p>
            <p>💰 <b>القيمة الإجمالية للطلب:</b> <span style="color:#15803d; font-weight:bold;">${order.totalAmount || order.total || 0} شيكل</span></p>
            <hr style="border: 0; border-top: 1px dashed #ccc; margin: 10px 0;"/>
            <p style="font-size: 11px; color: #777; text-align: center;">🛡️ تم حجب السلة والمشتريات التفصيلية حمايةً لخصوصية العميل.</p>
          </div>
        `,
        confirmButtonColor: '#1f130f',
        confirmButtonText: 'مفهوم'
      });
    } catch {
      Swal.fire({ icon: 'error', title: 'خطأ', text: 'تعذّر جلب تفاصيل الطلب، تأكد من سيرفر الطلبات.', confirmButtonColor: '#1f130f' });
    }
  };

  const handleDeleteContact = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم حذف رسالة التواصل هذه نهائياً من النظام!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/Contact/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      Swal.fire('تم الحذف!', 'تم إزالة الرسالة بنجاح.', 'success');
      fetchData();
    } catch {
      Swal.fire('خطأ', 'فشل حذف الرسالة', 'error');
    }
  };

  const filteredComplaints = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return complaints.filter(c => {
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      const haystack = `${c.customerName} ${c.cafeName} ${c.subject} ${c.description} ${c.id} ${c.orderId}`.toLowerCase();
      return matchStatus && (!kw || haystack.includes(kw));
    });
  }, [complaints, search, statusFilter]);

  const counts = useMemo(() => ({
    all:      complaints.length,
    pending:  complaints.filter(c => c.status === 'pending').length,
    review:   complaints.filter(c => c.status === 'under_review').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }), [complaints]);

  return (
    <div className="admin-page" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        .swal2-popup, .cairo-font { font-family: 'Cairo', sans-serif !important; direction: rtl !important; }
        .swal2-title, .swal2-html-container { text-align: right !important; }
        .admin-tabs { display: flex; gap: 10px; margin-bottom: 24px; border-bottom: 2px solid #f5ede8; padding-bottom: 10px; }
        .tab-btn { padding: 10px 20px; font-family: 'Cairo'; font-weight: 700; border: none; background: #fbfaf8; color: #5d4037; border: 1px solid #e5e0da; cursor: pointer; border-radius: 8px; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
        .tab-btn.active { background: #3e2723; color: #fff; border-color: #3e2723; }
        .order-link-btn { background: #e0f2fe; color: #0369a1; border: none; padding: 4px 8px; font-family: 'Cairo'; font-size: 12px; font-weight: bold; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
        .order-link-btn:hover { background: #bae6fd; }
        .action-layout { display: flex; flex-direction: column; gap: 6px; }
        .respond-btn { background: #3e2723; color: #fff; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-family: 'Cairo'; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 4px; transition: 0.2s; }
        .respond-btn:hover { background: #5d4037; }
        
        /* تنسيق مخصص وهادئ لقائمة التغيير المنسدلة داخل الجدول */
        .custom-row-select {
          padding: 6px 30px 6px 12px;
          border-radius: 8px;
          border: 1px solid #d7ccc8;
          background-color: #fcfcfc;
          color: #5d4037;
          font-family: 'Cairo', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238d6e63%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 10px top 50%;
          background-size: 10px auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          transition: all 0.2s;
        }
        .custom-row-select:focus { border-color: #c8a882; }
      `}</style>

      {/* ─── الهيدر المطور (تحديث مسمى وعملي لزر التحديث) ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: '#3e2723', fontWeight: 800 }}>الشكاوى والدعم الفني</h1>
          <p style={{ margin: '4px 0 0 0', color: '#8d6e63', fontSize: 14 }}>مراقبة وحل النزاعات البرمجية والتشغيلية المربوطة بحسابات المستخدمين.</p>
        </div>
        <button onClick={fetchData} disabled={loading} style={{
          background: '#fbfaf8', color: '#5d4037', border: '1px solid #e5e0da',
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
          display: 'flex', align0Items: 'center', gap: 8, fontSize: 14, fontWeight: 700,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s'
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = '#f5f0eb')}
        onMouseLeave={e => !loading && (e.currentTarget.style.background = '#fbfaf8')}>
          <FaSync size={13} className={loading ? 'spin-icon' : ''} /> {loading ? 'جاري...' : 'تحديث'}
        </button>
      </div>

      {/* ─── نظام التبويبات (Tabs) ─── */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => { setActiveTab('complaints'); setSearch(''); }}>
          <FaBullhorn /> الشكاوى والبلاغات ({counts.all})
        </button>
        <button className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => { setActiveTab('contact'); setSearch(''); }}>
          <FaEnvelope /> رسائل اتصل بنا ({contactMessages.length})
        </button>
      </div>

      {activeTab === 'complaints' ? (
        <>
          {/* ─── الكروت الإحصائية التفاعلية (Clickable Filter Cards) ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'إجمالي البلاغات', count: counts.all, icon: <FaBullhorn size={20} color="#8d6e63" />, bg: '#f5f0eb', filterValue: 'All' },
              { label: 'قيد الانتظار', count: counts.pending, icon: <FaExclamationTriangle size={20} color="#d84315" />, bg: '#fbe9e7', filterValue: 'pending' },
              { label: 'قيد المراجعة', count: counts.review, icon: <FaClock size={20} color="#1565c0" />, bg: '#e3f2fd', filterValue: 'under_review' },
              { label: 'تم حلها', count: counts.resolved, icon: <FaCheckCircle size={20} color="#2e7d32" />, bg: '#e8f5e9', filterValue: 'resolved' },
            ].map((card, idx) => (
              <div key={idx} 
                onClick={() => {
                  setActiveTab('complaints');
                  setStatusFilter(card.filterValue); // عند الضغط يغير الفلترة فوراً
                }}
                style={{
                  background: '#fff', padding: 20, borderRadius: 12,
                  boxShadow: statusFilter === card.filterValue ? '0 4px 12px rgba(200,168,130,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                  border: statusFilter === card.filterValue ? '2px solid #c8a882' : '1px solid #e5e0da',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div>
                  <div style={{ color: '#8d6e63', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#3e2723' }}>{card.count}</div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* ─── التولبار ─── */}
          <div className="admin-toolbar">
            <div className="admin-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث برقم التذكرة، العميل، الكافيه، أو رقم الطلب..."
              />
            </div>
            <div className="admin-filter-wrapper">
              <FaFilter />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">كل الشكاوى</option>
                <option value="pending">قيد الانتظار</option>
                <option value="under_review">قيد المراجعة</option>
                <option value="resolved">تم الحل</option>
              </select>
            </div>
          </div>

          {/* ─── جدول الشكاوى ─── */}
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>رقم الشكوى</th>
                  <th>المشتكي / الكافيه</th>
                  <th>الطلب المرتبط</th>
                  <th>تفاصيل البلاغ</th>
                  <th>الأولوية</th>
                  <th>الحالة</th>
                  <th>إجراءات الإدارة العليا</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="admin-empty">جاري الاتصال بالسيرفر وجلب البيانات...</td></tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr><td colSpan="7" className="admin-empty">لا توجد شكاوى تندرج تحت هذا الفلتر حالياً.</td></tr>
                ) : (
                  filteredComplaints.map(c => (
                    <tr key={c.id}>
                      <td className="admin-id">#{c.id}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{c.customerName}</div>
                        <span className="cafe-tag">{c.cafeName}</span>
                      </td>
                      <td>
                        {c.orderId ? (
                          <button className="order-link-btn" onClick={() => viewOrderDetailsDetails(c.orderId)}>
                            <FaEye /> #{c.orderId}
                          </button>
                        ) : (
                          <span style={{ color: '#999', fontSize: 12 }}>لا يوجد طلب</span>
                        )}
                      </td>
                      <td className="complaint-details-cell">
                        <strong>{c.subject}</strong>
                        <p>{c.description}</p>
                        {c.adminResponse && (
                          <div style={{ marginTop: 6, padding: '4px 8px', background: '#f0fdf4', borderRight: '3px solid #16a34a', borderRadius: 4, fontSize: 12 }}>
                            <b>ردك:</b> {c.adminResponse}
                          </div>
                        )}
                        <time style={{ display: 'block', marginTop: 4 }}>{new Date(c.createdAt).toLocaleString('ar-EG')}</time>
                      </td>
                      <td>
                        <span className={`priority-badge ${c.priority}`}>
                          {PRIORITY_LABELS[c.priority] ?? c.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${c.status}`}>
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-layout">
                          <select
                            className="custom-row-select"
                            value={c.status}
                            disabled={c.status === 'resolved'}
                            onChange={e => updateComplaintStatus(c.id, e.target.value)}
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="under_review">قيد المراجعة</option>
                            <option value="resolved">تم الحل</option>
                          </select>
                          
                          {c.status !== 'resolved' && (
                            <button className="respond-btn" onClick={() => handleAdminResponse(c.id)}>
                              <FaReply /> رد وحل تلقائي
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ─── قسم رسائل اتصل بنا ─── */
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الموضوع</th>
                <th>نص الرسالة</th>
                <th>تاريخ الإرسال</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="admin-empty">جاري تحميل رسائل تواصل...</td></tr>
              ) : contactMessages.length === 0 ? (
                <tr><td colSpan="5" className="admin-empty">لا يوجد أي رسائل واردة من صفحة اتصل بنا حالياً.</td></tr>
              ) : (
                contactMessages.map(msg => (
                  <tr key={msg.id}>
                    <td style={{ fontWeight: 700 }}>{msg.name}</td>
                    <td style={{ color: '#1f130f', fontWeight: 600 }}>{msg.subject}</td>
                    <td><p style={{ margin: 0, whiteSpace: 'pre-line', fontSize: 13 }}>{msg.message}</p></td>
                    <td><time>{new Date(msg.sentAt || new Date()).toLocaleString('ar-EG')}</time></td>
                    <td>
                      <button className="admin-row-btn" style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }} onClick={() => handleDeleteContact(msg.id)}>
                        <FaTrash /> حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminComplaints;