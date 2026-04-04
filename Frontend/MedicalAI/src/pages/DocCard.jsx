import React from 'react';

const DocCard = ({ doc, viewMode, onClick, onDelete }) => {
  const isGrid = viewMode === 'grid';

  const statusStyles = {
    done: "bg-emerald-50 text-emerald-700 border-emerald-100",
    analyzing: "bg-amber-50 text-amber-700 border-amber-100 animate-pulse",
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    failed: "bg-rose-50 text-rose-700 border-rose-100",
  };

  const cardClasses = isGrid
    ? "group bg-white border border-slate-200/60 rounded-3xl p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
    : "group bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer";

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Grid View Content */}
      {isGrid ? (
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusStyles[doc.status] || statusStyles.pending}`}>
              {doc.status}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 truncate mb-1 pr-6 group-hover:text-indigo-600 transition-colors">
            {doc.title || "Untitled Analysis"}
          </h3>
          <p className="text-xs text-slate-400 font-medium mb-4">
            ID: {doc.id.split('-')[0].toUpperCase()}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <span className="text-[11px] font-bold text-slate-500">
              {new Date(doc.created_at).toLocaleDateString()}
            </span>
            <button 
              onClick={onDelete}
              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        /* List View Content */
        <>
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{doc.title}</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Processed {new Date(doc.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusStyles[doc.status]}`}>{doc.status}</span>
            <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DocCard;