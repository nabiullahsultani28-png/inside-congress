type Point = readonly [number, number, number];
export interface Shot {
  title: string;
  detail: string;
  link: string;
  position: Point;
  target: Point;
  width: number;
}
export const shots: readonly Shot[] = [
  {
    title: "The west front",
    detail: "Two chambers meet on either side of the Rotunda.",
    link: "#capitol",
    position: [17.43354, 15.73272, 30.58517],
    target: [0.17331, 3.31746, 0.30405],
    width: 30.15532,
  },
  {
    title: "The north wing",
    detail: "Every state sends two senators to this chamber.",
    link: "#chambers/senate",
    position: [-18.21989, 7.13079, 20.29148],
    target: [-9.12, 2, 0.93],
    width: 9.4,
  },
  {
    title: "The south wing",
    detail: "House districts give population a voice in Congress.",
    link: "#chambers/house",
    position: [17.9044, 8.49282, 19.97653],
    target: [9.12, 2, 0.88],
    width: 9.65,
  },
];
export interface Lens {
  draw(index: number, seconds: number, elapsed: number, moving: boolean): void;
  close(): void;
}

export function startTour(root: HTMLElement, signal: AbortSignal): void {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = root.querySelector<HTMLButtonElement>("[data-tour-toggle]")!;
  const title = root.querySelector<HTMLAnchorElement>(".tour-title")!;
  const description = root.querySelector<HTMLElement>(".tour-detail")!;
  const counter = root.querySelector<HTMLElement>("[data-counter]")!;
  const stills = [...root.querySelectorAll<HTMLImageElement>("[data-still]")];
  const stops = [...root.querySelectorAll<HTMLButtonElement>("[data-stop]")];
  const frame = root.querySelector<HTMLElement>(".tour-frame")!;
  const oldCanvas = frame.querySelector("canvas")!;
  oldCanvas.replaceWith(oldCanvas.cloneNode(false));
  let index = 0,
    time = 0,
    prev = 0,
    lastPaint = 0,
    raf = 0,
    settle = 0;
  let playing = !media.matches,
    visible = true,
    closed = false,
    started = false;
  let lens: Lens | undefined;
  const hold = 8500;
  function sync() {
    const shot = shots[index];
    title.textContent = shot.title;
    title.href = shot.link;
    description.textContent = shot.detail;
    counter.textContent = String(index + 1).padStart(2, "0") + " / 03";
    stops.forEach((btn, i) =>
      btn.setAttribute("aria-pressed", String(i === index)),
    );
    stills.forEach((img, i) => {
      if (i === index && img.dataset.src) img.src = img.dataset.src;
      img.classList.toggle("current", i === index);
    });
    const label = playing ? "Pause camera tour" : "Play camera tour";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    toggle.firstElementChild!.textContent = playing ? "Ⅱ" : "▶";
    root.style.setProperty(
      "--tour-progress",
      playing ? String(time / hold) : "1",
    );
  }
  function select(i: number) {
    index = i;
    time = 0;
    settle = media.matches ? 0 : 2300;
    sync();
    lens?.draw(index, 0, 0, !media.matches);
  }
  function tick(now: number) {
    raf = 0;
    if (closed || !visible || document.hidden) return;
    if (now - lastPaint >= 31 || !prev) {
      const elapsed = prev ? Math.min(now - prev, 120) : 0;
      prev = now;
      lastPaint = now;
      if (playing) {
        time += elapsed;
        if (time >= hold) select((index + 1) % shots.length);
        root.style.setProperty("--tour-progress", String(time / hold));
      }
      settle = Math.max(0, settle - elapsed);
      lens?.draw(index, time / 1000, elapsed / 1000, !media.matches);
      if (!lens) {
        const drift = media.matches ? 0 : time / hold;
        frame.style.setProperty("--still-drift", String(drift));
      }
    }
    if (playing || settle > 0) raf = requestAnimationFrame(tick);
  }
  function wake() {
    cancelAnimationFrame(raf);
    prev = 0;
    lastPaint = 0;
    if (visible && !document.hidden && !closed)
      raf = requestAnimationFrame(tick);
  }
  function loadLens() {
    if (started || closed) return;
    started = true;
    import("./tour-renderer.js")
      .then(async ({ createLens }) => {
        if (signal.aborted) return;
        const next = await createLens(frame, signal);
        if (!next) return;
        if (closed) {
          next.close();
          return;
        }
        lens = next;
        lens.draw(index, time / 1000, 0, false);
        root.classList.add("live");
        settle = 2300;
        wake();
      })
      .catch(() => {
        /* The photographed sequence remains interactive without WebGL. */
      });
    stills.forEach((img) => {
      if (img.dataset.src && !img.getAttribute("src"))
        img.src = img.dataset.src;
    });
  }
  toggle.addEventListener(
    "click",
    () => {
      playing = !playing;
      if (!playing) settle = 0;
      sync();
      wake();
    },
    { signal },
  );
  stops.forEach((button, i) =>
    button.addEventListener(
      "click",
      () => {
        playing = false;
        select(i);
        wake();
      },
      { signal },
    ),
  );
  media.addEventListener(
    "change",
    () => {
      playing = !media.matches;
      sync();
      wake();
    },
    { signal },
  );
  document.addEventListener("visibilitychange", wake, { signal });
  const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) loadLens();
    wake();
  });
  frame.querySelector("canvas")!.addEventListener(
    "webglcontextlost",
    () => {
      root.classList.remove("live");
      lens?.close();
      lens = undefined;
    },
    { signal },
  );
  if (observer) observer.observe(frame);
  else loadLens();
  signal.addEventListener(
    "abort",
    () => {
      closed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      root.classList.remove("live");
      lens?.close();
    },
    { once: true },
  );
  sync();
  wake();
}
