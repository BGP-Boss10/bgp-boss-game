# Feature Specification: Network-Quest First Playable — IPv4 Tickets and the BGP Boss

**Feature Branch**: `001-ipv4-ticket-diagnosis` (spec directory; no git branch was created,
work is on `main`)

**Created**: 2026-11-17

**Status**: Draft (clarified 2026-11-17)

**Input**: User description: "Network-Quest first playable, from StarterKit/SPEC.md: NetworkSerf,
a new Service Desk recruit, diagnoses broken-network tickets by reading IP configuration
evidence; every correct diagnosis defeats the ticket monster and moves them one step closer to
promotion. Three levels, two rounds each, one core mechanic." Clarification replaced the
DHCP-relay level with a BGP best-path level.

## Pitch

The player is **NetworkSerf**, a Service Desk recruit in the fantasy realm of **Networklandia**.
Each round presents a user's trouble ticket, shown as a "ticket monster", plus the evidence
needed to solve it. In Levels 1–2 the evidence is an `ipconfig`-style card for the affected
host (IPv4 address, subnet mask in dotted and /prefix form, default gateway), and the player
picks the diagnosis the evidence proves. In Level 3, the **BGP Boss** level, the evidence is
a table of two or three candidate BGP paths to one destination prefix, and the player picks
the path the router will select.

A correct choice defeats the monster, marks the ticket Resolved, shows the rule and values
that prove it, and enables Next. An incorrect choice leaves the monster standing and the
ticket open, explains what the choice got wrong, and names the value to look at again. After
all six tickets across three levels are resolved, NetworkSerf is promoted to Senior Network
Engineer (T4) and a session summary appears.

**Learner:** people starting out in networking (help desk staff, students, career changers)
with little or no hands-on troubleshooting experience. Assumed knowledge: recognising a
dotted-decimal IPv4 address such as 192.168.1.10. Binary is not required; the game shows each
calculation. The Level 3 briefing introduces BGP from scratch (autonomous system, prefix,
path, path attributes). Target first playthrough: 5–10 minutes, with unlimited thinking time.

## Clarifications

### Session 2026-11-17

- Q: Should players see an XP number filling toward the next rank, or only get a new rank
  title on finishing a level? → A: Rank title only; no numeric XP in v1.
- Q: How should the game treat an answer that is true but not the most specific one? → A: Not
  correct; it counts as an attempt and gets "true, but incomplete" feedback naming what was
  missed. Only the single expected answer resolves a round.
- Q: Is the first release only the IPv4 → subnets → DHCP relay thread, despite the repo name
  `bgp-boss-game`? → A: No. Replace Level 3 (DHCP relay) with a BGP level.
- Q: Which BGP problem should the Level 3 tickets ask players to diagnose? → A: Best-path
  selection: given 2–3 candidate paths to one prefix, pick the path the router selects.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Make and understand a decision (Priority: P1)

As a learner, I read a ticket and its evidence, commit to one answer, and immediately learn
why my choice was right or wrong, so I can correct my thinking and retry.

**Why this priority**: This is the core learning loop (Constitution II). Without it there is
no game; with only this story, a single round already teaches something.

**Independent Test**: Start a fresh session, read the first briefing, play Level 1 Round 1
with one wrong and then one correct submission, and confirm the feedback and completion
state at each step.

**Acceptance Scenarios**:

1. **Given** a fresh session, **When** the player starts, **Then** the first briefing is shown
   before any challenge can be answered.
2. **Given** Level 1, Round 1 (host 169.254.33.7, mask 255.255.0.0 /16, no gateway), **When**
   the player submits "No DHCP lease", **Then** the ticket monster is defeated, the round is
   marked Resolved, Next is enabled, and an explanation states that 169.254.0.0/16 is a
   self-assigned address, not a lease.
3. **Given** the same round, **When** the player submits "Host IP settings are valid",
   **Then** feedback names the misconception that having any IP address means DHCP worked,
   the round stays unresolved, the attempt count increases by one, and the player can retry.
