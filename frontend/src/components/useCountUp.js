import { useEffect, useRef, useState } from "react";

// Animates a number from its previous value to `target` over `duration` ms.
// On first mount, animates up from 0 rather than snapping straight to the value.
//
// Note: `valueRef` always mirrors the last value actually rendered/animated to.
// It's only ever updated from inside the animation tick itself — never from a
// cleanup function — because React 18 Strict Mode runs effect cleanups as a
// double-invoke check even when the component hasn't really unmounted. If the
// cleanup were the one to "commit" the target, that phantom cleanup would mark
// the animation as already-complete before it ever ran, freezing the display.
export default function useCountUp(target, duration = 650) {
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = valueRef.current;
    const end = typeof target === "number" ? target : 0;

    if (start === end) return undefined;

    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const next = start + (end - start) * progress;
      valueRef.current = next;
      setValue(next);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
