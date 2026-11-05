// With scripting off, the page still works: the projects row scrolls sideways
// by hand.

// Projects: one whole card on screen at a time. The cards sit side by side in
// a row that snaps, so swiping works natively; the arrows slide the row.
(() => {
    document.querySelectorAll("[data-viewer]").forEach((viewer) => {
        const track = viewer.querySelector("[data-film-track]");
        if (!track) return;
        const films = [...track.querySelectorAll("[data-film]")];
        if (films.length < 2) return;

        const total = films.length;
        const count = viewer.querySelector("[data-film-count]");
        const reduced = matchMedia("(prefers-reduced-motion: reduce)");
        const wrap = (i) => (i + total) % total;
        const leftOf = (i) => films[i].offsetLeft - films[0].offsetLeft;

        const current = () => {
            let best = 0;
            let bestDistance = Infinity;
            films.forEach((_, i) => {
                const distance = Math.abs(leftOf(i) - track.scrollLeft);
                if (distance < bestDistance) {
                    best = i;
                    bestDistance = distance;
                }
            });
            return best;
        };

        const go = (i) => {
            track.scrollTo({ left: leftOf(wrap(i)), behavior: reduced.matches ? "auto" : "smooth" });
        };

        const update = () => {
            const i = current();
            if (count) count.textContent = `${i + 1} / ${total}`;
        };

        viewer.querySelectorAll("[data-film-controls]").forEach((el) => {
            el.hidden = false;
        });
        viewer.querySelectorAll("[data-film-prev]").forEach((b) => b.addEventListener("click", () => go(current() - 1)));
        viewer.querySelectorAll("[data-film-next]").forEach((b) => b.addEventListener("click", () => go(current() + 1)));

        viewer.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            go(current() + (event.key === "ArrowLeft" ? -1 : 1));
        });

        let queued = false;
        track.addEventListener(
            "scroll",
            () => {
                if (queued) return;
                queued = true;
                requestAnimationFrame(() => {
                    queued = false;
                    update();
                });
            },
            { passive: true }
        );

        update();
    });
})();
