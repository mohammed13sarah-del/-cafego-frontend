import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import Swal from 'sweetalert2';
import { MdOutlineEmail, MdLockOutline, MdOutlineLocalCafe, MdOutlinePhone, MdOutlinePerson, MdOutlineStorefront } from 'react-icons/md';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Customer',
        cafeID: ''
    });

    const [cafes, setCafes] = useState([]);
    const [errors, setErrors] = useState({});
    const [showPass,    setShowPass]    = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        if (formData.role === 'CafeOwner') {
            api.get('/Cafes').then(res => setCafes(res.data || [])).catch(() => setCafes([]));
        }
    }, [formData.role]);

    const validateField = (name, value) => {
        let tempErrors = { ...errors };
        switch (name) {
            case 'email':
                const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
                if (!value) tempErrors.email = "البريد الإلكتروني مطلوب";
                else if (!emailRegex.test(value)) tempErrors.email = "صيغة البريد غير صحيحة";
                else delete tempErrors.email;
                break;
            case 'password':
                // ✅ 8 خانات + حروف + أرقام + رموز
                const strongPass = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
                if (!value) tempErrors.password = "كلمة المرور مطلوبة";
                else if (value.length < 8) tempErrors.password = "8 خانات على الأقل";
                else if (!strongPass.test(value)) tempErrors.password = "يجب أن تحتوي على أحرف وأرقام ورموز (!@#$...)";
                else delete tempErrors.password;
                if (formData.confirmPassword && value !== formData.confirmPassword)
                    tempErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
                else if (formData.confirmPassword && value === formData.confirmPassword)
                    delete tempErrors.confirmPassword;
                break;
            case 'confirmPassword':
                if (value !== formData.password) tempErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
                else delete tempErrors.confirmPassword;
                break;
            case 'phone':
                if (!value) tempErrors.phone = "رقم الهاتف مطلوب";
                else delete tempErrors.phone;
                break;
            case 'cafeID':
                if (formData.role === 'CafeOwner' && !value)
                    tempErrors.cafeID = "يجب اختيار الكافيه";
                else delete tempErrors.cafeID;
                break;
            default:
                if (!value) tempErrors[name] = "هذا الحقل مطلوب";
                else delete tempErrors[name];
                break;
        }
        setErrors(tempErrors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    // ✅ منع الأرقام في الاسم
    const handleNameChange = (e) => {
        const { name } = e.target;
        const value = e.target.value.replace(/[0-9]/g, '');
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    // ✅ منع الحروف في الهاتف
    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/[^0-9+]/g, '');
        setFormData(prev => ({ ...prev, phone: value }));
        validateField('phone', value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        if (formData.role === 'CafeOwner' && !formData.cafeID) {
            setErrors(prev => ({ ...prev, cafeID: 'يجب اختيار الكافيه' }));
            return;
        }

        if (Object.keys(errors).length > 0 || !formData.email || !formData.password || !formData.phone) {
            setServerError("الرجاء تصحيح الأخطاء وتعبئة جميع الحقول");
            return;
        }

        try {
            const payload = {
                ...formData,
                cafeID: formData.cafeID ? parseInt(formData.cafeID) : null
            };
            const res = await api.post('/Account/register', payload);

            Swal.fire({
                title: 'تم إنشاء الحساب!',
                text: res.data.message || 'يمكنك الآن تسجيل الدخول.',
                icon: 'success',
                confirmButtonText: 'تسجيل الدخول',
                confirmButtonColor: '#c8914a',
                background: '#fdf8f2',
                color: '#2b1a0e',
            }).then(result => {
                if (result.isConfirmed) navigate('/login');
            });

        } catch (err) {
            setServerError(err.response?.data?.message || err.response?.data || "فشل التسجيل، بيانات غير صالحة");
        }
    };

    return (
        <div className="auth-page register-page">
            <div className="auth-card">

                {/* ── البانيل الجانبي (يسار في Register) ── */}
                <div className="auth-panel-side">
                    <MdOutlineLocalCafe className="panel-big-icon" />
                    <h3>لديك حساب بالفعل؟</h3>
                    <p>سجّل دخولك واستمتع باكتشاف أفضل الكافيهات حولك</p>
                    <button className="auth-panel-btn" onClick={() => navigate('/login')}>
                        <FiArrowLeft /> تسجيل الدخول
                    </button>
                </div>

                {/* ── فورم التسجيل ── */}
                <div className="auth-form-side" style={{ direction: 'rtl' }}>
                    <MdOutlineLocalCafe className="auth-logo-icon" />
                    <h2>إنشاء حساب جديد</h2>
                    <p className="auth-subtitle">انضم إلى مجتمع Lavender</p>

                    {serverError && <div className="auth-server-error">{serverError}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>

                        <div className="auth-name-row">
                            <div className="auth-field">
                                <MdOutlinePerson className="field-icon" />
                                <input type="text" name="firstName" placeholder="الاسم الأول" required
                                    value={formData.firstName} onChange={handleNameChange}
                                    className={errors.firstName ? 'error-input' : ''} />
                                {errors.firstName && <p className="field-error">{errors.firstName}</p>}
                            </div>
                            <div className="auth-field">
                                <MdOutlinePerson className="field-icon" />
                                <input type="text" name="lastName" placeholder="الاسم الأخير" required
                                    value={formData.lastName} onChange={handleNameChange}
                                    className={errors.lastName ? 'error-input' : ''} />
                                {errors.lastName && <p className="field-error">{errors.lastName}</p>}
                            </div>
                        </div>

                        {/* ✅ الهاتف — أرقام فقط */}
                        <div className="auth-field">
                            <MdOutlinePhone className="field-icon" />
                            <input type="text" name="phone" placeholder="رقم الهاتف" required
                                value={formData.phone} onChange={handlePhoneChange}
                                inputMode="numeric"
                                className={errors.phone ? 'error-input' : ''} />
                            {errors.phone && <p className="field-error">{errors.phone}</p>}
                        </div>

                        <div className="auth-field">
                            <MdOutlineEmail className="field-icon" />
                            <input type="text" name="email" placeholder="البريد الإلكتروني" required
                                value={formData.email} onChange={handleChange}
                                className={errors.email ? 'error-input' : ''} />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>

                        {/* ✅ كلمة المرور — قوية */}
                        <div className="auth-field">
                            <MdLockOutline className="field-icon" />
                            <input type={showPass ? 'text' : 'password'} name="password" placeholder="كلمة المرور (أحرف + أرقام + رموز)" required
                                value={formData.password} onChange={handleChange}
                                className={errors.password ? 'error-input' : ''} />
                            <span
                                onMouseDown={() => setShowPass(true)}
                                onMouseUp={() => setShowPass(false)}
                                onMouseLeave={() => setShowPass(false)}
                                style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-60%)', cursor: 'pointer', color: '#c4a882', fontSize: 17, userSelect: 'none' }}
                            >
                                {showPass ? <FaEye /> : <FaEyeSlash />}
                            </span>
                            {errors.password && <p className="field-error">{errors.password}</p>}
                        </div>

                        <div className="auth-field">
                            <MdLockOutline className="field-icon" />
                            <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="تأكيد كلمة المرور" required
                                value={formData.confirmPassword} onChange={handleChange}
                                className={errors.confirmPassword ? 'error-input' : ''} />
                            <span
                                onMouseDown={() => setShowConfirm(true)}
                                onMouseUp={() => setShowConfirm(false)}
                                onMouseLeave={() => setShowConfirm(false)}
                                style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-60%)', cursor: 'pointer', color: '#c4a882', fontSize: 17, userSelect: 'none' }}
                            >
                                {showConfirm ? <FaEye /> : <FaEyeSlash />}
                            </span>
                            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                        </div>

                        <div className="auth-field">
                            <MdOutlineStorefront className="field-icon" />
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="Customer">زبون</option>
                                <option value="CafeOwner">صاحب كافيه</option>
                            </select>
                        </div>

                        {formData.role === 'CafeOwner' && (
                            <div className="auth-field">
                                <MdOutlineStorefront className="field-icon" />
                                <select name="cafeID" value={formData.cafeID} onChange={handleChange}
                                    className={errors.cafeID ? 'error-input' : ''}>
                                    <option value="">-- اختر الكافيه --</option>
                                    {cafes.map(cafe => (
                                        <option key={cafe.cafeID ?? cafe.CafeID} value={cafe.cafeID ?? cafe.CafeID}>
                                            {cafe.name ?? cafe.Name}
                                        </option>
                                    ))}
                                </select>
                                {errors.cafeID && <p className="field-error">{errors.cafeID}</p>}
                            </div>
                        )}

                        <button type="submit" className="auth-btn">تسجيل</button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Register;