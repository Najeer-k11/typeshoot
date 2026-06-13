import { forwardRef, useEffect, useRef } from 'react';

const TypeInput = forwardRef(function TypeInput({ onChar, onBackspace }, ref) {
  const localRef = useRef(null);
  const inputRef = ref || localRef;

  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
    }
  }, [inputRef]);

  const handleInput = (e) => {
    const data = e.data;
    if (data) {
      // Only pass printable characters
      for (const ch of data) {
        if (/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]$/.test(ch)) {
          onChar(ch.toLowerCase());
        }
      }
    }
    e.target.value = ''; // always clear — game manages typed state
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace') {
      onBackspace();
    }
    // Block browser shortcuts during play
    const blocked = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'];
    if (blocked.includes(e.code)) {
      e.preventDefault();
    }
  };

  const handleBlur = () => {
    // Re-focus if blur happens (e.g. brief tap on another element)
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <input
      ref={inputRef}
      id="type-input"
      type="text"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'auto',
        zIndex: 9999,
      }}
    />
  );
});

export default TypeInput;
