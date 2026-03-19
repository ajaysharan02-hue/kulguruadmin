import axios from 'axios';
import { toast } from './toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies (refresh token)
});

// Request interceptor: auth token + FormData handling
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Let axios set Content-Type (with boundary) for FormData; don't force application/json
        if (config.data && typeof FormData !== 'undefined' && config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        const method = response?.config?.method?.toLowerCase();
        const url = response?.config?.url || '';
        const isMutating = ['post', 'put', 'patch', 'delete'].includes(method);
        const skip =
            url.includes('/auth/login') ||
            url.includes('/auth/refresh-token') ||
            url.includes('/auth/logout');

        if (isMutating && !skip) {
            const msg =
                response?.data?.message ||
                response?.data?.data?.message ||
                (method === 'delete' ? 'Deleted successfully.' : 'Saved successfully.');
            toast.success(msg, { title: 'Success' });
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const method = originalRequest?.method?.toLowerCase();
        const url = originalRequest?.url || '';
        const isMutating = ['post', 'put', 'patch', 'delete'].includes(method);
        const skip =
            url.includes('/auth/login') ||
            url.includes('/auth/refresh-token') ||
            url.includes('/auth/logout');

        // If error is 401 and we haven't retried yet, AND request is not for login
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const response = await axios.post(
                    `${API_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        if (isMutating && !skip) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Request failed. Please try again.';
            toast.error(msg, { title: 'Failed' });
        }

        return Promise.reject(error);
    }
);

export default api;
