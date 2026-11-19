export function icon(name) {
  return '<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#' + name + '"/></svg>';
}

export function intro(category, title, description) {
  return '<header class="exhibit-intro"><p class="eyebrow crumb-kicker"><span class="short-rule"></span>' + category + '</p><h1 tabindex="-1">' + title + '</h1><p>' + description + '</p></header>';
}

export function page(label, content) {
  return '<article class="wrap exhibit-page"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="#exhibits">Exhibits</a><span aria-hidden="true">/</span><span aria-current="page">' + label + '</span></nav>' + content + '</article>';
}

export function related(heading, text, url) {
  return '<aside class="related-bar"><h2>' + heading + '</h2><a class="button light-button" href="' + url + '">' + text + '</a></aside>';
}

export const sources = {
  house:'https://www.house.gov/the-house-explained',
  classes:'https://www.senate.gov/about/origins-foundations/senate-and-constitution/senate-classes.htm',
  equal:'https://www.senate.gov/about/origins-foundations/senate-and-constitution/two-senators-per-state.htm',
  capitol:'https://www.aoc.gov/explore-capitol-campus/buildings-grounds/capitol-building',
  process:'https://www.house.gov/the-house-explained/the-legislative-process',
  differences:'https://www.congress.gov/legislative-process/resolving-differences',
  president:'https://www.house.gov/the-house-explained/the-legislative-process/to-the-president',
  constitution:'https://www.archives.gov/founding-docs/constitution-transcript',
  purse:'https://history.house.gov/Institution/Origins-Development/Power-of-the-Purse/',
  committees:'https://www.senate.gov/committees/committees_faq.htm',
  nominations:'https://www.senate.gov/about/powers-procedures/nominations.htm',
  findHouse:'https://www.house.gov/representatives/find-your-representative',
  findSenate:'https://www.senate.gov/senators/senators-contact.htm',
  congress:'https://www.congress.gov/'
};

export const images = {
  house:{file:'house.webp', alt:'View from the gallery over the House desks toward the Speaker’s rostrum', label:'The House chamber', credit:'Office of the Speaker, U.S. House of Representatives', url:'https://commons.wikimedia.org/wiki/File:United_States_House_of_Representatives_chamber.jpg'},
  senate:{file:'senate.webp', alt:'The Senate’s desks face the presiding officer’s dais', label:'The Senate chamber',credit:'U.S. Senate',url:'https://commons.wikimedia.org/wiki/File:United_States_Senate_Floor.jpg'},
  bill:{file:'bill.webp', alt:'Handwritten heading on the enrolled act establishing Yellowstone National Park in 1872', label:'The Yellowstone National Park act, 1872',credit:'U.S. National Archives',url:'https://www.archives.gov/milestone-documents/act-establishing-yellowstone-national-park'},
  powers:{file:'powers.webp',alt:'Fred Thompson, Howard Baker, and Sam Ervin at the Senate Watergate hearings',label:'Senate Watergate hearings, 1973',credit:'U.S. Senate Historical Office',url:'https://www.senate.gov/artandhistory/history/common/image/ThompsonFred_BakerHoward.htm'}
};

export function photo(key) {
  const {file, alt, label, credit, url} = images[key];
  return '<figure class="photo-frame"><img src="assets/photos/' + file + '" alt="' + alt + '" loading="lazy"><figcaption>' + label + ' · <a href="' + url + '">' + credit + '</a></figcaption></figure>';
}
