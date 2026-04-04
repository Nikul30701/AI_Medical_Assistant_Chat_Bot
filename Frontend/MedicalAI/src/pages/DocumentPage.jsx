// src/pages/DocumentPage.jsx
import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetDocumentQuery } from '../services/API';
import { setMessages, prependMessages, selectMessages, selectWsStatus } from '../store/slices/chatSlice';
import { selectAccessToken } from '../store/slices/authSlice';
import useWebSocket from '../hooks/useWebSocket';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import Navbar from '../components/Navbar';
import { Button, Spinner, Badge } from '../components/UI';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function DocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const messages = useSelector(selectMessages);
  const wsStatus = useSelector(selectWsStatus);
  const token = useSelector(selectAccessToken);

  const { data: doc, isLoading: docLoading } = useGetDocumentQuery(id);

  const [cursor, setCursor] = useState(null);
  const [hasOlder, setHasOlder] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [input, setInput] = useState('');

  const initialLoaded = useRef(false);
  const msgContainerRef = useRef(null);
  const bottomRef = useRef(null);

  const { sendMessage, connectionStatus, reconnect } = useWebSocket(id);

  // Initial message load
  useEffect(() => {
    if (initialLoaded.current || !token || !id) return;
    initialLoaded.current = true;

    fetch(`${BASE}/chat/${id}/messages/?page_size=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        dispatch(setMessages(data.results || []));
        setCursor(data.next);
        setHasOlder(!!data.next);
      })
      .catch(() => dispatch(setMessages([])));
  }, [id, token, dispatch]);

  // Load older messages
  const loadOlder = useCallback(async () => {
    if (!cursor || loadingOlder) return;

    setLoadingOlder(true);
    const container = msgContainerRef.current;
    const prevHeight = container?.scrollHeight || 0;

    try {
      const res = await fetch(cursor, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      dispatch(prependMessages(data.results || []));
      setCursor(data.next);
      setHasOlder(!!data.next);

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevHeight;
        }
      });
    } catch (err) {
      console.error('Failed to load older messages');
    } finally {
      setLoadingOlder(false);
    }
  }, [cursor, loadingOlder, token, dispatch]);

  const topSentinelRef = useInfiniteScroll(loadOlder, {
    enabled: hasOlder && !loadingOlder,
    rootRef: msgContainerRef,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && !loadingOlder) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingOlder]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || connectionStatus !== 'connected') return;

    const success = sendMessage(trimmed);
    if (success) setInput('');
  };

  if (docLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner size={40} className="text-indigo-600" />
        <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Loading Clinical Data</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center text-3xl mb-6">🚫</div>
        <p className="text-xl font-black text-slate-900 tracking-tight">Document not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-6 px-8 rounded-2xl">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[380px_1fr] max-w-[1600px] mx-auto w-full p-4 lg:p-6 gap-6">
        
        {/* SIDEBAR: Clinical Analysis */}
        <aside className="flex flex-col gap-5 overflow-y-auto custom-scrollbar lg:pr-2 fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest mb-2"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </button>

          {/* Document Header Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative flex items-start justify-between mb-6">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl shadow-sm border p-2
                ${doc.file_type === 'pdf' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                {doc.file_type === 'pdf' ? '📄' : '🖼️'}
              </div>
              <Badge status={doc.status} className="scale-90 origin-right" />
            </div>

            <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight mb-2 uppercase italic">{doc.title}</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recorded {new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Analysis Data Sections */}
          {doc.analysis ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <Section icon="✨" title="Executive Summary">
                <p className="text-[14px] text-slate-600 leading-relaxed font-medium">{doc.analysis.summary}</p>
              </Section>

              <Section icon="🔬" title="Key Findings">
                <ul className="space-y-3">
                  {doc.analysis.key_findings?.map((finding, i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-slate-600 font-medium group">
                      <span className="text-indigo-500 font-black mt-0.5 group-hover:scale-125 transition-transform">•</span>
                      {finding}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section icon="💊" title="Medications Identified">
                <div className="flex flex-wrap gap-2">
                  {doc.analysis.medications?.map((med, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-black text-slate-700 hover:border-indigo-200 hover:bg-white transition-colors">
                      {med}
                    </span>
                  ))}
                </div>
              </Section>

              {doc.analysis.warnings?.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-[28px] p-6 shadow-sm shadow-rose-100/50">
                  <div className="flex items-center gap-2 text-rose-700 text-[11px] font-black uppercase tracking-[0.15em] mb-4">
                    <span className="text-lg">⚠️</span> Critical Flags
                  </div>
                  <div className="space-y-3">
                    {doc.analysis.warnings.map((warning, i) => (
                      <p key={i} className="text-[13px] font-bold text-rose-800 leading-snug">
                        {warning}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center">
              <Spinner size={24} className="mx-auto text-indigo-400 mb-4" />
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Processing Biology...</p>
            </div>
          )}

          <div className="mt-6 bg-slate-900 rounded-2xl p-4 text-[10px] text-slate-400 leading-relaxed border border-white/10 italic">
            <span className="text-amber-500 font-bold">DISCLAIMER:</span> AI-generated report. This is not medical advice. Cross-reference all data with your primary care physician.
          </div>
        </aside>

        {/* CHAT AREA: Concierge Interface */}
        <div className="bg-white rounded-[32px] flex flex-col h-full overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-200/60">
          
          {/* Concierge Header */}
          <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight uppercase italic">Concierge Assistant</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Core v2.0 Extraction Engine</p>
            </div>
            
            <div className="flex items-center gap-4">
              <WsStatus status={connectionStatus} />
              {connectionStatus !== 'connected' && (
                <button 
                  onClick={reconnect}
                  className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                >
                  Reconnect
                </button>
              )}
            </div>
          </header>

          {/* Message List */}
          <div
            ref={msgContainerRef}
            className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F8FAFC]/50 custom-scrollbar"
          >
            <div ref={topSentinelRef} className="h-1" />

            {loadingOlder && (
              <div className="flex justify-center py-4">
                <Spinner size={20} className="text-indigo-500" />
              </div>
            )}

            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-indigo-50 rounded-[30%] flex items-center justify-center text-3xl mb-6 shadow-inner">💬</div>
                <p className="text-xl font-black text-slate-900 tracking-tight italic">No Dialogue Yet</p>
                <p className="text-sm font-medium text-slate-400 mt-2 max-w-xs">
                  Ask questions about findings, lab ranges, or follow-up recommendations.
                </p>
              </div>
            ) : (
              messages.map((msg) => <Bubble key={msg.id || msg.timestamp} msg={msg} />)
            )}

            <div ref={bottomRef} />
          </div>

          {/* Interaction Footer */}
          <footer className="p-6 border-t border-slate-100 bg-white">
            <div className="flex gap-3 max-w-5xl mx-auto items-end">
              <div className="flex-1 relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={connectionStatus !== 'connected'}
                  placeholder="Inquire about clinical findings..."
                  rows={1}
                  className="w-full resize-none min-h-[56px] max-h-32 p-4 pr-12 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl 
                           focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all duration-300"
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                  }}
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={connectionStatus !== 'connected' || !input.trim()}
                className="h-[56px] px-8 rounded-2xl font-black uppercase tracking-widest text-[13px] shadow-lg shadow-indigo-100"
              >
                Inquire
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-4 opacity-40">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Protocol</span>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">HIPAA Compliant Session</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

/* ── SUB-COMPONENTS ──────────────────────────────────────────────────────── */

function Bubble({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex gap-4 max-w-[85%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && (
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-lg shadow-slate-200">
            <span className="text-xs italic font-black">AI</span>
          </div>
        )}

        <div
          className={`px-6 py-4 rounded-[24px] text-[15px] leading-relaxed shadow-sm font-medium
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100' 
              : 'bg-white border border-slate-200/60 text-slate-800 rounded-bl-none'}`}
        >
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          <div className={`flex items-center gap-2 mt-3 opacity-50 text-[10px] font-black uppercase tracking-widest ${isUser ? 'justify-end text-white' : 'text-slate-400'}`}>
              {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {isUser && <span>• Delivered</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-[28px] p-6 shadow-sm group hover:border-indigo-100 transition-colors">
      <h3 className="uppercase text-[10px] font-black tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
        <span className="text-base group-hover:scale-110 transition-transform">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function WsStatus({ status }) {
  const configs = {
    connected: { dot: 'bg-emerald-500', label: 'Engine Online', bg: 'bg-emerald-50 text-emerald-700' },
    connecting: { dot: 'bg-amber-500 animate-pulse', label: 'Syncing...', bg: 'bg-amber-50 text-amber-700' },
    disconnected: { dot: 'bg-rose-500', label: 'Offline', bg: 'bg-rose-50 text-rose-700' },
    error: { dot: 'bg-rose-500', label: 'Link Error', bg: 'bg-rose-50 text-rose-700' },
  };

  const config = configs[status] || configs.disconnected;

  return (
    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current opacity-80 ${config.bg}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
}