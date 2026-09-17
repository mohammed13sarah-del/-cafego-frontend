import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaStore, FaPhone, FaMapMarkerAlt, FaCoffee, FaUtensils,
  FaCheckCircle, FaTimesCircle, FaSearch, FaSyncAlt,
  FaFilter,
} from 'react-icons/fa';
import { MdRestaurantMenu, MdLocalCafe, MdStorefront } from 'react-icons/md';

const API_BASE = process.env.REACT_APP_API_URL || "https://localhost:7203/api";
const api = axios.create({ baseURL: API_BASE });

const getCategoryIcon = (cat) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('قهو') || c.includes('coffee') || c.includes('كافي')) return <FaCoffee />;
  if (c.includes('مطعم') || c.includes('restaurant'))                   return <FaUtensils />;
  if (c.includes('عصير') || c.includes('juice'))                        return <MdLocalCafe />;
  return <MdStorefront />;
};

const getGradient = (cat, isOpen) => {
  if (!isOpen) return 'linear-gradient(145deg, #37474f 0%, #546e7a 100%)';
  const c = (cat || '').toLowerCase();
  if (c.includes('قهو') || c.includes('coffee') || c.includes('كافي'))
    return 'linear-gradient(145deg, #3e2723 0%, #6d4c41 60%, #a0785a 100%)';
  if (c.includes('مطعم') || c.includes('restaurant'))
    return 'linear-gradient(145deg, #1b5e20 0%, #388e3c 100%)';
  if (c.includes('حلو') || c.includes('sweets'))
    return 'linear-gradient(145deg, #880e4f 0%, #c2185b 100%)';
  if (c.includes('عصير') || c.includes('juice'))
    return 'linear-gradient(145deg, #e65100 0%, #f57c00 100%)';
  return 'linear-gradient(145deg, #3e2723 0%, #6d4c41 100%)';
};

