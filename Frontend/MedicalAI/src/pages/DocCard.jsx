
import { useState } from "react";
import { Button, Badge } from '../components/UI';


const DocCard = ({ doc, onClick, onDelete }) => {
    const isPdf = doc.file_type?.toLowerCase() === 'pdf';

    return (
        <div
        onClick={onClick}
        className="group bg-[var(--bg2)] border border-[var(--border)] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-[var(--border2)] hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-4">
            <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                ${isPdf ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}
            >
                {isPdf ? '📄' : '🖼️'}
            </div>

            <Badge status={doc.status} />
        </div>

        <h3 className="font-medium text-sm mb-1 line-clamp-1">{doc.title}</h3>

        <p className="text-xs text-(--text3) mb-3">
            {new Date(doc.uploaded_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })}
        </p>

        {doc.analysis?.summary && (
            <p className="text-xs text-(--text2) line-clamp-2 mb-4 leading-relaxed">
            {doc.analysis.summary}
            </p>
        )}

        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[10px] text-[var(--text3)] font-mono">#{doc.id}</span>
            <Button
                variant="danger"
                size="xs"
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
            Delete
            </Button>
        </div>
        </div>
    );
}

export default DocCard;
