import React from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const DataTable = ({
    columns,
    data,
    isLoading,
    pagination,
    onPageChange,
    onSearch,
    searchTerm,
    searchPlaceholder = 'Search...',
    onSort,
    sortConfig,
}) => {
    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in-up">
            {/* Header: Search & Toolbar */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="relative w-full sm:w-72 group">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors group-hover:text-primary-500" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-x-auto scrollbar-thin">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                        <tr className="bg-gray-50/80">
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                                    onClick={() => column.sortable && onSort && onSort(column.key)}
                                    style={{ textAlign: column.align || 'left' }}
                                >
                                    <div className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : ''}`}>
                                        {column.header}
                                        {column.sortable && sortConfig?.key === column.key && (
                                            <span className="text-primary-500">
                                                {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {isLoading ? (
                            // Use Skeleton Loader here ideally, for now plain text
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-10 text-center">
                                    <div className="flex justify-center flex-col items-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-2"></div>
                                        <span className="text-gray-500 text-sm">Loading data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data && data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row._id || rowIndex}
                                    className="hover:bg-gray-50/80 transition-all duration-200 hover:shadow-sm"
                                >
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${column.className || ''}`}
                                            style={{ textAlign: column.align || 'left' }}
                                        >
                                            {column.render ? column.render(row) : row[column.key] || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                                            <FaSearch className="text-2xl text-gray-300" />
                                        </div>
                                        <p>No records found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (pagination.pages > 1 || pagination.totalPages > 1) && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500 font-medium">
                        Page {pagination.page} of {pagination.pages || pagination.totalPages || 1}
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            type="button"
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <span className="px-4 py-1 bg-white border border-gray-200 rounded-lg font-medium text-gray-700">
                            Page {pagination.page} of {pagination.pages || pagination.totalPages || 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= (pagination.pages || pagination.totalPages || 1)}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
