import { intro, page, photo, related, sources } from "./exhibit-kit.js";
const stages = [
    {
        short: "Introduce",
        title: "A representative files the bill",
        text: "Librarians tell a representative their roofs leak. She sponsors the fictional Library Repair Grants Act and introduces it in the House. Most bills can start in either chamber.",
        caption: "The first draft would fund public library roof repairs.",
    },
    {
        short: "Committee",
        title: "A committee reviews the proposal",
        text: "The committee can call witnesses, revise the language in a markup, and vote on whether to send the bill to the full House. In this example, the committee sends it forward.",
        caption: "The committee can also leave the bill without further action.",
    },
    {
        short: "House vote",
        title: "The House passes its version",
        text: "The full House debates the proposal. For an ordinary passage vote, a majority of members voting can pass the bill if a quorum is present. The House sends its version to the Senate.",
        caption: "The House version covers roof repairs.",
    },
    {
        short: "Senate vote",
        title: "The Senate adds a line",
        text: "Senators want the grants to cover accessible entrances too. The Senate passes the bill with that amendment. Each chamber has passed a version.",
        caption: "The Senate adds a second eligible use for the grants.",
    },
    {
        short: "Agreement",
        title: "Both chambers need to approve one text",
        text: "The House can accept the Senate’s amendment or the chambers can work out a compromise. Both have to pass the same wording before the bill can go to the president.",
        caption: "Accept the amendment to bring the two versions into agreement.",
    },
    {
        short: "President",
        title: "The bill reaches the president",
        text: "The enrolled bill now includes both roof repairs and accessible entrances. The president can sign it, return it with objections, or take no action.",
        caption: "The enrolled bill contains the exact text both chambers passed.",
    },
];
const outcomes = {
    agree: ["The texts match", "The House accepts the Senate amendment. Congress can present the final bill to the president."],
    stall: ["The bill stalls", "Members can resume negotiations. If this Congress ends first, someone has to introduce the bill again in the next Congress."],
    signed: ["The bill becomes law", "The president signs it. The law sets up the grant program. The agency can award grants when Congress makes funding available."],
    veto: ["The bill returns to Congress", "The president returns the bill with objections to the chamber where it began. With a quorum present, two-thirds of those voting in each chamber must support an override."],
    override: ["Congress overrides the veto", "Both chambers meet the two-thirds threshold. The bill becomes law over the president’s objections."],
    sustained: ["The veto stands", "At least one chamber falls short of two-thirds, so the bill ends here."],
    wait: ["The ten-day clock starts", "The Constitution gives the president ten days after presentment, excluding Sundays. The result depends on whether Congress can receive a returned bill when the period ends."],
    unsigned: ["The bill becomes law without a signature", "Ten days, excluding Sundays, have passed. Congress could still receive a returned bill, so the unsigned bill becomes law."],
    pocket: ["A pocket veto ends the bill", "The president leaves the bill unsigned and an adjournment prevents its return within the constitutional period. A pocket veto has no override vote."],
};
const stamps = {
    signed: "Signed into law", veto: "Returned with objections", override: "Veto overridden",
    sustained: "Veto stands", wait: "Awaiting action", unsigned: "Became law", pocket: "Pocket veto",
};
function sheet(version, amended, kind) {
    return `<div class="paper-sheet ${kind}">
    <p class="document-meta">${version}</p>
    <p class="document-title">Library Repair Grants Act</p>
    <p class="document-subtitle">Grants to public libraries for</p>
    <ol class="document-lines"><li>Repair of roofs</li>${amended ? '<li class="amended-line">Accessible entrances</li>' : ''}</ol>
  </div>`;
}
function illustration(state) {
    const { step, agreement, outcome } = state;
    const version = ["As introduced", "Committee print", "House version", "", "", "Enrolled bill"][step];
    const matching = agreement === "agree" && step === 4;
    const twoVersions = step === 3 || step === 4;
    const stamp = step === 1 ? "Committee advances bill" :
        step === 2 ? "Passed by the House" :
            matching ? "Texts match" :
                step === 5 && outcome ? stamps[outcome] : undefined;
    const negative = outcome === "veto" || outcome === "sustained" || outcome === "pocket";
    const caption = matching ? "Both versions now include accessible entrances." : stages[step].caption;
    return `<figure class="diagram-pane" data-bill-step="${step}" data-aligned="${matching}">
    <p class="document-index">Fictional legislation</p>
    <div class="paper-spread ${twoVersions ? "paired-papers" : "single-paper"}">
      ${twoVersions ? sheet("House version", matching, "house-paper") + sheet("Senate version", true, "senate-paper") : sheet(version, step === 5, "working-paper")}
      ${stamp ? `<p class="document-stamp is-stamped${negative ? " rejected" : ""}">${stamp}</p>` : ""}
    </div>
    <figcaption>${caption}</figcaption>
  </figure>`;
}
function choices(prompt, options, selected) {
    const buttons = options.map(([value, label]) => `<button class="seg-button" type="button" data-choice="${value}" aria-pressed="${selected === value}">${label}</button>`).join("");
    return `<fieldset class="branch-choices"><legend>${prompt}</legend><div class="choice-row">${buttons}</div></fieldset>`;
}
function result(key) {
    if (!key)
        return "";
    const [heading, description] = outcomes[key];
    return `<div class="branch-result"><h3>${heading}</h3><p>${description}</p></div>`;
}
function journal(state) {
    const { step, agreement, response, outcome } = state;
    let extra = "";
    if (step === 4) {
        extra = choices("How will the House respond?", [
            ["agree", "Accept the amendment"], ["stall", "Leave the difference unresolved"],
        ], agreement) + result(agreement);
    }
    if (step === 5) {
        extra = choices("What does the president do?", [
            ["signed", "Sign"], ["veto", "Veto"], ["wait", "Take no action"],
        ], response);
        if (response === "veto") {
            extra += choices("How do the override votes go?", [
                ["override", "Both reach two-thirds"], ["sustained", "One falls short"],
            ], outcome);
        }
        if (response === "wait") {
            extra += choices("Can Congress receive the returned bill?", [
                ["unsigned", "Return is possible"], ["pocket", "Adjournment prevents return"],
            ], outcome);
        }
        extra += result(outcome);
    }
    const advance = step < 4 || (step === 4 && agreement === "agree");
    return `<section class="journal">
    <p class="eyebrow">Step ${step + 1} of ${stages.length}</p>
    <h2 tabindex="-1" data-stage-heading>${stages[step].title}</h2>
    <p>${stages[step].text}</p>
    ${extra}
    <div class="journal-actions">
      ${step ? '<button type="button" class="button light-button" data-move="back">Back</button>' : ''}
      ${advance ? '<button type="button" class="button primary-button" data-move="next">Next step <span aria-hidden="true">→</span></button>' : ''}
      ${step === 5 ? '<button type="button" class="button light-button" data-move="again">Start again</button>' : ''}
    </div>
  </section>`;
}
export function billContent() {
    const steps = stages.map((stage, i) => `<li><button type="button" data-step="${i}"><span>${i + 1}</span> ${stage.short}</button></li>`).join("");
    return page("Lawmaking", intro("Lawmaking", "How a bill becomes law", "Follow a proposal to repair public libraries. You’ll compare the House and Senate texts and see what happens when the bill reaches the president.") +
        `<div class="bill-workbench">
      <div class="bill-toolbar"><p>Library Repair Grants Act</p><button class="button light-button" type="button" data-walkthrough aria-pressed="false">Play walkthrough</button></div>
      <nav aria-label="Legislative stages"><ol class="bill-steps">${steps}</ol></nav>
      <div class="bill-stage"></div>
      <p class="sr-only" aria-live="polite" id="bill-announcement"></p>
    </div>
    <section class="context-card">${photo("bill")}
      <div><p class="eyebrow">From the archives</p><h2>A bill that became a park</h2>
        <p>On March 1, 1872, President Ulysses S. Grant signed the act establishing Yellowstone National Park. This handwritten enrolled act is the final text both chambers passed.</p>
        <p class="source-note"><a href="${sources.process}">The House guide to lawmaking</a> · <a href="${sources.differences}">Resolving differences</a> · <a href="${sources.president}">Presidential action</a></p>
      </div>
    </section>` + related("What else can Congress do?", "Explore congressional powers", "#powers"));
}
export function wireBill(root, signal) {
    const panel = root.querySelector(".bill-stage");
    const announcement = root.querySelector("#bill-announcement");
    const tracker = root.querySelector(".bill-steps");
    const play = root.querySelector("[data-walkthrough]");
    const buttons = [...tracker.querySelectorAll("button")];
    const beat = 7200;
    let state = { step: 0 };
    let timer = 0;
    let playing = false;
    function pause() {
        window.clearTimeout(timer);
        playing = false;
        tracker.classList.remove("is-playing");
        play.setAttribute("aria-pressed", "false");
        play.textContent = "Play walkthrough";
    }
    function render(focus, fromJournal = false) {
        buttons.forEach((button, index) => {
            if (index === state.step)
                button.setAttribute("aria-current", "step");
            else
                button.removeAttribute("aria-current");
            button.disabled = index === 5 && state.agreement !== "agree";
            button.title = button.disabled ? "Accept the amendment at Agreement to unlock this stage." : "";
        });
        panel.innerHTML = illustration(state) + journal(state);
        if (focus === "step") {
            const heading = panel.querySelector("[data-stage-heading]");
            heading.focus({ preventScroll: true });
            if (fromJournal) {
                const { top, bottom } = heading.getBoundingClientRect();
                const stickyHeader = document.querySelector(".topbar").getBoundingClientRect().bottom;
                if (top < stickyHeader || bottom > innerHeight)
                    heading.scrollIntoView({ block: "nearest" });
            }
        }
        else if (focus) {
            panel.querySelector(`[data-choice="${focus}"]`)?.focus({ preventScroll: true });
        }
    }
    function queue() {
        timer = window.setTimeout(() => {
            state.step++;
            render();
            announcement.textContent = stages[state.step].title;
            if (state.step < 4)
                queue();
            else
                pause();
        }, beat);
    }
    function move(step, fromJournal = false) {
        pause();
        state.step = step;
        render("step", fromJournal);
        announcement.textContent = `Step ${step + 1}. ${stages[step].title}.`;
    }
    play.addEventListener("click", () => {
        if (playing) {
            pause();
            return;
        }
        if (state.step >= 4) {
            state = { step: 0 };
            render();
        }
        playing = true;
        play.setAttribute("aria-pressed", "true");
        play.textContent = "Pause walkthrough";
        tracker.style.setProperty("--beat", `${beat}ms`);
        tracker.classList.add("is-playing");
        queue();
    }, { signal });
    tracker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-step]");
        if (button && !button.disabled)
            move(Number(button.dataset.step));
    }, { signal });
    panel.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button)
            return;
        if (button.dataset.move) {
            if (button.dataset.move === "again") {
                state = { step: 0 };
                move(0, true);
            }
            else {
                move(state.step + (button.dataset.move === "next" ? 1 : -1), true);
            }
            return;
        }
        const value = button.dataset.choice;
        if (!value)
            return;
        if (value === "agree" || value === "stall") {
            state.agreement = value;
            state.response = undefined;
            state.outcome = undefined;
        }
        else {
            if (value === "signed" || value === "veto" || value === "wait")
                state.response = value;
            state.outcome = value;
        }
        render(value);
        announcement.textContent = outcomes[value].join(". ");
    }, { signal });
    document.addEventListener("visibilitychange", () => { if (document.hidden)
        pause(); }, { signal });
    signal.addEventListener("abort", pause, { once: true });
    render();
}
