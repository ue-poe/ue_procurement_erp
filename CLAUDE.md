# Penguin Procurement Suite: Project Rules

## What this is
Internal procurement ERP for Urban Excellence LLP, used for the "Poetry of Earth" (PoE) G+26 residential development (Varthur-Sarjapur Road, Bengaluru).
- Front end: single-file HTML app, `index.html` (about 3.9 MB, about 41,450 lines). The Planning & QS Suite is embedded inside it as a string (see "index.html map").
- Database/auth: Supabase (Postgres). Production project and staging project are SEPARATE.
- Hosting: GitHub repo -> Cloudflare (auto-deploys from GitHub)
- Companion tool: Penguin Planning & QS Suite (WBS/location planning), separate file

## Owner and working style
- Owner: Sunderrajan. Strong on domain and creative problem-solving, not a full-time developer.
- Explain what you are about to change and why, in plain language, BEFORE big changes.
- After each change, tell me exactly how to test it (click path + expected result).
- Prefer simple, boring, maintainable solutions over clever ones.

## Hard rules (never break)
1. NEVER run SQL or migrations against the production Supabase project. Staging only. I promote to production myself.
2. NEVER put a service_role key, database password or any secret in the HTML or the repo. Only the public anon key may appear in client code.
3. NEVER rewrite or regenerate the whole HTML file. Make minimal, targeted edits and keep the existing look and behaviour unless I ask otherwise.
4. NEVER run destructive SQL (DROP, TRUNCATE, DELETE without WHERE, ALTER that removes columns) without showing it to me and getting an explicit yes.
5. Never commit directly to main. Work on a branch, open a PR.

## Git workflow
- Branch per change: feature/<short-name> or fix/<short-name>
- Small commits with clear messages: "Add PO approval status filter", not "update"
- Cloudflare preview URL is where I test; merge to main only after I confirm it works
- Before merging anything that touches the database, confirm the migration has been applied and tested on staging

## Database rules
- All schema changes are migration files in supabase/migrations/ named YYYYMMDDHHMMSS_short_description.sql
- Migrations must be safe to review: one purpose per file, comments explaining intent
- Every table has Row Level Security ENABLED with explicit policies. No table is ever left open.
- Use snake_case, plural table names, uuid primary keys, created_at/updated_at timestamps
- Money: numeric (never float). Quantities and units stored explicitly.
- Add indexes for columns used in filters/joins; mention why
- When adding a column to a table with data, provide a safe default or backfill plan

## Front-end rules
- Keep one source of truth for Supabase config; environment (staging vs production) is chosen by hostname
- Handle loading, empty and error states for every data call; never fail silently
- Escape/sanitize user-entered text before rendering as HTML
- Currency in INR with Indian digit grouping; dates shown as DD-MMM-YYYY
- Must work on a laptop and a phone-sized screen

## Domain notes (procurement)
- Core flow: indent/requisition -> RFQ/quotes -> comparison -> PO -> GRN/receipt -> invoice/payment
- Keep GST, retention, advances and taxes explicit; do not silently round
- Master codes are generated in the client as prefix plus a 3-digit serial (next number = highest existing code + 1):
  - Vendors (`ho_vendors.vendor_code`): `VEN001`
  - Contractors (`wo_contractors.contractor_code`): `CON001`
  - Materials (`pu_material_master.material_code`): `MAT001`
  - Activities (`ho_activities.activity_code`): `ACT001`
  New master entries go through an approval queue (`rpc_master_decide`).
- Material categories: `pu_material_master` uses material_group and sub-group fields and is shown as a tree in Masters.
- Document numbers come from the `next_doc_number(p_doc_type, p_fin_year)` RPC. The financial year runs April to March, formatted as `2025-26`, which gives numbers like `HO/2025-26/007`. Certifications are numbered per order, e.g. `HOC/HO-007/001`. GRN and MIS numbers have their own RPCs (`next_grn_number`, `next_mis_number`).
- Approval levels: there is no hard-coded role map. Each permission is a `(function_code, side)` pair from `function_permissions`, where side C means create/maker and side A means approve/checker. `PGS_PERM_MAP` in index.html (around line 6513) translates UI permission keys into these pairs, and the DB triggers enforce the same table. Owner/super-admin-only actions are listed in `PGS_OWNER_ONLY`. The maker and the checker should be different people (see the v75.8 note on payments).
- Budget codes: cost heads and sub-heads live in `pu_cost_heads` (a tree). WBS nodes (`wbs_nodes`, `wbs_scope`) and locations (`location_nodes`) carry the estimate/budget. Package budget and remaining amounts come from `fn_package_budget`, `fn_package_remaining` and `fn_order_headroom`.

