/**
 * Tiny event emitter — shared singleton between React (TypeInput) and
 * Phaser scenes (GameScene) so they can communicate without coupling.
 *
 * React fires: 'char', 'backspace'
 * Phaser listens: 'char', 'backspace'
 */
class EventEmitter {
  constructor() {
    this._listeners = {};
  }

  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((l) => l !== fn);
  }

  emit(event, ...args) {
    (this._listeners[event] || []).forEach((fn) => fn(...args));
  }

  removeAll(event) {
    this._listeners[event] = [];
  }
}

export const gameEvents = new EventEmitter();
