const positions = [0, 1, 2, 3, 4, 5];
const spacing = 100;
const station = (i: number) => 50 + i * spacing;

export function screeningMarkup(): string {
  const nodes = positions
    .map(
      (i) =>
        '<circle cx="' +
        station(i) +
        '" cy="45" r="5" fill="#443139" stroke="#dcbb9a" stroke-width="1.4"/>',
    )
    .join("");
  return (
    '<div class="screening"><div class="screening-top"><span class="eyebrow">The legislative route</span><button type="button" class="screening-toggle">Play walkthrough</button></div>' +
    '<svg viewBox="0 0 600 76" class="route-film" aria-hidden="true"><path d="M50 45H550" stroke="#987e72" stroke-dasharray="2 5"/><path class="travel-ink" d="M50 45H550" pathLength="5" fill="none" stroke="#f1b37e" stroke-width="2"/>' +
    nodes +
    '<g class="travel-sheet"><circle cy="34" r="17" fill="#50323b" stroke="#e7b890"/><path d="M-7 23h9l5 5v16H-7z" fill="#f5dcbc"/><path d="M2 23v5h5M-4 32h8m-8 4h7m-7 4h4" fill="none" stroke="#875a50" stroke-width="1.3"/></g></svg></div>'
  );
}

export function createScreening(
  root: HTMLElement,
  signal: AbortSignal,
  advance: () => void,
) {
  const group = root.querySelector<SVGGElement>(".travel-sheet")!;
  const line = root.querySelector<SVGPathElement>(".travel-ink")!;
  const toggle = root.querySelector<HTMLButtonElement>(".screening-toggle")!;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let step = 0,
    position = 0,
    progressing = false,
    initiator = false,
    spent = 0;
  let animation = 0,
    previous = 0,
    viewport = true;

  function paint() {
    const arc = Math.abs(Math.sin(position * Math.PI));
    group.setAttribute(
      "transform",
      "translate(" +
        station(position) +
        " " +
        -7 * arc +
        ") rotate(" +
        -7 * arc +
        " 0 34)",
    );
    line.setAttribute("stroke-dasharray", position + " 5");
  }
  function state() {
    toggle.textContent = progressing
      ? "Pause walkthrough"
      : step >= 4
        ? "Replay walkthrough"
        : "Play walkthrough";
    toggle.setAttribute("aria-pressed", String(progressing));
  }
  function loop(now: number) {
    animation = 0;
    if (signal.aborted || document.hidden || !viewport) return;
    const dt = previous ? Math.min(100, now - previous) : 16;
    previous = now;
    const delta = step - position;
    position =
      media.matches || Math.abs(delta) < 0.002
        ? step
        : position + delta * (1 - Math.exp(-dt / 250));
    paint();
    if (progressing && (spent += dt) >= 7000) {
      spent = 0;
      initiator = true;
      advance();
      initiator = false;
    }
    if (!animation && (progressing || position !== step))
      animation = requestAnimationFrame(loop);
  }
  function wake() {
    cancelAnimationFrame(animation);
    previous = 0;
    animation = requestAnimationFrame(loop);
  }
  function show(i: number) {
    if (!initiator || i >= 4) progressing = false;
    step = i;
    spent = 0;
    state();
    wake();
  }
  toggle.addEventListener(
    "click",
    () => {
      if (step >= 4)
        root.querySelector<HTMLButtonElement>('[data-step="0"]')?.click();
      progressing = !progressing;
      state();
      wake();
    },
    { signal },
  );
  const visibleParts = new Set<Element>();
  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visibleParts.add(entry.target);
            else visibleParts.delete(entry.target);
          }
          viewport = visibleParts.size > 0;
          wake();
        });
  observer?.observe(root.querySelector(".screening")!);
  observer?.observe(root.querySelector(".bill-stage")!);
  document.addEventListener("visibilitychange", wake, { signal });
  signal.addEventListener(
    "abort",
    () => {
      cancelAnimationFrame(animation);
      observer?.disconnect();
    },
    { once: true },
  );
  paint();
  state();
  return { show };
}