## Definition of done
- Works on the Cloudflare preview URL against STAGING data
- No console errors
- Migration (if any) applied on staging and committed
- I have been given the test steps and confirmed

## Repo file structure
```
CLAUDE.md               these rules
CNAME                   custom domain: app.penguin-suite.com
index.html              the whole app (HTML + CSS + JS), about 3.9 MB, about 41,450 lines
sw.js                   service worker (app-shell cache)
manifest.webmanifest    PWA manifest ("Penguin Suite"), points to the two icons
icon-192.png            PWA / apple-touch icon
icon-512.png            PWA icon (also used as the maskable icon)
```
There is no build step, package.json or test suite. The `supabase/migrations/` folder named in "Database rules" does not exist yet. External libraries load from CDNs in `<head>`: supabase-js v2, xlsx 0.18.5, exceljs 4.4.0, jspdf 2.5.1 and jspdf-autotable 3.8.2.

## Supabase objects referenced by the code
"Main" means the main app. "Plan" means the embedded Planning & QS Suite (the `PGS_PLAN_SRC` string). Client code cannot tell a table from a view, so only objects that the code's own comments call a view are marked as views. Some helpers take the table name as a variable (`dbInsert`, `_puInChunks`, `_certGuard`, the WO/HO amendment config near line 31383, and the vendor/contractor lookup in `_printOrderDoc`). All of those resolve to tables already in this list.

**Tables (Main)**
- Org/access: `organizations`, `projects`, `project_users`, `project_role_assignments`, `function_permissions`, `user_profiles`
- WBS/location: `wbs_master`, `wbs_nodes`, `wbs_scope`, `location_nodes`
- Hire orders (HO): `ho_vendors`, `ho_activities`, `ho_locations`, `ho_boq_items`, `ho_orders`, `ho_order_items`, `ho_certifications`, `ho_certification_items`, `ho_bills`, `ho_bill_items`, `ho_bill_extra_lines`
- Work orders (WO): `wo_contractors`, `wo_orders`, `wo_order_items`, `wo_item_stages`, `wo_certifications`, `wo_certification_items`, `wo_bills`, `wo_bill_items`, `wo_bill_extra_lines`
- Amendments: `order_amendments`
- Payments: `ho_payments`, `ho_payment_allocations`, `pgs_bill_block_log`
- Purchase: `pu_material_master`, `pu_material_edit_log`, `pu_cost_heads`, `pu_drafts`, `pu_mir`, `pu_mir_items`, `pu_mir_item_po_links`, `pu_mir_item_rfq_links`, `pu_rfq`, `pu_rfq_items`, `pu_rfq_quotes`, `pu_rfq_quote_items`, `pu_quotes`, `pu_quote_items`, `pu_quote_comparison`, `pu_qc_negotiations`, `pu_po_orders`, `pu_po_items`, `pu_grn`, `pu_grn_items`, `pu_po_bills`, `pu_po_bill_items`, `pu_mis`, `pu_mis_items`, `pu_stock_audit_log`, `pu_doc_deletion_audit`, `material_fifo_layers`, `vendor_doc_profiles`
- Daily report (read-only to clients; writes go only through RPCs): `dpr_areas`, `dpr_area_locations`, `dpr_area_engineers`

**Views (Main)**
- `pu_stock_balance`: stock balance, already net of reserved qty (comments near lines 35146 and 36056)

**Tables (Plan only)**
- `project_config`, `wbs_location_rules`, `wbs_material_buildup`, `wbs_scope_leases`, `wbs_scope_submissions`, `pq_drawings`, `pq_takeoffs`, `pq_takeoff_sheets`, `pq_takeoff_measurements`, `pq_estimate_links`, `pq_item_rates`
- Plan also reads these Main tables: `projects`, `organizations`, `user_profiles`, `wbs_nodes`, `wbs_scope`, `location_nodes`, `ho_activities`, `pu_material_master`, `pu_mis_items`, plus WO/HO order, certification and bill item tables.

