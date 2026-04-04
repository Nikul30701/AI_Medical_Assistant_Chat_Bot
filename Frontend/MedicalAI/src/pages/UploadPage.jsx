import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUploadDocumentMutation } from '../services/API'
import Navbar from '../components/Navbar'
import { Button, Input, Alert, Spinner } from '../components/UI'

const ACCEPT = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_MB = 10

export default function UploadPage() {
    const navigate = useNavigate()
    const [upload] = useUploadDocumentMutation()

    const [file, setFile] = useState(null)
    const [title, setTitle] = useState('')
    const [drag, setDrag] = useState(false)
    const [error, setError] = useState('')
    const [phase, setPhase] = useState('idle') // idle|uploading|analyzing|done
    const fileRef = useRef()

    // Memoize pickFile so it updates its closure when `title` changes
  const pickFile = useCallback((f) => {
    if (!ACCEPT.includes(f.type)) return setError('Only PDF, JPG, PNG files allowed');
    if (f.size > MAX_MB * 1024 * 1024) return setError(`Max file size is ${MAX_MB}MB`);
    
    setFile(f); 
    setError('');
    
    // Now it safely reads the current 'title' state
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  }, [title]); 

  // onDrop now safely depends on the memoized pickFile
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false); 
    
    const f = e.dataTransfer.files[0];
    if (f) {
      pickFile(f);
    }
  }, [pickFile]);

  
    const onSubmit = async (e) => {
        e.preventDefault()
        if (!file) return setError('Please select a file')
        if (!title.trim()) return setError('Please enter a title')
        setError(''); setPhase('uploading')

        const fd = new FormData()
        fd.append('file', file)
        fd.append('title', title.trim())

        try {
            setPhase('analyzing')
            const result = await upload(fd).unwrap()
            setPhase('done')
            setTimeout(() => navigate(`/documents/${result.id}`), 800)
        } catch (err) {
            setPhase('idle')
            setError(err?.data?.error || 'Upload failed. Please try again.')
        }
    }

    const busy = phase === 'uploading' || phase === 'analyzing'

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />
            
            <main className="max-w-2xl mx-auto px-6 py-12 lg:py-20">
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="group flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest mb-8"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Records
                </button>

                {/* Main Card */}
                <div className="bg-white border border-slate-200/60 rounded-[32px] shadow-xl shadow-slate-200/40 overflow-hidden">
                    
                    {/* Header Section */}
                    <div className="p-8 pb-0">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analyze Record</h1>
                        </div>
                        <p className="text-slate-500 text-[14px] leading-relaxed">
                            Upload clinical reports, bloodwork, or imaging results. 
                            Our <span className="text-indigo-600 font-bold italic">Core v2.0 AI</span> will extract markers automatically.
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="p-8 space-y-6">
                        
                        {/* Drop Zone */}
                        <div
                            onClick={() => !busy && fileRef.current.click()}
                            onDragOver={e => { e.preventDefault(); !busy && setDrag(true) }}
                            onDragLeave={() => setDrag(false)}
                            onDrop={onDrop}
                            className={`
                                relative group flex flex-col items-center justify-center gap-4 p-10 
                                border-2 border-dashed rounded-[24px] transition-all duration-500
                                ${drag ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'}
                                ${file ? 'border-emerald-500/40 bg-emerald-50/30' : ''}
                                ${busy ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}
                            `}
                        >
                            <input 
                                ref={fileRef} 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png" 
                                className="hidden"
                                onChange={e => e.target.files[0] && pickFile(e.target.files[0])} 
                            />

                            {file ? (
                                <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                                    <div className="w-16 h-16 mb-4 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-emerald-100">
                                        {file.type === 'application/pdf' ? 
                                            <span className="text-2xl">📄</span> : <span className="text-2xl">🖼️</span>
                                        }
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-[10px] font-black text-emerald-600 mt-1 uppercase tracking-widest">
                                        Ready for Processing • {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                    <button 
                                        type="button" 
                                        onClick={e => { e.stopPropagation(); setFile(null); setTitle('') }}
                                        className="mt-4 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm font-bold text-slate-900">Drag file here or <span className="text-indigo-600 underline underline-offset-4">browse</span></p>
                                        <p className="text-[11px] font-medium text-slate-400 mt-2">Maximum 10MB (PDF, JPEG, PNG)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="space-y-4">
                            <Input 
                                label="Analysis Label" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Q1 Metabolic Panel" 
                                disabled={busy}
                                className="rounded-2xl border-slate-200 focus:border-indigo-500 h-12"
                            />
                        </div>

                        {error && (
                            <Alert type="error" className="rounded-2xl border-rose-100 bg-rose-50/50 text-rose-700 text-xs font-bold">
                                {error}
                            </Alert>
                        )}

                        {/* Status Message */}
                        {busy && (
                            <div className="p-6 rounded-2xl bg-slate-900 text-white animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-4">
                                    <Spinner size={18} className="text-indigo-400" />
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">
                                            {phase === 'uploading' ? 'Encryption Active' : 'AI Processing Engine'}
                                        </p>
                                        <p className="text-xs font-medium opacity-80">
                                            {phase === 'uploading' ? 'Securing your medical data...' : 'Extracting clinical findings...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {phase === 'done' && (
                            <div className="p-6 rounded-2xl bg-emerald-500 text-white flex items-center gap-4 animate-in zoom-in-95">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                                <p className="text-sm font-bold tracking-tight">Analysis complete. Redirecting...</p>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={busy || phase === 'done'} 
                            className="w-full h-14 text-[15px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 transition-all hover:shadow-indigo-200"
                        >
                            {phase === 'idle' ? 'Start Analysis' : 'Processing...'}
                        </Button>
                    </form>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4 opacity-50 grayscale">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HIPAA Compliant</span>
                    <div className="h-3 w-[1px] bg-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AES-256 Encrypted</span>
                </div>
            </main>
        </div>
    )
}