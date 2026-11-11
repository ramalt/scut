import { useEffect, useRef, useCallback, useState } from 'react'
import { Howl } from 'howler'
import type { Binding } from '../../main/store'

export function useAudio(bindings: Binding[], globalVolume: number) {
  const howlMap = useRef<Map<string, Howl>>(new Map())
  // Şu an çalan pad'ler ve her tetiklemede artan sayaç (flash animasyonunu yeniden başlatmak için)
  const [playingIds, setPlayingIds] = useState<Set<string>>(new Set())
  const [hits, setHits] = useState<Record<string, number>>({})

  const markPlaying = useCallback((id: string, playing: boolean) => {
    setPlayingIds((prev) => {
      if (prev.has(id) === playing) return prev
      const next = new Set(prev)
      if (playing) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

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
          html5: false,
          onplay: () => {
            markPlaying(binding.id, true)
            setHits((prev) => ({ ...prev, [binding.id]: (prev[binding.id] ?? 0) + 1 }))
          },
          onend: () => markPlaying(binding.id, false),
          onstop: () => markPlaying(binding.id, false)
        })
        howlMap.current.set(binding.id, howl)
      } else {
        existing.volume(binding.volume * globalVolume)
      }
    })

    return () => {}
  }, [bindings, globalVolume, markPlaying])

  useEffect(() => {
    const unsubscribe = window.electronAPI.onPlaySound((id: string) => {
      const howl = howlMap.current.get(id)
      if (howl) {
        howl.stop()
        howl.play()
      }
    })
    return () => { unsubscribe() }
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

  return { playPreview, stopAll, playingIds, hits }
}