4. **Given** Level 3, Round 1 (Path A: local preference 100, AS path length 2; Path B: local
   preference 200, AS path length 3; equal weight), **When** the player submits Path A,
   **Then** feedback explains that local preference is compared before AS-path length and
   that 200 beats 100, and the round stays unresolved.
5. **Given** any round, **When** the player submits with nothing selected (or with malformed
   input), **Then** input guidance appears and neither attempts nor completion change.

---

### User Story 2 - Get help, track progress, and finish the game (Priority: P1)

As a learner, I can get help when I am stuck, see an honest record of my progress, move
through all three levels, and reach a summary of how I did.

**Why this priority**: Progression and help turn one round into a complete session and keep
progress honest (Constitution III). It is needed for the release, but builds on Story 1.

**Independent Test**: Play the full six-round session using a hint on one round and a worked
solution on another, double-submit after a correct answer, then restart; confirm the counters
and summary at each step.

**Acceptance Scenarios**:

1. **Given** an unresolved round, **When** the player asks for a hint, **Then** the first hint
   explains the method; **When** they ask for more help, **Then** a worked solution can be
   shown. Each use is recorded as assistance, and neither marks the round complete.
2. **Given** an unresolved round, **When** the player makes valid submissions, **Then** each
   one counts as exactly one attempt until the round is solved.
3. **Given** a round that is already Resolved, **When** the player submits again (including a
   rapid repeated Submit), **Then** nothing changes: no extra attempt, completion, or
   promotion is recorded.
4. **Given** both rounds of a level are Resolved, **When** the player chooses Next, **Then**
   the level completes, the player's rank title changes to the next rank, and the next
   level's briefing opens; after the final round, Next opens the session summary.
5. **Given** the session summary, **Then** it shows, for each level, rounds completed, valid
   attempts, and assistance used, as separate figures.
6. **Given** a session in progress, **When** the player chooses Restart, **Then** a
   confirmation is requested; confirming clears the session and returns to the first
   briefing, and cancelling leaves the session unchanged.

---

### User Story 3 - Play entirely with accessible controls (Priority: P1)

As a keyboard or assistive-technology user, I can inspect the challenge, choose, submit, get
help, advance, and restart without a mouse, and I receive feedback in text.

**Why this priority**: Accessibility is part of the core game (Constitution IV), not polish.
It is required for release and applies across Stories 1 and 2.

**Independent Test**: Complete the full session using only the keyboard, in a narrow browser
window, with the reduced-motion preference turned on.

**Acceptance Scenarios**:

1. **Given** any screen, **When** the player navigates by keyboard, **Then** every core control
   (answer choices, Submit, Hint, Next, Restart and its confirmation) is reachable in a
   logical order, has a visible focus indicator, and has an accessible name.
2. **Given** a submission, **When** feedback appears, **Then** correct/incorrect is conveyed in
   text (not colour alone), stays on screen to be read, and is announced to assistive
   technology.
3. **Given** the reduced-motion preference is on, **When** a round is answered, **Then** no
   information is lost and feedback and controls are available without waiting for
   animation.
4. **Given** a narrow browser window, **Then** the evidence (including the Level 3 path
   table), the answer choices, and the action buttons remain usable; dense technical data may
   scroll within its own labelled area without hiding the actions.

---

### Edge Cases

- **Most-specific / single expected answer:** exactly one choice resolves each round. A choice
  that is partly right (for example, the path that would win on a later attribute) does not
  resolve the round, counts as one attempt, and gets feedback naming the step where it lost.
- **Subnet boundaries:** host 192.168.1.126/25 with gateway 192.168.1.1 is valid (last usable
  host of 192.168.1.0/25); host 192.168.1.129/25 with gateway 192.168.1.1 is off-subnet (first
  usable host of 192.168.1.128/25).
- **BGP attribute order:** a higher weight wins even against a higher local preference and a
  shorter AS path; MED is compared only when every earlier attribute ties **and** the
  remaining paths come from the same neighbouring AS.
