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

      // Maintain scroll position when loading older messages
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
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <Spinner size={40} />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <p className="text-xl font-medium text-zinc-400">Document not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      <Navbar />

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[400px_1fr] max-w-7xl mx-auto w-full p-4 lg:p-6 gap-6">
        
        {/* Sidebar - Document Analysis */}
        <aside className="flex flex-col gap-5 overflow-y-auto lg:pr-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors self-start"
          >
            ← Back to Dashboard
          </button>

          {/* Document Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
            <div className="flex items-start justify-between mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner
                ${doc.file_type === 'pdf' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {doc.file_type === 'pdf' ? '📄' : '🖼️'}
              </div>
              <Badge status={doc.status} />
            </div>

            <h1 className="text-xl font-semibold leading-tight tracking-tight mb-1">{doc.title}</h1>
            <p className="text-sm text-zinc-500">
              Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </p>
          </div>

          {/* Analysis Sections */}
          {doc.analysis ? (
            <div className="space-y-5">
              <Section icon="📋" title="Executive Summary">
                <p className="text-zinc-600 leading-relaxed">{doc.analysis.summary}</p>
              </Section>

              <Section icon="🔍" title="Key Findings">
                <ul className="space-y-3 text-sm text-zinc-600">
                  {doc.analysis.key_findings?.map((finding, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-emerald-500 mt-1">•</span>
                      {finding}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section icon="💊" title="Medications">
                <div className="flex flex-wrap gap-2">
                  {doc.analysis.medications?.map((med, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-white border border-zinc-200 rounded-2xl text-sm font-medium text-zinc-700"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </Section>

              {doc.analysis.warnings?.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
                  <div className="flex items-center gap-2 text-red-600 font-semibold mb-3">
                    ⚠️ Critical Warnings
                  </div>
                  <div className="space-y-2 text-sm text-red-700">
                    {doc.analysis.warnings.map((warning, i) => (
                      <p key={i}>{warning}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-12 text-center">
              <Spinner size={28} className="mx-auto text-zinc-300" />
              <p className="mt-4 text-zinc-500">AI is still analyzing this document...</p>
            </div>
          )}

          <div className="mt-auto text-[10px] text-zinc-400 leading-relaxed px-2">
            ⚕ This is an AI-generated analysis for informational purposes only. 
            Always consult a qualified medical professional.
          </div>
        </aside>

        {/* Chat Area */}
        <div className="bg-white rounded-3xl flex flex-col h-full overflow-hidden shadow-sm border border-zinc-100">
          
          {/* Chat Header */}
          <header className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-white">
            <div>
              <h3 className="font-semibold text-lg tracking-tight">Medical Assistant</h3>
              <p className="text-xs text-zinc-500">Ask anything about this document</p>
            </div>
            
            <div className="flex items-center gap-3">
              <WsStatus status={connectionStatus} />
              {connectionStatus !== 'connected' && (
                <Button size="sm" variant="ghost" onClick={reconnect}>
                  Reconnect
                </Button>
              )}
            </div>
          </header>

          {/* Messages */}
          <div
            ref={msgContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/70"
          >
            <div ref={topSentinelRef} className="h-2" />

            {loadingOlder && (
              <div className="flex justify-center py-4">
                <Spinner size={20} />
              </div>
            )}

            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="text-6xl mb-6 opacity-40">💬</div>
                <p className="text-xl font-medium text-zinc-400">No conversation yet</p>
                <p className="text-sm text-zinc-500 mt-2 max-w-xs">
                  Ask the AI assistant anything about this medical document
                </p>
              </div>
            ) : (
              messages.map((msg) => <Bubble key={msg.id || msg.timestamp} msg={msg} />)
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <footer className="p-5 border-t border-zinc-100 bg-white">
            <div className="flex gap-3 max-w-4xl mx-auto">
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
                placeholder="Ask about findings, medications, risks..."
                rows={1}
                className="flex-1 resize-y min-h-[52px] max-h-32 p-4 text-sm bg-zinc-50 border border-zinc-200 rounded-3xl 
                           focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/30 outline-none transition-all"
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                }}
              />

              <Button
                onClick={handleSend}
                disabled={connectionStatus !== 'connected' || !input.trim()}
                className="h-[52px] px-8 rounded-3xl font-medium shadow-sm"
              >
                Send
              </Button>
            </div>
            
            <p className="text-center text-[10px] text-zinc-400 mt-3">
              AI responses are generated based on document analysis
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

// ── Sub Components ─────────────────────────────────────────────────────────────

function Bubble({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 
                          flex items-center justify-center text-white text-lg flex-shrink-0 shadow">
            ⚕
          </div>
        )}

        <div
          className={`px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed shadow-sm
            ${isUser 
              ? 'bg-zinc-900 text-white rounded-br-none' 
              : 'bg-white border border-zinc-100 text-zinc-800 rounded-bl-none'}`}
        >
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          <p className={`text-[10px] mt-2 opacity-60 ${isUser ? 'text-right' : ''}`}>
            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
      <h3 className="uppercase text-xs font-bold tracking-[0.08em] text-zinc-400 mb-4 flex items-center gap-2">
        <span className="text-base">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function WsStatus({ status }) {
  const configs = {
    connected: { dot: 'bg-emerald-500', label: 'Connected', pulse: false },
    connecting: { dot: 'bg-amber-500 animate-pulse', label: 'Connecting...' },
    disconnected: { dot: 'bg-red-500', label: 'Disconnected' },
    error: { dot: 'bg-red-500', label: 'Error' },
  };

  const config = configs[status] || configs.disconnected;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600">
      <span className={`inline-block w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
}