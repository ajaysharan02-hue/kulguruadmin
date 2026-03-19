import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import {
    FaHome,
    FaBell,
    FaCog,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaGraduationCap,
    FaUserShield,
    FaUser,
    FaSearch,
} from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
                setNotificationMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const menuItems = [
        { icon: FaHome, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: FaUserShield, label: 'Roles & Permissions', path: '/admin/roles', roles: ['super_admin', 'school_admin', 'admin'] },
    ];
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } bg-white shadow-xl w-64 flex flex-col`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 bg-primary-600">
                    <div className="flex items-center space-x-3 text-white">
                        <FaGraduationCap className="text-2xl" />
                        <div>
                            <h2 className="text-lg font-bold leading-none">Kulguru Solution Point</h2>
                            <p className="text-[10px] opacity-80 uppercase tracking-wider">Management</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-white/80 hover:text-white"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Menu</div>
                    {menuItems.filter(item => !item.roles || (user && item.roles.includes(user.role))).map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${location.pathname === item.path
                                ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`text-lg transition-transform group-hover:scale-110 ${location.pathname === item.path ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                                }`} />
                            <span>{item.label}</span>
                        </button>
                    ))}

                 
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-center text-gray-400">© 2026 EduSmart v1.0</p>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className={`transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? 'lg:ml-64' : 'ml-0'
                    }`}
            >
                {/* Header */}
                <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200/50 backdrop-blur-sm bg-white/90">
                    <div className="flex items-center justify-between px-6 h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-500 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                            >
                                <FaBars className="text-xl" />
                            </button>

                            {/* Search bar placeholder */}
                            <div className="hidden md:flex items-center ml-6 bg-gray-100 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-primary-300 focus-within:bg-white transition-all">
                                <FaSearch className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-700 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Notifications Dropdown */}
                            <div className="relative" ref={notificationMenuRef}>
                                <button
                                    onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                                    className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaBell className="text-xl" />
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                                </button>

                                {notificationMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn origin-top-right">
                                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                                            <span className="text-xs text-primary-600 cursor-pointer hover:underline">Mark all read</span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none">
                                                    <div className="flex items-start">
                                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                            <FaBell className="text-xs" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm text-gray-800 font-medium">New Student Registered</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">John Doe added to Class 10-A</p>
                                                            <p className="text-[10px] text-gray-400 mt-1">2 mins ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-100 text-center">
                                            <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">View All</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile Dropdown */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                                        {user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-gray-700 leading-none">{user?.email?.split('@')[0]}</p>
                                        <p className="text-[10px] text-gray-500 capitalize leading-none mt-1">{user?.role?.replace('_', ' ')}</p>
                                    </div>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fadeIn origin-top-right">
                                        <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                                            <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigate('/admin/settings');
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <FaUser className="text-gray-400" />
                                            <span>Profile</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/admin/settings');
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <FaCog className="text-gray-400" />
                                            <span>Settings</span>
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                        >
                                            <FaSignOutAlt />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-0 overflow-x-hidden">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default DashboardLayout;
