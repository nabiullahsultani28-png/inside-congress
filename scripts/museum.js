import {icon, intro, page, related, sources} from './exhibit-kit.js';
import {chamberContent, wireChamber} from './chambers.js';
import {billContent, wireBill} from './bill.js';
import {guideContent, powersContent} from './field-guide.js';

const home = document.getElementById('home-view');
const exhibit = document.getElementById('exhibit-view');
const nav = document.getElementById('nav');
const menu = document.querySelector('.menu-toggle');
let activeView = '';
let lifecycle = new AbortController();

function setMenu(open) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.innerHTML = icon(open ? 'close' : 'menu');
}
menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
document.addEventListener('keydown', event => {
  if (event.key==='Escape' && nav.classList.contains('open')) {setMenu(false);menu.focus();}
});
document.querySelector('.masthead').addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('click', event => {
  if (nav.classList.contains('open') && !event.target.closest('.masthead')) setMenu(false);
});
window.matchMedia('(min-width:651px)').addEventListener('change', ({matches}) => { if (matches) setMenu(false); });

function viewerContent() {
  const commands=[['left','left','Rotate left'],['right','right','Rotate right'],['out','minus','Zoom out'],['in','plus','Zoom in'],['reset','reset','Reset view']];
  const buttons=commands.map(([action,symbol,label])=>'<button type="button" disabled class="ghost-button" data-camera="' + action + '" aria-label="' + label + '" title="' + label + '">' + icon(symbol) + '</button>').join('');
  return page('The Capitol',intro('Architecture','The U.S. Capitol.','The Senate meets in the north wing and the House in the south. Explore the scale model from any angle, or choose a chamber below.') +
    '<div class="viewer"><div class="viewer-stage" tabindex="0" role="group" aria-label="Interactive Capitol model" aria-describedby="viewer-keys"><img class="viewer-photo" src="assets/capitol/capitol.webp" alt="Scale model of the west front of the U.S. Capitol"><canvas class="viewer-canvas" aria-label="Rotatable 3D Capitol"></canvas></div><div class="viewer-bar"><p class="viewer-status" role="status">Opening the 3D model…</p><div class="viewer-controls" role="group" aria-label="Camera controls">' + buttons + '</div></div></div>' +
    '<p id="viewer-keys" class="sr-only">Use left and right arrow keys to rotate, up and down to zoom, and Home to reset the camera.</p>' +
    '<section class="viewer-layout"><div class="viewer-text"><h2>One building, two chambers.</h2><p>The Rotunda sits beneath the central dome. Facing the west front, you see the Senate wing on your left and the House wing on your right.</p></div><nav class="model-wing-links" aria-label="Visit a chamber"><a class="button light-button" href="#chambers/senate">Visit the Senate</a><a class="button primary-button" href="#chambers/house">Visit the House</a></nav></section>' +
    '<p class="source-note exhibit-footnote">Architecture reference · <a href="' + sources.capitol + '">Architect of the Capitol</a></p>' +
    related('Ready to follow a bill through both wings?','Enter the bill journey','#bill'));
}

function route(initial=false) {
  const [fragment='', detail='']=location.hash.slice(1).split('/');
  // A native skip link must preserve the current exhibit.
  if (fragment==='main-content' && !initial) {document.getElementById('main-content').focus(); return;}
  const view=['chambers','bill','powers','guide','capitol'].includes(fragment) ? fragment : 'home';
  const collection=fragment==='exhibits';
  const previous=activeView;
  activeView=view;
  lifecycle.abort();
  lifecycle=new AbortController();
  setMenu(false);
  home.hidden=view!=='home';
  exhibit.hidden=view==='home';
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav===view) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  });
  const titles={home:'Inside Congress',chambers:'The two chambers',bill:'The life of a bill',powers:'Beyond lawmaking',guide:'Field guide',capitol:'The U.S. Capitol in 3D'};
  document.title=titles[view]+' · Civic Atlas';
  if (view==='home') {
    exhibit.replaceChildren();
    if (collection) {
      const gallery=document.getElementById('exhibits');
      gallery.focus({preventScroll:true});
      gallery.scrollIntoView({block:'start'});
    } else {
      if (!initial) document.getElementById('main-content').focus({preventScroll:true});
      window.scrollTo(0,0);
    }
    return;
  }
  if (view==='chambers') {
    const key = detail==='senate' ? 'senate' : 'house';
    exhibit.innerHTML=chamberContent(key); wireChamber(exhibit,key);
  } else if (view==='bill') {
    exhibit.innerHTML=billContent(); wireBill(exhibit);
  } else if (view==='powers') {
    const key=['spending','oversight','confirmations'].includes(detail) ? detail : 'spending';
    exhibit.innerHTML=powersContent(key);
  } else if (view==='guide') {
    exhibit.innerHTML=guideContent(detail==='credits');
  } else {
    exhibit.innerHTML=viewerContent();
    const viewer=exhibit.querySelector('.viewer'), signal=lifecycle.signal;
    import('./capitol.js').then(({showCapitol}) => {
      if (!signal.aborted) return showCapitol(viewer, signal);
    }).catch(() => {
      if (!signal.aborted) {
        viewer.querySelector('.viewer-status').textContent='Still view. Explore the House and Senate using the links below.';
        viewer.querySelector('.viewer-controls').hidden=true;
        viewer.querySelector('.viewer-stage').removeAttribute('tabindex');
      }
    });
  }
  if (view==='guide' && detail==='credits') {
    const credits=exhibit.querySelector('#source-collection');
    credits.focus({preventScroll:true}); credits.scrollIntoView({block:'start'});
  } else if (!initial && previous===view && (view==='chambers'||view==='powers')) {
    exhibit.querySelector('.switch-link[aria-current="page"]')?.focus({preventScroll:true});
  } else {
    window.scrollTo(0,0);
    if (!initial) exhibit.querySelector('h1').focus({preventScroll:true});
  }
}
// Keep the skip link out of hash navigation so reloading keeps a deep-linked exhibit.
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault(); document.getElementById('main-content').focus();
});
window.addEventListener('hashchange', () => route());
document.addEventListener('click', event => {
  const same=event.target.closest('a[href="#home"],a[href="#exhibits"]');
  if (same && same.hash===location.hash) {event.preventDefault();route();}
});
route(true);
