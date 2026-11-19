import {icon, images, intro, page, photo, related, sources} from './exhibit-kit.js';

const powers = {
  spending:{
    label:'Federal spending',title:'Who can spend public money?',
    detail:'The Constitution gives Congress the power of the purse. Money can be drawn from the Treasury only under appropriations made by law. Appropriations specify which activities may receive federal funds.',
    example:'A law can create a library grant program. An appropriation gives an agency budget authority to fund grants within the law’s terms.',
    path:'An appropriation in practice', steps:[['people','Both chambers pass an appropriations bill.'],['file','The bill becomes law through the legislative process.'],['ear','An agency uses the funds for the authorized purpose.']],
    source:sources.purse,sourceLabel:'House History, Power of the Purse'
  },
  oversight:{
    label:'Oversight',title:'Who checks the work?',
    detail:'Congress investigates how federal programs operate and how agencies spend money. Committees can request documents, question witnesses at hearings, and publish findings to inform legislation and spending decisions.',
    example:'A committee could ask a grant administrator which libraries received money, whether repairs were completed, and what the program should change.',
    path:'A committee investigates',steps:[['file','Members request evidence about a federal program.'],['people','Witnesses explain the record at a hearing.'],['book','The committee reports findings or proposes changes.']],
    source:sources.committees,sourceLabel:'U.S. Senate, Committees FAQ'
  },
  confirmations:{
    label:'Confirmations',title:'Who fills key federal posts?',
    detail:'The president nominates people for many offices, including Cabinet posts and federal judgeships. The Senate considers the nominees and can give or withhold its advice and consent. The House has no confirmation vote.',
    example:'When a federal judgeship opens, the president selects a nominee. A Senate committee may hold a hearing before the full Senate decides whether to confirm.',
    path:'A nomination moves forward',steps:[['file','The president submits a nomination.'],['people','The relevant Senate committee considers the nominee.'],['ear','The Senate decides whether to confirm.']],
    source:sources.nominations,sourceLabel:'U.S. Senate, Nominations'
  }
};

export function powersContent(key) {
  const p=powers[key];
  const buttons=Object.entries(powers).map(([id,item])=>'<a class="switch-link" href="#powers/' + id + '"' + (id===key?' aria-current="page"':'') + '>' + item.label + '</a>').join('');
  const steps=p.steps.map(([symbol,text],i)=>'<li style="--delay:' + i*120 + 'ms"><span>' + icon(symbol) + '</span><p>' + text + '</p></li>').join('');
  const content=intro('Constitutional powers','Beyond lawmaking.','A spending decision, a public hearing, and a confirmation vote each use a different power. Explore what Congress can do in each case.') +
    '<nav class="power-controls" aria-label="Choose a congressional power">' + buttons + '</nav><section class="panel power-layout"><div class="power-text"><p class="eyebrow detail-eyebrow">' + p.label + '</p><h2>' + p.title + '</h2><p>' + p.detail + '</p><blockquote>' + p.example + '</blockquote><p class="source-note exhibit-footnote"><a href="' + p.source + '">' + p.sourceLabel + '</a></p></div><div class="dark-panel power-flow"><p class="eyebrow">How it works</p><h3>' + p.path + '</h3><ol class="flow-list">' + steps + '</ol></div></section>' +
    '<section class="panel context-card">' + photo('powers') + '<div><p class="eyebrow detail-eyebrow">From the archives</p><h2>Oversight in the open.</h2><p>In 1973, televised Senate Watergate hearings brought witness testimony before a national audience. The photograph shows minority counsel Fred Thompson with Senators Howard Baker and Sam Ervin during the investigation.</p></div></section>' +
    related('See these powers in today’s Congress.','Open field guide','#guide');
  return page('Beyond lawmaking',content);
}

const glossary=[
  ['Amendment','A proposed change to the text of a bill or other measure. Each chamber can consider amendments under its own rules.'],
  ['Appropriation','A law or provision that gives an agency budget authority for specified purposes. Agencies use that authority to incur obligations and make payments.'],
  ['Conference committee','A temporary group of House and Senate members that works to resolve differences between versions of a measure. Both chambers must approve the result.'],
  ['Enrolled bill','The final text of a bill after both chambers have passed it in identical form. It is prepared for presentation to the president.'],
  ['Markup','A committee meeting in which members debate, amend, and vote on legislation.'],
  ['Quorum','The minimum number of members needed to conduct business. The Constitution generally requires a majority of each chamber’s members to constitute a quorum.'],
  ['Veto','The president’s formal rejection of a bill. A returned veto may be overridden by two-thirds of those voting in each chamber, with a quorum present.']
];
const sourceGroups=[
  ['The Capitol and its chambers',[['The U.S. Capitol building',sources.capitol],['The House Explained',sources.house],['Why each state has two senators',sources.equal],['Staggered terms and Senate classes',sources.classes]]],
  ['How legislation moves',[['The legislative process',sources.process],['Resolving differences between the chambers',sources.differences],['What happens at the president’s desk',sources.president],['Text of the U.S. Constitution',sources.constitution]]],
  ['Spending, oversight, and confirmations',[['The power of the purse',sources.purse],['How Senate committees work',sources.committees],['Senate consideration of nominations',sources.nominations]]]
];
function resource(symbol,title,copy,url) {
  return '<a class="resource-link" href="' + url + '">' + icon(symbol) + '<span><b>' + title + '</b><small>' + copy + '</small></span></a>';
}
export function guideContent(creditsOpen) {
  const sourcesHTML=sourceGroups.map(([heading,links])=>'<details><summary>' + heading + '</summary><ul>' + links.map(([name,url])=>'<li><a href="' + url + '">' + name + '</a></li>').join('') + '</ul></details>').join('');
  const photoCredits=Object.values(images).map(i=>'<li>' + i.label + ' · <a href="' + i.url + '">' + i.credit + '</a>.</li>').join('');
  const content=intro('Field guide','Follow Congress today.','Connect the exhibits to the people who represent you, read the bills under consideration, and consult the official record.') +
    '<div class="guide-grid"><section class="panel guide-content"><h2>Find your way in.</h2>' +
    resource('pin','Find your representative','Look up your congressional district and House member.',sources.findHouse) +
    resource('people','Find your senators','Browse senators by state and find their contact pages.',sources.findSenate) +
    resource('file','Track a bill','Search Congress.gov for a bill, its text, its sponsors, and its latest action.',sources.congress) +
    '</section><section class="panel guide-content"><h2>Words on the floor.</h2>' +
    glossary.map(([term,definition])=>'<details><summary>' + term + '</summary><p>' + definition + '</p></details>').join('') + '</section></div>' +
    '<section class="panel guide-content guide-credits" id="source-collection" tabindex="-1"><h2>Sources &amp; credits.</h2>' + sourcesHTML +
    '<details id="photography-credits"' + (creditsOpen?' open':'') + '><summary>Photography and the Capitol model</summary><ul>' + photoCredits +
    '<li>The original 3D Capitol and its still rendering are simplified architectural illustrations of the west front. The <a href="' + sources.capitol + '">Architect of the Capitol</a> documents the building and the locations of its two chambers.</li></ul></details></section>';
  return page('Field guide',content);
}
