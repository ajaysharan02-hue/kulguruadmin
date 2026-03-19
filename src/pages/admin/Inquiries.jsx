import { useState, useEffect, useCallback } from 'react';
import { FaEye, FaTrash, FaFilter } from 'react-icons/fa';
import api from '../../utils/api';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

const API_BASE = '/inquiries';
const PROGRAMS_API = '/programs';

export default function Inquiries() {
    const [inquiries, setInquiries] = useState([]);
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
    const [searchQuery, setSearchQuery] = useState('');
    const [programFilter, setProgramFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchPrograms = useCallback(async () => {
        try {
            const { data } = await api.get(PROGRAMS_API, { params: { limit: 500 } });
            setPrograms(data.data || []);
        } catch {
            setPrograms([]);
        }
    }, []);

    const fetchInquiries = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, limit };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (programFilter) params.program = programFilter;
            if (statusFilter) params.status = statusFilter;
            const { data } = await api.get(API_BASE, { params });
            setInquiries(data.data || []);
            const p = data.pagination || {};
            setPagination({
                page: p.page || 1,
                limit: p.limit || 10,
                total: p.total ?? data.total ?? 0,
                totalPages: p.totalPages ?? 1,
                pages: p.pages ?? p.totalPages ?? 1,
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch inquiries');
            setInquiries([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, programFilter, statusFilter]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    useEffect(() => {
        const t = setTimeout(() => {
            setSearchQuery(searchTerm);
            setPagination((prev) => ({ ...prev, page: 1 }));
        }, 350);
        return () => clearTimeout(t);
    }, [searchTerm]);

    useEffect(() => {
        fetchInquiries(pagination.page, pagination.limit);
    }, [pagination.page, pagination.limit, fetchInquiries]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleProgramFilter = (e) => {
        setProgramFilter(e.target.value || '');
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value || '');
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSearchQuery('');
        setProgramFilter('');
        setStatusFilter('');
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleDelete = (inquiry) => {
        setSelectedInquiry(inquiry);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedInquiry) return;
        setDeleting(true);
        try {
            await api.delete(`${API_BASE}/${selectedInquiry._id}`);
            setShowDeleteModal(false);
            setSelectedInquiry(null);
            fetchInquiries(pagination.page, pagination.limit);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const handleViewDetails = (inquiry) => {
        setSelectedInquiry(inquiry);
        setShowDetailsModal(true);
    };

    const statusLabel = (status) => {
        const s = status || 'active';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const statusClass = (status) => {
        const s = status || 'active';
        if (s === 'active') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    const columns = [
        {
            key: 'name',
            header: 'Contact',
            render: (row) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-blue-600 font-semibold text-sm">
                            {row.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{row.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                            {row.mobile}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'program',
            header: 'Program',
            render: (row) => (
                <span className="text-sm text-gray-900">
                    {row.program?.name || '—'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass(row.status)}`}>
                    {statusLabel(row.status)}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Submitted',
            render: (row) => (
                <span className="text-sm text-gray-500">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleViewDetails(row)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View"
                    >
                        <FaEye className="w-4 h-4" />
                    </button>
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

    if (loading && inquiries.length === 0) {
        return <Spinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title="Inquiries"
                subtitle="Manage inquiries and leads"
            />

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Program</label>
                        <select
                            value={programFilter}
                            onChange={handleProgramFilter}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All programs</option>
                            {programs.map((p) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-36">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <FaFilter />
                        Clear filters
                    </button>
                </div>
                <DataTable
                    columns={columns}
                    data={inquiries}
                    isLoading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    searchPlaceholder="Search by name or mobile..."
                />
                {inquiries.length === 0 && !loading && (
                    <EmptyState
                        title="No inquiries yet"
                        description="Inquiries from the website will appear here."
                    />
                )}
            </div>

            {showDetailsModal && selectedInquiry && (
                <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Inquiry Details</h3>
                            <button
                                type="button"
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedInquiry.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mobile</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedInquiry.mobile}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedInquiry.program?.name || '—'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <p className="mt-1">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass(selectedInquiry.status)}`}>
                                        {statusLabel(selectedInquiry.status)}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : '—'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedInquiry && (
                <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Inquiry</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to delete this inquiry from &quot;{selectedInquiry.name}&quot;?
                        </p>
                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => { setShowDeleteModal(false); setSelectedInquiry(null); }}
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
