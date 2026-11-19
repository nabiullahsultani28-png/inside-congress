import {screeningMarkup, createScreening} from './bill-screening.js';
import {intro, page, photo, related, sources} from './exhibit-kit.js';

const stages = [
  {short:'Introduce', title:'An idea enters the House.', text:'A representative hears from librarians about leaking roofs. She sponsors the fictional Library Repair Grants Act and introduces it in the House. A bill can usually begin in either chamber.', caption:'The hopper is the box where House members can introduce paper bills.'},
  {short:'Committee', title:'A committee works on the details.', text:'The bill goes to a committee with jurisdiction. Members can hear testimony, debate the wording, and amend it in a meeting called a markup. In this example, they vote to report it to the House.', caption:'A committee can advance a proposal, change it, or leave it without further action.'},
  {short:'House vote', title:'The House passes its version.', text:'After debate, the House votes to help public libraries repair their roofs. With a quorum present, a simple majority of those voting is usually enough for passage. The bill moves to the Senate.', caption:'The House text covers roof repairs. Only one chamber has agreed to it so far.'},
  {short:'Senate vote', title:'The Senate adds a line.', text:'Senators want the grants to cover accessible entrances as well as roof repairs. The Senate adopts an amendment and passes its version. Each chamber has passed a bill, but their texts differ.', caption:'The highlighted line appears only in the Senate version.'},
  {short:'Agreement', title:'Two votes. One text.', text:'The House can agree to the Senate amendment or the chambers can negotiate. Both must approve exactly the same wording before the bill can go to the president.', caption:'A shared idea reaches the president only after both chambers pass identical text.'},
  {short:'President', title:'At the president’s desk.', text:'Both chambers have agreed to fund roof repairs and accessible entrances. The enrolled bill goes to the president. Explore how each response changes its fate.', caption:'The president can sign the bill, return it with objections, or take no action.'}
];

const colors = {paper:'#f2e7c9', ink:'#30464a', copper:'#e7ae82', muted:'#90a6a1', light:'#efe3cf'};

function label(x,y,text,size=12,color=colors.light,anchor='middle') {
  return '<text x="' + x + '" y="' + y + '" fill="' + color + '" font-size="' + size + '" text-anchor="' + anchor + '" font-weight="600">' + text + '</text>';
}
function documentSheet(x,y,width,height,heading) {
  const fold = 15;
  return '<g class="slide-in"><path d="M' + x + ' ' + y + 'h' + (width-fold) + 'l' + fold + ' ' + fold + 'v' + (height-fold) + 'h-' + width + 'z" fill="' + colors.paper + '" stroke="#a39478" stroke-width="1.5"/><path d="M' + (x+width-fold) + ' ' + y + 'v' + fold + 'h' + fold + '" fill="#d5c4a3" stroke="#a39478"/>' +
    label(x+12,y+32,heading,12,colors.ink,'start') + '<path d="M' + (x+12) + ' ' + (y+39) + 'h' + (width-27) + '" stroke="#a59676"/></g>';
}
function bar(x,y,width,stroke=colors.ink) {
  return '<path class="ink-stroke" d="M' + x + ' ' + y + 'h' + width + '" fill="none" stroke="' + stroke + '" stroke-width="2.5" stroke-linecap="round"/>';
}
function desk(x,y) {
  return '<g class="beat" style="--delay:' + (x % 6 * 30) + 'ms"><circle cx="' + x + '" cy="' + y + '" r="6" fill="#d9a480"/><path d="M' + (x-9) + ' ' + (y+15) + 'q1-9 9-9t9 9" fill="#d8c9ac"/></g>';
}
function seal(x,y,win) {
  return '<g class="beat"><circle cx="' + x + '" cy="' + y + '" r="18" fill="' + (win?'#aecab9':'#e6ad89') + '" stroke="#405d56" stroke-width="1.3"/><path d="' + (win ? 'm'+(x-8)+' '+y+' 5 5 11-12' : 'm'+(x-6)+' '+(y-6)+' 12 12m0-12-12 12') + '" fill="none" stroke="#263d39" stroke-width="2.5" stroke-linecap="round"/></g>';
}

