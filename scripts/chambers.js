import { voteLab } from './vote-lab.js';
import { intro, page, photo, related, sources } from './exhibit-kit.js';
const chambers = {
    house: {
        name: 'House', full: 'House of Representatives', wing: 'South wing', seats: 435,
        rows: [19, 23, 27, 31, 35, 39, 44, 48, 52, 56, 61],
        title: 'How House seats are assigned',
        copy: 'The House divides its 435 voting seats among the states by population after each census. Each state gets at least one. Voters in each congressional district elect one representative, and every seat is up for election every two years.',
        represented: 'One district', term: '2 years', button: 'Show one district', highlight: 1,
        allCaption: 'Each dot is one voting House seat.', highlightCaption: 'One district elects one representative.',
        roleTitle: 'Where revenue bills begin',
        powers: 'Bills for raising revenue must originate in the House. The Senate can propose amendments. The House also has the sole power to impeach federal officers, bringing formal charges that the Senate then tries.',
        note: 'Delegates and the resident commissioner also serve in the House. The 435 dots count seats that can vote on final passage on the House floor.',
        source: sources.house, sourceLabel: 'The House Explained'
    },
    senate: {
        name: 'Senate', full: 'United States Senate', wing: 'North wing', seats: 100,
        rows: [12, 16, 20, 24, 28],
        title: 'Two senators per state',
        copy: 'Every state elects two senators, whatever its population. A senator represents the entire state for six years. The terms are staggered so about one-third of the Senate is regularly up for election every two years.',
        represented: 'One state', term: '6 years', button: 'Show one state', highlight: 2,
        allCaption: 'Each dot is one Senate seat.', highlightCaption: 'One state elects two senators.',
        roleTitle: 'Advice, consent and trials',
        powers: 'The Senate considers many presidential nominations, including federal judges, and gives advice and consent to treaties. A treaty needs the agreement of two-thirds of senators present. The Senate also tries impeachments brought by the House.',
        note: 'The dots represent seats. Their arrangement illustrates how representation works and carries no party or seating assignment.',
        source: sources.equal, sourceLabel: 'Two Senators per State'
    }
};
function seatDiagram(chamber) {
    let seat = 0;
    const cx = 250, cy = 227;
    const dots = chamber.rows.map((count, row) => {
        const radius = 57 + row * 145 / (chamber.rows.length - 1);
        return Array.from({ length: count }, (_, i) => {
            // Angular gaps separate the blocks into four aisles.
            const arc = Math.PI * .95, gutter = .041;
            const angle = Math.PI + (Math.PI - arc) / 2 + (arc - 3 * gutter) * i / (count - 1) + gutter * Math.min(3, Math.floor(i * 4 / count));
            const x = cx + Math.cos(angle) * radius, y = cy + Math.sin(angle) * radius;
            const id = seat++;
            return '<circle class="seat" data-seat="' + id + '" cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + (chamber.seats === 435 ? '3.45' : '6.2') + '" style="--delay:' + (row * 25 + i * 2) + 'ms"/>';
        }).join('');
    }).join('');
    return '<svg class="seat-map" viewBox="30 12 440 237" role="img" aria-label="' + chamber.seats + ' seats arranged in a semicircle">' + dots + '<path class="rostrum" d="M211 224q39-13 78 0v7h-78z"/><text x="250" y="247" text-anchor="middle">Dais</text></svg>';
}
export function chamberContent(key) {
    const c = chambers[key];
    const switcher = ['house', 'senate'].map(id => '<a class="switch-link" href="#chambers/' + id + '"' + (key === id ? ' aria-current="page"' : '') + '>' + chambers[id].name + '</a>').join('');
    const content = intro('Representation', 'The House and Senate', 'One chamber represents districts. The other gives every state an equal voice. Compare their seats, terms and powers.') +
        '<nav class="chamber-controls" aria-label="Choose a chamber">' + switcher + '</nav>' +
        '<div class="chamber-grid"><section class="panel dark-panel seats-panel"><div class="panel-top"><div><p class="eyebrow">' + c.wing + '</p><h2>' + c.name + ' seats</h2></div><span class="seat-total">' + c.seats + '</span></div>' +
        seatDiagram(c) + '<div class="seat-footer"><p id="seat-caption" aria-live="polite">' + c.allCaption + '</p><button type="button" class="ghost-button" id="highlight-seats" aria-pressed="false">' + c.button + '</button></div></section>' +
        '<section class="panel paper-panel"><p class="eyebrow">' + c.full + '</p><h2>' + c.title + '</h2><p>' + c.copy + '</p><dl class="stats-pair"><div><dt>Who a member represents</dt><dd>' + c.represented + '</dd></div><div><dt>Length of term</dt><dd>' + c.term + '</dd></div></dl></section></div>' +
        voteLab(c.seats) +
        '<section class="panel context-card">' + photo(key) + '<div><p class="eyebrow detail-eyebrow">Distinctive powers</p><h2>' + c.roleTitle + '</h2><p>' + c.powers + '</p><p class="source-note">Read <a href="' + sources.constitution + '">the Constitution</a> and <a href="' + c.source + '">' + c.sourceLabel + '</a>.</p></div></section>' +
        '<p class="source-note exhibit-footnote">' + c.note + '</p>' + related('What happens when the chambers disagree?', 'Follow a bill', '#bill');
    return page('House &amp; Senate', content);
}
export function wireChamber(root, key, signal) {
    const c = chambers[key], button = root.querySelector('#highlight-seats'), caption = root.querySelector('#seat-caption');
    button.addEventListener('click', () => {
        const highlight = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(highlight));
        button.textContent = highlight ? 'Show all seats' : c.button;
        caption.textContent = highlight ? c.highlightCaption : c.allCaption;
        const dots = root.querySelectorAll('.seat');
        const start = Math.floor(c.rows[0] / 2) - 1;
        dots.forEach((dot, index) => {
            const chosen = index >= start && index < start + c.highlight;
            dot.classList.toggle('dim', highlight && !chosen);
            dot.classList.toggle('lit', highlight && chosen);
        });
    }, { signal });
}
