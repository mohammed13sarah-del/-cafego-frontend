import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCoffee, FaArrowRight, FaCheckCircle, FaStore,
  FaFileAlt, FaShieldAlt, FaMoneyBillWave, FaClipboardList,
  FaTimesCircle, FaInfoCircle,
} from 'react-icons/fa';

const Section = ({ icon, title, children }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', marginBottom: 20, border: '1px solid #ede0d4', boxShadow: '0 2px 10px rgba(62,39,35,0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f5ede0' }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: '#f5ede0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0785a', flexShrink: 0 }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 900, color: '#3e2723', margin: 0 }}>{title}</h2>
    </div>
    {children}
  </div>
);

const Item = ({ ok = true, text }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
    {ok
      ? <FaCheckCircle size={14} color="#2e7d32" style={{ marginTop: 2, flexShrink: 0 }} />
      : <FaTimesCircle size={14} color="#c62828" style={{ marginTop: 2, flexShrink: 0 }} />
    }
    <span style={{ fontSize: 14, color: '#5d4037', lineHeight: 1.7 }}>{text}</span>
  </div>
);

const TermsOfJoining = () => {
  const navigate = useNavigate();

  return (
    <div style={{ direction: 'rtl', fontFamily: "'Cairo','Tajawal',sans-serif", minHeight: '100vh', background: '#f5f0eb' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a110e,#3e2723)', padding: '48px 32px', textAlign: 'center', position: 'relative' }}>
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: 24, right: 32,
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          color: '#e8d5b0', padding: '8px 16px', borderRadius: 10,
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <FaArrowRight size={12} /> رجوع
        </button>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(200,168,130,0.15)', border: '1px solid rgba(200,168,130,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <FaStore size={28} color="#c8a882" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#e8d5b0', margin: '0 0 8px' }}>شروط الانضمام للمنصة</h1>
        <p style={{ fontSize: 14, color: '#bcaaa4', margin: 0 }}>يرجى قراءة الشروط بعناية قبل تسجيل كافيهك</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* تنبيه */}
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <FaInfoCircle size={18} color="#f57f17" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: '#5d4037', lineHeight: 1.8, margin: 0 }}>
            بتسجيلك على منصة <strong>Lavender</strong> كصاحب كافيه، فإنك توافق على جميع الشروط والأحكام الواردة أدناه. الانضمام مجاني ويخضع لموافقة الإدارة.
          </p>
        </div>

        <Section icon={<FaClipboardList size={18} />} title="متطلبات الانضمام">
          <Item text="يجب أن يكون الكافيه نشاطاً تجارياً مرخصاً وقانونياً." />
          <Item text="تقديم بيانات حقيقية ودقيقة عند التسجيل (الاسم، العنوان، رقم التواصل)." />
          <Item text="امتلاك بريد إلكتروني فعّال للتواصل والإشعارات." />
          <Item text="الالتزام بتحديث بيانات المنيو وأوقات العمل بشكل منتظم." />
          <Item text="توفير خدمة عملاء جيدة والالتزام بتنفيذ الطلبات في الوقت المحدد." />
        </Section>

        <Section icon={<FaMoneyBillWave size={18} />} title="الرسوم والعمولات">
          <Item text="الانضمام للمنصة مجاني تماماً." />
          <Item text="تقتطع المنصة عمولة بسيطة على كل طلب يتم عبر النظام وفق النسبة المحددة من الإدارة." />
          <Item text="يحق للإدارة تعديل نسبة العمولة مع إشعار مسبق للكافيهات." />
          <Item text="يتم تسوية المبالغ المستحقة أسبوعياً عبر الطريقة المتفق عليها." />
        </Section>

        <Section icon={<FaShieldAlt size={18} />} title="الالتزامات والمسؤوليات">
          <Item text="الالتزام بجودة المنتجات المعروضة ومطابقتها للصور والأوصاف المنشورة." />
          <Item text="معالجة الطلبات خلال المدة المحددة وإخطار العميل في حالة التأخير." />
          <Item text="الالتزام بمعايير الصحة والسلامة الغذائية." />
          <Item text="التعاون مع فريق الدعم لحل أي شكاوى أو نزاعات مع العملاء." />
          <Item ok={false} text="يُمنع نشر معلومات مضللة أو مخالفة لشروط المنصة." />
          <Item ok={false} text="يُمنع التعامل المباشر مع العملاء خارج المنصة بعد تقديم الطلب." />
        </Section>

        <Section icon={<FaFileAlt size={18} />} title="إجراءات القبول والرفض">
          <Item text="يخضع كل طلب انضمام لمراجعة من فريق الإدارة خلال 48 ساعة." />
          <Item text="في حالة القبول، سيتم إشعارك عبر البريد الإلكتروني وتفعيل حسابك." />
          <Item text="يحق للإدارة رفض أي طلب انضمام دون الحاجة لذكر السبب." />
          <Item text="في حالة مخالفة الشروط، يحق للإدارة تعليق الحساب أو إلغاؤه فورياً." />
          <Item text="يمكن التقدم بطلب انضمام مجدداً بعد معالجة المخالفات." />
        </Section>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ fontSize: 14, color: '#7a6050', marginBottom: 20 }}>
            هل أنت مستعد للانضمام؟ سجّل كافيهك الآن وابدأ رحلتك مع Lavender
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{
              background: 'linear-gradient(135deg,#c8a882,#a0785a)', color: '#1a110e',
              border: 'none', padding: '13px 32px', borderRadius: 12,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(160,120,90,0.3)',
            }}>
              <FaStore size={14} /> سجّل كافيهك الآن
            </button>
            <button onClick={() => navigate('/support')} style={{
              background: '#fff', color: '#7a6050',
              border: '1px solid #ede0d4', padding: '13px 24px', borderRadius: 12,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
            }}>
              تواصل معنا
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#bcaaa4', marginTop: 32 }}>
          آخر تحديث: 2026 — Lavender 🇵🇸
        </p>
      </div>
    </div>
  );
};

export default TermsOfJoining;