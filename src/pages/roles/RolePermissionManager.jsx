import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';

const API_BASE = '/roles';

// Resources aligned with backend modules
const RESOURCES = ['banner', 'inquire', 'notification', 'program', 'role', 'user', 'setting'];
const ACTIONS = ['create', 'read', 'update', 'delete'];

export default function RolePermissionManager() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.get(`${API_BASE}/${id}`)
            .then(({ data }) => {
                setRole(data.data);
                setPermissions(data.data?.permissions || []);
            })
            .catch((err) => setError(err.response?.data?.message || 'Failed to load role'))
            .finally(() => setLoading(false));
    }, [id]);

    const hasPermission = (resource, action) => {
        const perm = permissions.find((p) => p.resource === resource);
        if (!perm) return false;
        if (perm.actions.includes('*')) return true;
        return perm.actions.includes(action);
    };

    const handlePermissionChange = (resource, action) => {
        setPermissions((prev) => {
            const next = [...prev];
            const idx = next.findIndex((p) => p.resource === resource);
            if (idx === -1) {
                next.push({ resource, actions: [action] });
                return next;
            }
            const entry = { ...next[idx], actions: [...next[idx].actions] };
            if (entry.actions.includes(action)) {
                entry.actions = entry.actions.filter((a) => a !== action);
                if (entry.actions.length === 0) {
                    next.splice(idx, 1);
                    return next;
                }
            } else {
                entry.actions.push(action);
            }
            next[idx] = entry;
            return next;
        });
    };

    const handleSelectAll = (resource) => {
        setPermissions((prev) => {
            const idx = prev.findIndex((p) => p.resource === resource);
            const hasAll = idx !== -1 && prev[idx].actions.length === ACTIONS.length;
            if (hasAll) {
                return prev.filter((p) => p.resource !== resource);
            }
            const next = prev.filter((p) => p.resource !== resource);
            next.push({ resource, actions: [...ACTIONS] });
            return next;
        });
    };

    const handleWildcard = (checked) => {
        if (checked) {
            setPermissions([{ resource: '*', actions: ['*'] }]);
        } else {
            setPermissions([]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await api.put(`${API_BASE}/${id}`, {
                displayName: role?.displayName,
                description: role?.description,
                permissions,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !role) return <Spinner />;
    if (error && !role) {
        return (
            <div className="p-6">
                <p className="text-red-600">{error}</p>
                <button type="button" onClick={() => navigate('/app/roles')} className="mt-4 text-indigo-600">
                    Back to Roles
                </button>
            </div>
        );
    }

    const hasWildcard = permissions.some((p) => p.resource === '*' && p.actions.includes('*'));

    return (
        <div className="p-6">
            <button
                type="button"
                onClick={() => navigate('/app/roles')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <FaArrowLeft className="mr-2" /> Back to Roles
            </button>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Permissions: <span className="text-indigo-600">{role?.displayName}</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Toggle permissions for each resource. Save to apply.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    <FaSave className="mr-2" /> {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 border border-green-200">
                    Permissions updated successfully.
                </div>
            )}
            {error && role && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
                    {error}
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-blue-900">Full system access (Super Admin)</h3>
                    <p className="text-sm text-blue-700">
                        Grant this role unrestricted access to all resources. Use with caution.
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={hasWildcard}
                        onChange={(e) => handleWildcard(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600" />
                </label>
            </div>

            <div className={`rounded-xl border border-gray-100 overflow-hidden ${hasWildcard ? 'opacity-50 pointer-events-none' : ''}`}>
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase w-1/4">Resource</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions (CRUD)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {RESOURCES.map((resource) => (
                            <tr key={resource} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={permissions.find((p) => p.resource === resource)?.actions?.length === ACTIONS.length}
                                            onChange={() => handleSelectAll(resource)}
                                            className="mr-3 h-4 w-4 text-indigo-600 rounded border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-gray-700 capitalize">{resource}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-6">
                                        {ACTIONS.map((action) => (
                                            <label key={action} className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hasPermission(resource, action)}
                                                    onChange={() => handlePermissionChange(resource, action)}
                                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-600 capitalize">{action}</span>
                                            </label>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
