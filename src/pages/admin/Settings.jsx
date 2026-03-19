import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaLock, FaPalette, FaSave, FaCog } from 'react-icons/fa';
import api from '../../utils/api';
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
    const [generalSettings, setGeneralSettings] = useState({});
    const [generalLoading, setGeneralLoading] = useState(false);
    const [generalSaving, setGeneralSaving] = useState(false);
    const [generalError, setGeneralError] = useState(null);

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
            api.get('/settings')
                .then(({ data }) => setGeneralSettings(data.data || {}))
                .catch(() => setGeneralSettings({}))
                .finally(() => setGeneralLoading(false));
        }
    }, [activeTab, dispatch]);

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
        api.put('/settings', { settings: generalSettings })
            .then(({ data }) => setGeneralSettings(data.data || {}))
            .catch((err) => setGeneralError(err.response?.data?.message || 'Failed to save'))
            .finally(() => setGeneralSaving(false));
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
                                    <div className="space-y-4 max-w-lg">
                                        <p className="text-sm text-gray-500">
                                            Site-wide key-value settings. Add or edit keys as needed.
                                        </p>
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. siteName"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const key = e.target.value?.trim();
                                                            if (key && !generalSettings[key]) {
                                                                setGeneralSettings((prev) => ({ ...prev, [key]: '' }));
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {Object.entries(generalSettings).map(([key, value]) => (
                                                <div key={key} className="flex gap-2 items-center">
                                                    <span className="text-sm font-medium text-gray-700 w-32 truncate">{key}</span>
                                                    <input
                                                        type="text"
                                                        value={typeof value === 'string' ? value : JSON.stringify(value)}
                                                        onChange={(e) => setGeneralSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setGeneralSettings((prev) => {
                                                            const next = { ...prev };
                                                            delete next[key];
                                                            return next;
                                                        })}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSaveGeneral}
                                            disabled={generalSaving}
                                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <FaSave />
                                            <span>{generalSaving ? 'Saving...' : 'Save Settings'}</span>
                                        </button>
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
