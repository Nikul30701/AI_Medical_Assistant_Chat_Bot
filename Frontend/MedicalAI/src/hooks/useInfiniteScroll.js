import { useEffect, useRef, useCallback } from "react";

export default function useInfiniteScroll(onIntersect, options = {}) {
    const {
        enabled = true,
        rootRef = null,
        threshold = 0.1,
        rootMargin = "200px",
    } = options;

    const sentinelRef = useRef(null);

    // Memoized intersection handler
    const handleIntersect = useCallback(
        ([entry]) => {
            if (entry.isIntersecting && enabled) {
                onIntersect();
            }
        },
        [onIntersect, enabled]
    );

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !enabled) return;

        const rootElement = rootRef?.current ?? null;

        const observer = new IntersectionObserver(handleIntersect, {
            root: rootElement,
            rootMargin,
            threshold,
        });

        observer.observe(sentinel);

        return () => {
            observer.disconnect();        // Better than unobserve for cleanup
        };
    }, [handleIntersect, enabled, rootRef, threshold, rootMargin]);

    return sentinelRef;
}