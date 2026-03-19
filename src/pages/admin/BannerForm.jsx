import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';

const API_BASE = '/banners';

export default function BannerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
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
            api.get('/banners/' + id)
                .then(({ data }) => {
                    const b = data.data;
                    if (b) {
                        setFormData({
                            title: b.title || '',
                            subtitle: b.subtitle || '',
                            buttonText: b.buttonText || '',
                            buttonLink: b.buttonLink || '',
                            status: b.status === 'active',
                        });
                        const img = b.image || b.imageUrl;
                        setImagePreview(img);
                    }
                })
                .catch((err) => setError(err.response?.data?.message || 'Failed to load banner'))
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
        if (!formData.title?.trim()) errors.title = 'Banner title is required';
        if (!isEditing && !selectedFile && !imagePreview) errors.image = 'Banner image is required';
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
            payload.append('title', formData.title);
            payload.append('subtitle', formData.subtitle);
            payload.append('buttonText', formData.buttonText);
            payload.append('buttonLink', formData.buttonLink);
            payload.append('status', formData.status ? 'active' : 'inactive');
            if (selectedFile) payload.append('image', selectedFile);

            if (isEditing) {
                await api.put(API_BASE + '/' + id, payload);
            } else {
                await api.post(API_BASE, payload);
            }
            navigate('/app/banners');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save banner');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading && isEditing) return <Spinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title={isEditing ? 'Edit Banner' : 'Add Banner'}
                subtitle={isEditing ? 'Update banner details' : 'Create a new banner'}
                action={
                    <Link
                        to="/app/banners"
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
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Banner Image *</label>
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="h-48 rounded mb-4 object-cover w-full max-w-md"
                                />
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="block" />
                            {formErrors.image && <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Button Text</label>
                            <input
                                type="text"
                                name="buttonText"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Button Link</label>
                            <input
                                type="text"
                                name="buttonLink"
                                value={formData.buttonLink}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded"
                            />
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
                            {loading ? 'Saving...' : 'Save Banner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
