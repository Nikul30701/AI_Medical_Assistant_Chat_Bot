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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [docs, setDocs] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 450);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // RTK Query
  const { data, isLoading, isFetching, isError, isSuccess } = useGetDocumentsQuery({
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
    if (!data?.results) return;
    setDocs((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
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
      alert('Failed to delete document');
    }
  };

  const stats = useMemo(() => ({
    total: data?.count ?? 0,
    analyzed: docs.filter((d) => d.status === 'done').length,
    failed: docs.filter((d) => d.status === 'failed').length,
  }), [data?.count, docs]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      <main className="max-w-[1180px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-zinc-500 tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', month: 'long', day: 'numeric' 
            })}
          </p>
          <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900">
            {greeting}, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-zinc-500 mt-1">Here are your uploaded medical records</p>
        </div>

        {/* Stats */}
        {isSuccess && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Total Documents', value: stats.total, color: 'text-zinc-900' },
              { label: 'Successfully Analyzed', value: stats.analyzed, color: 'text-emerald-600' },
              { label: 'Analysis Failed', value: stats.failed, color: 'text-red-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                <p className={`text-4xl font-semibold tracking-tighter ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-zinc-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by document title, date, or keyword..."
              className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 outline-none"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:border-zinc-900 outline-none min-w-[170px]"
          >
            <option value="">All Status</option>
            <option value="done">Done</option>
            <option value="analyzing">Analyzing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Documents Grid */}
        {isLoading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size={36} />
            <p className="mt-5 text-zinc-500">Loading your uploaded records...</p>
          </div>
        ) : isError ? (
          <Alert type="error">Failed to load documents. Please try refreshing the page.</Alert>
        ) : docs.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500 font-medium">
                Showing {docs.length} of {data?.count || 0} documents
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {docs.map((doc) => (
                <DocCard
                  key={doc.id}
                  doc={doc}
                  onClick={() => openDocument(doc)}
                  onDelete={(e) => deleteHandler(e, doc.id)}
                />
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={bottomRef} className="h-16 flex items-center justify-center mt-12">
              {isFetching && <Spinner size={24} />}
              {!hasMore && (
                <p className="text-xs tracking-widest text-zinc-400 font-medium">
                  ALL DOCUMENTS LOADED • {data?.count} TOTAL
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon="📄"
            title="No documents uploaded yet"
            subtitle="Upload your medical reports to start getting AI insights and analysis."
            action={
              <Button onClick={() => navigate('/upload')} size="lg">
                Upload Your First Record
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
