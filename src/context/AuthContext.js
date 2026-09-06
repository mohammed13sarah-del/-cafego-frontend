import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

const cleanId = (val) => {
    if (!val || val === 'undefined' || val === 'null') return null;
    const str = String(val).trim();
    return str.includes(':') ? str.split(':')[0] : str;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✅ عند كل تحميل للصفحة — امسح الجلسة بس ابقي الصور والبيانات المحفوظة
        ['token','userId','userName','role','activeCafeID','ownerCafes',
         'userFirstName','userLastName','userEmail','userPhone','userAddress']
            .forEach(k => localStorage.removeItem(k));
        setUser(null);
        setLoading(false);
    }, []);

    const login = ({ token, id, userName, role, cafeID }) => {
        const cleanCafeID = cleanId(cafeID);

        localStorage.setItem('token',    token);
        localStorage.setItem('userId',   id);
        localStorage.setItem('userName', userName);
        localStorage.setItem('role',     role);
        // ✅ احفظ الـ userId بمفتاح ثابت ما يتمسح — عشان الصورة تضل
        localStorage.setItem('Lavender_persistent_uid', String(id));

        if (cleanCafeID) {
            localStorage.setItem('activeCafeID', cleanCafeID);
        }

        setUser({
            loggedIn: true, token, id,
            name: userName, role,
            cafes: [],
            activeCafeID: cleanCafeID ? Number(cleanCafeID) : null,
            cafeID: cleanCafeID ? Number(cleanCafeID) : null,
        });
    };

    const setCafes = (cafesArray) => {
        localStorage.setItem('ownerCafes', JSON.stringify(cafesArray));

        const storedActive = localStorage.getItem('activeCafeID');
        const firstID      = cafesArray[0]?.cafeID ?? null;

        const isValid  = storedActive && cafesArray.some(c => c.cafeID === Number(storedActive));
        const activeID = isValid ? Number(storedActive) : firstID;

        if (!isValid && firstID) {
            localStorage.setItem('activeCafeID', String(firstID));
        }

        setUser(prev => ({
            ...prev,
            cafes: cafesArray,
            activeCafeID: activeID,
            cafeID: activeID,
        }));
    };

    const switchCafe = (cafeID) => {
        localStorage.setItem('activeCafeID', cafeID);
        setUser(prev => ({
            ...prev,
            activeCafeID: Number(cafeID),
            cafeID: Number(cafeID),
        }));
    };

    const updateUser = (updated) => {
        if (updated.firstName !== undefined) localStorage.setItem('userFirstName', updated.firstName);
        if (updated.lastName  !== undefined) localStorage.setItem('userLastName',  updated.lastName);
        if (updated.email     !== undefined) localStorage.setItem('userEmail',     updated.email);
        if (updated.phone     !== undefined) localStorage.setItem('userPhone',     updated.phone);
        if (updated.address   !== undefined) localStorage.setItem('userAddress',   updated.address);

        if (updated.firstName || updated.lastName) {
            const fullName = [updated.firstName, updated.lastName].filter(Boolean).join(' ');
            localStorage.setItem('userName', fullName);
        }

        setUser(prev => ({ ...prev, ...updated }));
    };

    const logout = () => {
        ['token','userId','userName','role','activeCafeID','ownerCafes',
         'userFirstName','userLastName','userEmail','userPhone','userAddress',
         'sidebar_pinned']
            .forEach(k => localStorage.removeItem(k));
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, setCafes, switchCafe, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);