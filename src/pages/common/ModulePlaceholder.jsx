import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { FaRocket } from 'react-icons/fa';

export default function ModulePlaceholder({ module: moduleName }) {
    return (
        <div>
            <PageHeader
                title={moduleName}
                subtitle="This module is coming soon. Backend APIs are ready."
            />
            <div className="glass-card rounded-2xl border border-gray-100 overflow-hidden">
                <EmptyState
                    title={`${moduleName} module`}
                    description="Connect the existing backend API to this page to enable full functionality."
                    icon={FaRocket}
                />
            </div>
        </div>
    );
}
