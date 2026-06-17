import React, { useState } from 'react'
import { HotkeyRecorder } from './HotkeyRecorder'

interface Props {
  existingAccelerators: string[]
  onAdd: (data: { name: string; filePath: string; accelerator: string; volume: number }) => Promise<void>
  onClose: () => void
}

export function AddBindingModal({ existingAccelerators, onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [filePath, setFilePath] = useState('')
  const [fileName, setFileName] = useState('')
  const [accelerator, setAccelerator] = useState('')
  const [volume, setVolume] = useState(1.0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleBrowse() {
    const p = await window.electronAPI.openFileDialog()
    if (p) {
      setFilePath(p)
      setFileName(p.split('/').pop() || p.split('\\').pop() || p)
      if (!name) {
        const base = (p.split('/').pop() || '').replace(/\.[^/.]+$/, '')
        setName(base)
      }
    }
  }

  async function handleSave() {
    if (!filePath) { setError('Ses dosyası seçmelisin.'); return }
    if (!accelerator) { setError('Tuş kombinasyonu belirlemek zorundasın.'); return }
    if (!name.trim()) { setError('İsim boş olamaz.'); return }

    setSaving(true)
    setError('')
    try {
      await onAdd({ name: name.trim(), filePath, accelerator, volume })
      onClose()
    } catch (e) {
      setError(String(e))
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h2>Yeni Ses Bağlama</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label>
            Ses Dosyası
            <div className="file-row">
              <span className="file-name">{fileName || 'Dosya seçilmedi'}</span>
              <button className="btn btn-secondary" onClick={handleBrowse}>Gözat</button>
            </div>
          </label>

          <label>
            İsim
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Alkış"
              maxLength={40}
            />
          </label>

          <label>
            Tuş Kombinasyonu
            <HotkeyRecorder
              value={accelerator}
              onChange={setAccelerator}
              existingAccelerators={existingAccelerators}
            />
          </label>

          <label>
            Ses Seviyesi — {Math.round(volume * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>

          {error && <div className="error-msg">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>İptal</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
