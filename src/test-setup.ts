import '@testing-library/jest-dom/vitest';

// Neither Node's experimental localStorage nor this jsdom setup provide a
// working Storage — install a spec-compliant in-memory implementation.
class MemoryStorage {
  #map = new Map<string, string>();
  get length() {
    return this.#map.size;
  }
  key(index: number): string | null {
    return [...this.#map.keys()][index] ?? null;
  }
  getItem(key: string): string | null {
    return this.#map.get(String(key)) ?? null;
  }
  setItem(key: string, value: string): void {
    this.#map.set(String(key), String(value));
  }
  removeItem(key: string): void {
    this.#map.delete(String(key));
  }
  clear(): void {
    this.#map.clear();
  }
}

const storage = new MemoryStorage();
for (const target of [globalThis, window] as const) {
  Object.defineProperty(target, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
}