**RPC functions (Main)**
- Numbering: `next_doc_number`, `next_grn_number`, `next_mis_number`
- Session/admin: `rpc_whoami`, `rpc_my_workspace`, `rpc_permissions_snapshot`, `rpc_set_active_project`, `rpc_create_org`, `rpc_update_org_profile`, `rpc_create_project`, `rpc_copy_masters`, `rpc_list_project_masters`, `rpc_invite_user`, `rpc_assign_project_role`, `rpc_revoke_project_role`, `rpc_um_team`, `rpc_um_set_user_active`, `rpc_master_decide`
- Saves (atomic, idempotent via `puRPC`, around line 37143): `rpc_save_mir`, `rpc_save_rfq`, `rpc_save_rfq_quote`, `rpc_submit_qc`, `rpc_save_po`, `rpc_save_grn`, `rpc_save_pob`, `rpc_save_mis`, `rpc_save_wo`, `rpc_save_woc`, `rpc_save_wob`, `rpc_save_ho`, `rpc_save_hoc`, `rpc_save_hob`
- Approve/reject/close: `rpc_qc_approve`, `rpc_qc_cancel`, `rpc_pob_approve`, `rpc_grn_verify`, `rpc_grn_reject`, `rpc_reject_doc`, `rpc_po_cancel`, `rpc_po_short_close`, `rpc_mir_short_close`, `rpc_grn_delete`, `rpc_pob_delete`
- Amendments: `rpc_amd_open`, `rpc_amd_open_v2`, `rpc_amd_preview`, `rpc_amd_save_draft`, `rpc_amd_request`, `rpc_amd_submit`, `rpc_amd_approve`, `rpc_amd_reject`, `rpc_amd_cancel`, `rpc_amd_history`, `fn_amd_wo_stage_template`
- Payments: `rpc_vendor_ledger`, `rpc_confirm_payment_batch`, `rpc_payment_decide`, `rpc_bill_block`, `rpc_bill_release_request`, `rpc_bill_release_decide`
- Quantities/budget: `fn_package_budget`, `fn_package_remaining`, `fn_package_effective_locations`, `fn_pair_remaining`, `fn_ls_remaining`, `fn_order_headroom`, `fn_material_estimate_pkg`, `fn_material_consumed_pkg`, `fn_material_issue_remaining`, `fn_material_issue_remaining_pkg`, `fn_material_wbs_locations`, `rpc_estimate_pooled_cells`, `rpc_mir_coverage`, `rpc_mir_list`, `rpc_po_rate_history`, `rpt_material_reconcile_v2`
- Documents/scan: `rpc_doc_view`, `rpc_doc_scan_log`, `rpc_doc_scan_stats`, `rpc_vendor_profile_learn`
- Daily report (DPR): `rpc_dpr_masters`, `rpc_dpr_open_my_day`, `rpc_dpr_sheet`, `rpc_dpr_start_group`, `rpc_dpr_save_group`, `rpc_dpr_drop_group`, `rpc_dpr_regroup`, `rpc_dpr_save_np`, `rpc_dpr_np_reason_save`, `rpc_dpr_submit`, `rpc_dpr_my_submission`, `rpc_dpr_my_history`, `rpc_dpr_review_queue`, `rpc_dpr_submission_detail`, `rpc_dpr_accept`, `rpc_dpr_return`, `rpc_dpr_publish`, `rpc_dpr_published_list`, `rpc_dpr_plans`, `rpc_dpr_plan_save`, `rpc_dpr_plan_delete`, `rpc_dpr_stage_templates`, `rpc_dpr_stage_template_save`, `rpc_dpr_line_catalog`, `rpc_dpr_location_lines`, `rpc_dpr_location_search`, `rpc_dpr_wbs_reportable_set`, `rpc_dpr_area_save`, `rpc_dpr_area_delete`, `rpc_dpr_area_engineers_set`, `rpc_dpr_trade_save`, `rpc_dpr_rate_save`, `rpc_dpr_hindrance_register`, `rpc_dpr_hindrance_note`, `rpc_dpr_hindrance_set_start`, `rpc_dpr_classify_hindrance`, `rpc_dpr_allocate_hindrance`, `rpc_dpr_close_hindrance`, `rpc_dpr_confirm_hindrance_close`, `rpc_dpr_reopen_hindrance`

