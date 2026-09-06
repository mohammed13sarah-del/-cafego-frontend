import React, { useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';
import { MdOutlineEmail, MdLockOutline, MdOutlineLocalCafe } from 'react-icons/md';
import { FiArrowRight } from 'react-icons/fi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/Account/login', formData);
            const { token, id, userName, role, cafeID } = res.data;

            if (role !== 'Admin') {
                try {
                    const settingsRes = await api.get('/Settings');
                    if (settingsRes.data?.maintenanceMode === true) {
                        setError('النظام تحت الصيانة المؤقتة، سنعود قريباً 🔧');
                        return;
                    }
                } catch { }
            }

            login({ token, id, userName, role, cafeID });

            if (from) {
                navigate(from, { replace: true });
            } else if (role === 'Admin')     navigate('/admin/dashboard');
            else if (role === 'CafeOwner')   navigate('/owner/dashboard');
            else                             navigate('/home');

        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'تأكد من البيانات');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* ── فورم تسجيل الدخول ── */}
                <div className="auth-form-side">
                    <MdOutlineLocalCafe className="auth-logo-icon" />
                    <h2>أهلاً بعودتك</h2>
                    <p className="auth-subtitle">سجّل دخولك للوصول إلى حسابك</p>

                    {error && <div className="auth-server-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <MdOutlineEmail className="field-icon" />
                            <input
                                type="email"
                                placeholder="البريد الإلكتروني"
                                required
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        {/* ✅ كلمة المرور مع أيقونة العين */}
                        <div className="auth-field">
                            <MdLockOutline className="field-icon" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="كلمة المرور"
                                required
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <span
                                onMouseDown={() => setShowPass(true)}
                                onMouseUp={() => setShowPass(false)}
                                onMouseLeave={() => setShowPass(false)}
                                style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-60%)', cursor: 'pointer', color: '#c4a882', fontSize: 17, userSelect: 'none' }}
                            >
                                {showPass ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>

                        <button type="submit" className="auth-btn">دخول</button>
                    </form>

                    <p className="auth-forgot" onClick={() => navigate('/forgot-password')}>
                        نسيت كلمة المرور؟
                    </p>
                </div>

                {/* ── البانيل الجانبي ── */}
                <div className="auth-panel-side">
                    <MdOutlineLocalCafe className="panel-big-icon" />
                    <h3>مرحباً بك في Lavender</h3>
                    <p>اكتشف أفضل الكافيهات من أي مكان وفي أي وقت. انضم إلينا الآن!</p>
                    <button className="auth-panel-btn" onClick={() => navigate('/register')}>
                        إنشاء حساب <FiArrowRight />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Login;