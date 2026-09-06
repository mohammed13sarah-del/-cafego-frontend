import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  FaUsers, FaStore, FaBell, FaSync,
  FaDownload, FaCoffee, FaCheckCircle,
} from 'react-icons/fa';
import api from '../../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MOCK_LABELS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'];
const MOCK_GROWTH = [5, 9, 4, 12, 7, 11, 14];
const MOCK_USERS  = 348;

/* ════════════════════════════════
   بطاقة إحصائية
════════════════════════════════ */
const StatCard = ({ icon, label, value, iconBg, iconColor, sub, subColor }) => (
  <div style={{ background: '#f9f6f3', borderRadius: 14, padding: '18px 20px' }}>
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: iconBg, color: iconColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 17, marginBottom: 12,
    }}>
      {icon}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
      {value ?? '—'}
    </div>
    <div style={{ fontSize: 13, color: '#888', marginTop: 5 }}>{label}</div>
    {sub && (
      <div style={{ fontSize: 11, fontWeight: 600, color: subColor, marginTop: 3 }}>{sub}</div>
    )}
  </div>
);

/* ════════════════════════════════
   صف اشتراك كافيه
════════════════════════════════ */
const SubRow = ({ sub }) => {
  const isActive = sub.status === 'Active';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '10px 0',
      borderBottom: '1px solid #f5f0eb',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: isActive ? '#E1F5EE' : '#F5F5F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FaStore size={14} color={isActive ? '#0F6E56' : '#aaa'} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{sub.name}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
            ينتهي: {new Date(sub.endDate).toLocaleDateString('ar-PS')}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F6E56' }}>150 ₪ / شهر</span>
        <span style={{
          fontSize: 10, fontWeight: 600,
          padding: '2px 8px', borderRadius: 20,
          background: isActive ? '#E1F5EE' : '#F5F5F5',
          color: isActive ? '#0F6E56' : '#aaa',
        }}>
          {isActive ? 'نشط' : 'منتهي'}
        </span>
      </div>
    </div>
  );
};

/* ════════════════════════════════
   الصفحة الرئيسية
════════════════════════════════ */
const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [cafes,   setCafes]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, cafesRes] = await Promise.all([
        api.get('/Admin/dashboard-stats'),
        api.get('/Cafes'),
      ]);
      setStats(statsRes.data);

      const withSubs = (cafesRes.data ?? []).map((cafe, i) => ({
        ...cafe,
        status:  i === 0 ? 'Expired' : 'Active',
        endDate: i === 0 ? '2024-12-31' : '2026-06-30',
      }));
      setCafes(withSubs);

    } catch {
      Swal.fire({
        icon: 'error', title: 'خطأ في التحميل',
        text: 'تعذّر تحميل بيانات لوحة التحكم.',
        confirmButtonColor: '#3e2723', confirmButtonText: 'حسناً',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalCafes     = stats?.totalCafes     ?? stats?.TotalCafes     ?? 0;
  const openComplaints = stats?.openComplaints ?? stats?.OpenComplaints ?? 0;
  const activeSubs     = cafes.filter(c => c.status === 'Active');
  const totalSubIncome = activeSubs.length * 150;

  const exportCsv = () => {
    const rows = [
      ['اسم الكافيه', 'الاشتراك (₪)', 'الحالة', 'تاريخ الانتهاء'],
      ...cafes.map(c => [
        c.name ?? c.cafeName,
        150,
        c.status === 'Active' ? 'نشط' : 'منتهي',
        c.endDate,
      ]),
    ];
    const csv  = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `تقرير_${new Date().toLocaleDateString('ar')}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const chartData = {
    labels: MOCK_LABELS,
    datasets: [{
      label: 'نمو الكافيهات الجديدة',
      data: MOCK_GROWTH,
      backgroundColor: '#378ADD',
      borderRadius: 5,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { rtl: true } },
    scales: {
      x: {
        ticks: { autoSkip: false, maxRotation: 0, font: { size: 11 }, color: '#888' },
        grid: { display: false }, border: { display: false },
      },
      y: {
        ticks: { font: { size: 11 }, color: '#888', stepSize: 2 },
        grid: { color: 'rgba(0,0,0,0.06)' }, border: { display: false },
      },
    },
  };

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 13, fontWeight: 600, padding: '9px 16px',
    borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
    border: '1px solid #ddd', background: 'transparent', color: '#3e2723',
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#888', fontFamily: 'Cairo, sans-serif' }}>
      <FaCoffee size={36} color="#c8a882" style={{ marginBottom: 12 }} />
      <p style={{ fontWeight: 600 }}>جاري تحميل لوحة التحكم...</p>
    </div>
  );

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo','Tajawal',sans-serif" }}>

      {/* ══ Header ══ */}
      <div className="admin-dash-header" style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
            لوحة تحكم الأدمن
          </h1>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
            {new Date().toLocaleDateString('ar-PS', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCsv} style={btnStyle}>
            <FaDownload size={12} /> تصدير CSV
          </button>
          <button onClick={fetchAll} style={btnStyle}>
            <FaSync size={12} /> تحديث
          </button>
        </div>
      </div>

      {/* ══ بطاقات الإحصائيات ══ */}
      <div className="admin-dash-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <StatCard
          icon={<FaUsers />} label="المستخدمين"
          value={MOCK_USERS} iconBg="#E6F1FB" iconColor="#185FA5"
        />
        <StatCard
          icon={<FaStore />} label="الكافيهات المسجلة"
          value={totalCafes} iconBg="#E1F5EE" iconColor="#0F6E56"
        />
        <StatCard
          icon={<FaBell />} label="الشكاوى المفتوحة"
          value={openComplaints} iconBg="#FCEBEB" iconColor="#A32D2D"
          sub={openComplaints > 0 ? 'تحتاج متابعة' : undefined} subColor="#A32D2D"
        />
        <StatCard
          icon={<FaCheckCircle />} label="إجمالي الاشتراكات الشهرية"
          value={`${totalSubIncome} ₪`} iconBg="#E1F5EE" iconColor="#0F6E56"
          sub={`${activeSubs.length} كافيه نشط`} subColor="#0F6E56"
        />
      </div>

      {/* ══ قسم التقارير ══ */}
      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid #eee', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ece8' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>تقارير النظام</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>آخر 7 أشهر</div>
        </div>

        <div className="admin-dash-reports" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>

          {/* ─ الشارت ─ */}
          <div style={{ padding: '20px', borderLeft: '1px solid #f0ece8' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 }}>
              نمو الكافيهات الجديدة شهرياً
            </div>
            <div style={{ height: 200 }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* ─ الكافيهات المشتركة ─ */}
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 4,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
                الكافيهات المشتركة
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                padding: '2px 10px', borderRadius: 20,
                background: '#E1F5EE', color: '#0F6E56',
              }}>
                {activeSubs.length} نشط
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>
              150 ₪ / شهر لكل كافيه
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              {cafes.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, paddingTop: 30 }}>
                  لا توجد بيانات بعد
                </div>
              ) : (
                cafes.map((c, i) => (
                  <SubRow key={c.id ?? c.cafeId ?? i} sub={c} />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;