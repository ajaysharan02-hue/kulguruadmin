import { FaTools } from 'react-icons/fa';

const ComingSoon = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <FaTools className="text-4xl text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {title || 'Coming Soon'}
            </h2>
            <p className="text-gray-600 max-w-md">
                This module is currently under development. check back later for updates.
            </p>
        </div>
    );
};

export default ComingSoon;
