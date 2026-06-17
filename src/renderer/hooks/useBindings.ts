import { useState, useEffect, useCallback } from 'react'
import type { Binding } from '../../main/store'

export function useBindings() {
  const [bindings, setBindings] = useState<Binding[]>([])
  const [globalVolume, setGlobalVolumeState] = useState(1.0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      window.electronAPI.getBindings(),
      window.electronAPI.getGlobalVolume()
    ]).then(([b, v]) => {
      setBindings(b)
      setGlobalVolumeState(v)
      setLoading(false)
    })
  }, [])

  const addBinding = useCallback(
    async (data: { name: string; filePath: string; accelerator: string; volume: number }) => {
      const result = await window.electronAPI.addBinding(data)
      setBindings((prev) => [...prev, result.binding])
      return result
    },
    []
  )

  const updateBinding = useCallback(async (id: string, partial: Partial<Binding>) => {
    const updated = await window.electronAPI.updateBinding(id, partial)
    if (updated) {
      setBindings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    }
    return updated
  }, [])

  const deleteBinding = useCallback(async (id: string) => {
    await window.electronAPI.deleteBinding(id)
    setBindings((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const setGlobalVolume = useCallback(async (v: number) => {
    await window.electronAPI.setGlobalVolume(v)
    setGlobalVolumeState(v)
  }, [])

  return {
    bindings,
    globalVolume,
    loading,
    addBinding,
    updateBinding,
    deleteBinding,
    setGlobalVolume
  }
}
