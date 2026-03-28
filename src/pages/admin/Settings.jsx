import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaLock, FaPalette, FaSave, FaCog } from 'react-icons/fa';
import api from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import { getMe } from '../../features/auth/authSlice';

const Settings = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        role: user?.role || '',
    });
    const { settings: ctxSettings, setSettings: setCtxSettings } = useSettings();
    const [generalSettings, setGeneralSettings] = useState({});
    const [generalLoading, setGeneralLoading] = useState(false);
    const [generalSaving, setGeneralSaving] = useState(false);
    const [generalError, setGeneralError] = useState(null);
    const [generalMessage, setGeneralMessage] = useState(null);
    const logoInputRef = useRef(null);

    useEffect(() => {
        if (activeTab === 'profile') {
            setProfileLoading(true);
            setProfileError(null);
            dispatch(getMe())
                .unwrap()
                .then((me) => {
                    setProfileForm({
                        name: me?.name || '',
                        phone: me?.phone || '',
                        email: me?.email || '',
                        role: me?.role || '',
                    });
                })
                .catch((e) => setProfileError(String(e || 'Failed to load profile')))
                .finally(() => setProfileLoading(false));
        }
        if (activeTab === 'general') {
            setGeneralLoading(true);
            setGeneralError(null);
            // Load from context first (already fetched globally)
            setGeneralSettings(ctxSettings || {});
            setGeneralLoading(false);
        }
    }, [activeTab, dispatch, ctxSettings]);

    const handleSaveProfile = () => {
        const id = user?._id || user?.id;
        if (!id) {
            setProfileError('User ID not found. Please logout and login again.');
            return;
        }
        setProfileSaving(true);
        setProfileError(null);
        api.put(`/users/${id}`, { name: profileForm.name, phone: profileForm.phone })
            .then(() => dispatch(getMe()))
            .catch((err) => setProfileError(err.response?.data?.message || 'Failed to update profile'))
            .finally(() => setProfileSaving(false));
    };

    const handlePickAvatar = () => {
        setProfileError(null);
        fileInputRef.current?.click();
    };

    const handleAvatarSelected = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            setProfileError('Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setProfileError('Image must be under 5MB.');
            return;
        }

        const id = user?._id || user?.id;
        if (!id) {
            setProfileError('User ID not found. Please logout and login again.');
            return;
        }

        setAvatarUploading(true);
        setProfileError(null);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await api.post('/upload/avatar', fd);
            const url = res.data?.data?.url;
            if (!url) throw new Error('Upload failed');
            await api.put(`/users/${id}`, { profilePicture: url });
            await dispatch(getMe()).unwrap();
        } catch (err) {
            setProfileError(err.response?.data?.message || err.message || 'Failed to upload avatar');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleSaveGeneral = () => {
        setGeneralSaving(true);
        setGeneralError(null);
        setGeneralMessage(null);
        api.put('/settings', { settings: generalSettings })
            .then(({ data }) => {
                const next = data.data || {};
                setGeneralSettings(next);
                setCtxSettings(next);
            })
            .then(() => setGeneralMessage('Settings saved.'))
            .catch((err) => setGeneralError(err.response?.data?.message || 'Failed to save'))
            .finally(() => setGeneralSaving(false));
    };

    const handlePickLogo = () => {
        logoInputRef.current?.click();
    };

    const handleLogoSelected = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            setGeneralError('Please select an image file.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setGeneralError('Image must be under 5MB.');
            return;
        }
        setGeneralError(null);
        setGeneralMessage(null);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await api.post('/upload/logo', fd);
            const url = res.data?.data?.url;
            if (!url) throw new Error('Upload failed');
            setGeneralSettings((prev) => ({ ...prev, logoUrl: url }));
            setCtxSettings((prev) => ({ ...(prev || {}), logoUrl: url }));
            setGeneralMessage('Logo uploaded.');
        } catch (err) {
            setGeneralError(err.response?.data?.message || err.message || 'Failed to upload logo');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col md:flex-row">
                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100">
                    <nav className="flex flex-col p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'profile'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FaUser />
                            <span>Profile</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'security'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FaLock />
                            <span>Security</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('appearance')}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'appearance'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FaPalette />
                            <span>Appearance</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === 'general'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <FaCog />
                            <span>General Settings</span>
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Profile Settings</h2>

                            {profileError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                                    {profileError}
                                </div>
                            )}

                            <div className="flex items-center space-x-6 mb-8">
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-blue-100 flex items-center justify-center">
                                    {user?.profilePicture ? (
                                        <img
                                            src={
                                                user.profilePicture.startsWith('http')
                                                    ? user.profilePicture
                                                    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profilePicture}`
                                            }
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-blue-600 text-3xl font-bold">
                                            {user?.email?.[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarSelected}
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePickAvatar}
                                        disabled={avatarUploading}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        {avatarUploading ? 'Uploading...' : 'Change Avatar'}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 5MB</p>
                                </div>
                            </div>

                            <form className="space-y-4 max-w-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                                            disabled={profileLoading || profileSaving}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                                            disabled={profileLoading || profileSaving}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <input
                                        type="text"
                                        value={profileForm.role?.replace('_', ' ') || ''}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize cursor-not-allowed"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={profileLoading || profileSaving}
                                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                                    >
                                        <FaSave />
                                        <span>{profileSaving ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Security Settings</h2>

                            <form className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button type="button" className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                                        <FaSave />
                                        <span>Update Password</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">App Appearance</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                                    <div className="grid grid-cols-2 gap-4 max-w-md">
                                        <div className="border-2 border-blue-500 rounded-lg p-3 cursor-pointer bg-blue-50">
                                            <div className="h-20 bg-white border border-gray-200 rounded mb-2"></div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-blue-700">Light Mode</span>
                                                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                            </div>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                                            <div className="h-20 bg-gray-800 rounded mb-2"></div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-600">Dark Mode</span>
                                                <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Dark mode is coming soon.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                    <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* General Settings Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">General Settings</h2>
                            {generalLoading ? (
                                <p className="text-gray-500">Loading...</p>
                            ) : (
                                <>
                                    {generalError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                                            {generalError}
                                        </div>
                                    )}
                                    <div className="space-y-6">
                                        {/* Branding */}
                                        <div className="space-y-3 max-w-2xl">
                                            <h3 className="text-lg font-semibold text-gray-800">Branding</h3>
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-md border bg-white overflow-hidden flex items-center justify-center">
                                                    {generalSettings.logoUrl ? (
                                                        <img
                                                            src={
                                                                generalSettings.logoUrl.startsWith('http')
                                                                    ? generalSettings.logoUrl
                                                                    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${generalSettings.logoUrl}`
                                                            }
                                                            alt="Logo"
                                                            className="w-full h-full object-contain p-1"
                                                        />
                                                    ) : (
                                                        <div className="text-xs text-gray-400">No Logo</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <input
                                                        ref={logoInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleLogoSelected}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handlePickLogo}
                                                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Upload Logo
                                                    </button>
                                                    <p className="text-xs text-gray-500 mt-1">PNG/JPG up to 5MB. URL is set automatically after upload.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.brandName || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, brandName: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Institute Name</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.instituteName || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, instituteName: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact */}
                                        <div className="space-y-3 max-w-2xl">
                                            <h3 className="text-lg font-semibold text-gray-800">Contact</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.phone || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, phone: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.contactPhone || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, contactPhone: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
                                                    <input
                                                        type="email"
                                                        value={generalSettings.email || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, email: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                                    <input
                                                        type="email"
                                                        value={generalSettings.contactEmail || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, contactEmail: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                    <textarea
                                                        rows={3}
                                                        value={generalSettings.address || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, address: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* WhatsApp */}
                                        <div className="space-y-3 max-w-2xl">
                                            <h3 className="text-lg font-semibold text-gray-800">Social Media</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (+91...)</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.whatsapp || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, whatsapp: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.facebook  || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, facebook: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.twitter || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, twitter: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.instagram  || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, instagram: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.linkedin || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, linkedin: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL (optional)</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.youtube  || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, youtube: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* UI Preferences */}
                                        <div className="space-y-3 max-w-2xl">
                                            <h3 className="text-lg font-semibold text-gray-800">Preferences</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                                                    <select
                                                        value={generalSettings.theme || 'light'}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, theme: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    >
                                                        <option value="light">Light</option>
                                                        <option value="dark">Dark</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.language || 'en'}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, language: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.timezone || 'Asia/Kolkata'}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, timezone: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SMTP */}
                                        <div className="space-y-3 max-w-2xl">
                                            <h3 className="text-lg font-semibold text-gray-800">SMTP</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.smtpHost || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, smtpHost: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.smtpPort ?? 587}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, smtpPort: Number(e.target.value || 0) }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.smtpUser || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, smtpUser: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                                    <input
                                                        type="password"
                                                        value={generalSettings.smtpPass || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, smtpPass: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        id="smtpSecure"
                                                        type="checkbox"
                                                        checked={Boolean(generalSettings.smtpSecure)}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, smtpSecure: e.target.checked }))}
                                                        className="h-4 w-4"
                                                    />
                                                    <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">Use TLS/SSL</label>
                                                </div>
                                                <div />
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                                                    <input
                                                        type="text"
                                                        value={generalSettings.smtpFromName || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, smtpFromName: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                                                    <input
                                                        type="email"
                                                        value={generalSettings.smtpFromEmail || ''}
                                                        onChange={(e) => setGeneralSettings((p) => ({ ...p, smtpFromEmail: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={handleSaveGeneral}
                                                disabled={generalSaving}
                                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                <FaSave />
                                                <span>{generalSaving ? 'Saving...' : 'Save Settings'}</span>
                                            </button>
                                            {generalMessage && (
                                                <span className="ml-3 text-sm text-green-700">{generalMessage}</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
