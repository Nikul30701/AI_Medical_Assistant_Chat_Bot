// src/hooks/useWebSocket.js
import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setWsStatus, setChatError } from '../store/slices/chatSlice'
import { selectAccessToken } from '../store/slices/authSlice'

const WS = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export default function useWebSocket(documentId) {
  const dispatch   = useDispatch()
  const token      = useSelector(selectAccessToken)
  const wsRef      = useRef(null)
  const retryTimer = useRef(null)
  const retries    = useRef(0)

  const connect = useCallback(function doConnect() {
    if (!documentId || !token) return
    dispatch(setWsStatus('connecting'))
    const ws = new WebSocket(`${WS}/ws/chat/${documentId}/?token=${token}`)
    wsRef.current = ws

    ws.onopen    = () => { dispatch(setWsStatus('connected')); retries.current = 0 }
    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data)
      if (msg.type === 'message') dispatch(addMessage({ role: msg.role, content: msg.content }))
    }
    ws.onerror   = () => dispatch(setChatError('Connection error'))
    ws.onclose   = ({ code }) => {
      dispatch(setWsStatus('disconnected'))
      wsRef.current = null
      if (code !== 1000 && retries.current < 4) {
        retryTimer.current = setTimeout(doConnect, Math.min(1000 * 2 ** retries.current, 15000))
        retries.current++
      }
    }
  }, [documentId, token, dispatch])

  useEffect(() => {
    connect()
    return () => { clearTimeout(retryTimer.current); wsRef.current?.close(1000, 'unmount') }
  }, [connect])

  const sendMessage = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      dispatch(addMessage({ role: 'user', content: text }))
      wsRef.current.send(JSON.stringify({ message: text }))
      return true
    }
    return false
  }, [dispatch])

  return { sendMessage }
}
