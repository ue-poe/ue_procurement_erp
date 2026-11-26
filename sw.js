/* Penguin Suite service worker · v15 (shell fetch bypasses the HTTP cache — a deploy shows on the next launch, not 10 min later) · redeploy 10 Nov 2026 (Pages build for db8ccd0 failed on GitHub side)
   v24 (C9.2 deploy: construction.html v5.5.2 — M62 undo a resume: auto when the Draft is deleted · Undo Resume on the Waiting shelf)
   v23 (C9.1 deploy: construction.html v5.5.1 — tap a lit snap to clear yesterday's status · chips wrap on laptops)
   v22 (C9 deploy: construction.html v5.5 — manager phone flow: engineer-report cards · review with Accept / Return · Combined DPR by activity)
   v21 (C8.6 deploy: construction.html v5.4.6 — edge-to-edge tinted activity cards · minimal gutters)
   v20 (C8.5 deploy: construction.html v5.4.5 — one-line sub chips · tighter entry · sticky activity header on the sheet)
   v19 (C8.4 deploy: construction.html v5.4.4 — denser sheet and preview · slim footer aligned to the cards)
   v18 (C8.3 deploy: construction.html v5.4.3 — half padding · stage groups as strips · no sideways overflow on the preview)
   v17 (C8.1 deploy: construction.html v5.4.1 — tap-sized calendar sheet · Not Created screen · one-row footer)
   v16 (C8 deploy: construction.html v5.4 — DPR phone flow: floor chips · activity cards · crew · PO-style preview)
   v14 (C7 deploy: construction.html v5.3 — Waiting / On Hold, M49)
   v13 (C6 deploy: construction.html — Non-Estimated cards, Work-Wise toggle removed)
   v10 (C5 deploy: construction.html v5 — Cards only)
   v9 (C4.1 deploy: construction.html v4.1)
   v8 (C4 deploy: construction.html v4 — C3 bands withdrawn)
   v7 (C3 deploy: construction.html v3)
   v6 (C2 deploy: construction.html v2)
   v5 (C1 deploy)
   Deliberately conservative. It caches the app shell so the icon opens
   instantly and the UI paints without signal; it never caches Supabase
   responses, so every figure on screen is live. Offline DRAFT mode —
   saving edits with no signal and syncing later — is a separate piece
   of work and is NOT what this does.
   v5 (C1): construction.html and its manifest join the precached shell;
   a failed navigation falls back to the page that was asked for. */
