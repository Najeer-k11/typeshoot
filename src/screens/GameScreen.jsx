import { useCallback, useEffect, useRef } from 'react';
import PhaserGame from '../game/PhaserGame';
import HUD from '../components/HUD';
import ComboDisplay from '../components/ComboDisplay';
import PowerUpBar from '../components/PowerUpBar';
import TypeInput from '../components/TypeInput';
import { gameEvents } from '../game/events';

// Characters that shouldn't be passed to the game
const BLOCKED_KEYS = new Set(['Backspace', 'Enter', 'Tab', 'Escape', 'F1', 'F2',
  'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
  'Control', 'Alt', 'Shift', 'Meta', 'CapsLock']);

export default function GameScreen() {
  const inputRef = useRef(null);

  const handleChar = useCallback((char) => {
    gameEvents.emit('char', char);
  }, []);

  const handleBackspace = useCallback(() => {
    gameEvents.emit('backspace');
  }, []);

  // ── Desktop: window-level keydown listener ──────────────────────────
  // Captures keyboard input regardless of what element has focus.
  // This is the primary input path for desktop.
  // TypeInput below handles mobile virtual keyboard only.
  useEffect(() => {
    const onKeyDown = (e) => {
      // Ignore modifier-combo shortcuts (Ctrl+R, Ctrl+C, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // Only pass single printable characters (letters, digits)
      if (e.key.length === 1 && !BLOCKED_KEYS.has(e.key)) {
        e.preventDefault();
        handleChar(e.key.toLowerCase());
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleChar, handleBackspace]);

  // ── Re-focus the hidden input on canvas tap (mobile) ─────────────────
  const handleCanvasTap = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden screen-enter"
      style={{ height: '100dvh' }}
      onClick={handleCanvasTap}
    >
      {/* Phaser canvas */}
      <PhaserGame />

      {/* React HUD overlay — pointer-events-none so taps pass through */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <HUD />
        <ComboDisplay />
        <PowerUpBar />
      </div>

      {/* Hidden input — mobile virtual keyboard trigger only */}
      <TypeInput
        ref={inputRef}
        onChar={handleChar}
        onBackspace={handleBackspace}
      />
    </div>
  );
}
