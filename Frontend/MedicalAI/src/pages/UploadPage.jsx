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

    const pickFile = (f) => {
        if (!ACCEPT.includes(f.type)) return setError('Only PDF, JPG, PNG files allowed')
        if (f.size > MAX_MB * 1024 * 1024) return setError(`Max file size is ${MAX_MB}MB`)
        setFile(f); setError('')
        if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
    }

    const onDrop = useCallback((e) => {
        e.preventDefault(); setDrag(false)
        const f = e.dataTransfer.files[0]; if (f) pickFile(f)
    }, [title])

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
        <div className="min-h-screen bg-white text-zinc-900">
        <Navbar />
        
        <main className="max-w-[580px] mx-auto px-6 py-16">
            {/* Header */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
                onClick={() => navigate('/dashboard')} 
                className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest mb-6"
            >
                ← Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Upload Record</h1>
            <p className="text-sm text-zinc-500 mt-2">
                Upload medical results or imaging. Our AI will extract key findings automatically.
            </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            
            {/* Enhanced Drop Zone */}
            <div
                onClick={() => !busy && fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); !busy && setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                className={`
                relative group flex flex-col items-center justify-center gap-4 p-12 
                border-2 border-dashed rounded-[24px] transition-all duration-300
                ${drag ? 'border-zinc-900 bg-zinc-50 scale-[1.01]' : 'border-zinc-200 bg-white hover:border-zinc-400'}
                ${file ? 'border-emerald-500/30 bg-emerald-50/20' : ''}
                ${busy ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
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
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center justify-center text-3xl">
                    {file.type === 'application/pdf' ? '📄' : '🖼️'}
                    </div>
                    <p className="text-sm font-bold text-emerald-700 truncate max-w-[250px]">{file.name}</p>
                    <p className="text-[11px] font-medium text-zinc-400 mt-1 uppercase tracking-tighter">
                    {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button 
                    type="button" 
                    onClick={e => { e.stopPropagation(); setFile(null); setTitle('') }}
                    className="mt-4 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors"
                    >
                    Change File
                    </button>
                </div>
                ) : (
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📂
                    </div>
                    <div className="mt-4">
                    <p className="text-sm font-bold text-zinc-900">Click to upload or drag & drop</p>
                    <p className="text-xs text-zinc-400 mt-1">PDF, PNG, or JPG up to {MAX_MB}MB</p>
                    </div>
                </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                <Input 
                label="Document Title" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Yearly Bloodwork" 
                hint="This will be used to identify the record in your dashboard" 
                required 
                disabled={busy}
                />
            </div>

            {error && <Alert type="error" className="rounded-xl">{error}</Alert>}

            {/* Progress State */}
            {busy && (
                <div className="p-5 rounded-2xl bg-zinc-900 text-white flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                <Spinner size={20} className="text-white" />
                <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                    {phase === 'uploading' ? 'Securing File...' : 'AI Analysis in progress'}
                    </p>
                    <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-white animate-infinite-loading" style={{ width: '40%' }} />
                    </div>
                </div>
                </div>
            )}

            {phase === 'done' && (
                <div className="p-5 rounded-2xl bg-emerald-600 text-white flex items-center gap-4">
                <span className="text-xl">✅</span>
                <p className="text-sm font-bold">Analysis finished. Opening report...</p>
                </div>
            )}

            <Button 
                type="submit" 
                disabled={busy || phase === 'done'} 
                loading={busy} 
                className="w-full h-14 text-base rounded-2xl"
            >
                Start Analysis
            </Button>
            </form>

            <p className="mt-8 text-center text-[10px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
            By uploading, you agree to have your data processed by our HIPAA-compliant AI engine.
            </p>
        </main>
        </div>
    )
}