- **Unsupported content (Levels 1–2):** a non-contiguous mask (e.g. 255.255.0.255), a mask
  outside /8–/30, a host address that is the network or broadcast address of its subnet, or a
  non-169.254 host with no gateway.
- **Unsupported content (Level 3):** fewer than two or more than three paths; a path missing any
  modelled attribute; paths that tie on every modelled attribute; or a decision that would
  reach MED while the remaining paths come from different neighbouring ASes.
- Any unsupported content shows a visible content error. The round cannot be graded and no
  progress changes.
- **Repeated Submit** after success, or rapid double activation of Submit, records nothing
  extra.
- **Hint after success**: help stays available but is not recorded as assistance for an
  already Resolved round.
- **Reload** mid-session starts a fresh session (no saved progress in this version).
- **Restart cancelled** leaves every counter and the current position unchanged.

## Requirements *(mandatory)*

### Functional Requirements

**Briefing and challenge**

- **FR-001**: The game MUST show each level's briefing before its first round. The briefing
  introduces the concept and its terms, gives a worked example different from the rounds,
  states the simplifications that apply, and cites its sources.
- **FR-002**: Levels 1–2 rounds MUST show the ticket text, the host's IPv4 address, the subnet
  mask in both dotted and /prefix form, and the default gateway (or "none"). Level 3 rounds
  MUST show the ticket text, the destination prefix, and for each candidate path: its label,
  next hop, weight, local preference, AS path (with its length), origin (IGP, EGP, or
  incomplete), and MED, in a table with a text equivalent.
- **FR-003**: The player MUST explicitly submit exactly one selection from the level's choice
  set:
  - **Levels 1–2:** three diagnoses — "No DHCP lease: the host self-assigned a 169.254.x.x
    address" (`no-lease`); "Default gateway is outside the host's subnet"
    (`gateway-off-subnet`); "Host IP settings are valid; escalate to the next check"
    (`config-valid`).
  - **Level 3:** the round's candidate paths (e.g. "Path A via ISP-A (198.51.100.1)").
- **FR-004**: Decision-relevant values MUST be visible without hover-only interactions.

**Grading rules**

- **FR-005**: Levels 1–2 MUST be graded with this ordered rule, accepting only the first
  diagnosis that matches:
  1. Validate the round's content; if invalid, show a content error and do not grade.
  2. If the host address is in 169.254.0.0/16 → `no-lease`.
  3. Else, if the host's network (address AND mask) differs from the gateway's network
     (gateway AND mask) → `gateway-off-subnet`.
  4. Else → `config-valid`.
- **FR-006**: Level 3 MUST be graded with this ordered best-path rule. Starting from all
  candidate paths, compare one attribute at a time and keep only the paths with the best
  value; the first step that leaves a single path decides the winner:
  1. Validate the round's content; if invalid, show a content error and do not grade.
  2. Highest weight.
  3. Highest local preference.
  4. Shortest AS path (count of AS numbers).
  5. Lowest origin, in the order IGP < EGP < incomplete.
  6. Lowest MED — only if all remaining paths share the same neighbouring AS (first AS in
     the path); otherwise the content is unsupported.
  7. If more than one path remains, the content is unsupported.
- **FR-007**: A correct submission MUST defeat the ticket monster, mark the round Resolved,
  enable Next, and explain the rule and the specific values that prove the answer. For subnet
  rounds: both computed network addresses and the host's range. For Level 3: the attributes
  that tied, the deciding attribute, and each remaining path's value at that step.
- **FR-008**: An incorrect submission MUST leave the round unresolved and retryable, explain
  what the choice got wrong about this evidence, and name the value to re-examine. For
  Level 3 it MUST name the step at which the chosen path was eliminated and the winning value
  at that step. Feedback MUST agree with the grading rule's reasoning.
- **FR-009**: Submitting with nothing selected or malformed input MUST show input guidance and
  MUST NOT count as an attempt.

**Help, progress, and session**

- **FR-010**: Each round MUST provide ordered help: first a hint that explains the method,
  then a worked solution. Using either MUST be recorded as assistance for that round and MUST
  NOT complete it.
