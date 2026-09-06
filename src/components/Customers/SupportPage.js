import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import {
  FaPaperPlane, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCheckCircle, FaArrowRight, FaHeadset, FaExclamationTriangle,
  FaInfoCircle, FaBullhorn,
} from 'react-icons/fa';

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1px solid #e0d5cc', fontSize: 14,
  fontFamily: "'Cairo','Tajawal',sans-serif",
  background: '#fdf9f5', color: '#3e2723',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
};
const lbl = { display: 'block', fontSize: 12, fontWeight: 700, color: '#7a6050', marginBottom: 6 };
const Req = () => <span style={{ color: '#c62828' }}>*</span>;

// ✅ PersonalFields خارج SupportPage تماماً
const PersonalFields = ({ form, setForm }) => (
  <div style={{ background: '#fdf8f5', borderRadius: 12, padding: '16px', marginBottom: 16, border: '1px solid #ede0d4' }}>
    <p style={{ fontSize: 11, fontWeight: 800, color: '#c8a882', letterSpacing: 1.5, marginBottom: 12, textTransform: 'uppercase' }}>
      معلوماتك الشخصية
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
      <div>
        <label style={lbl}>الاسم الأول <Req /></label>
        <input style={inp} placeholder="الاسم الأول"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          onFocus={e => e.target.style.borderColor = '#c8a882'}
          onBlur={e => e.target.style.borderColor = '#e0d5cc'} />
      </div>
      <div>
        <label style={lbl}>الاسم الأخير <Req /></label>
        <input style={inp} placeholder="الاسم الأخير"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          onFocus={e => e.target.style.borderColor = '#c8a882'}
          onBlur={e => e.target.style.borderColor = '#e0d5cc'} />
      </div>
    </div>

    <div style={{ marginBottom: 10 }}>
      <label style={lbl}>البريد الإلكتروني <Req /></label>
      <input style={inp} placeholder="البريد الإلكتروني" type="email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        onFocus={e => e.target.style.borderColor = '#c8a882'}
        onBlur={e => e.target.style.borderColor = '#e0d5cc'} />
    </div>

    <div>
      <label style={lbl}>رقم الهاتف <Req /></label>
      <input style={inp} placeholder="رقم الهاتف" type="tel"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        onFocus={e => e.target.style.borderColor = '#c8a882'}
        onBlur={e => e.target.style.borderColor = '#e0d5cc'} />
    </div>
  </div>
);

const SupportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const complaintRef = useRef(null);
  const contactRef   = useRef(null);

  const [activeTab, setActiveTab] = useState('contact');

  const [contactForm, setContactForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: ''
  });
  const [contactSending, setContactSending] = useState(false);
  const [contactSent,    setContactSent]    = useState(false);

  const [complaintForm, setComplaintForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    subject: '', description: '', priority: 'Medium', cafeId: '', orderId: ''
  });
  const [complaintSending, setComplaintSending] = useState(false);
  const [complaintSent,    setComplaintSent]    = useState(false);

  const [cafes,    setCafes]    = useState([]);
  const [error,    setError]    = useState('');
  const [settings, setSettings] = useState({
    supportPhone: '+970 59 000 0000',
    supportEmail: 'support@lavender.ps',
  });

  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (scrollTo === 'complaint-form') {
      setActiveTab('complaint');
      setTimeout(() => complaintRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } else if (scrollTo === 'contact-form') {
      setActiveTab('contact');
      setTimeout(() => contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  }, [location.state]);

  useEffect(() => {
    api.get('/Settings').then(res => {
      const d = res.data?.data ?? res.data;
      if (d) setSettings(prev => ({ ...prev, ...d }));
    }).catch(() => {});
    api.get('/Cafes').then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setCafes(data.filter(c => c.status?.toLowerCase() === 'active' || c.status === 'نشط'));
    }).catch(() => {});
  }, []);

  const contactSubjects   = ['مشكلة في الطلب', 'مشكلة في الدفع', 'مشكلة تقنية', 'استفسار عام', 'أخرى'];
  const complaintSubjects = ['تأخر في التوصيل', 'جودة المنتج سيئة', 'سلوك غير لائق', 'مشكلة مالية', 'خدمة سيئة', 'أخرى'];

  const handleContactSubmit = async () => {
    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email ||
        !contactForm.phone || !contactForm.subject || !contactForm.message) {
      setError('يرجى تعبئة جميع الحقول المطلوبة'); return;
    }
    setContactSending(true); setError('');
    try {
      await api.post('/Contact/send', {
        name:    `${contactForm.firstName} ${contactForm.lastName}`.trim(),
        email:   contactForm.email,
        phone:   contactForm.phone,
        subject: contactForm.subject,
        message: contactForm.message,
        sentAt:  new Date().toISOString(),
        isRead:  false,
      });
      setContactSent(true);
    } catch { setError('حدث خطأ أثناء الإرسال، حاول مرة أخرى'); }
    finally { setContactSending(false); }
  };

  const handleComplaintSubmit = async () => {
    if (!complaintForm.firstName || !complaintForm.lastName || !complaintForm.email ||
        !complaintForm.phone || !complaintForm.subject || !complaintForm.orderId ||
        !complaintForm.description) {
      setError('يرجى تعبئة جميع الحقول المطلوبة'); return;
    }
    setComplaintSending(true); setError('');
    try {
      await api.post('/Complaints', {
        customerId:  user?.id ?? user?.customerID ?? null,
        name:        `${complaintForm.firstName} ${complaintForm.lastName}`.trim(),
        email:       complaintForm.email,
        phone:       complaintForm.phone,
        cafeId:      complaintForm.cafeId  ? parseInt(complaintForm.cafeId)  : null,
        orderId:     complaintForm.orderId ? parseInt(complaintForm.orderId) : null,
        subject:     complaintForm.subject,
        description: complaintForm.description,
        priority:    complaintForm.priority,
      });
      setComplaintSent(true);
    } catch { setError('حدث خطأ أثناء إرسال الشكوى، حاول مرة أخرى'); }
    finally { setComplaintSending(false); }
  };

  const SuccessMsg = ({ isComplaint, onReset }) => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0faf0', border: '2px solid #4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <FaCheckCircle size={32} color="#2e7d32" />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: '#3e2723', marginBottom: 10 }}>
        {isComplaint ? 'تم تقديم شكواك ✓' : 'تم إرسال رسالتك ✓'}
      </h3>
      <p style={{ fontSize: 13, color: '#7a6050', lineHeight: 1.8, marginBottom: 24 }}>
        {isComplaint
          ? 'تم استلام شكواك وسيقوم فريق الإدارة بمراجعتها والرد عليك خلال 24 ساعة.'
          : 'شكراً لتواصلك معنا! سيقوم فريق الدعم بالرد عليك خلال 24 ساعة.'
        }
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onReset} style={{ background: '#f5f0eb', color: '#7a6050', border: '1px solid #ede0d4', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
          {isComplaint ? 'تقديم شكوى أخرى' : 'إرسال رسالة أخرى'}
        </button>
        <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg,#c8a882,#a0785a)', color: '#1a110e', border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800 }}>
          العودة للرئيسية
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif", minHeight: '100vh', background: '#f5f0eb' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a110e,#3e2723)', padding: '48px 32px', textAlign: 'center', position: 'relative' }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 24, right: 32, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#e8d5b0', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
          <FaArrowRight size={12} /> رجوع
        </button>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(200,168,130,0.15)', border: '1px solid rgba(200,168,130,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <FaHeadset size={28} color="#c8a882" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#e8d5b0', margin: '0 0 8px' }}>الدعم الفني والشكاوى</h1>
        <p style={{ fontSize: 14, color: '#bcaaa4', margin: 0 }}>نحن هنا لمساعدتك — سيصلك رد خلال 24 ساعة</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 28 }}>

        {/* يسار */}
        <div>
          {[
            { icon: <FaPhone size={18} color="#c8a882" />,        title: 'هاتف الدعم',        value: settings.supportPhone, sub: 'متاح 9 ص — 6 م' },
            { icon: <FaEnvelope size={18} color="#c8a882" />,     title: 'البريد الإلكتروني', value: settings.supportEmail, sub: 'نرد خلال 24 ساعة' },
            { icon: <FaMapMarkerAlt size={18} color="#c8a882" />, title: 'الموقع',             value: 'رام الله، فلسطين',   sub: 'مقر Lavender الرئيسي' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', marginBottom: 14, border: '1px solid #ede0d4', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(62,39,35,0.05)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5ede0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: '#a0785a', fontWeight: 700, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#3e2723' }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#bcaaa4', marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          ))}

          <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #ede0d4', boxShadow: '0 2px 8px rgba(62,39,35,0.05)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#3e2723', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <FaInfoCircle size={13} color="#c8a882" /> ملاحظات مهمة
            </h4>
            {['للشكاوى العاجلة اتصل بنا مباشرة', 'احتفظ برقم طلبك عند التواصل', 'سيتم الرد خلال 24 ساعة عمل'].map((note, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 12, color: '#7a6050' }}>
                <FaExclamationTriangle size={10} color="#c8a882" style={{ marginTop: 2, flexShrink: 0 }} />
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* يمين */}
        <div ref={contactRef} style={{ background: '#fff', borderRadius: 16, padding: '28px 26px', border: '1px solid #ede0d4', boxShadow: '0 4px 16px rgba(62,39,35,0.07)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#f5f0eb', padding: 5, borderRadius: 12 }}>
            {[
              { key: 'contact',   label: 'رسالة تواصل', icon: <FaPaperPlane size={12} /> },
              { key: 'complaint', label: 'تقديم شكوى',  icon: <FaBullhorn size={12} /> },
            ].map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setError(''); }} style={{
                flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                background: activeTab === tab.key ? 'linear-gradient(135deg,#c8a882,#a0785a)' : 'transparent',
                color: activeTab === tab.key ? '#1a110e' : '#8d6e63',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'all .2s',
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #ffcdd2', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c62828', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaExclamationTriangle size={12} /> {error}
            </div>
          )}

          {/* تاب التواصل */}
          {activeTab === 'contact' && (
            contactSent
              ? <SuccessMsg isComplaint={false} onReset={() => { setContactSent(false); setContactForm({ firstName:'', lastName:'', email:'', phone:'', subject:'', message:'' }); }} />
              : <>
                  <PersonalFields form={contactForm} setForm={setContactForm} />

                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>الموضوع <Req /></label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={contactForm.subject}
                      onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#c8a882'}
                      onBlur={e => e.target.style.borderColor = '#e0d5cc'}>
                      <option value="">موضوع رسالتك</option>
                      {contactSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>الرسالة <Req /></label>
                    <textarea style={{ ...inp, resize: 'vertical', minHeight: 120 }}
                      placeholder="رسالتك..."
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#c8a882'}
                      onBlur={e => e.target.style.borderColor = '#e0d5cc'} />
                    <div style={{ fontSize: 11, color: '#bcaaa4', textAlign: 'left', marginTop: 4 }}>{contactForm.message.length} / 500</div>
                  </div>

                  <button onClick={handleContactSubmit} disabled={contactSending} style={{
                    width: '100%', border: 'none', padding: 13, borderRadius: 12,
                    cursor: contactSending ? 'not-allowed' : 'pointer',
                    background: contactSending ? '#d7ccc8' : 'linear-gradient(135deg,#c8a882,#a0785a)',
                    color: contactSending ? '#9e9e9e' : '#1a110e',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: contactSending ? 'none' : '0 4px 14px rgba(160,120,90,0.3)',
                  }}>
                    <FaPaperPlane size={13} /> {contactSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </button>
                </>
          )}

          {/* تاب الشكوى */}
          {activeTab === 'complaint' && (
            complaintSent
              ? <SuccessMsg isComplaint={true} onReset={() => { setComplaintSent(false); setComplaintForm({ firstName:'', lastName:'', email:'', phone:'', subject:'', description:'', priority:'Medium', cafeId:'', orderId:'' }); }} />
              : <div ref={complaintRef}>
                  <PersonalFields form={complaintForm} setForm={setComplaintForm} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={lbl}>موضوع الشكوى <Req /></label>
                      <select style={{ ...inp, cursor: 'pointer' }} value={complaintForm.subject}
                        onChange={e => setComplaintForm(f => ({ ...f, subject: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = '#c8a882'}
                        onBlur={e => e.target.style.borderColor = '#e0d5cc'}>
                        <option value="">موضوع الشكوى</option>
                        {complaintSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>الأولوية <Req /></label>
                      <select style={{ ...inp, cursor: 'pointer' }} value={complaintForm.priority}
                        onChange={e => setComplaintForm(f => ({ ...f, priority: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = '#c8a882'}
                        onBlur={e => e.target.style.borderColor = '#e0d5cc'}>
                        <option value="Low">منخفضة</option>
                        <option value="Medium">متوسطة</option>
                        <option value="High">عالية</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>الكافيه المعني <span style={{ fontSize: 10, color: '#bcaaa4' }}>(اختياري)</span></label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={complaintForm.cafeId}
                      onChange={e => setComplaintForm(f => ({ ...f, cafeId: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#c8a882'}
                      onBlur={e => e.target.style.borderColor = '#e0d5cc'}>
                      <option value="">اختر الكافيه</option>
                      {cafes.map(c => <option key={c.cafeID} value={c.cafeID}>{c.name}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>رقم الطلب <Req /></label>
                    <input style={inp} type="number" placeholder="رقم الطلب"
                      value={complaintForm.orderId}
                      onChange={e => setComplaintForm(f => ({ ...f, orderId: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#c8a882'}
                      onBlur={e => e.target.style.borderColor = '#e0d5cc'} />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>تفاصيل الشكوى <Req /></label>
                    <textarea style={{ ...inp, resize: 'vertical', minHeight: 110 }}
                      placeholder="تفاصيل شكواك..."
                      value={complaintForm.description}
                      onChange={e => setComplaintForm(f => ({ ...f, description: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = '#c8a882'}
                      onBlur={e => e.target.style.borderColor = '#e0d5cc'} />
                  </div>

                  <button onClick={handleComplaintSubmit} disabled={complaintSending} style={{
                    width: '100%', border: 'none', padding: 13, borderRadius: 12,
                    cursor: complaintSending ? 'not-allowed' : 'pointer',
                    background: complaintSending ? '#d7ccc8' : 'linear-gradient(135deg,#c8a882,#a0785a)',
                    color: complaintSending ? '#9e9e9e' : '#1a110e',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: complaintSending ? 'none' : '0 4px 14px rgba(160,120,90,0.3)',
                  }}>
                    <FaBullhorn size={13} /> {complaintSending ? 'جاري الإرسال...' : 'تقديم الشكوى'}
                  </button>
                </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;