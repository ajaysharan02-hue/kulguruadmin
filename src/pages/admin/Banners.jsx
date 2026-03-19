import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../../utils/api';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';

const API_BASE = '/banners';

export default function Banners() {
    const [banners, setBanners] = useState([]);
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
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchBanners = useCallback(async (page = 1, limit = 10, search = '') => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(API_BASE, {
                params: { page, limit, ...(search && { search }) },
            });
            setBanners(data.data || []);
            const p = data.pagination || {};
            setPagination({
                page: p.page || 1,
                limit: p.limit || 10,
                total: p.total ?? 0,
                totalPages: p.totalPages ?? 1,
                pages: p.totalPages ?? 1,
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch banners');
            setBanners([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners(pagination.page, pagination.limit, searchTerm);
    }, [pagination.page, pagination.limit, searchTerm, fetchBanners]);

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleDelete = (banner) => {
        setSelectedBanner(banner);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedBanner) return;
        setDeleting(true);
        try {
            await api.delete(`${API_BASE}/${selectedBanner._id}`);
            setShowDeleteModal(false);
            setSelectedBanner(null);
            fetchBanners(pagination.page, pagination.limit, searchTerm);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const imageUrl = (row) => {
        const img = row.image || row.imageUrl;
        if (!img) return null;
        if (img.startsWith('http')) return img;
        const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        return img.startsWith('/') ? base + img : `${base}/uploads/banners/${img}`;
    };

    const columns = [
        {
            key: 'title',
            header: 'Title',
            sortable: true,
            render: (row) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                        <img
                            className="h-10 w-10 object-cover"
                            src={imageUrl(row) || 'https://via.placeholder.com/40?text=No+Image'}
                            alt={row.title}
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                            }}
                        />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{row.title}</div>
                        <div className="text-sm text-gray-500">{row.subtitle || '—'}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'buttonText',
            header: 'Button',
            render: (row) => (
                <span className="text-sm text-gray-900">{row.buttonText || '—'}</span>
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
            key: 'createdAt',
            header: 'Created',
            sortable: true,
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

    if (loading && banners.length === 0) {
        return <Spinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title="Banners"
                subtitle="Manage website banners and promotional content"
                actions={
                    <Link
                        to="new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <FaPlus className="w-4 h-4 mr-2" />
                        Add Banner
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
                    data={banners}
                    isLoading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    searchPlaceholder="Search banners..."
                />
            </div>

            {showDeleteModal && selectedBanner && (
                <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900">Delete Banner</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to delete &quot;{selectedBanner.title}&quot;? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => { setShowDeleteModal(false); setSelectedBanner(null); }}
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
