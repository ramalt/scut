import React from 'react'
import { BindingRow } from './BindingRow'
import type { Binding } from '../../main/store'

interface Props {
  bindings: Binding[]
  onToggle: (id: string, enabled: boolean) => void
  onVolumeChange: (id: string, volume: number) => void
  onDelete: (id: string) => void
  onPlay: (id: string) => void
}

export function BindingList({ bindings, onToggle, onVolumeChange, onDelete, onPlay }: Props) {
  if (bindings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎵</div>
        <p>Henüz ses bağlaması yok.</p>
        <p className="empty-hint">Yukarıdaki "Ekle" butonuna tıklayarak başla.</p>
      </div>
    )
  }

  return (
    <div className="binding-list">
      <div className="binding-list-header">
        <span>İsim</span>
        <span>Tuş Kombinasyonu</span>
        <span>Ses Seviyesi</span>
        <span>İşlemler</span>
      </div>
      {bindings.map((binding) => (
        <BindingRow
          key={binding.id}
          binding={binding}
          onToggle={onToggle}
          onVolumeChange={onVolumeChange}
          onDelete={onDelete}
          onPlay={onPlay}
        />
      ))}
    </div>
  )
}
