import Store from 'electron-store'

export interface Binding {
  id: string
  name: string
  filePath: string
  accelerator: string
  volume: number
  enabled: boolean
}

interface AppSettings {
  bindings: Binding[]
  globalVolume: number
  startMinimized: boolean
}

const store = new Store<AppSettings>({
  defaults: {
    bindings: [],
    globalVolume: 1.0,
    startMinimized: false
  }
})

export function getBindings(): Binding[] {
  return store.get('bindings')
}

export function setBindings(bindings: Binding[]): void {
  store.set('bindings', bindings)
}

export function addBinding(binding: Binding): void {
  const bindings = getBindings()
  setBindings([...bindings, binding])
}

export function updateBinding(id: string, partial: Partial<Binding>): Binding | null {
  const bindings = getBindings()
  const idx = bindings.findIndex((b) => b.id === id)
  if (idx === -1) return null
  bindings[idx] = { ...bindings[idx], ...partial }
  setBindings(bindings)
  return bindings[idx]
}

export function deleteBinding(id: string): boolean {
  const bindings = getBindings()
  const next = bindings.filter((b) => b.id !== id)
  if (next.length === bindings.length) return false
  setBindings(next)
  return true
}

export function getGlobalVolume(): number {
  return store.get('globalVolume')
}

export function setGlobalVolume(v: number): void {
  store.set('globalVolume', Math.max(0, Math.min(1, v)))
}
