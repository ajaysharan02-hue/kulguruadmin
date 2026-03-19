/**
 * Central navigation config for the school management panel.
 * All paths are under /app. Roles: super_admin, school_admin, admin, teacher, accountant, librarian
 */
import {
    FaHome,
    FaClipboardList,
    FaUserShield,
    FaCog,
    FaBook,
    FaQuestionCircle,
    FaAffiliatetheme,
} from 'react-icons/fa';

const BASE = '/app';

export const navSections = [
    {
        id: 'main',
        label: 'Main',
        roles: null,
        items: [
            { path: `${BASE}/dashboard`, label: 'Dashboard', icon: FaHome, roles: null },
        ],
    },
    {
        id: 'admin',
        label: 'Administration',
        roles: ['super_admin', 'school_admin', 'admin'],
        items: [
            { path: `${BASE}/banners`, label: 'Banners', icon: FaAffiliatetheme, roles: null },
            { path: `${BASE}/programs`, label: 'Programs', icon: FaBook, roles: null },
            { path: `${BASE}/inquiries`, label: 'Inquiries', icon: FaQuestionCircle, roles: null },
            { path: `${BASE}/roles`, label: 'Roles & Permissions', icon: FaUserShield, roles: null },
        ],
    },
    {
        id: 'settings',
        label: 'Settings',
        roles: null,
        items: [
            { path: `${BASE}/settings`, label: 'Settings', icon: FaCog, roles: null },
        ],
    },
];

/** Flat list of all paths for role filtering */
export function getMenuItemsForRole(role) {
    const items = [];
    navSections.forEach((section) => {
        const sectionVisible = !section.roles || section.roles.includes(role);
        if (!sectionVisible) return;
        section.items.forEach((item) => {
            const itemVisible = !item.roles || item.roles.includes(role);
            if (itemVisible) {
                items.push({ ...item, sectionLabel: section.label });
            }
        });
    });
    return items;
}

/** Get path for role after login */
export function getDashboardPathForRole(role) {
    const map = {
        super_admin: `${BASE}/dashboard`,
        school_admin: `${BASE}/dashboard`,
        admin: `${BASE}/dashboard`,
        teacher: `${BASE}/dashboard`,
        accountant: `${BASE}/dashboard`,
        librarian: `${BASE}/dashboard`,
        student: '/student/dashboard',
        parent: '/parent/dashboard',
    };
    return map[role] || `${BASE}/dashboard`;
}
