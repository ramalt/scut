import React, { useState, useRef } from 'react'

interface Props {
  value: string
  onChange: (accelerator: string) => void
  existingAccelerators?: string[]
  currentId?: string
}

const MODIFIER_KEYS = new Set(['Control', 'Meta', 'Alt', 'Shift', 'CapsLock', 'NumLock', 'ScrollLock'])

// e.code → Electron accelerator key name (fiziksel tuş, layout bağımsız)
const CODE_TO_KEY: Record<string, string> = {
  Space: 'Space', Enter: 'Return', Backspace: 'Backspace', Tab: 'Tab',
  Escape: 'Escape', Delete: 'Delete', Insert: 'Insert',
  Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown',
  ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4', F5: 'F5', F6: 'F6',
  F7: 'F7', F8: 'F8', F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
  F13: 'F13', F14: 'F14', F15: 'F15', F16: 'F16', F17: 'F17', F18: 'F18',
  F19: 'F19', F20: 'F20', F21: 'F21', F22: 'F22', F23: 'F23', F24: 'F24',
  Numpad0: 'num0', Numpad1: 'num1', Numpad2: 'num2', Numpad3: 'num3',
  Numpad4: 'num4', Numpad5: 'num5', Numpad6: 'num6', Numpad7: 'num7',
  Numpad8: 'num8', Numpad9: 'num9',
  NumpadAdd: 'numadd', NumpadSubtract: 'numsub', NumpadMultiply: 'nummult',
  NumpadDivide: 'numdiv', NumpadDecimal: 'numdec',
  Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']',
  Backslash: '\\', Semicolon: ';', Quote: "'", Backquote: '`',
  Comma: ',', Period: '.', Slash: '/',
}

function toAccelerator(e: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null

  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push('CommandOrControl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  // Önce code map'e bak, sonra letter/digit kodu dene
  let key: string | undefined = CODE_TO_KEY[e.code]

  if (!key) {
    // KeyA → 'A', Digit1 → '1'
    if (/^Key[A-Z]$/.test(e.code)) {
      key = e.code.slice(3) // 'KeyA' → 'A'
    } else if (/^Digit[0-9]$/.test(e.code)) {
      key = e.code.slice(5) // 'Digit1' → '1'
    }
  }

  if (!key) return null
  if (parts.length === 0) return null // Modifier'sız tek tuş accelerator olarak kaydedilmez

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
