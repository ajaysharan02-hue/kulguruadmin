import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <FaExclamationTriangle className="h-16 w-16 text-yellow-500" />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Access Denied
                </h2>
                <div className="mt-2 text-sm text-gray-600">
                    <p>You do not have permission to access this page.</p>
                    <p className="mt-2">
                        If you believe this is an error, please contact your administrator.
                    </p>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 w-full text-sm text-primary-600 hover:text-primary-500"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