**RPC functions (Plan)**
- `rpc_whoami`, `fn_certified_qty`, `fn_effective_locations`, `fn_scope_floor_qty`, `rpc_est_board_rows`, `rpc_est_board_summary`, `rpc_est_finder_index`, `rpc_est_finder_rows`, `rpc_est_history_buildup`, `rpc_est_history_events`, `rpc_est_history_ledger`, `rpc_est_history_rejected`, `rpc_est_history_rows`, `rpc_est_lease_state`, `rpc_est_matrix`, `rpc_est_unit_floors`, `rpc_material_floors`, `rpc_material_project_position`, `rpc_save_scope_draft`, `rpc_discard_scope_drafts`, `rpc_submit_scope_changes`, `rpc_submit_scope_revision`, `rpc_approve_scope_submissions`, `rpc_reject_scope_submissions`, `rpc_withdraw_scope_submissions`, `rpc_set_node_lock`, `rpc_set_node_locks`, `rpc_lock_all_nodes`, `rpc_pq_clone_takeoff`

**Storage buckets**
- `pgs-attachments` (Main): uploads around lines 11717 and 30812, signed-URL reads around line 30831. Payment proofs read the bucket name stored on the attachment record (`PAY.proof`, around line 12304).
- `takeoff-drawings` (Plan): `PQ_BUCKET`, drawing files for take-offs.

**Auth**
- Uses `sb.auth`: signInWithPassword, signUp, signOut, getSession, refreshSession, onAuthStateChange, resetPasswordForEmail and updateUser. The password-reset redirect is `window.location.origin + pathname`, and that URL must be listed as an Allowed Redirect URL in Supabase Auth. Realtime is not used.

## Service worker (sw.js) and releases
- It is registered at the bottom of the main script in index.html (around line 39912) with `navigator.serviceWorker.register('sw.js')` on page load.
- The cache name is the `VERSION` constant (currently `pgs-shell-v3`). On install it pre-caches the app shell (`./`, `./index.html`, `./manifest.webmanifest` and both icons) and calls `skipWaiting()`. On activate it deletes every cache whose name differs from `VERSION` and calls `clients.claim()`.
- On fetch, it skips anything on `*.supabase.co`, any `/auth` path and every non-GET request, so data is always live. Same-origin GET requests are network-first: the fresh response is stored in the cache, and the cache (then `index.html`) is used only when the user is offline. CDN libraries are not cached.
- Because of network-first, a normal deploy is picked up on the next online load. Even so, do these on **every release**:
  1. Bump `VERSION` in sw.js (e.g. `pgs-shell-v4`). This changes the bytes of sw.js, so the browser installs the new worker, and old caches are purged on activate. Also update the version note in the header comment.
  2. Bump the app version in `<title>Penguin Suite vNNN</title>` (index.html line 13) so it is easy to see which build a user is running.
  3. If you add a new same-origin file that must work offline, add it to the `SHELL` array.

## Supabase config and secrets
- Main app: `SUPABASE_URL` and `SUPABASE_KEY` are hard-coded at index.html **lines 6488-6489**, and the client is created as `sb` at line 6490.
- Embedded Planning suite: it has its own copy of the same URL and key inside the `PGS_PLAN_SRC` string on index.html **line 40519** (lines 2780-2782 of the embedded source). If you change the config, change **both** copies.
- Both copies point to the same project (`lrpwfqqnljknonermltr`). Both keys are JWTs starting `eyJhbG`, and their payload says `"role":"anon"`, so they are the public anon key, which is allowed.
- A secret scan of all tracked files and the full git history found no service_role key, no `sb_secret_` key, no database password or connection string, and no other API secret.
- Gap compared with "Front-end rules": there is **no hostname-based staging/production switch**. The config is a single hard-coded project in two places. Check with the owner which environment `lrpwfqqnljknonermltr` is before testing anything that writes data.

