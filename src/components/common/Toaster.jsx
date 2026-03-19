import { useEffect, useState } from 'react';
import { dismissToast, subscribeToToasts } from '../../utils/toast';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const stylesByType = {
    success: {
        ring: 'ring-green-200/60',
        bg: 'bg-white',
        title: 'text-gray-900',
        msg: 'text-gray-600',
        iconWrap: 'bg-green-50 text-green-600 ring-green-100',
        bar: 'bg-green-500',
        icon: FaCheckCircle,
    },
    error: {
        ring: 'ring-red-200/60',
        bg: 'bg-white',
        title: 'text-gray-900',
        msg: 'text-gray-600',
        iconWrap: 'bg-red-50 text-red-600 ring-red-100',
        bar: 'bg-red-500',
        icon: FaExclamationTriangle,
    },
    info: {
        ring: 'ring-blue-200/60',
        bg: 'bg-white',
        title: 'text-gray-900',
        msg: 'text-gray-600',
        iconWrap: 'bg-blue-50 text-blue-600 ring-blue-100',
        bar: 'bg-blue-500',
        icon: FaInfoCircle,
    },
};

export default function Toaster() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        return subscribeToToasts(setItems);
    }, []);

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] space-y-3">
            {items.map((t) => {
                const s = stylesByType[t.type] || stylesByType.info;
                const Icon = s.icon;
                return (
                    <div
                        key={t.id}
                        className={`pointer-events-auto overflow-hidden rounded-2xl ${s.bg} shadow-xl ring-1 ${s.ring} animate-fadeIn`}
                    >
                        <div className="flex gap-3 p-4">
                            <div className={`mt-0.5 grid h-10 w-10 place-items-center rounded-2xl ring-1 ${s.iconWrap}`}>
                                <Icon className="text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className={`text-sm font-semibold ${s.title}`}>{t.title || 'Notification'}</div>
                                <div className={`mt-0.5 text-sm leading-5 ${s.msg} break-words`}>
                                    {t.message || ''}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    dismissToast(t.id);
                                }}
                                className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                aria-label="Close"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="h-1 w-full bg-gray-100">
                            <div
                                className={`h-full ${s.bar}`}
                                style={{ animation: `toastbar ${Math.max(600, t.duration || 2600)}ms linear forwards` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

