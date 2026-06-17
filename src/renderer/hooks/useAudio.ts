import { useEffect, useRef, useCallback } from 'react'
import { Howl } from 'howler'
import type { Binding } from '../../main/store'

export function useAudio(bindings: Binding[], globalVolume: number) {
  const howlMap = useRef<Map<string, Howl>>(new Map())

  useEffect(() => {
    const currentIds = new Set(bindings.map((b) => b.id))

    howlMap.current.forEach((howl, id) => {
      if (!currentIds.has(id)) {
        howl.unload()
        howlMap.current.delete(id)
      }
    })

    bindings.forEach((binding) => {
      const existing = howlMap.current.get(binding.id)
      if (!existing) {
        const howl = new Howl({
          src: [`file://${binding.filePath}`],
          volume: binding.volume * globalVolume,
          preload: true,
          html5: false
        })
        howlMap.current.set(binding.id, howl)
      } else {
        existing.volume(binding.volume * globalVolume)
      }
    })

    return () => {}
  }, [bindings, globalVolume])

  useEffect(() => {
    const unsubscribe = window.electronAPI.onPlaySound((id: string) => {
      const howl = howlMap.current.get(id)
      if (howl) {
        howl.stop()
        howl.play()
      }
    })
    return unsubscribe
  }, [])

  const playPreview = useCallback((id: string) => {
    const howl = howlMap.current.get(id)
    if (howl) {
      howl.stop()
      howl.play()
    }
  }, [])

  const stopAll = useCallback(() => {
    howlMap.current.forEach((howl) => howl.stop())
  }, [])

  useEffect(() => {
    return () => {
      howlMap.current.forEach((howl) => howl.unload())
      howlMap.current.clear()
    }
  }, [])

  return { playPreview, stopAll }
}
