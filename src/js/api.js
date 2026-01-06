const API_URL = 'http://localhost:5001/api';

export const auth = {
    login: async (loginInput, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loginInput, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { ok: res.ok, data };
    },

    register: async (username, email, password) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { ok: res.ok, data };
    },

    googleLogin: async (token) => {
        console.log('Sending Google token to backend...');
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await res.json();
        console.log('Backend response:', data);
        if (res.ok) {
            console.log('Login successful, saving token:', data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        } else {
            console.error('Login failed:', data);
        }
        return { ok: res.ok, data };
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated: () => !!localStorage.getItem('token'),
    getUser: () => JSON.parse(localStorage.getItem('user'))
};

export const game = {
    saveResult: async (resultData) => {
        const token = localStorage.getItem('token');
        console.log('[API] Saving result. Token exists?', !!token);
        if (!token) {
            console.error('[API] No token found, aborting save.');
            return;
        }

        console.log('[API] Sending payload:', resultData);
        try {
            const res = await fetch(`${API_URL}/game/result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(resultData)
            });
            const data = await res.json();
            console.log('[API] Save response:', res.status, data);
            return data;
        } catch (e) {
            console.error('[API] Save error:', e);
            throw e;
        }
    },

    getProfile: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const res = await fetch(`${API_URL}/user/profile`, {
            headers: { 'x-auth-token': token }
        });
        return await res.json();
    }
};