- **FR-011**: Each valid submission on an unresolved round MUST count as exactly one attempt.
  A round MUST complete at most once; submissions after completion MUST change nothing.
- **FR-012**: A level MUST complete when both of its rounds are Resolved, promoting the player
  to the level's reward rank: Level 1 Service Desk (T1) → NOC Engineer (T2); Level 2 → Network
  Engineer (T3); Level 3 → Senior Network Engineer (T4). Promotion is shown as the new rank
  title only; there is no numeric XP or progress-to-next-rank bar.
- **FR-013**: Play MUST be sequential on the first playthrough: Next opens the following round
  or level; after the final round it opens the session summary.
- **FR-014**: The game MUST always show the current rank, the round position ("Round x of 2"),
  and the attempts and hints used in the current round.
- **FR-015**: The session summary MUST show rounds completed, valid attempts, and assistance
  used per level as separate figures, and MUST NOT present completion as proof of independent
  mastery.
- **FR-016**: Restart MUST ask for confirmation; confirming clears all progress and returns to
  the first briefing; cancelling preserves the session.
- **FR-017**: Progress MUST last only for the current page session; reloading starts afresh.
- **FR-018**: The game MUST NOT include lives, timers, countdowns, speed bonuses, points or XP,
  leaderboards, or streaks, and hints and retries MUST carry no penalty.

**Content and correctness**

- **FR-019**: Levels, rounds, ticket text, evidence values, hints, briefings, and source
  references MUST be editable as content separately from the grading rules, and adding a
  round that uses an existing rule MUST NOT require changing that rule.
- **FR-020**: Content MUST be validated before a round is presented; invalid content (see Edge
  Cases) MUST produce a visible content error and MUST NOT be graded or affect progress.
- **FR-021**: Every networking claim in briefings and explanations MUST cite an authoritative
  source with section (see Sources).

**Accessibility and presentation**

- **FR-022**: All core actions MUST be operable by keyboard with visible focus, accessible
  names, and logical order.
- **FR-023**: Feedback MUST be conveyed in text as well as colour, remain readable on screen,
  and be announced to assistive technology.
- **FR-024**: The game MUST respect the reduced-motion preference, and animation MUST NOT delay
  feedback or controls.
- **FR-025**: Every essential diagram (address ruler, path comparison) MUST have a text
  equivalent.
- **FR-026**: The game MUST remain usable on a typical laptop screen and in a narrow window.
- **FR-027**: After a Level 2 submission, the host and gateway MUST be placed on an address
  ruler showing the subnet's range, with matching text (e.g. "Gateway 192.168.1.1 is outside
  192.168.1.128–192.168.1.255"). After a Level 3 submission, the attribute checks MUST be shown
  in order, marking the step at which each path dropped out.

**Runtime**

- **FR-028**: The game MUST be playable without an account, server-side service, live device
  connection, AI model, or API key; no external service may decide an answer.

### Version-One Content

Three levels, two rounds each, six rounds total, all using the same mechanic: read the
evidence, pick one answer, submit, and get an explanation.

| Level | Rank played | Phase / outcome | Concept | Misconceptions exposed |
| --- | --- | --- | --- | --- |
| 1 | Service Desk (T1) | Foundation / LO1 | A 169.254.x.x self-assigned address versus a real DHCP lease | "It has an IP address, so DHCP worked"; "an unfamiliar address like 10.20.30.44 means something is broken" |
| 2 | NOC Engineer (T2) | Application / LO2 | Using the mask to check the gateway is inside the host's subnet | "Same first three octets means same subnet"; "a different third octet means a different subnet" |
| 3 | Network Engineer (T3) — the BGP Boss | Transfer / LO3 | BGP best-path selection: attributes are compared in a fixed order and the first difference decides | "The shortest AS path always wins"; "the lowest MED always wins" |

**Learning outcomes:**

- **LO1**: Identify whether a host's IPv4 address came from a DHCP lease or was self-assigned
  (169.254.0.0/16).
