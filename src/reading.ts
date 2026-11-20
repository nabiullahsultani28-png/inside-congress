export function wireReading(root: HTMLElement, signal: AbortSignal) {
  const compare = root.querySelector<HTMLElement>("[data-compare]")!;
  const control = compare.querySelector<HTMLButtonElement>("[data-compare-toggle]")!;
  const status = compare.querySelector<HTMLElement>("[data-compare-status]")!;
  const addition = compare.querySelector<HTMLElement>(".house-paper .amended-line")!;
  control.disabled = false;
  addition.setAttribute("aria-hidden", String(compare.dataset.aligned !== "true"));
  control.addEventListener("click", () => {
    const aligned = compare.dataset.aligned !== "true";
    compare.dataset.aligned = String(aligned);
    addition.setAttribute("aria-hidden", String(!aligned));
    control.setAttribute("aria-pressed", String(aligned));
    control.textContent = aligned ? "Compare original versions" : "Accept the amendment";
    status.textContent = aligned
      ? "The House has accepted the new line. The bill can go to the president."
      : "The Senate has added a second item.";
  }, {signal});

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const headings = [...root.querySelectorAll<HTMLElement>(".reveal")];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!motion.matches) {
        entry.target.animate(
          [{translate: "0 14px"}, {translate: "0 0"}],
          {duration: 680, easing: "cubic-bezier(.2,.73,.23,1)"},
        );
      }
      observer.unobserve(entry.target);
    }
  }, {threshold: .25});
  headings.forEach((heading) => observer.observe(heading));
  signal.addEventListener("abort", () => observer.disconnect(), {once: true});
}