export default function Home({ search = "", filter = "all" }) {
  const [cafes,      setCafes]      = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [cityFilter, setCityFilter] = useState('all');
  const [catFilter,  setCatFilter]  = useState('all');
  const [hovered,    setHovered]    = useState(null);
  const navigate = useNavigate();

  const checkIsOpen = (cafe) => {
    const status = cafe.status?.toLowerCase();
    return (status === "open" || status === "approved") && !cafe.isBlockedByAdmin;
  };

  useEffect(() => {
    api.get("/Cafes")
      .then(res => { setCafes(res.data); setLoading(false); })
      .catch(() => { setError("تعذّر تحميل الكافيهات، تأكد أن السيرفر شغال."); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = [...cafes];
    if (search?.trim())
      result = result.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.city?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      );
    if (filter === "open")
      result = result.filter(c => checkIsOpen(c));
    if (cityFilter !== 'all')
      result = result.filter(c => c.city === cityFilter);
    if (catFilter !== 'all')
      result = result.filter(c => c.category === catFilter);
    setFiltered(result);
  }, [search, filter, cafes, cityFilter, catFilter]);

  const cities     = ['all', ...new Set(cafes.map(c => c.city).filter(Boolean))];
  const categories = ['all', ...new Set(cafes.map(c => c.category).filter(Boolean))];
  const openCount   = cafes.filter(c => checkIsOpen(c)).length;
  const closedCount = cafes.length - openCount;

  return (
    <div className="home-page" style={{ width: "100%", direction: "rtl", fontFamily: "'Cairo','Tajawal',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .cafe-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(200,168,130,0.15);
          box-shadow: 0 2px 14px rgba(62,39,35,0.07);
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
          animation: fadeUp 0.5s ease both;
        }
        .cafe-card:hover {
          transform: translateY(-7px) scale(1.01);
          box-shadow: 0 20px 50px rgba(62,39,35,0.16);
        }
        .cafe-card:hover .card-overlay { opacity: 1 !important; }
        .cafe-card:hover .card-icon    { transform: scale(1.18) rotate(-5deg); }
        .menu-btn {
          width: 100%;
          background: linear-gradient(135deg, #3e2723, #6d4c41);
          color: #e8d5b0;
          border: none;
          padding: 11px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 800;
          font-size: 13px;
          font-family: 'Cairo', sans-serif;
          margin-top: 12px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .menu-btn:hover {
          background: linear-gradient(135deg, #1a110e, #3e2723);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(62,39,35,0.3);
        }
        .filter-chip {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid rgba(200,168,130,0.3);
          background: #fff;
          color: #5d4037;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-chip:hover { border-color: #a0785a; color: #3e2723; }
        .filter-chip.active {
          background: linear-gradient(135deg, #3e2723, #6d4c41);
          color: #e8d5b0;
          border-color: transparent;
          box-shadow: 0 3px 10px rgba(62,39,35,0.25);
        }
        .skeleton {
          background: linear-gradient(90deg, #f5ede8 25%, #fdf8f5 50%, #f5ede8 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease infinite;
          border-radius: 12px;
        }
        .card-icon {
          transition: transform 0.3s ease;
          display: flex;
        }
      `}</style>

      {/* ── Hero Banner ── */}
      <div className="home-hero" style={{
        background: 'linear-gradient(135deg, #3e2723 0%, #5d4037 50%, #a0785a 100%)',
        borderRadius: 20, padding: '26px 28px 22px',
        marginBottom: 22, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <FaCoffee size={11} /> مرحباً بك في Lavender
          </div>
          <h1 className="home-hero-title" style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 6px', lineHeight: 1.3 }}>
            اكتشف أفضل الكافيهات
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '0 0 18px' }}>
            اطلب قهوتك المفضلة من أي مكان وفي أي وقت
          </p>
          <div className="home-stats" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: <FaStore size={13} />,       value: cafes.length,  label: 'كافيه' },
              { icon: <FaCheckCircle size={13} />, value: openCount,     label: 'مفتوح الآن' },
              { icon: <FaTimesCircle size={13} />, value: closedCount,   label: 'مغلق' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)',
                borderRadius: 12, padding: '7px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{s.icon}</span>
                <span style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{s.value}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Local Filters ── */}
      {!loading && cafes.length > 0 && (
        <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cities.length > 2 && (
            <div className="home-filters" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#a0785a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <FaMapMarkerAlt size={10} /> المدينة:
              </span>
              {cities.map(city => (
                <button key={city} className={`filter-chip ${cityFilter === city ? 'active' : ''}`}
                  onClick={() => setCityFilter(city)}>
                  {city === 'all' ? 'الكل' : city}
                </button>
              ))}
            </div>
          )}
          {categories.length > 2 && (
            <div className="home-filters" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#a0785a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <FaFilter size={10} /> التصنيف:
              </span>
              {categories.map(cat => (
                <button key={cat} className={`filter-chip ${catFilter === cat ? 'active' : ''}`}
                  onClick={() => setCatFilter(cat)}>
                  {cat === 'all' ? 'الكل' : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Skeleton Loading ── */}
      {loading && (
        <div className="home-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(200,168,130,0.1)' }}>
              <div className="skeleton" style={{ height: 145 }} />
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton" style={{ height: 18, width: '60%' }} />
                <div className="skeleton" style={{ height: 12, width: '90%' }} />
                <div className="skeleton" style={{ height: 12, width: '70%' }} />
                <div className="skeleton" style={{ height: 40, marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          textAlign: 'center', padding: '50px 40px',
          background: '#fdecea', borderRadius: 18,
          border: '1px solid rgba(198,40,40,0.2)',
        }}>
          <FaTimesCircle size={44} color="#c62828" style={{ marginBottom: 14, opacity: 0.7 }} />
          <p style={{ color: '#c62828', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{
            background: '#c62828', color: '#fff', border: 'none',
            padding: '9px 24px', borderRadius: 20, cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: "'Cairo',sans-serif",
            display: 'inline-flex', alignItems: 'center', gap: 7,
          }}>
            <FaSyncAlt size={12} /> إعادة المحاولة
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '70px 20px',
          background: '#fff', borderRadius: 20,
          border: '2px dashed rgba(200,168,130,0.3)',
        }}>
          <FaSearch size={40} color="#c8a882" style={{ marginBottom: 14, opacity: 0.4 }} />
          <p style={{ color: '#5d4037', fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
            لا توجد كافيهات مطابقة
          </p>
          <p style={{ color: '#a0785a', fontSize: 12, marginBottom: 20 }}>
            جرّب تغيير الفلتر أو كلمة البحث
          </p>
          <button onClick={() => { setCityFilter('all'); setCatFilter('all'); }} style={{
            background: 'linear-gradient(135deg, #c8a882, #a0785a)',
            color: '#1a110e', border: 'none', padding: '10px 24px',
            borderRadius: 20, cursor: 'pointer', fontSize: 13,
            fontWeight: 700, fontFamily: "'Cairo',sans-serif",
            display: 'inline-flex', alignItems: 'center', gap: 7,
          }}>
            <FaFilter size={11} /> إعادة ضبط الفلاتر
          </button>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: '#a0785a', marginBottom: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaStore size={11} color="#c8a882" />
            عرض {filtered.length} من {cafes.length} كافيه
          </div>

          <div className="home-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {filtered.map((cafe, idx) => {
              const isOpen   = checkIsOpen(cafe);
              const catIcon  = getCategoryIcon(cafe.category);
              const gradient = getGradient(cafe.category, isOpen);

              return (
                <div
                  key={cafe.cafeID}
                  className="cafe-card"
                  style={{ animationDelay: `${Math.min(idx * 0.07, 0.5)}s` }}
                  onClick={() => cafe.cafeID && navigate(`/cafe-menu/${cafe.cafeID}`)}
                  onMouseEnter={() => setHovered(cafe.cafeID)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div style={{
                    height: 145, background: gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0, opacity: 0.07,
                      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                      backgroundSize: '18px 18px',
                    }} />
                    <div className="card-icon" style={{ fontSize: 52, color: 'rgba(255,255,255,0.9)', position: 'relative', zIndex: 1 }}>
                      {catIcon}
                    </div>
                    <div className="card-overlay" style={{
                      position: 'absolute', inset: 0, zIndex: 2,
                      background: 'rgba(0,0,0,0.2)',
                      opacity: 0, transition: 'opacity 0.25s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
                        color: '#fff', fontSize: 12, fontWeight: 800,
                        padding: '8px 18px', borderRadius: 20,
                        fontFamily: "'Cairo',sans-serif",
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <MdRestaurantMenu size={14} /> عرض المنيو
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute', top: 10, right: 10, zIndex: 3,
                      background: isOpen ? 'rgba(232,245,233,0.95)' : 'rgba(253,238,238,0.95)',
                      color: isOpen ? '#2e7d32' : '#c62828',
                      fontSize: 10, fontWeight: 800,
                      padding: '4px 10px', borderRadius: 20,
                      display: 'flex', alignItems: 'center', gap: 5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}>
                      {isOpen ? <FaCheckCircle size={9} /> : <FaTimesCircle size={9} />}
                      {isOpen ? 'مفتوح' : 'مغلق'}
                    </div>
                    {cafe.category && (
                      <div style={{
                        position: 'absolute', top: 10, left: 10, zIndex: 3,
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)',
                        color: '#fff', fontSize: 10, fontWeight: 700,
                        padding: '4px 10px', borderRadius: 20,
                      }}>
                        {cafe.category}
                      </div>
                    )}
                    {cafe.city && (
                      <div style={{
                        position: 'absolute', bottom: 10, right: 10, zIndex: 3,
                        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                        color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 600,
                        padding: '3px 9px', borderRadius: 20,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <FaMapMarkerAlt size={9} /> {cafe.city}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '14px 16px 16px' }}>
                    <h3 style={{ margin: '0 0 5px', fontSize: 16, fontWeight: 900, color: '#3e2723' }}>
                      {cafe.name}
                    </h3>
                    {cafe.description && (
                      <p style={{
                        fontSize: 12, color: '#8d6e63', margin: '0 0 10px', lineHeight: 1.6,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {cafe.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {cafe.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#a0785a' }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: '#f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FaPhone size={9} color="#a0785a" />
                          </div>
                          {cafe.phone}
                        </div>
                      )}
                      {cafe.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#a0785a' }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: '#f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FaMapMarkerAlt size={9} color="#a0785a" />
                          </div>
                          {cafe.address}
                        </div>
                      )}
                    </div>
                    <button
                      className="menu-btn"
                      onClick={e => { e.stopPropagation(); cafe.cafeID && navigate(`/cafe-menu/${cafe.cafeID}`); }}
                    >
                      <MdRestaurantMenu size={15} /> عرض المنيو
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}