import { useNavigate, useLocation } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

/**
 * Professional page header with optional breadcrumbs, title, description and action buttons.
 * @param {string} title - Main heading
 * @param {string} [subtitle] - Optional description below title
 * @param {Array<{ label: string, path?: string }>} [breadcrumbs] - e.g. [{ label: 'Dashboard', path: '/app/dashboard' }, { label: 'Students' }]
 * @param {React.ReactNode} [actions] - Buttons or elements to show on the right
 */
export default function PageHeader({ title, subtitle, breadcrumbs = [], actions }) {
    const navigate = useNavigate();
    const location = useLocation();
    console.log("actions in header", actions);
    const crumbs = breadcrumbs.length > 0
        ? breadcrumbs
        : (() => {
            const base = '/app';
            const segments = location.pathname.replace(base, '').split('/').filter(Boolean);
            const list = [{ label: 'Dashboard', path: `${base}/dashboard` }];
            let acc = base;
            segments.forEach((seg, i) => {
                acc += `/${seg}`;
                const label = seg
                    .split('-')
                    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(' ');
                list.push(i === segments.length - 1 ? { label } : { label, path: acc });
            });
            return list;
        })();

    return (
        <div className="mb-8">
            {crumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    {crumbs.map((c, i) => (
                        <span key={i} className="flex items-center gap-1">
                            {i > 0 && <FaChevronRight className="text-gray-400 w-3 h-3" />}
                            {c.path ? (
                                <button
                                    type="button"
                                    onClick={() => navigate(c.path)}
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    {c.label}
                                </button>
                            ) : (
                                <span className="text-gray-900 font-medium">{c.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
                 
            </div>
        </div>
    );
}
