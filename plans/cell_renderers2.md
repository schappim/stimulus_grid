reat question — FSM/tradies has a really distinct vocabulary, and a lot of it is
  Australia-state-specific (NSW Fair Trading ≠ QBCC ≠ VBA). Here's the gap analysis.

  Top of mind — what every AU tradie SaaS needs

  ┌────────────────┬────────────────────────────────────────────────────────────────────┐
  │    Missing     │                           Why it matters                           │
  ├────────────────┼────────────────────────────────────────────────────────────────────┤
  │ trade-licence  │ NSW LIC, QBCC, VBA, SA CBS all have different formats. Show        │
  │                │ licence #, trade class, state badge, expiry-warning colour         │
  ├────────────────┼────────────────────────────────────────────────────────────────────┤
  │ job-status     │ The workflow pill: Quoted → Scheduled → Dispatched → On-site →     │
  │                │ Completed → Invoiced → Paid (plus On-hold, Cancelled, No-show)     │
  ├────────────────┼────────────────────────────────────────────────────────────────────┤
  │ arrival-window │ Customer-promised slot: 8–10am Tue 27 May with countdown / overdue │
  │                │  colour                                                            │
  ├────────────────┼────────────────────────────────────────────────────────────────────┤
  │ swms-status    │ Safe Work Method Statement: Required ✓ / Signed / Expired /        │
  │                │ Missing                                                            │
  ├────────────────┼────────────────────────────────────────────────────────────────────┤
  │ rego-plate     │ AU number plate with state-coloured background (NSW yellow/black,  │
  │                │ VIC blue/white, QLD maroon/white, etc.)                            │
  └────────────────┴────────────────────────────────────────────────────────────────────┘

  AU compliance / licences (genuinely state-specific)

  ┌───────────────────┬─────────────────────────────────────────────────────────────────┐
  │      Missing      │                              Notes                              │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ trade-licence     │ Generic AU contractor licence with state + class + expiry       │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ white-card        │ Construction Induction Card (CIC) — required on every site      │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ blue-card / wwcc  │ Working With Children — QLD Blue Card, NSW WWCC, VIC WWCC have  │
  │                   │ different formats                                               │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ high-risk-licence │ HRWL class codes (SI scaffolding intermediate, WP working       │
  │                     │ platform, DG dogging, RB rigging basic…)                      │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ coes                │ VIC Certificate of Electrical Safety                          │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ coc                 │ Electrical Certificate of Compliance (NSW/SA/WA all slightly  │
  │                     │ different)                                                    │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ qbcc-licence        │ QLD Building & Construction Commission licence with class     │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ vba-licence         │ Victorian Building Authority                                  │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ gas-certificate     │ Type A / Type B gas work certificate                          │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ asbestos-licence    │ Class A / Class B asbestos removal                            │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ refrigerant-licence │ ARC RHL (refrigeration handling)                              │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ pool-safety-cert    │ QLD Form 23 pool safety inspector                             │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ test-and-tag        │ Last tested + next-due date (electrical equipment)            │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ insurance-cert      │ Public liability / PI / Workers Comp — insurer + policy # +   │
  │                     │ expiry                                                        │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ gst-status          │ GST registered / not / pending — pairs with the existing abn  │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ abn-status          │ ABN with live ABR lookup status (active / cancelled /         │
  │                     │ suspended)                                                    │
  ├─────────────────────┼───────────────────────────────────────────────────────────────┤
  │ hbcf-cert           │ NSW Home Building Compensation Fund cert (any reno > $20k)    │
  └─────────────────────┴───────────────────────────────────────────────────────────────┘

  ▎ ⚠️ Our existing abn / acn / tfn / medicare / bsb are format renderers — none of them
  ▎ carry compliance state. The above add the status / expiry layer that FSM needs.

  Jobs & dispatch

  ┌─────────────────┬─────────────────────────────────────────────────────┐
  │     Missing     │                        Notes                        │
  ├─────────────────┼─────────────────────────────────────────────────────┤
  │ job-status      │ Workflow pill (above)                               │
  ├─────────────────┼─────────────────────────────────────────────────────┤
  │ arrival-window  │ Promised time window with overdue countdown         │
  ├─────────────────┼─────────────────────────────────────────────────────┤
  │ route-stop      │ Stop 3 of 7 with mini-map / ordering                │
  ├─────────────────┼─────────────────────────────────────────────────────┤
  │ travel-time     │ ETA from previous job (drive-time + traffic colour) │
  ├─────────────────┼─────────────────────────────────────────────────────┤
  │ technician-slot │ Colour-coded calendar slot in a roster grid         │
  ├─────────────────┼─────────────────────────────────────────────────────┤
  │ progress-claim  │ Milestone claim — Claim 2/5 · 40% complete          │
  ├─────────────────┼─────────────────────────────────────────────────────┤
  │ variation       │ Variation order with $ delta and approval status    │
  ├─────────────────┼───────────────────────────────────────────────────────────────────┤
  │ defect / snag   │ Snag item with severity (Critical / Major / Minor)                │
  ├─────────────────┼───────────────────────────────────────────────────────────────────┤
  │ signature       │ Customer sign-off image preview                                   │
  ├─────────────────┼───────────────────────────────────────────────────────────────────┤
  │ job-photo       │ Photo thumb with Before / During / After badge                    │
  ├─────────────────┼───────────────────────────────────────────────────────────────────┤
  │ callout-fee     │ Service call indicator                                            │
  ├─────────────────┼───────────────────────────────────────────────────────────────────┤
  │ payment-terms   │ Net 7 / 14 / 30 / EOM with overdue warning                        │
  ├─────────────────┼───────────────────────────────────────────────────────────────────┤
  │ invoice-status  │ Draft / Sent / Viewed / Overdue / Paid / Disputed                 │
  ├─────────────────┼───────────────────────────────────────────────────────────────────┤
  │ retention       │ Retention $ with release-date countdown                           │
  ├─────────────────┼───────────────────────────────────────────────────────────────────┤
  │ materials-pick  │ Pick-list line with stock status (In stock / Backorder / Special  │
  │                 │ order)                                                            │
  └─────────────────┴───────────────────────────────────────────────────────────────────┘

  Safety / WHS

  ┌───────────────────┬─────────────────────────────────────────────────────────────────┐
  │      Missing      │                              Notes                              │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ swms-status       │ Above                                                           │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ jsa-status        │ Job Safety Analysis state                                       │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ toolbox-talk      │ Last attended date with overdue warning                         │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ ppe-checklist     │ Inline icons for required PPE (hard-hat, hi-vis, gloves, boots, │
  │                   │  glasses, hearing)                                              │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ incident-severity │ Near-miss / First-aid / MTI / LTI / Fatality                    │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ hazard-rating     │ Risk-matrix score (Likelihood × Consequence → 5×5 grid colour)  │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ site-induction    │ Inducted-for-site status + expiry                               │
  └───────────────────┴─────────────────────────────────────────────────────────────────┘

  People / Trades

  ┌───────────────────┬─────────────────────────────────────────────────────────────────┐
  │      Missing      │                              Notes                              │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ trade-type        │ Electrician / Plumber / Carpenter / HVAC / Tiler / Painter /    │
  │                   │ Roofer / Glazier — icon + label                                 │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ skill-endorsement │ Specific competencies with cert expiry (e.g. "Solar PV install  │
  │                   │ — exp 11/2027")                                                 │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ subcontractor     │ Composite: ABN + insurance + licence status as one pill         │
  ├───────────────────┼─────────────────────────────────────────────────────────────────┤
  │ crew              │ Team/leading-hand with avatar stack and trade-mix               │
  └───────────────────┴─────────────────────────────────────────────────────────────────┘

  Fleet / Vehicle

  ┌─────────────┬─────────────────────────────────────────────────────────┐
  │   Missing   │                          Notes                          │
  ├─────────────┼─────────────────────────────────────────────────────────┤
  │ rego-plate  │ Above                                                   │
  ├─────────────┼─────────────────────────────────────────────────────────┤
  │ rego-status │ Rego valid / expires soon / expired (huge for dispatch) │
  ├─────────────┼─────────────────────────────────────────────────────────┤
  │ ctp-status  │ Green slip currency                                     │
  ├─────────────┼─────────────────────────────────────────────────────────┤
  │ service-due │ km / date — whichever comes first                       │
  ├─────────────┼─────────────────────────────────────────────────────────┤
  │ fuel-card   │ Fuel-card # with provider logo                          │
  ├─────────────┼─────────────────────────────────────────────────────────┤
  │ odometer    │ km reading                                              │
  └─────────────┴─────────────────────────────────────────────────────────┘

  Customer / Property (AU conventions)

  ┌────────────────────┬────────────────────────────────────────────────────────────────┐
  │      Missing       │                             Notes                              │
  ├────────────────────┼────────────────────────────────────────────────────────────────┤
  │ customer-type      │ Residential / Commercial / Strata / Real Estate / Insurance /  │
  │                    │ Builder                                                        │
  ├────────────────────┼────────────────────────────────────────────────────────────────┤
  │ strata-plan        │ SP 12345 strata identifier                                     │
  ├────────────────────┼────────────────────────────────────────────────────────────────┤
  │ lot-plan           │ Lot 12 DP 456789 property identifier (cadastral)               │
  ├────────────────────┼────────────────────────────────────────────────────────────────┤
  │ council-lga        │ Local Government Area badge                                    │
  ├────────────────────┼────────────────────────────────────────────────────────────────┤
  │ region-classifier  │ Metro / Regional / Remote (drives travel rates)                │
  ├────────────────────┼────────────────────────────────────────────────────────────────┤
  │ suburb-postcode-au │ BONDI NSW 2026 formatted (we have address-au but not the       │
  │                    │ suburb-line alone)                                             │
  └────────────────────┴────────────────────────────────────────────────────────────────┘

