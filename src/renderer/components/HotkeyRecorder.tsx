import React, { useState, useRef } from 'react'

interface Props {
  value: string
  onChange: (accelerator: string) => void
  existingAccelerators?: string[]
  currentId?: string
}

const MODIFIER_KEYS = new Set(['Control', 'Meta', 'Alt', 'Shift'])

function toAccelerator(e: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null

  const parts: string[] = []
  if (e.ctrlKey) parts.push('CommandOrControl')
  else if (e.metaKey) parts.push('CommandOrControl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  let key = e.key
  if (key === ' ') key = 'Space'
  else if (key.length === 1) key = key.toUpperCase()
  else if (key === 'ArrowUp') key = 'Up'
  else if (key === 'ArrowDown') key = 'Down'
  else if (key === 'ArrowLeft') key = 'Left'
  else if (key === 'ArrowRight') key = 'Right'

  parts.push(key)
  return parts.join('+')
}

export function HotkeyRecorder({ value, onChange, existingAccelerators = [] }: Props) {
  const [recording, setRecording] = useState(false)
  const [conflict, setConflict] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    e.preventDefault()
    e.stopPropagation()

    const acc = toAccelerator(e.nativeEvent)
    if (!acc) return

    if (existingAccelerators.includes(acc)) {
      setConflict(true)
      return
    }

    setConflict(false)
    onChange(acc)
    setRecording(false)
    inputRef.current?.blur()
  }

  return (
    <div className="hotkey-recorder">
      <div
        ref={inputRef}
        className={`hotkey-input ${recording ? 'recording' : ''} ${conflict ? 'conflict' : ''}`}
        tabIndex={0}
        onFocus={() => { setRecording(true); setConflict(false) }}
        onBlur={() => setRecording(false)}
        onKeyDown={handleKeyDown}
      >
        {recording ? (
          <span className="hotkey-hint">Tuş kombinasyonuna bas...</span>
        ) : value ? (
          <span className="hotkey-value">{value}</span>
        ) : (
          <span className="hotkey-placeholder">Kaydetmek için tıkla</span>
        )}
      </div>
      {conflict && <span className="hotkey-conflict">Bu kombinasyon zaten kullanımda</span>}
      {value && !recording && (
        <button
          className="hotkey-clear"
          onClick={(e) => { e.stopPropagation(); onChange('') }}
          title="Temizle"
        >
          ✕
        </button>
      )}
    </div>
  )
}
