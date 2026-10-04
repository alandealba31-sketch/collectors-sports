(() => {
  const root = window.CS_IMAGE_CATALOG = window.CS_IMAGE_CATALOG || {collections:{},cards:{}};
  root.cards = root.cards || {};
  const verifiedAt = '2026-10-04';
  const exact = (front, sourcePage, label, verified) => ({
    front,
    kind:'exact',
    exactVerified:true,
    variant:'Base',
    source:'Topps official product page',
    sourcePage,
    sourceImageUrl:front,
    label,
    verified,
    verificationMethod:'official Topps product page + SKU/card number + subject + card-attached base front',
    verifiedAt,
    confidence:'official-high'
  });

  Object.assign(root.cards, {
    'topps-now-mlb-2026|730': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/16a2881684a0384af3156af307d0ddca10ab703c_ARTBB_16C2S_26TN_0730.jpg?v=1790619920',
      'https://www.topps.com/products/francisco-lindor-2026-mlb-topps-now%C2%AE-card-730',
      'Francisco Lindor #730 — frente Base exacto oficial',
      ['2026 MLB Topps NOW','Card 730','Francisco Lindor','Base','SKU ARTBB-16C2S-26TN-0730']
    ),
    'topps-now-mlb-2026|734': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/d0d6286334d8d3c7991d6bee891bf43aa4891a36_ARTBB_16C2S_26TN_0734.jpg?v=1790619921',
      'https://www.topps.com/products/tj-rumfield-2026-mlb-topps-now%C2%AE-card-734',
      'TJ Rumfield #734 — frente Base exacto oficial',
      ['2026 MLB Topps NOW','Card 734','TJ Rumfield','Base','SKU ARTBB-16C2S-26TN-0734']
    ),
    'topps-now-mlb-2026|737': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/3f4a942c71bcaac5a6524b03f350abc26df522d6_ARTBB_16C2S_26TN_0737.jpg?v=1790799962',
      'https://www.topps.com/products/colson-montgomery-2026-mlb-topps-now%C2%AE-card-737',
      'Colson Montgomery #737 — frente Base exacto oficial',
      ['2026 MLB Topps NOW','Card 737','Colson Montgomery','Base','SKU ARTBB-16C2S-26TN-0737']
    ),
    'topps-now-mlb-2026|738': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/f04d8930923a71946243099d21950a931fca8238_ARTBB_16C2S_26TN_0738.jpg?v=1790799965',
      'https://www.topps.com/products/cam-schlittler-2026-mlb-topps-now%C2%AE-card-738',
      'Cam Schlittler #738 — frente Base exacto oficial',
      ['2026 MLB Topps NOW','Card 738','Cam Schlittler','Base','SKU ARTBB-16C2S-26TN-0738']
    ),
    'topps-now-mlb-2026|739': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/25832c0612be2423eb9529ae4437b036de8a778c_ARTBB_16C2S_26TN_0739.jpg?v=1790799961',
      'https://www.topps.com/products/ben-rice-2026-mlb-topps-now%C2%AE-card-739',
      'Ben Rice #739 — frente Base exacto oficial',
      ['2026 MLB Topps NOW','Card 739','Ben Rice','Base','SKU ARTBB-16C2S-26TN-0739']
    ),
    'topps-now-mlb-2026|740': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/7e80203f0879691d063058da40e07d79c92f1ffb_ARTBB_16C2S_26TN_0740.jpg?v=1790799958',
      'https://www.topps.com/products/george-lombard-jr-2026-mlb-topps-now%C2%AE-card-740',
      'George Lombard Jr. #740 — frente Base exacto oficial',
      ['2026 MLB Topps NOW','Card 740','George Lombard Jr.','Base','SKU ARTBB-16C2S-26TN-0740']
    ),
    'topps-now-mlb-2026|748': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/560d6d28adf2054d5c0f2ab27edb72aaec933d81_ARTBB_16C2S_26TN_0748.jpg?v=1790878904',
      'https://www.topps.com/products/ethan-salas-2026-mlb-topps-now%C2%AE-card-748',
      'Ethan Salas #748 — frente Base exacto oficial',
      ['2026 MLB Topps NOW','Card 748','Ethan Salas','Base','SKU ARTBB-16C2S-26TN-0748']
    ),

    'topps-now-nfl-2026|31': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/74939ab9ce66fc9706dd09c9f88586a226000ae1_ARTFB_16C2S_26TN_0031.jpg?v=1790542390',
      'https://www-next.topps.com/products/jahmyr-gibbs-2026-nfl-topps-now%C2%AE-card-31',
      'Jahmyr Gibbs #31 — frente Base exacto oficial',
      ['2026 NFL Topps NOW','Card 31','Jahmyr Gibbs','Base','SKU ARTFB-16C2S-26TN-0031']
    ),
    'topps-now-nfl-2026|32': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/87d3726784c62cccf1211cfb6c482858b78edb3e_ARTFB_16C2S_26TN_0032.jpg?v=1790621049',
      'https://www.topps.com/products/aaron-rodgers-ben-roethlisberger-2026-27-nfl-topps-now%C2%AE-card-32',
      'Aaron Rodgers / Ben Roethlisberger #32 — frente Base exacto oficial',
      ['2026-27 NFL Topps NOW','Card 32','Aaron Rodgers / Ben Roethlisberger','Base','SKU ARTFB-16C2S-26TN-0032']
    ),
    'topps-now-nfl-2026|36': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/4f8e2746553f769b0bcc03ad336da79bbaa09dd6_ARTFB_16C2S_26TN_0036.jpg?v=1790621061',
      'https://www.topps.com/products/matthew-stafford-2026-27-nfl-topps-now%C2%AE-card-36',
      'Matthew Stafford #36 — frente Base exacto oficial',
      ['2026-27 NFL Topps NOW','Card 36','Matthew Stafford','Base','SKU ARTFB-16C2S-26TN-0036']
    ),

    'topps-now-tennis-2026|26': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/9a5f4ec822d2d501002ec6ace9aa54088ea199ae_ARTTS_16C2S_26TN_0026.jpg?v=1790539432',
      'https://www-next.topps.com/products/carlos-alcaraz-2026-topps-now%C2%AE-tennis-card-26',
      'Carlos Alcaraz #26 — frente Base exacto oficial',
      ['2026 Topps NOW Tennis','Card 26','Carlos Alcaraz','Base','SKU ARTTS-16C2S-26TN-0026']
    ),
    'topps-now-tennis-2026|27': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/13c301e8a20023d36cc25d008c138a495b6da34b_ARTTS_16C2S_26TN_0027.jpg?v=1790622237',
      'https://www.topps.com/products/carlos-alcaraz-2026-topps-now%C2%AE-tennis-card-27',
      'Carlos Alcaraz #27 — frente Base exacto oficial',
      ['2026 Topps NOW Tennis','Card 27','Carlos Alcaraz','Base','SKU ARTTS-16C2S-26TN-0027']
    ),

    'topps-now-f1-2026|62': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/ff0c6ddec3e874f5bb8f06e671e0715608f07369_ARTF1_16C2S_26TN_0062.jpg?v=1790680106',
      'https://www.topps.com/products/george-russell-2026-formula-1%C2%AE-topps-now%C2%AE-card-62',
      'George Russell #62 — frente Base exacto oficial',
      ['2026 Formula 1 Topps NOW','Card 62','George Russell','Base','SKU ARTF1-16C2S-26TN-0062']
    ),
    'topps-now-f1-2026|63': exact(
      'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/f93fe40db0f8f9ae778efca86918293cb49223f3_ARTF1_16C2S_26TN_0063.jpg?v=1790680105',
      'https://www-next.topps.com/products/max-verstappen-2026-formula-1%C2%AE-topps-now%C2%AE-card-63',
      'Max Verstappen #63 — frente Base exacto oficial',
      ['2026 Formula 1 Topps NOW','Card 63','Max Verstappen','Base','SKU ARTF1-16C2S-26TN-0063']
    )
  });
})();
