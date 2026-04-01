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
  const [viewMode, setViewMode] = useState('grid'); // grid or list

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

  // Debug logging
  useEffect(() => {
  }, [isLoading, isFetching, isError, isSuccess, data, error, page, search, statusFilter]);

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
      alert('Failed to delete document');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-2">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', month: 'long', day: 'numeric' 
                })}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {greeting}, {user?.full_name?.split(' ')[0] || 'User'}
              </h1>
              <p className="text-lg text-gray-600">
                Manage and analyze your medical documents with AI
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/upload')} 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              <span className="mr-2">+</span> Upload Document
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {isSuccess && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Documents</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Completed</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.analyzed}</p>
              <p className="text-sm text-gray-600 mt-1">Analyzed</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Processing</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{stats.processing}</p>
              <p className="text-sm text-gray-600 mt-1">Analyzing</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Issues</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-600 mt-1">Failed</p>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by document title, date, or keyword..."
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none min-w-[160px]"
              >
                <option value="">All Status</option>
                <option value="done">Completed</option>
                <option value="analyzing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {isLoading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Spinner size={40} className="text-blue-600" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your medical documents...</p>
          </div>
        ) : isError ? (
          <div className="mb-8">
            <Alert type="error" className="mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Failed to load documents. Please try refreshing the page.
              </div>
            </Alert>
            
            {/* Debug error information */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800 font-mono">
                  Error: {JSON.stringify(error, null, 2)}
                </p>
              </div>
            )}
          </div>
        ) : Array.isArray(docs) && docs.length > 0 ? (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {docs.length} of {data?.count || 0} documents
                </p>
              </div>
              
              {(search || statusFilter) && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setStatusFilter('');
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Documents Grid/List */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
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

            {/* Load More */}
            <div ref={bottomRef} className="flex items-center justify-center mt-12">
              {isFetching && (
                <div className="flex items-center text-gray-600">
                  <Spinner size={24} className="mr-3" />
                  <span>Loading more documents...</span>
                </div>
              )}
              {!hasMore && docs.length > 0 && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    All documents loaded
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            }
            title="No documents found"
            subtitle={
              search || statusFilter 
                ? "No documents match your current filters. Try adjusting your search or filters."
                : "Upload your medical reports to start getting AI insights and analysis."
            }
            action={
              <Button 
                onClick={() => navigate('/upload')} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              >
                <span className="mr-2">+</span> Upload Your First Document
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