function sceneContent(index, state) {
  const {outcome, agreement} = state;
  if (index === 0) return documentSheet(147,14,122,146,'LIBRARY REPAIR') +
    bar(160,70,73) + bar(160,80,56) + bar(160,90,82) + bar(160,100,42) +
    '<path d="m88 139 30-18h160l30 18v59H88z" fill="#b48666" stroke="#e5c2a1" stroke-width="2"/><path d="m93 140 18-11h174l17 11z" fill="#24383b"/><path d="M91 144h214v52H91z" fill="#926e58"/>' + label(198,177,'HOUSE HOPPER',14,'#ffeed7');
  if (index === 1) return '<path d="M52 111q146-148 292 0l-19 16Q197 15 72 127z" fill="#b99170" stroke="#e7c39e"/>' +
    [[86,65],[137,39],[197,26],[257,39],[307,65]].map(([x,y])=>desk(x,y)).join('') +
    '<path d="M122 165q74-18 149 0v19H122z" fill="#9b795f" stroke="#e7bd99"/>' + desk(166,135) + desk(227,135) + label(198,211,'Public hearing',15);
  if (index === 2) {
    let seats = '';
    [8,12,16,20].forEach((count,row) => {
      const radius = 45 + row*21;
      for (let i=0;i<count;i++) {
        const angle = Math.PI*1.05 + Math.PI*.9*i/(count-1);
        const x=198+Math.cos(angle)*radius, y=146+Math.sin(angle)*radius;
        seats += '<circle class="beat" style="--delay:' + (i*9+row*20) + 'ms" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5" fill="' + (i<count*.64?'#e8ba96':'#8aa09e') + '"/>';
      }
    });
    return seats + '<path d="M174 146q24-8 48 0v7h-48z" fill="#b6a487"/>' + label(198,187,'House version passes',17) + label(198,206,'Illustrative vote',11,colors.muted);
  }
  if (index === 3 || index === 4) {
    const match = index===4 && agreement==='agree';
    const sheet = (x,header,extra) => documentSheet(x,22,150,148,header) +
      label(x+12,83,'Roof repairs',14,colors.ink,'start') + bar(x+12,96,108,'#adab97') +
      (extra ? '<rect class="beat" x="' + (x+9) + '" y="109" width="131" height="27" rx="2" fill="#e6b187"/>' + label(x+14,127,'Accessible entrances',11,colors.ink,'start') : bar(x+12,122,61,'#b4b4a4'));
    return sheet(35,'HOUSE TEXT',match) + sheet(209,'SENATE TEXT',true) + label(198,201,match?'The wording matches':agreement==='stall'&&index===4?'Different texts remain':'Compare the wording',16,match?'#c4dfc9':colors.light);
  }
  const win = ['signed','override','unsigned'].includes(outcome);
  const negative = ['veto','sustained','pocket'].includes(outcome);
  const stamp = win ? 'LAW' : negative ? (outcome==='pocket'?'POCKET VETO':'VETO') : 'ENROLLED BILL';
  return documentSheet(123,9,151,170,'LIBRARY REPAIR') + bar(138,67,94) + bar(138,78,76) + bar(138,89,106) + bar(138,100,79) +
    (win||negative?seal(234,140,win):'<path class="ink-stroke" d="M139 143q17-23 19-11t5 1q6-8 10-2t16-2" fill="none" stroke="#4a6257" stroke-width="2.5"/>') +
    label(198,203,stamp,15,win?'#c6dfbe':negative?'#ffc09b':colors.light);
}

function illustration(index, state) {
  return '<figure class="diagram-pane"><p class="eyebrow">Library Repair Grants Act · Fictional bill</p><svg class="scene-svg" viewBox="0 0 396 220" role="img" aria-label="' + stages[index].caption + '">' + sceneContent(index,state) + '</svg><figcaption>' + stages[index].caption + '</figcaption></figure>';
}

const outcomes = {
  agree:['The texts match.','The House accepts the Senate amendment. Both chambers have approved the same language, so the enrolled bill can go to the president.'],
  stall:['The bill stalls.','The two versions cannot be sent to the president. Members could resume negotiations, but if this Congress ends first, the bill must be introduced again in a new Congress.'],
  signed:['The bill becomes law.','The president signs the bill. The grant program can proceed under the law and any funding Congress makes available.'],
  veto:['The bill returns to Congress.','The president returns the bill with objections to the chamber where it began. Congress can reconsider it. With a quorum present, two-thirds of those voting in each chamber must support an override.'],
  override:['Congress overrides the veto.','Both chambers reached the two-thirds threshold. The bill becomes law over the president’s objections.'],
  sustained:['The veto stands.','At least one chamber fell short of two-thirds. The bill does not become law.'],
  wait:['The ten-day clock matters.','The Constitution gives the president ten days after presentment, excluding Sundays. What happens next depends on whether Congress can receive the returned bill.'],
  unsigned:['The bill becomes law without a signature.','Ten days, excluding Sundays, have passed. Because an adjournment did not prevent return, the unsigned bill becomes law.'],
  pocket:['The bill does not become law.','The president left the bill unsigned and an adjournment prevented its return within the constitutional period. This is a pocket veto. Congress cannot override it.']
};

