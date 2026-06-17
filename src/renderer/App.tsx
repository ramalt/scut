import React, { useState } from 'react'
import { BindingList } from './components/BindingList'
import { AddBindingModal } from './components/AddBindingModal'
import { useBindings } from './hooks/useBindings'
import { useAudio } from './hooks/useAudio'

export default function App() {
  const { bindings, globalVolume, loading, addBinding, updateBinding, deleteBinding, setGlobalVolume } =
    useBindings()
  const { playPreview, stopAll } = useAudio(bindings, globalVolume)
  const [showModal, setShowModal] = useState(false)

  const accelerators = bindings.map((b) => b.accelerator).filter(Boolean)

  async function handleAdd(data: { name: string; filePath: string; accelerator: string; volume: number }) {
    const result = await addBinding(data)
    if (result.warning) {
      alert(`Uyarı: ${result.warning}`)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-icon">🔊</span>
          <h1>Scut</h1>
          <span className="app-subtitle">Soundboard</span>
        </div>

        <div className="app-controls">
          <div className="global-volume">
            <label>
              <span>Global Ses</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={globalVolume}
                onChange={(e) => setGlobalVolume(Number(e.target.value))}
              />
              <span className="volume-pct">{Math.round(globalVolume * 100)}%</span>
            </label>
          </div>

          <button className="btn btn-ghost" onClick={stopAll} title="Tüm sesleri durdur">
            ⏹ Durdur
          </button>

          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Ekle
          </button>
        </div>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <BindingList
            bindings={bindings}
            onToggle={(id, enabled) => updateBinding(id, { enabled })}
            onVolumeChange={(id, volume) => updateBinding(id, { volume })}
            onDelete={deleteBinding}
            onPlay={playPreview}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>{bindings.length} bağlama • Uygulama arka planda çalışıyor</span>
      </footer>

      {showModal && (
        <AddBindingModal
          existingAccelerators={accelerators}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
