import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FaCoffee, FaChevronDown, FaCheck, FaPlus } from 'react-icons/fa';

// ─── Cafe Switcher — يظهر في الهيدر لصاحب الكافيه فقط ───────────────────────
const CafeSwitcher = () => {
    const { user, setCafes, switchCafe } = useAuth();
    const [open, setOpen]   = useState(false);
    const ref               = useRef();

    // ── دالة ذكية وموحدة للتحقق من حالة الكافيه (مفتوح / مغلق) ─────────────────
    const checkIsOpen = (cafe) => {
        if (!cafe) return false;
        // الفحص يدعم 'Open' أو 'approved' وبشرط ألا يكون الكافيه محظوراً من الأدمن
        return (cafe.status === 'Open' || cafe.status === 'approved') && !cafe.isBlockedByAdmin;
    };

    // ── جلب قائمة الكافيهات من الـ API دايماً عند الـ mount ─────────────────
    useEffect(() => {
        if (!user?.id || user.role !== 'CafeOwner') return;

        api.get(`/Cafes/by-owner/${user.id}`)
            .then(({ data }) => {
                const raw  = Array.isArray(data) ? data : [data];
                const list = raw.map(c => ({
                    ...c, // 🌟 ننسخ جميع البيانات القادمة لضمان عدم ضياع حقول مثل isBlockedByAdmin
                    cafeID: c.cafeID  ?? c.CafeID,
                    name:   c.name    ?? c.Name    ?? 'كافيه',
                    status: c.status  ?? c.Status  ?? '',
                }));
                setCafes(list);
            })
            .catch(() => {});
    }, [user?.id]);

    // ── إغلاق عند الضغط خارج القائمة ────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (user?.role !== 'CafeOwner') return null;

    const cafes      = user.cafes ?? [];
    const activeCafe = cafes.find(c => c.cafeID === user.activeCafeID) ?? cafes[0];

    // لو كافيه وحدة فقط — اعرض اسمها بدون switcher
    if (cafes.length <= 1) {
        const isOpen = checkIsOpen(activeCafe);
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 8,
                background: 'rgba(200,168,130,0.12)',
                border: '1px solid rgba(200,168,130,0.2)',
            }}>
                <FaCoffee size={11} color="#c8a882" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#c8a882' }}>
                    {activeCafe?.name ?? 'كافيهي'}
                </span>
                <span style={{
                    fontSize: 9, padding: '1px 6px', borderRadius: 10,
                    background: isOpen ? 'rgba(46,125,50,.3)' : 'rgba(198,40,40,.3)',
                    color: isOpen ? '#a5d6a7' : '#ef9a9a',
                    fontWeight: 700,
                }}>
                    {isOpen ? 'مفتوح' : 'مغلق'}
                </span>
            </div>
        );
    }

    // لو أكثر من كافيه — اعرض قائمة منسدلة
    const activeIsOpen = checkIsOpen(activeCafe);
    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Trigger */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '6px 12px', borderRadius: 9, cursor: 'pointer',
                    background: 'rgba(200,168,130,0.12)',
                    border: '1px solid rgba(200,168,130,0.25)',
                    color: '#c8a882', fontFamily: "'Cairo',sans-serif",
                    transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,168,130,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,168,130,0.12)'}
            >
                <FaCoffee size={11} />
                <span style={{ fontSize: 12, fontWeight: 700, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeCafe?.name ?? 'اختر كافيه'}
                </span>
                {activeCafe && (
                    <span style={{
                        fontSize: 8, padding: '1px 5px', borderRadius: 8,
                        background: activeIsOpen ? 'rgba(46,125,50,.35)' : 'rgba(198,40,40,.35)',
                        color: activeIsOpen ? '#a5d6a7' : '#ef9a9a',
                        fontWeight: 700,
                    }}>
                        {activeIsOpen ? 'مفتوح' : 'مغلق'}
                    </span>
                )}
                <FaChevronDown size={9} style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    minWidth: 200, background: '#1c1917',
                    border: '1px solid rgba(200,168,130,0.2)',
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    zIndex: 2000, direction: 'rtl',
                }}>
                    <div style={{ padding: '8px 12px', fontSize: 9, fontWeight: 800, color: '#a0785a', letterSpacing: 1.5, borderBottom: '1px solid rgba(200,168,130,0.1)' }}>
                        كافيهاتي
                    </div>
                    {cafes.map(cafe => {
                        const isActive = cafe.cafeID === user.activeCafeID;
                        const itemIsOpen = checkIsOpen(cafe);
                        return (
                            <div
                                key={cafe.cafeID}
                                onClick={() => { switchCafe(cafe.cafeID); setOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 14px', cursor: 'pointer',
                                    background: isActive ? 'rgba(200,168,130,0.12)' : 'transparent',
                                    borderBottom: '1px solid rgba(200,168,130,0.06)',
                                    transition: 'background .12s',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(200,168,130,0.07)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{
                                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                    background: isActive ? 'linear-gradient(135deg,#c8a882,#a0785a)' : 'rgba(200,168,130,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <FaCoffee size={12} color={isActive ? '#1a110e' : '#c8a882'} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#f5deb3' : '#d7ccc8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {cafe.name}
                                    </div>
                                    <div style={{
                                        fontSize: 10, fontWeight: 600, marginTop: 1,
                                        color: itemIsOpen ? '#81c784' : '#e57373',
                                    }}>
                                        {itemIsOpen ? '🟢 مفتوح' : '🔴 مغلق'}
                                    </div>
                                </div>
                                {isActive && <FaCheck size={11} color="#c8a882" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CafeSwitcher;