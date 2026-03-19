import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaEdit } from 'react-icons/fa';
import api from '../../utils/api';
import DataTable from '../../components/common/DataTable';
import Spinner from '../../components/common/Spinner';

const API_BASE = '/roles';

export default function RoleList() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get(API_BASE)
            .then(({ data }) => {
                if (!cancelled) setRoles(data.data || []);
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || 'Failed to fetch roles');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const columns = [
        {
            header: 'Role',
            key: 'name',
            render: (row) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <FaUserShield className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{row.displayName}</div>
                        <div className="text-xs text-gray-500">{row.name}</div>
                    </div>
                </div>
            ),
        },
        { header: 'Description', key: 'description', render: (row) => row.description || '—' },
        {
            header: 'Type',
            key: 'type',
            render: (row) => (
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        row.isSystem ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}
                >
                    {row.isSystem ? 'System' : 'Custom'}
                </span>
            ),
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => navigate(`/app/roles/${row._id}`)}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                    <FaEdit className="mr-1 w-4 h-4" />
                    Manage Permissions
                </button>
            ),
        },
    ];

    if (loading && roles.length === 0) return <Spinner />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
                    <p className="text-gray-600">Manage user roles and permissions</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={roles}
                isLoading={loading}
                pagination={{ page: 1, limit: 100, total: roles.length, pages: 1 }}
                onPageChange={() => {}}
                onSearch={() => {}}
                searchTerm=""
                searchPlaceholder="Search roles..."
            />
        </div>
    );
}
