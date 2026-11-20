export interface Seat {
  x: number;
  y: number;
}
export function readSeats(root: HTMLElement): Seat[] {
  return [...root.querySelectorAll<SVGCircleElement>(".seat")].map((el) => ({
    x: Number(el.getAttribute("cx")),
    y: Number(el.getAttribute("cy")),
  }));
}

// Match seats by their position through the rows so the whole seating fan changes in place.
export function animateSeats(root: HTMLElement, old: Seat[]): void {
  if (!old.length || matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;
  const dots = [...root.querySelectorAll<SVGCircleElement>(".seat")];
  if (
    !dots.length ||
    typeof dots[0].animate !== "function" ||
    dots.length === old.length
  )
    return;
  dots.forEach((el, i) => {
    const from = old[Math.round((i * (old.length - 1)) / (dots.length - 1))];
    const x = Number(el.getAttribute("cx")),
      y = Number(el.getAttribute("cy"));
    const dx = from.x - x,
      dy = from.y - y;
    el.animate(
      [
        {
          transform: "translate(" + dx + "px," + dy + "px) scale(.65)",
          opacity: 0.45,
          fill: "#b1c7cc",
        },
        { transform: "translate(0,0) scale(1)", opacity: 1, fill: "#e3e8d9" },
      ],
      {
        duration: 740,
        delay: (120 * i) / dots.length,
        easing: "cubic-bezier(.17,.75,.25,1)",
        fill: "backwards",
      },
    );
  });
}
