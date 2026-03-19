import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';

const API_BASE = '/programs';

export default function ProgramForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        duration: '',
        eligibility: '',
        fee: '',
        status: 'active',
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditing) {
            setFetchLoading(true);
            api.get(`${API_BASE}/${id}`)
                .then(({ data }) => {
                    const p = data.data;
                    if (p) {
                        setFormData({
                            name: p.name || '',
                            code: p.code || '',
                            description: p.description || '',
                            duration: p.duration || '',
                            eligibility: p.eligibility || '',
                            fee: p.fee ?? '',
                            status: p.status || 'active',
                        });
                    }
                })
                .catch((err) => setError(err.response?.data?.message || 'Failed to load program'))
                .finally(() => setFetchLoading(false));
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'active' : 'inactive') : value,
        }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errors = {};
        if (!formData.name?.trim()) errors.name = 'Program name is required';
        if (!formData.code?.trim()) errors.code = 'Program code is required';
        if (!formData.duration?.trim()) errors.duration = 'Duration is required';
        if (formData.fee !== '' && (isNaN(Number(formData.fee)) || Number(formData.fee) < 0)) {
            errors.fee = 'Fee must be a valid positive number';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setError(null);
        try {
            const payload = {
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                description: formData.description?.trim() || undefined,
                duration: formData.duration.trim(),
                eligibility: formData.eligibility?.trim() || undefined,
                fee: formData.fee !== '' ? parseFloat(formData.fee) : undefined,
                status: formData.status === 'active' ? 'active' : 'inactive',
            };
            if (isEditing) {
                await api.put(`${API_BASE}/${id}`, payload);
            } else {
                await api.post(API_BASE, payload);
            }
            navigate('/app/programs');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save program');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading && isEditing) return <Spinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title={isEditing ? 'Edit Program' : 'Add Program'}
                subtitle={isEditing ? 'Update program details' : 'Create a new program'}
                action={
                    <Link
                        to="/app/programs"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Programs
                    </Link>
                }
            />

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Program Name *</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="e.g. Full Stack Development"
                            />
                            {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                            <input
                                id="code"
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g. FSD01"
                                className={`w-full px-3 py-2 border rounded-md uppercase ${formErrors.code ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {formErrors.code && <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>}
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                            <input
                                id="duration"
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md ${formErrors.duration ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="e.g. 6 months"
                            />
                            {formErrors.duration && <p className="mt-1 text-sm text-red-600">{formErrors.duration}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Program description"
                            />
                        </div>
                        <div>
                            <label htmlFor="eligibility" className="block text-sm font-medium text-gray-700 mb-2">Eligibility</label>
                            <input
                                id="eligibility"
                                type="text"
                                name="eligibility"
                                value={formData.eligibility}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g. 12th grade"
                            />
                        </div>
                        <div>
                            <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-2">Fee (₹)</label>
                            <input
                                id="fee"
                                type="number"
                                name="fee"
                                min="0"
                                step="0.01"
                                value={formData.fee}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md ${formErrors.fee ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="0"
                            />
                            {formErrors.fee && <p className="mt-1 text-sm text-red-600">{formErrors.fee}</p>}
                        </div>
                        <div className="md:col-span-2 flex items-center">
                            <input
                                type="checkbox"
                                id="status"
                                name="status"
                                checked={formData.status === 'active'}
                                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <label htmlFor="status" className="ml-2 text-sm text-gray-900">Active</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Link
                            to="/app/programs"
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            <FaSave className="mr-2" />
                            {loading ? 'Saving...' : (isEditing ? 'Update Program' : 'Create Program')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
