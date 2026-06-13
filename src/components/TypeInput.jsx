import { forwardRef, useEffect, useRef, useCallback } from 'react';

/**
 * TypeInput – invisible text input that captures keyboard events.
 *
 * Desktop: the window-level keydown listener in GameScreen handles everything.
 * Mobile:  this input is focused so the virtual keyboard stays open.
 *          We use onInput (fires after IME composition too) to capture chars.
 *
 * Positioning trick: we keep the element in the viewport at 1×1 px with
 * opacity:0 so mobile browsers treat it as interactive (off-screen elements
 * sometimes refuse to fire input events on Android Chrome / Samsung Browser).
 */
const TypeInput = forwardRef(function TypeInput({ onChar, onBackspace }, ref) {
  const localRef = useRef(null);
  const inputRef = ref || localRef;
  const isComposing = useRef(false);

  const focus = useCallback(() => {
    const el = inputRef.current;
    if (el && document.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
  }, [inputRef]);

  // Auto-focus on mount
  useEffect(() => {
    focus();
  }, [focus]);

  // Re-focus whenever the page becomes visible (e.g. returning from background)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') focus(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [focus]);

  const handleCompositionStart = () => { isComposing.current = true; };
  const handleCompositionEnd = (e) => {
    isComposing.current = false;
    // Emit every char from the composed string
    const data = e.data || e.target.value;
    if (data) {
      for (const ch of data) {
        if (/^[a-zA-Z0-9]$/.test(ch)) onChar(ch.toLowerCase());
      }
    }
    e.target.value = '';
  };

  const handleInput = (e) => {
    // Skip during IME composition — compositionend handles it
    if (isComposing.current) return;
    const data = e.data || e.target.value;
    if (data) {
      for (const ch of data) {
        if (/^[a-zA-Z0-9]$/.test(ch)) onChar(ch.toLowerCase());
      }
    }
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace();
      return;
    }
    // Suppress browser navigation shortcuts during play
    const blocked = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (blocked.includes(e.code)) e.preventDefault();
  };

  const handleBlur = () => {
    // On mobile the keyboard dismiss fires blur — re-focus so keyboard stays
    setTimeout(focus, 80);
  };

  return (
    <input
      ref={inputRef}
      id="type-input"
      type="text"
      inputMode="text"          /* tells mobile to show the text keyboard */
      enterKeyHint="done"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        /* Keep it inside the viewport (1×1 px, fully transparent).
           Some Android browsers refuse to fire input events on elements
           that are scrolled off-screen or have display:none / visibility:hidden. */
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '1px',
        height: '1px',
        opacity: 0,
        border: 'none',
        outline: 'none',
        padding: 0,
        margin: 0,
        background: 'transparent',
        color: 'transparent',
        caretColor: 'transparent',
        pointerEvents: 'auto',
        zIndex: 9999,
      }}
    />
  );
});

export default TypeInput;
