import { useCallback, useRef } from "react";

interface UseTypingDebounceProps {
  onStartTyping: () => void;
  onStopTyping: () => void;
  debounceMs?: number;
}

export function useTypingDebounce({
  onStartTyping,
  onStopTyping,
  debounceMs = 1500,
}: UseTypingDebounceProps) {
  const isTypingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyPress = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onStartTyping();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onStopTyping();
    }, debounceMs);
  }, [onStartTyping, onStopTyping, debounceMs]);

  const forceStop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onStopTyping();
    }
  }, [onStopTyping]);

  return { handleKeyPress, forceStop };
}
