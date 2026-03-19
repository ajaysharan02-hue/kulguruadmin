import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import {
    FaImage,
    FaBook,
    FaQuestionCircle,
    FaUserShield,
    FaCog,
} from 'react-icons/fa';

const quickLinks = [
    { label: 'Banners', path: '/app/banners', icon: FaImage, color: 'from-blue-500 to-blue-600' },
    { label: 'Programs', path: '/app/programs', icon: FaBook, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Inquiries', path: '/app/inquiries', icon: FaQuestionCircle, color: 'from-violet-500 to-violet-600' },
    { label: 'Roles & Permissions', path: '/app/roles', icon: FaUserShield, color: 'from-amber-500 to-amber-600' },
    { label: 'Settings', path: '/app/settings', icon: FaCog, color: 'from-gray-500 to-gray-600' },
];

export default function AdminDashboard() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const name = user?.email?.split('@')[0] || 'Admin';

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Welcome back, ${name}!`}
                subtitle="Manage your content and settings from here."
            />

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <h2 className="px-6 py-4 text-lg font-semibold text-gray-900 border-b border-gray-100">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
                    {quickLinks.map((item) => (
                        <button
                            key={item.path}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left"
                        >
                            <div
                                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-3`}
                            >
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-800">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
