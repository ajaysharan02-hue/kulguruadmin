import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { navSections } from '../../config/navigation';
import {
    FaBars,
    FaTimes,
    FaGraduationCap,
    FaSearch,
    FaBell,
    FaCog,
    FaSignOutAlt,
    FaUser,
    FaChevronDown,
    FaChevronRight,
} from 'react-icons/fa';
import Toaster from '../common/Toaster';

export default function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [openSections, setOpenSections] = useState(() =>
        navSections.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
    );
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const userMenuRef = useRef(null);
    const notifRef = useRef(null);

    const role = user?.role || '';

    useEffect(() => {
        const close = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const toggleSection = (id) => {
        setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const isItemActive = (path) => {
        if (location.pathname === path) return true;
        if (path !== '/app' && location.pathname.startsWith(path + '/')) return true;
        return false;
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50/80">
            <Toaster />
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col bg-white border-r border-gray-200/80 shadow-sm ${
                    sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
                }`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 shrink-0 bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <div className="flex items-center gap-3 text-white min-w-0">
                        <FaGraduationCap className="text-2xl shrink-0" />
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold leading-tight truncate">Kulguru Solution Point</h1>
                            <p className="text-xs opacity-90 uppercase tracking-wider">Programs Management</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-white/80 hover:text-white rounded-lg"
                        aria-label="Close menu"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
                    {navSections.map((section) => {
                        const sectionAllowed = !section.roles || section.roles.includes(role);
                        if (!sectionAllowed) return null;

                        const visibleItems = section.items.filter(
                            (item) => !item.roles || item.roles.includes(role)
                        );
                        if (visibleItems.length === 0) return null;

                        const isOpen = openSections[section.id];
                        const hasActive = visibleItems.some((item) => isItemActive(item.path));

                        return (
                            <div key={section.id} className="mb-1">
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 rounded-lg"
                                >
                                    <span>{section.label}</span>
                                    {isOpen ? (
                                        <FaChevronDown className="w-3 h-3" />
                                    ) : (
                                        <FaChevronRight className="w-3 h-3" />
                                    )}
                                </button>
                                {isOpen && (
                                    <div className="space-y-0.5 mt-0.5">
                                        {visibleItems.map((item) => {
                                            const active = isItemActive(item.path);
                                            return (
                                                <button
                                                    key={item.path}
                                                    type="button"
                                                    onClick={() => {
                                                        navigate(item.path);
                                                        if (window.innerWidth < 1024) setSidebarOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                        active
                                                            ? 'bg-indigo-50 text-indigo-700'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                                >
                                                    <item.icon
                                                        className={`w-5 h-5 shrink-0 ${
                                                            active ? 'text-indigo-600' : 'text-gray-400'
                                                        }`}
                                                    />
                                                    <span className="truncate">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">School Management System</p>
                    <p className="text-xs text-gray-500 mt-0.5">v2.0</p>
                </div>
            </aside>

            {/* Main area */}
            <div
                className={`transition-all duration-300 min-h-screen flex flex-col ${
                    sidebarOpen ? 'lg:ml-64' : 'ml-0'
                }`}
            >
                <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-gray-200/80 flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((o) => !o)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Toggle sidebar"
                        >
                            <FaBars className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-56 lg:w-72 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-colors">
                            <FaSearch className="text-gray-400 w-4 h-4 shrink-0 mr-2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                onClick={() => setNotificationOpen(!notificationOpen)}
                                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <FaBell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
                            </button>
                            {notificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">Notifications</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-2">
                                        <p className="text-sm text-gray-500 text-center py-6">No new notifications</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                                    {user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-800 leading-tight truncate max-w-[120px]">
                                        {user?.email?.split('@')[0] || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize leading-tight">
                                        {role?.replace('_', ' ')}
                                    </p>
                                </div>
                                <FaChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                            </button>
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate('/app/settings');
                                            setUserMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <FaCog className="text-gray-400" />
                                        Settings
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate('/app/settings');
                                            setUserMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <FaUser className="text-gray-400" />
                                        Profile
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <FaSignOutAlt />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden
                />
            )}
        </div>
    );
}
