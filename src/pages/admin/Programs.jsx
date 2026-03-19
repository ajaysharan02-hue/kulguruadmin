import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../utils/api';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';

const API_BASE = '/programs';

export default function Programs() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        pages: 1,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchPrograms = useCallback(async (page = 1, limit = 10, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(API_BASE, {
                params: { page, limit, ...(search && { search }) },
            });
            setPrograms(data.data || []);
            const p = data.pagination || {};
            setPagination({
                page: p.page || 1,
                limit: p.limit || 10,
                total: p.total ?? 0,
                totalPages: p.totalPages ?? 1,
                pages: p.totalPages ?? 1,
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch programs');
            setPrograms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrograms(pagination.page, pagination.limit, searchTerm);
    }, [pagination.page, pagination.limit, searchTerm, fetchPrograms]);

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleDelete = (program) => {
        setSelectedProgram(program);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedProgram) return;
        setDeleting(true);
        try {
            await api.delete(`${API_BASE}/${selectedProgram._id}`);
            setShowDeleteModal(false);
            setSelectedProgram(null);
            fetchPrograms(pagination.page, pagination.limit, searchTerm);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Program',
            sortable: true,
            render: (row) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">
                            {row.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{row.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {row.description ? `${row.description.substring(0, 50)}${row.description.length > 50 ? '…' : ''}` : '—'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'code',
            header: 'Code',
            render: (row) => (
                <span className="text-sm font-mono text-gray-700">{row.code || '—'}</span>
            ),
        },
        {
            key: 'duration',
            header: 'Duration',
            render: (row) => (
                <span className="text-sm text-gray-900">{row.duration || '—'}</span>
            ),
        },
        {
            key: 'fee',
            header: 'Fee',
            render: (row) => (
                <span className="text-sm text-gray-900">
                    {row.fee != null ? `₹${Number(row.fee).toLocaleString()}` : '—'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (row) => (
                <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {row.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Link
                        to={`${row._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit"
                    >
                        <FaEdit className="w-4 h-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                    >
                        <FaTrash className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    if (loading && programs.length === 0) {
        return <Spinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title="Programs"
                subtitle="Manage educational programs and courses"
                actions={
                    <Link
                        to="new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <FaPlus className="w-4 h-4 mr-2" />
                        Add Program
                    </Link>
                }
            />

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={programs}
                    isLoading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    searchPlaceholder="Search programs..."
                />
            </div>

            {showDeleteModal && selectedProgram && (
                <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Program</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to delete &quot;{selectedProgram.name}&quot;? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => { setShowDeleteModal(false); setSelectedProgram(null); }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
