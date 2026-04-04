// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetDocumentsQuery, useDeleteDocumentMutation } from '../services/API';
import { setSelected } from '../store/slices/documentSlice';
import { selectCurrentUser } from '../store/slices/authSlice';

import DocCard from './DocCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button, EmptyState, Spinner, Alert } from '../components/UI';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const PAGE_SIZE = 12;

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [searchInput, setSearchInput] = useState('');
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [page,  setPage]  = useState(1);
  const [docs,  setDocs]  = useState([]);
  const [hasMore,setHasMore]= useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 450);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // RTK Query
  const { data, isLoading, isFetching, isError, isSuccess, error } = useGetDocumentsQuery({
    page,
    page_size: PAGE_SIZE,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  });

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setDocs([]);
    setHasMore(true);
  }, [search, statusFilter]);

  // Accumulate documents
  useEffect(() => {
    if (!data) return;
    const results = data.result || [];
    setDocs((prev) => (page === 1 ? results : [...prev, ...results]));
    setHasMore(!!data.next);
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((p) => p + 1);
    }
  }, [isFetching, hasMore]);

  const bottomRef = useInfiniteScroll(loadMore, { enabled: hasMore && !isFetching });

  const [deleteDoc] = useDeleteDocumentMutation();

  const openDocument = (doc) => {
    dispatch(setSelected(doc));
    navigate(`/documents/${doc.id}`);
  };

  const deleteHandler = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDoc(id).unwrap();
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert('Failed to delete document', err);
    }
  };

  const stats = useMemo(() => ({
    total: data?.count ?? 0,
    analyzed: Array.isArray(docs) ? docs.filter((d) => d.status === 'done').length : 0,
    processing: Array.isArray(docs) ? docs.filter((d) => d.status === 'analyzing').length : 0,
    failed: Array.isArray(docs) ? docs.filter((d) => d.status === 'failed').length : 0,
  }), [data?.count, docs]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const statCards = [
    { label: 'Documents', value: stats.total, color: 'brand', icon: DocIcon },
    { label: 'Analyzed',  value: stats.analyzed, color: 'emerald', icon: CheckIcon },
    { label: 'Processing', value: stats.processing, color: 'amber', icon: ClockIcon },
    { label: 'Failed',    value: stats.failed, color: 'rose', icon: AlertIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-secondary)]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="mb-10 fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-brand-600 mb-1.5 tracking-wide">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}
              </p>
              <h1 className="text-3xl sm:text-[2.25rem] font-extrabold text-zinc-900 tracking-tight leading-tight">
                {greeting}, {user?.full_name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-[15px] text-zinc-500 mt-1.5">
                Manage and analyze your medical documents with AI
              </p>
            </div>

            <Button
              onClick={() => navigate('/upload')}
              size="lg"
              className="self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Upload Document
            </Button>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        {isSuccess && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            {statCards.map(({ label, value, color, icon: Icon }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 border border-zinc-100
                           hover:border-zinc-200 hover:shadow-md
                           transition-all duration-300 ease-out group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${color === 'brand' ? 'bg-brand-50 text-brand-600' : ''}
                    ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}
                    ${color === 'amber' ? 'bg-amber-50 text-amber-600' : ''}
                    ${color === 'rose' ? 'bg-rose-50 text-rose-600' : ''}
                    transition-transform duration-300 group-hover:scale-110
                  `}>
                    <Icon />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    {label}
                  </span>
                </div>
                <p className={`text-[1.75rem] font-extrabold tracking-tight leading-none
                  ${color === 'brand' ? 'text-zinc-900' : ''}
                  ${color === 'emerald' ? 'text-emerald-600' : ''}
                  ${color === 'amber' ? 'text-amber-600' : ''}
                  ${color === 'rose' ? 'text-rose-600' : ''}
                `}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Search & Filters ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 sm:p-5 mb-7 fade-up shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400"
                   fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl
                           text-sm placeholder:text-zinc-400
                           focus:border-brand-400 focus:ring-[3px] focus:ring-brand-500/10 focus:bg-white
                           outline-none transition-all duration-200"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600
                             transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter + View toggle */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm
                           text-zinc-700 focus:border-brand-400 outline-none min-w-[140px]
                           transition-colors cursor-pointer hover:border-zinc-300"
              >
                <option value="">All Status</option>
                <option value="done">Completed</option>
                <option value="analyzing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <div className="flex bg-zinc-100 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-[10px] transition-all duration-200 cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-[10px] transition-all duration-200 cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Document Display ──────────────────────────────────────────── */}
        {isLoading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-24 fade-in">
            <Spinner size={36} className="text-brand-500" />
            <p className="mt-5 text-sm font-medium text-zinc-500">
              Loading your documents...
            </p>
          </div>
        ) : isError ? (
          <div className="mb-8 fade-up">
            <Alert type="error">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Failed to load documents. Please try refreshing the page.
              </div>
            </Alert>

            {import.meta.env.DEV && error && (
              <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-4 mt-3">
                <p className="text-[12px] text-rose-700 font-mono whitespace-pre-wrap">
                  {JSON.stringify(error, null, 2)}
                </p>
              </div>
            )}
          </div>
        ) : Array.isArray(docs) && docs.length > 0 ? (
          <div className="fade-up">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                  Your Documents
                </h2>
                <p className="text-[13px] text-zinc-500 mt-0.5">
                  Showing {docs.length} of {data?.count || 0} documents
                </p>
              </div>

              {(search || statusFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setStatusFilter('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Grid / List */}
            <div className={`stagger ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }`}>
              {docs.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  viewMode={viewMode}
                  onClick={() => openDocument(doc)}
                  onDelete={(e) => deleteHandler(e, doc.id)}
                />
              ))}
            </div>

            {/* Load more sentinel */}
            <div ref={bottomRef} className="flex items-center justify-center mt-10">
              {isFetching && (
                <div className="flex items-center gap-2.5 text-zinc-500">
                  <Spinner size={18} />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
              {!hasMore && docs.length > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2
                                bg-zinc-100 rounded-full text-[13px] text-zinc-500 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  All documents loaded
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            }
            title="No documents found"
            subtitle={
              search || statusFilter
                ? 'No documents match your current filters. Try adjusting your search.'
                : 'Upload your medical reports to start getting AI insights.'
            }
            action={
              <Button onClick={() => navigate('/upload')} size="lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Upload Your First Document
              </Button>
            }
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;

/* ── Stat Icons ──────────────────────────────────────────────────────────── */
function DocIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