- **LO2**: Compare a host's and gateway's network addresses using the mask to decide whether
  the gateway is in the host's subnet.
- **LO3**: Predict which of several BGP paths a router selects by comparing weight, local
  preference, AS-path length, origin, and MED in order, and name the attribute that decides.

### Reference Cases

Expected results are recorded independently of any implementation (Constitution I). All
Level 3 rounds use destination prefix 203.0.113.0/24 (documentation range), private AS numbers,
and documentation next hops.

| Case | Evidence | Player submits | Expected result | Source |
| --- | --- | --- | --- | --- |
| L1R1 correct | Host 169.254.33.7/16, no gateway | No DHCP lease | Resolved; 169.254.0.0/16 is self-assigned | RFC 3927 §2.1 |
| L1R1 mistake | As above | Host IP settings are valid | Not resolved; attempt +1; "Having an address isn't the same as having a lease. 169.254.x.x is what a host gives itself when DHCP doesn't answer." | — |
| L1R2 correct | Host 10.20.30.44/24, gateway 10.20.30.1 | Host IP settings are valid | Resolved; 10.x is a private range a DHCP server may assign; both in 10.20.30.0/24 | RFC 1918 §3; RFC 1122 §3.3.1.1 |
| L1R2 mistake | As above | No DHCP lease | Not resolved; "Only 169.254.x.x means self-assigned. 10.20.30.44 is a normal private address from DHCP." | — |
| L2R1 correct | Host 192.168.1.130/25, gateway 192.168.1.1 | Gateway outside subnet | Resolved; host network 192.168.1.128, gateway network 192.168.1.0 | RFC 1122 §3.3.1.1; RFC 4632 §3.1 |
| L2R1 mistake | As above | Host IP settings are valid | Not resolved; "Matching the first three octets proves the same subnet only when the mask is /24, and this mask is /25. AND the last octet of the host (130) and gateway (1) with 128, then compare." | — |
| L2R2 correct | Host 172.16.4.200/22 (255.255.252.0), gateway 172.16.5.1 | Host IP settings are valid | Resolved; both AND to 172.16.4.0 (range 172.16.4.0–172.16.7.255) | RFC 4632 §3.1 |
| L2R2 mistake | As above | Gateway outside subnet | Not resolved; "With /22, the third octet is part of the host range. 4 AND 252 = 4 and 5 AND 252 = 4, so both are in the same network." | — |
| L3R1 correct | Path A via ISP-A (198.51.100.1): weight 0, local pref 100, AS path 64501 64510 (2), IGP, MED 0. Path B via ISP-B (198.51.100.5): weight 0, local pref 200, AS path 64502 64520 64510 (3), IGP, MED 0 | Path B | Resolved; weights tie at 0; local preference 200 beats 100, so B wins before AS-path length is compared | RFC 4271 §5.1.5, §9.1.1; Cisco best-path doc |
| L3R1 mistake | As above | Path A | Not resolved; "A has the shorter AS path, but AS-path length is only checked after local preference. B's local preference is 200 versus A's 100, so B wins at that step." | — |
| L3R2 correct | Path A (198.51.100.1): weight 0, local pref 100, AS path 64501 64510 (2), incomplete, MED 10. Path B (198.51.100.9): weight 0, local pref 100, AS path 64501 64510 (2), IGP, MED 50. Path C (198.51.100.5): weight 0, local pref 100, AS path 64502 64530 64510 (3), IGP, MED 0 | Path B | Resolved; weight and local pref tie; C drops out on AS-path length (3 vs 2); B beats A on origin (IGP before incomplete); MED is never reached | RFC 4271 §9.1.2.2 (a, b) |
| L3R2 mistake | As above | Path C | Not resolved; "C has the lowest MED, but it drops out earlier: its AS path is 3 long versus 2 for A and B. MED is only compared if everything before it ties." | — |
| L3R2 mistake | As above | Path A | Not resolved; "A beats B on MED, but origin is compared first: B's origin is IGP and A's is incomplete, so B wins before MED is reached." | — |
| Boundary | Host 192.168.1.126/25, gateway 192.168.1.1 | Host IP settings are valid | Resolved; both in 192.168.1.0/25 | RFC 4632 §3.1 |
| Boundary | Host 192.168.1.129/25, gateway 192.168.1.1 | Gateway outside subnet | Resolved; host in 192.168.1.128/25, gateway in 192.168.1.0/25 | RFC 4632 §3.1 |
| Boundary | Path A: weight 0, local pref 300, AS path length 1. Path B: weight 200, local pref 100, AS path length 3. Origin and MED equal | Path B | Resolved; weight is compared first and 200 beats 0 | Cisco best-path doc |
| Boundary | Path A: AS path 64501 64600, MED 50. Path B: AS path 64501 64700, MED 10. Weight, local pref, origin equal | Path B | Resolved; same neighbouring AS (64501), so MED is compared and lower wins | RFC 4271 §9.1.2.2 (c) |
| Unsupported | Mask 255.255.0.255; host 192.168.1.128/25; non-169.254 host with no gateway; Level 3 paths tying on every attribute; Level 3 decision reaching MED across different neighbouring ASes | Open round | Visible content error; no grading or progress | — |

