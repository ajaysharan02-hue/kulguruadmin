import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import api from '../../utils/api';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';

const API_BASE = '/courses';

export default function CourseForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [programs, setPrograms] = useState([]);
    const [formData, setFormData] = useState({
        program: '',
        name: '',
        code: '',
        description: '',
        duration: '',
        eligibility: '',
        fee: '',
        status: 'active',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/programs', { params: { status: 'active', limit: 200 } })
            .then(({ data }) => setPrograms(data.data || []))
            .catch(() => setPrograms([]));
    }, []);

    useEffect(() => {
        if (!isEditing) return;
        setFetchLoading(true);
        api.get(`${API_BASE}/${id}`)
            .then(({ data }) => {
                const c = data.data;
                if (c) {
                    setFormData({
                        program: c.program?._id || c.program || '',
                        name: c.name || '',
                        code: c.code || '',
                        description: c.description || '',
                        duration: c.duration || '',
                        eligibility: c.eligibility || '',
                        fee: c.fee ?? '',
                        status: c.status || 'active',
                    });
                    setImagePreview(c.image || c.imageUrl || '');
                }
            })
            .catch((err) => setError(err.response?.data?.message || 'Failed to load course'))
            .finally(() => setFetchLoading(false));
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errors = {};
        if (!formData.program) errors.program = 'Program is required';
        if (!formData.name?.trim()) errors.name = 'Course name is required';
        if (formData.fee !== '' && (isNaN(Number(formData.fee)) || Number(formData.fee) < 0)) {
            errors.fee = 'Fee must be a valid positive number';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            setFormErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }));
            return;
        }
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        if (formErrors.image) setFormErrors((prev) => ({ ...prev, image: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setError(null);
        try {
            const payload = new FormData();
            payload.append('program', formData.program);
            payload.append('name', formData.name.trim());
            payload.append('code', formData.code?.trim().toUpperCase() || '');
            payload.append('description', formData.description?.trim() || '');
            payload.append('duration', formData.duration?.trim() || '');
            payload.append('eligibility', formData.eligibility?.trim() || '');
            if (formData.fee !== '') payload.append('fee', String(parseFloat(formData.fee)));
            payload.append('status', formData.status === 'active' ? 'active' : 'inactive');
            if (selectedFile) payload.append('image', selectedFile);

            if (isEditing) {
                await api.put(`${API_BASE}/${id}`, payload);
            } else {
                await api.post(API_BASE, payload);
            }
            navigate('/app/courses');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading && isEditing) return <Spinner />;

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title={isEditing ? 'Edit Course' : 'Add Course'}
                subtitle={isEditing ? 'Update course details' : 'Create a new course'}
                action={(
                    <Link to="/app/courses" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
                        <FaArrowLeft className="mr-2" />
                        Back to Courses
                    </Link>
                )}
            />

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                            <select
                                id="program"
                                name="program"
                                value={formData.program}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md ${formErrors.program ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select Program</option>
                                {programs.map((p) => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                            {formErrors.program && <p className="mt-1 text-sm text-red-600">{formErrors.program}</p>}
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g. MA in History" />
                            {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                            <input id="code" type="text" name="code" value={formData.code} onChange={handleChange} className="w-full px-3 py-2 border rounded-md border-gray-300 uppercase" placeholder="e.g. MA-HIS" />
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                            <input id="duration" type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. 2 years" />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Course description" />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">Course Image</label>
                            {imagePreview && (
                                <img src={imagePreview} alt="Course preview" className="h-44 w-full max-w-md rounded-lg object-cover border border-gray-200 mb-3" />
                            )}
                            <input id="image" type="file" accept="image/*" onChange={handleFileChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.image ? 'border-red-500' : 'border-gray-300'}`} />
                            {formErrors.image && <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>}
                        </div>

                        <div>
                            <label htmlFor="eligibility" className="block text-sm font-medium text-gray-700 mb-2">Eligibility</label>
                            <input id="eligibility" type="text" name="eligibility" value={formData.eligibility} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. Graduation" />
                        </div>
                        <div>
                            <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-2">Fee (₹)</label>
                            <input id="fee" type="number" name="fee" min="0" step="0.01" value={formData.fee} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.fee ? 'border-red-500' : 'border-gray-300'}`} placeholder="0" />
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
                        <Link to="/app/courses" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                            <FaSave className="mr-2" />
                            {loading ? 'Saving...' : (isEditing ? 'Update Course' : 'Create Course')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
