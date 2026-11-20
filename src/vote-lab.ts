export function voteLab(seats: number) {
  const yes = Math.floor(seats * .49);
  const label = seats === 100 ? "Senate" : "House";
  return `<section class="vote-lab" data-vote-lab>
    <div class="vote-intro">
      <h2>How many yes votes?</h2>
      <p>A regular bill usually needs a majority in each chamber. Overriding a veto takes two-thirds in each.</p>
      <p class="source-note">This example fills every voting seat. Each member votes yes or no. ${seats === 100 ? 'The vice president can break a tie on an ordinary passage vote.' : ''}</p>
    </div>
    <div class="tally">
      <fieldset class="vote-rules">
        <legend class="sr-only">Choose the type of ${label} vote</legend>
        <label><input type="radio" name="threshold" value="majority" checked> Pass a bill</label>
        <label><input type="radio" name="threshold" value="override"> Override a veto</label>
      </fieldset>
      <div class="tally-counts"><p><strong data-yes>${yes}</strong> <span>yes</span></p><p><strong data-no>${seats - yes}</strong> <span>no</span></p></div>
      <div class="vote-track" aria-hidden="true"><div class="vote-fill"></div><div class="vote-mark"></div></div>
      <div class="tally-meta"><label for="yes-votes">Yes votes</label><span data-needed></span></div>
      <input id="yes-votes" type="range" min="0" max="${seats}" value="${yes}">
      <p class="tally-result" role="status"></p>
    </div>
  </section>`;
}

export function wireVoteLab(root: HTMLElement, signal: AbortSignal) {
  const lab = root.querySelector<HTMLElement>("[data-vote-lab]")!;
  const range = lab.querySelector<HTMLInputElement>("#yes-votes")!;
  const yesCount = lab.querySelector<HTMLElement>("[data-yes]")!;
  const noCount = lab.querySelector<HTMLElement>("[data-no]")!;
  const needed = lab.querySelector<HTMLElement>("[data-needed]")!;
  const result = lab.querySelector<HTMLElement>(".tally-result")!;
  const seats = Number(range.max);

  function sync() {
    const override = lab.querySelector<HTMLInputElement>("[value='override']")!.checked;
    const min = override ? Math.ceil(seats * 2 / 3) : Math.floor(seats / 2) + 1;
    const yes = range.valueAsNumber;
    const difference = min - yes;
    const tied = !override && seats === 100 && yes === 50;
    const passes = difference <= 0;
    yesCount.textContent = String(yes);
    noCount.textContent = String(seats - yes);
    needed.textContent = `${min} yes votes needed`;
    lab.style.setProperty("--yes", `${(yes / seats) * 100}%`);
    lab.style.setProperty("--threshold", `${(min / seats) * 100}%`);
    result.textContent = tied ? "Tie. The vice president can cast the deciding vote."
      : passes ? (override ? "This chamber votes to override." : "This chamber passes the bill.")
        : `Short by ${difference} ${difference === 1 ? "vote" : "votes"}.`;
    lab.dataset.passes = String(passes);
  }
  lab.addEventListener("input", sync, {signal});
  lab.addEventListener("change", sync, {signal});
  sync();
}