**Worked interaction (Level 2, Round 1, "The Half-Wall Goblin"):** the ticket reads *"I can
print to the printer next to me, but nothing else works."* The player submits "Host IP settings
are valid"; the goblin shrugs off the hit, attempts reads 1, and the feedback above appears.
The player then submits "Default gateway is outside the host's subnet"; the goblin is
defeated, the ticket is Resolved, and the address ruler shows the host inside
192.168.1.128–192.168.1.255 with the gateway outside, in 192.168.1.0–192.168.1.127. Feedback:
*"Correct. 130 AND 128 = 128, so the host is in 192.168.1.128/25. 1 AND 128 = 0, so the gateway
is in 192.168.1.0/25. The printer works because it shares the host's subnet. Fix: use a gateway
in .129–.254, or correct the mask."*

### Sources

- RFC 3927 §2.1 — a host without a configured address selects a link-local address from
  169.254.0.0/16.
- RFC 1122 §3.3.1.1 — a host decides whether a destination is local by comparing network
  numbers under its mask; the gateway must be on a directly connected network.
- RFC 4632 §3.1 — prefix/mask notation and how the network portion is determined.
- RFC 1918 §3 — 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 are private ranges.
- RFC 4271 §5.1.1, §5.1.2, §5.1.4, §5.1.5 — the ORIGIN, AS_PATH, MULTI_EXIT_DISC, and
  LOCAL_PREF attributes; higher LOCAL_PREF is preferred.
- RFC 4271 §9.1.1 and §9.1.2.2 — degree of preference (LOCAL_PREF) and tie-breaking: shorter
  AS_PATH, then lower ORIGIN, then lower MED among routes from the same neighbouring AS.
- Cisco, "BGP Best Path Selection Algorithm" (Cisco IOS) — weight is a Cisco-specific, local
  attribute compared before local preference; higher weight wins.
- RFC 5737 §3 and RFC 6996 §5 — documentation IPv4 ranges and private AS numbers used in
  Level 3 examples.

### Key Entities

- **Session**: one playthrough; current level and round, current rank title, and per-round
  records. Lives only for the page session.
- **Level**: ID, title, rank played and rank awarded, learning phase and outcome, grading rule
  (host-configuration or best-path), briefing (text, worked example, sources), and exactly two
  ordered rounds.
- **Round**: ID, monster name, ticket text, ordered hints, and evidence: for Levels 1–2, host
  address, mask, and gateway (or none); for Level 3, a destination prefix and two or three
  candidate paths.
- **Candidate path** (Level 3): label, next hop, weight, local preference, AS path (ordered AS
  numbers), origin (IGP / EGP / incomplete), MED.
- **Choice**: a stable ID and an exact player-facing label (a diagnosis in Levels 1–2, a path in
  Level 3).
