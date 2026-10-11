import { RefObject, useEffect, useRef } from "react";

export function useScrollToBottom(
  ref: RefObject<HTMLElement | null>,
  dependency: unknown
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (isFirstRender.current) {
      element.scrollTop = element.scrollHeight;
      isFirstRender.current = false;
      return;
    }

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    // Only auto-scroll if user is near bottom (< 150px)
    if (distanceFromBottom < 150) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [dependency, ref]);
}
