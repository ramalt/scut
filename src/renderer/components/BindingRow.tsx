import React, { useState } from 'react'
import type { Binding } from '../../main/store'

interface Props {
  binding: Binding
  onToggle: (id: string, enabled: boolean) => void
  onVolumeChange: (id: string, volume: number) => void
  onDelete: (id: string) => void
  onPlay: (id: string) => void
}

export function BindingRow({ binding, onToggle, onVolumeChange, onDelete, onPlay }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={`binding-row ${!binding.enabled ? 'disabled' : ''}`}>
      <div className="binding-name">{binding.name}</div>

      <div className="binding-accelerator">
        <span className="hotkey-badge">{binding.accelerator || '—'}</span>
      </div>

      <div className="binding-volume">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={binding.volume}
          onChange={(e) => onVolumeChange(binding.id, Number(e.target.value))}
          title={`${Math.round(binding.volume * 100)}%`}
        />
        <span className="volume-label">{Math.round(binding.volume * 100)}%</span>
      </div>

      <div className="binding-actions">
        <button
          className="btn-icon"
          title="Önizle"
          onClick={() => onPlay(binding.id)}
        >
          ▶
        </button>

        <button
          className={`btn-icon toggle ${binding.enabled ? 'on' : 'off'}`}
          title={binding.enabled ? 'Devre dışı bırak' : 'Etkinleştir'}
          onClick={() => onToggle(binding.id, !binding.enabled)}
        >
          {binding.enabled ? '●' : '○'}
        </button>

        {confirmDelete ? (
          <>
            <button className="btn-icon danger" onClick={() => onDelete(binding.id)}>✓</button>
            <button className="btn-icon" onClick={() => setConfirmDelete(false)}>✕</button>
          </>
        ) : (
          <button
            className="btn-icon"
            title="Sil"
            onClick={() => setConfirmDelete(true)}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  )
}