## index.html map (approximate line ranges)
| Lines | What |
|---|---|
| 1-18 | `<head>`: meta, manifest, title (`Penguin Suite v154`), CDN scripts |
| 19-807 | Main screen and print CSS, plus dashboard CSS (from about line 458) |
| 808-1121 | `pgs-shell-css`: v2 shell chrome (sidebar rail, `--pgs-*` vars) |
| 1122-1641 | Module CSS: HO tree, Site Areas, Daily Report, Labour masters |
| 1642-2263 | `dpr154css`: Daily Reporting Plan CSS |
| 2265-2361 | `<body>`: auth gate (login/forgot/reset) and post-print modal |
| 2362-2440 | `#app` shell: header, project switcher, tabs |
| 2441-3083 | `#mod-reports` markup (with its own `<style>` at 2442-2798) |
| 3084-3138 | `#mod-dpr` (Daily Report) host markup |
| 3139-3670 | `#mod-ho` Hire Orders markup |
| 3671-4334 | `#mod-wo` Work Orders markup |
| 4335-4591 | `#mod-masters` markup |
| 4592-4673 | `#mod-users` markup |
| 4674-5820 | `#mod-purchase` markup (MIR, RFQ, QC, PO, GRN, POB, MIS, Stock) |
| 5821-5839 | Shared modal, toast, progress bar, print container |
| 5840-6498 | Main `<script>` start: save guard, PO/HO/WO print engine, **Supabase config (6488)** |
| 6499-6800 | Constants, `PGS_PERM_MAP` (permissions), state, utilities (`esc`, formatters), progress bar, cache |
| 6800-8400 | Opening-stock upload, WBS loader, DB helpers (`dbInsert`), numbering, vendor/user admin |
| 8401-8855 | Auth (Supabase login, password reset), role helpers (`hasPerm`), tab navigation |
| 8856-10081 | Daily Report module (IIFE): engineer sheet, then manager screens (from about line 9784) |
| 10082-10736 | Reports module (`window.RPT`) |
| 10737-10897 | Deletion audit report |
| 10898-11467 | Payables dashboard (`rpc_vendor_ledger`) |
| 11468-12658 | Payments: Record Payment, approvals, holds (`window.PAY`) |
| 12659-13133 | Masters approval queue, `initApp()` (about line 13086) |
| 13134-14296 | Masters (vendor/activity edit), typeaheads, sort, number-to-words |
| 14297-16823 | Hire Orders: list/form, HO certification (15124), HO billing (15699) |
| 16824-20742 | Work Orders: UI, activity picker, WOC certification tree, WO billing |
| 20743-21406 | All Requests, payment confirmation, reject modal, print-doc builder |
| 21407-23860 | Purchase tabs, Material Master tree, cost heads, duplicate checks |
| 23861-24486 | Draft engine (save and resume) |
| 24487-26437 | MIR (indent) and its estimate picker |
| 26438-27936 | RFQ and Quote Comparison (QC) |
| 27937-32154 | Purchase Orders: estimate allocation, picker, rate history, amendments (about line 31383) |
| 32155-33851 | GRN, cash-purchase GRN, admin delete, GRN reject/revise |
| 33852-34952 | POB (GRN billing) and cash-purchase bill |
| 34953-36453 | MIS (material issue), grouped MIS |
| 36454-37140 | Stock audit, stock balance, material stock detail |
| 37141-37558 | `puRPC` save helper, generic reject, sortable tables |
| 37559-38614 | Print functions (RFQ/QC/PO/POB), contractor master, negotiation, QC print |
| 38615-39311 | Dashboard module |
| 39312-39608 | T&C rich editor, RMC opex toggle |
| 39609-40209 | v2 shell: org/project pipeline, sidebar rail, **service-worker registration (about line 39912)** |
| 40210-40508 | Users & Permissions pane |
| 40509-40588 | Planning & QS embed. **Line 40519 is a single 1.3 MB line** (`PGS_PLAN_SRC`): never print or read it whole, search inside it instead. |
| 40589-40731 | Feature flags and patches: estimate picker RPC, MIR coverage/list RPC |
| 40732-41453 | `pgs-rail-boot`: sidebar boot, Site Areas (v133), Labour masters (v146) |

Working tip: search with grep and read in slices. Skip line 40519 unless the task concerns the Planning suite.