- **Evaluation result**: the expected choice, whether the submission is correct, why a wrong
  choice is wrong (including the elimination step in Level 3), and the computed values used as
  evidence.
- **Round record**: valid attempts, assistance used, and Resolved state.
- **Source**: title, link, section, and the claim it supports.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the reference cases (correct, mistake, boundary, unsupported) produce
  exactly the expected result.
- **SC-002**: A first-time learner can complete all six rounds in 10 minutes or less, with
  unlimited thinking time per round.
- **SC-003**: A teammate completes the full session from first briefing to summary using only
  the keyboard, with no step requiring a mouse.
- **SC-004**: For every incorrect choice in every shipped round, a teammate can state, from the
  feedback alone, what was wrong and which value to re-check.
- **SC-005**: Repeated Submit after success, hint use, and Restart (confirm and cancel) leave
  the counters exactly as the requirements specify in 100% of checks.
- **SC-006**: All six rounds, their briefings, and their explanations are reviewed against the
  cited sources, with zero unresolved technical errors at release.
- **SC-007**: A clean browser session can play the full game with no network access beyond
  loading the game itself, and no account or key.
- **SC-008**: A trial seventh round can be added to any level through content alone, without
  changing that level's grading rule, and is graded correctly.

## Assumptions

- **Scope:** the first release has three levels: IPv4 lease (L1), gateway subnet (L2), and BGP
  best-path selection (L3, the BGP Boss), confirmed 2026-11-17. DHCP relay, Wi-Fi, DNS, and
  traffic engineering are later levels.
- **Progression rewards:** promotion to a rank title on level completion, with no numeric XP
  (confirmed 2026-11-17). The purpose statement's "XP" is represented by rank promotion in v1.
- **Single expected answer:** exactly one choice is correct per round; "true but incomplete"
  answers are not accepted (confirmed 2026-11-17).
- **Levels 1–2 choice set:** with DHCP relay removed, the `no-relay` diagnosis is dropped
  because no Level 1–2 evidence could ever prove it; Levels 1–2 offer three diagnoses.
- **Learning sequence:** Foundation → Application → Transfer maps to Levels 1 → 2 → 3. Level 3
  is the transfer level because it applies the same evidence-then-rule habit to a new domain
  and both of its rounds are built so the obvious answer is wrong.
- **IPv4 model (Levels 1–2):** IPv4 only; a Windows-style `ipconfig` view of a DHCP client. The
  host's link is up; the values shown are accurate and complete; masks are contiguous, /8 to
  /30.
- **BGP model (Level 3):** a single Cisco IOS-style router choosing among 2–3 valid, usable
  paths to one prefix, none locally originated. Only weight, local preference, AS-path length,
  origin, and MED (same neighbouring AS only) are compared; rounds are authored so one of these
  decides.
- **Excluded behaviour:** the DHCP message exchange and timers, DHCP relay, IPv6, DNS, Wi-Fi,
  ARP, routing beyond the default gateway, /31 and /32; in BGP: neighbour establishment, next-hop
  reachability, locally originated routes, eBGP-vs-iBGP and later tie-breakers (IGP metric,
  path age, router ID, neighbour address), multipath, always-compare-MED and deterministic-MED,
  AS_SET and confederations, communities, and route-policy configuration. Briefings tell the
  learner about these boundaries in plain language.
- **Non-goals:** accounts, multiplayer, backend, live infrastructure, runtime AI, leaderboards,
  level editor, saved progress across reloads.
- **Originality:** characters (NetworkSerf, ticket monsters, the BGP Boss), the realm of
  Networklandia, and all art and text are original to this project.
- **Build budget:** a 60-minute workshop build block, per the constitution. Level 3 adds a
  second grading rule, so it is the first content to cut if time runs short (Constitution VII).
- **Source check:** every cited section, especially the Cisco best-path document, is verified
  against the source text before release (Constitution I).
- **Release evidence:** every acceptance scenario has a recorded result, and the README
  describes the implemented behaviour, exact run/test commands, and remaining limits.
