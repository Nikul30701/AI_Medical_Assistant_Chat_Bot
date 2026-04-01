
import { useState } from "react";
import { Button, Badge } from '../components/UI';

const DocCard = ({ doc, onClick, onDelete, viewMode = 'grid' }) => {
    const isPdf = doc.file_type?.toLowerCase() === 'pdf';

    if (viewMode === 'list') {
        return (
            <div
                onClick={onClick}
                className="group bg-white border border-gray-100 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-md"
            >
                <div className="flex items-center gap-4">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0
                            ${isPdf ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}
                    >
                        {isPdf ? '📄' : '🖼️'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
                            <Badge status={doc.status} />
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                            <span className="text-xs text-gray-400 font-mono">#{doc.id}</span>
                        </div>

                        {doc.analysis?.summary && (
                            <p className="text-sm text-gray-600 line-clamp-1 mt-2">
                                {doc.analysis.summary}
                            </p>
                        )}
                    </div>

                    <Button
                        variant="danger"
                        size="sm"
                        onClick={onDelete}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className="group bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-4">
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
                        ${isPdf ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}
                >
                    {isPdf ? '📄' : '🖼️'}
                </div>

                <Badge status={doc.status} />
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>

            <p className="text-sm text-gray-500 mb-3">
                {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })}
            </p>

            {doc.analysis?.summary && (
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {doc.analysis.summary}
                </p>
            )}

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-mono">#{doc.id}</span>
                <Button
                    variant="danger"
                    size="sm"
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Delete
                </Button>
            </div>
        </div>
    );
};

export default DocCard;