// v25 · construction.html v5.5.3 — Resume moves the date of an already-resumed hold (M63); Recently Resumed strip removed
// v26 · construction.html v5.5.4 — Resume on a sheet opens the whole sheet (resume date = the sheet's progress date)
// v27 · construction.html v5.5.5 — Add Work: the estimate picker with its search always on screen
// v28 · construction.html v5.5.6 — floor chips carry the tower mark
// v29 · construction.html v5.6 — DPR compact header on phone (names · date row · chips; shrinks while scrolling)
// v30 · construction.html v5.6.1 — DPR header: names follow the scroll (fluid), rounded top corners
// v31 · index.html v199 — BBS and Quantity Take Off as their own pages under Planning & QS
// v32 · index.html v200 — BBS: general notes reader on Detailing Parameters · reinforcement refresh · pan on plan and sections
// v33 · index.html v201 — BBS: top bars per isolated footing on the Footing Register (M68)
// v34 · construction.html v5.6.2 — a deleted Draft stays deleted until Create Report (it was re-created on reopen)
// v35 · construction.html v5.6.3 — Add Work asks before adding more than 20 activities at once
// v36 · index.html v202 — BBS: combined footings (reinforcement drawing reader · bar sets · splices marked on the plan) (M69, M70)
// v37 · index.html v203 — BBS: combined footings checked beside the uploaded drawing · cover and spacing acceptance · several drawings · depth from layout (M71)
// v38 · index.html v204 — BBS: Bar Sets and Reinforcement Drawing fill the window (drawings stay, table scrolls) · drawings in a popup · compact header
// v39 · index.html v205 — BBS: rafts with sunk parts and sections · drawings without types · register built on reading · Reinforcement Drawing corrects, Bar Sets checks · section view
// v40 · index.html v206 — BBS: tables as cards beside the drawing · Layout view of the whole drawing · assisted Add Bar Set and Copy · layer mapping status · section kept for the BBS report
// v41 · index.html v207 — BBS: after a change only the footing that changed is read again · sheet and header read side by side
// v42 · index.html v208 — BBS: Footing Layout window on combined footing sheets (every footing mapped on the layout plan, what is left to resolve) · Layout pane toggle removed
// v43 · index.html v209 — BBS: Delete on the BBS Register (reason required, recorded in the deletion audit)
// v44 · index.html v210 — BBS: bar shapes drawn with their lengths on them (cards, schedule, report, Excel) · lengths typed on the sketch · A B C columns removed
// v45 · index.html v211 — BBS on a phone (register, reinforcement, BBS sheet; submit, approve, return) · Summary By Footing on the BBS sheet, report and Excel
// v46 · index.html v212 — BBS on a phone: only the view switch and model stay pinned on Reinforcement · bar mark cards on one grid
// v47 · index.html v213 — BBS on a phone: the BBS area reaches down to the Suite's navigation (no empty band below it)
// v48 · index.html v214 — Estimation: one Add / Edit Estimate screen replaces Add Estimate and Bulk Edit · line lock and Allocation Rules retired (M81a, M81b)
// v49 · index.html v214 (in place) — Add / Edit Estimate: full width, locations as a band of tick buttons that keeps its place · the line's estimated items listed for edit (M81c) · Expand All / Collapse All
// v50 · index.html v214 (in place) — Add / Edit Estimate: items on the left half, locations on the right half · Board is view only (no tick boxes or select buttons) · WBS / Location panel shows on the Board only
// v51 · index.html v214 (in place) — Add / Edit Estimate: a searched item that is already estimated shows its figures · listed rows show their totals · changing a listed row ticks its locations · clearer button names · a failed read is shown (M81d)
// v52 · index.html v214 (in place) — Add / Edit Estimate is item first: search the item, its WBS and locations show if it is estimated; a new item gets both picked · Reset · Reason For Change always on screen
// v53 · index.html v214 (in place) — Add / Edit Estimate: Qty By Location in the location table's order · a qty that differs by location reads Varies with its range · unchanged row shows no change · Paste Rows and Select N Loc removed
// v54 · index.html v214 (in place) — Add / Edit Estimate lists Your Drafts and re-opens them · Board shows lines at every location that holds an estimate, draft or pending change · WBS Structure shows material lines and adds them
// v55 · index.html v214 (in place) — Add / Edit Estimate: each item shows its total with every qty / wastage / rate combination and its locations under it; rate and wastage can differ by location (M81e)
// v56 · index.html v214 (in place) — Add / Edit Estimate: Delete From Estimate moves to the WBS / Basis row behind a selection box and a confirmation · a draft that repeats the approved figure no longer reads Your Draft
// v57 · index.html v214 (in place) — Estimation: the Changes tab is retired (entries go straight to Approvals; drafts are under Your Drafts on Add / Edit Estimate)
// v63 · construction.html v5.7 — Daily Report in two tabs: Labour (today) · Progress (till yesterday); club any activities
// v64 · construction.html v5.7.1 — Labour: locations in the header, manpower under each sub-activity by group; Progress: a block per location
// v65 · construction.html v5.7.2 — Labour cards: sticky title row, like the Progress cards
// v66 · construction.html v5.7.3 — wide screens: Labour and Progress scroll on their own
// v67 · construction.html v5.7.4 — Progress: the block stays on the sub-activity just filled (no jump to the next one)
// v68 · construction.html v5.7.5 — Progress cards keep a fixed order (no re-sort by attention after an entry)
// v69 · construction v5.8 · DPR cards: location rail, quiet H / N, one-row floor ribbon
// v70 · construction v5.8.1 · DPR paints only the cards that changed; contractor name on one line
// v71 · construction v5.8.2 · tucked floor ribbon gives its height back; ⋯ no longer covers the sub-activity strip
// v72 · construction v5.8.3 · Hold once per activity card and per club; ⋯ removed from the blocks
// v73 · construction v5.8.4 · no Hold button on the Labour screen
// v74 · construction v5.8.5 · a sub-activity hindrance no longer folds away as 'No Work'
// v75 · construction v5.9 · club sub-activities for labour (needs M87 on the database)
// v76 · construction v5.10 · Handover tab for the manager (needs M88 on the database)
// v77 · construction v5.11 · review / preview rows with the location rail; one-line activity header
// v78 · Construction v5.12 — DPR: every slab level gets its own floor chip, labelled × Remove on never-reported work, confirm sheet before Add Work
// v79 · Construction v5.12.1 — DPR Add Work: work already on a sheet always shows, marked green
// v80 · Construction v5.12.2 — DPR: × Remove on Labour cards too (pairs with M89 on the database)
// v81 · Construction v5.13 — Reporting Plan: add a sub-activity inside a named group, move rows between groups
// v82 · Construction v5.14 — Daily Report manager: Sequence tab (predecessors / successors, project format; pairs with M90 on the database)
// v83 · Construction v5.14.1 — Sequence: the panel under the chart is removed, the chart takes the height
// v84 · Construction v5.15 — Reporting Plan: a group is a split of the location (M92); Sequence lists a grouped activity once
// v85 · Construction v5.15.1 — left rail: Site Areas and Labour Setup entries removed (they are tabs inside Daily Report)
// v86 · Construction v5.15.2 — Progress: 25 / 50 / 75 buttons fill up to the progress reported; Left counts today's entry
// v87 · Construction v5.16 — Combined DPR print redesigned: Labour Report + Activity Progress, A4 and Phone formats
// v88 · Construction v5.16.1 — Combined DPR on the phone: Share PDF straight to the share sheet (no print dialog)
// v89 · Construction v5.16.2 — Share PDF: plain file name, faster build, and Share Image / Save PDF when the phone refuses the PDF
// v90 · Construction v5.16.3 — DPR report: End Of Report line; 1 Week Trend shows Week No, date range and weekdays
// v91 · Construction v5.16.4 — DPR report: contractor wise 1-week trend
// v92 · Construction v5.16.5 — DPR report: progress as compact cards (every sub-activity, a group is its own card), Non-Estimated as its own area row
// v93 · Construction v5.16.6 — Combined DPR: warning when the report's manpower differs from the labour saved for the day
// v94 · Construction v5.16.7 — DPR A4 print: an activity starts on a new sheet when it would otherwise be split
// v95 · Construction v5.16.8 — Daily Report: a crew with heads marks every blank running row Working today
// v96 · Construction v5.16.9 — Heads Missing is shown only on the rows Working today
// v97 · Construction v5.17 — Review & Publish: Analysis segment (labour deployment, no-labour, productivity per head) · reads M98
// v98 · Construction v5.18 — Review & Publish: review, flag, accept and return from the Analysis (Reports / Combined under the ⋯ menu) · reads M99
const VERSION = 'pgs-shell-v98';
const SHELL = ['./', './index.html', './manifest.webmanifest',
               './construction.html', './construction.webmanifest',
               './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // never touch API or auth traffic
  if (u.hostname.endsWith('supabase.co') || u.pathname.startsWith('/auth') || e.request.method !== 'GET') return;
  // app shell: network first, cache fallback — so a new deploy wins
  if (u.origin === location.origin) {
    const fallback = /construction\.html$/.test(u.pathname) ? './construction.html' : './index.html';
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => {   // v15: revalidate with the server every time; offline still falls back to the cached shell
      const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match(fallback))));
  }
});
