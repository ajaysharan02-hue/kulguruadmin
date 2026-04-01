import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';

const API_BASE = '/servicepatners';

function previewUrlFromRecord(b) {
    if (!b) return '';
    const img = b.image || b.imageUrl;
    if (!img) return '';
    if (img.startsWith('http')) return img;
    const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return img.startsWith('/') ? base + img : `${base}/uploads/servicepatner/${img}`;
}

export default function ServicePartnerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: true,
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditing) {
            setFetchLoading(true);
            api
                .get(`${API_BASE}/${id}`)
                .then(({ data }) => {
                    const b = data.data;
                    if (b) {
                        setFormData({
                            name: b.name || '',
                            description: b.description || '',
                            status: b.status === 'active',
                        });
                        setImagePreview(previewUrlFromRecord(b));
                    }
                })
                .catch((err) => setError(err.response?.data?.message || 'Failed to load partner'))
                .finally(() => setFetchLoading(false));
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validate = () => {
        const errors = {};
        if (!formData.name?.trim()) errors.name = 'Name is required';
        if (!isEditing && !selectedFile && !imagePreview) errors.image = 'Image is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setError(null);
        try {
            const payload = new FormData();
            payload.append('kind', 'servicepatner');
            payload.append('name', formData.name.trim());
            payload.append('description', formData.description || '');
            payload.append('status', formData.status ? 'active' : 'inactive');
            if (selectedFile) payload.append('image', selectedFile);

            if (isEditing) {
                await api.put(`${API_BASE}/${id}`, payload);
            } else {
                await api.post(API_BASE, payload);
            }
            navigate('/app/service-partners');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading && isEditing) return <Spinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title={isEditing ? 'Edit service partner' : 'Add service partner'}
                subtitle={isEditing ? 'Update partner details' : 'Create a new partner entry'}
                actions={
                    <Link
                        to="/app/service-partners"
                        className="inline-flex items-center px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back
                    </Link>
                }
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded ${
                                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {formErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full border border-gray-300 px-3 py-2 rounded"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Image {!isEditing && '*'}
                            </label>
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-40 rounded mb-4 object-contain max-w-md border border-gray-100 bg-gray-50 p-2"
                                />
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="block" />
                            {formErrors.image && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
                            )}
                            {isEditing && (
                                <p className="text-sm text-gray-500 mt-2">
                                    Leave unchanged to keep the current image.
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-2 flex items-center">
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status}
                                onChange={handleChange}
                                className="mr-2 h-4 w-4 text-blue-600 rounded"
                            />
                            <label>Active</label>
                        </div>
                    </div>
                    <div className="flex justify-end pt-6 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            <FaSave className="mr-2" />
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