function choices(prompt, options, chosen) {
  return '<fieldset class="branch-choices"><legend>' + prompt + '</legend><div class="choice-row">' +
    options.map(([value,label])=>'<button class="seg-button" type="button" data-choice="' + value + '" aria-pressed="' + (chosen===value) + '">' + label + '</button>').join('') + '</div></fieldset>';
}
function result(key) {
  return key ? '<div class="branch-result"><h3 tabindex="-1" data-result>' + outcomes[key][0] + '</h3><p>' + outcomes[key][1] + '</p></div>' : '';
}
function journal(index,state) {
  const stage=stages[index];
  let extra='';
  if (index===4) extra = choices('How will the House respond?',[['agree','Accept the amendment'],['stall','Leave the texts unresolved']],state.agreement) + result(state.agreement);
  if (index===5) {
    const {response, outcome}=state;
    extra = choices('Choose the president’s response.',[['signed','Sign'],['veto','Veto'],['wait','Take no action']],response) + result(response);
    if (response==='veto') extra+=choices('What happens in the override votes?',[['override','Both reach two-thirds'],['sustained','One falls short']],outcome);
    if (response==='wait') extra+=choices('After ten days, excluding Sundays…',[['unsigned','Return is still possible'],['pocket','Adjournment prevents return']],outcome);
    if (outcome && outcome!==response) extra+=result(outcome);
  }
  const advance = index < 5 && (index!==4 || state.agreement==='agree');
  return '<section class="journal"><p class="eyebrow detail-eyebrow">Step ' + (index+1) + ' of 6</p><h2 tabindex="-1" data-stage-heading>' + stage.title + '</h2><p>' + stage.text + '</p>' + extra +
    '<div class="journal-actions">' + (index ? '<button type="button" class="button light-button" data-move="back">Back</button>' : '') +
    (advance ? '<button type="button" class="button primary-button" data-move="next">Continue</button>' : '') +
    (index===5 ? '<button type="button" class="button primary-button" data-move="again">Start again</button>' : '') + '</div></section>';
}

export function billContent() {
  const content=intro('Lawmaking','The life of a bill.','Follow a fictional plan to repair public libraries. Step through the votes, compare two versions of the bill, and explore the choices that decide its fate.') +
    screeningMarkup() + '<nav aria-label="Bill journey steps"><ol class="bill-steps">' + stages.map((s,i)=>'<li><button type="button" data-step="' + i + '"><span>' + (i+1) + '</span>' + s.short + '</button></li>').join('') +
    '</ol></nav><div class="panel bill-stage"></div><p class="sr-only" aria-live="polite" id="bill-announcement"></p>' +
    '<section class="panel context-card">' + photo('bill') + '<div><p class="eyebrow detail-eyebrow">From the archives</p><h2>A bill that became a park.</h2><p>On March 1, 1872, President Ulysses S. Grant signed the act establishing Yellowstone National Park. This handwritten enrolled act is the final version passed by both chambers.</p><p class="source-note">Read the <a href="' + sources.process + '">House legislative guide</a>, <a href="' + sources.differences + '">how chambers resolve differences</a>, and <a href="' + sources.president + '">presidential action</a>.</p></div></section>' + related('What can Congress do beyond passing bills?','Explore its powers','#powers');
  return page('The life of a bill',content);
}

export function wireBill(root, signal) {
  const state={step:0,agreement:'',response:'',outcome:''};
  const panel=root.querySelector('.bill-stage'), announce=root.querySelector('#bill-announcement');
  const screening=createScreening(root,signal,()=>{
    if(state.step<4){state.step++;render();announce.textContent=stages[state.step].title;}
  });
  function render(focus='') {
    screening.show(state.step);
    root.querySelectorAll('[data-step]').forEach(button => {
      const i=Number(button.dataset.step);
      if (i===state.step) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
      button.disabled = i===5 && state.agreement!=='agree';
      button.title = button.disabled ? 'Choose matching text at the Agreement step to unlock this stage.' : '';
    });
    panel.innerHTML=illustration(state.step,state)+journal(state.step,state);
    if (focus==='step') panel.querySelector('[data-stage-heading]').focus({preventScroll:true});
    if (focus==='choice') {
      const who = state.step===4 ? state.agreement : state.outcome;
      panel.querySelector('[data-choice="' + who + '"]')?.focus({preventScroll:true});
    }
  }
  root.querySelector('.bill-steps').addEventListener('click', event => {
    const button=event.target.closest('[data-step]');
    if (!button || button.disabled) return;
    state.step=Number(button.dataset.step); render('step');
  });
  panel.addEventListener('click', event => {
    const button=event.target.closest('button');
    if (!button) return;
    if (button.dataset.move) {
      if (button.dataset.move==='again') Object.assign(state,{step:0,agreement:'',response:'',outcome:''});
      else state.step += button.dataset.move==='next' ? 1 : -1;
      render('step'); announce.textContent='Step ' + (state.step+1) + '. ' + stages[state.step].title;
      return;
    }
    const value=button.dataset.choice;
    if (!value) return;
    if (state.step===4) {
      state.agreement=value;
      state.response=''; state.outcome='';
    } else {
      if (['signed','veto','wait'].includes(value)) state.response=value;
      state.outcome=value;
    }
    render('choice'); announce.textContent=outcomes[value].join(' ');
  });
  render();
}
