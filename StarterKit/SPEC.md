# Network-Quest · First playable specification

## The pitch

**NetworkSerf, a new Service Desk recruit, diagnoses broken-network tickets by reading IP configuration evidence, and every correct diagnosis defeats the ticket monster and moves them one step closer to promotion.**

The player is NetworkSerf (Service Desk) in Networklandia (Fantasy Europe). Each round shows an ipconfig card for the affected host (IPv4 address, subnet mask in dotted and /prefix form, default gateway) and, in Level 3, a small VLAN/DHCP topology panel, and asks the player to pick which one of four diagnoses the evidence proves and submit it. A correct decision defeats the ticket monster, marks the ticket "Resolved", shows the rule and values that prove the diagnosis, and enables Next; an incorrect decision leaves the monster standing and the ticket open, explains what the chosen diagnosis got wrong about the evidence, and names the value to look at again. The session ends when all six tickets across the three levels are resolved, NetworkSerf is promoted to Senior Network Engineer (T4), and the session summary appears.

## Who this is for

- **Learner:** people starting out in networking (help desk staff, students, career changers) with little or no hands-on troubleshooting experience.
- **Assumed knowledge:** none beyond recognising a dotted-decimal IPv4 address such as 192.168.1.10. Binary is not required; the game shows each calculation.
- **What the briefing teaches:** what an IPv4 address, subnet mask (dotted and /prefix), and default gateway are; how to read the ipconfig card; that DHCP hands out leases and that a 169.254.x.x address means the host gave up and assigned itself one; how to find a network address by ANDing an address with its mask; that DHCP requests are broadcasts routers don't forward unless a relay (`ip helper-address`) is configured; and what each of the four diagnoses means.
- **Why interaction helps:** learners believe "the first three octets match, so it's the same subnet" and "it has an IP address, so DHCP worked." Committing to a diagnosis and seeing the host and gateway land in different subnets on the address ruler makes both misconceptions visible.
- **Session target:** 5–10 minutes for a first playthrough, with unlimited thinking time.

## Learning outcomes and evidence

Use observable verbs such as identify, calculate, order, compare, or diagnose. Replace the rows with your topic's skills.

| ID | After playing, the learner can… | The game asks them to… | Evidence of success |
| --- | --- | --- | --- |
| LO1 | Identify whether a host's IPv4 address came from a DHCP lease or was self-assigned (169.254.0.0/16) | Read an ipconfig card and choose between "No DHCP lease" and "Host IP settings are valid" (among the four diagnoses) | Both Level 1 rounds resolved with the evaluator's diagnosis; attempts and assistance recorded separately |
| LO2 | Compare a host's and gateway's network addresses using the mask to decide whether the gateway is in the host's subnet | Calculate (or reason out) both network addresses for a /25 and a /22 case and choose the diagnosis | Both Level 2 rounds resolved: the /25 case diagnosed as gateway off-subnet and the /22 case as valid |
| LO3 | Diagnose why a client gets no lease even though the DHCP server is healthy, recognising that a relay is needed only when the server is on another subnet/VLAN | Read the topology panel (client VLAN, server VLAN, relay setting) and choose between "No DHCP relay" and "No DHCP lease" | Both Level 3 rounds resolved: the remote-server case diagnosed as no relay and the local-server case as no lease |

## The technical model

- **Rule being taught:** the evaluator applies these checks in order and returns the first that matches. It returns one of four diagnoses:
  1. **Validate** the round data (see Unsupported content). If it is invalid, show a content error and do not grade.
  2. **If the host address is in 169.254.0.0/16** (self-assigned link-local), the host has no DHCP lease. If the topology panel shows that the DHCP server is on a different VLAN from the client **and** the client VLAN's gateway interface has no relay configured → **`no-relay`** ("No DHCP relay: the client VLAN has no DHCP server and no relay"). Otherwise → **`no-lease`** ("No DHCP lease: the host self-assigned a 169.254.x.x address").
  3. **Else, if** (host address AND mask) ≠ (gateway address AND mask) → **`gateway-off-subnet`** ("Default gateway is outside the host's subnet").
  4. **Else** → **`config-valid`** ("Host IP settings are valid; escalate to the next check").

  **Accepting answers:** exactly one diagnosis is correct per round, namely the **most specific diagnosis the evidence proves**. In a `no-relay` round, "No DHCP lease" is true but incomplete. It does not complete the round, and its feedback says so and points to the relay setting.
- **Context:** IPv4 only. A Windows-style ipconfig view of a DHCP client on a Cisco IOS-style campus network, where each VLAN has one gateway interface (SVI) and DHCP relay is modelled as `ip helper-address` on that SVI. Concepts are drawn from the CCNA blueprint.
- **Assumptions:** the host's link is up and associated (cabling and Wi-Fi are fine). The values shown are accurate and complete for the decision. A configured relay points to the correct DHCP server. Each VLAN maps to one IPv4 subnet. Masks are contiguous, between /8 and /30.
- **Excluded behavior:** DHCP message exchange (DORA), timers, lease renewal/expiry, exhausted scopes shown as a separate cause, Option 82, DHCP snooping, multiple helper addresses, IPv6/SLAAC, DNS, Wi-Fi association and authentication, ARP, duplicate address detection, routing beyond the default gateway, secondary addresses, /31 and /32, and operating-system differences.
- **Authoritative references:**
  - RFC 3927 §2.1, https://www.rfc-editor.org/rfc/rfc3927#section-2.1: a host without a configured address selects a link-local address from 169.254.0.0/16.
  - RFC 1122 §3.3.1.1, https://www.rfc-editor.org/rfc/rfc1122#section-3.3.1.1: a host decides whether a destination is local by comparing network numbers under its mask, and sends non-local traffic to a gateway that must be on its directly connected network.
  - RFC 4632 §3.1, https://www.rfc-editor.org/rfc/rfc4632#section-3.1: prefix/mask notation and how the network portion of an address is determined.
  - RFC 1542 §4, https://www.rfc-editor.org/rfc/rfc1542#section-4: relay agents forward BOOTP/DHCP requests between subnets, which routers otherwise do not forward.
  - RFC 2131 §4.1, https://www.rfc-editor.org/rfc/rfc2131#section-4.1: clients broadcast DHCP requests when they have no address, and relay agents set `giaddr` when forwarding.
  - RFC 1918 §3, https://www.rfc-editor.org/rfc/rfc1918#section-3: 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 are private ranges that a DHCP server may legitimately assign.

Tell the learner about these boundaries in plain language. If two answers can both be valid, define how the game accepts them or remove that ambiguity from the first version.

## The repeatable game loop

1. **Brief:** introduce one concept, its terms, and a worked example different from the challenge.
2. **Inspect:** show the ipconfig card (address, mask in dotted and /prefix form, gateway) and, in Level 3, the VLAN/DHCP topology panel with a text equivalent, with all decision-relevant values visible.
3. **Choose:** the player selects one of the four diagnoses and explicitly submits the decision.
4. **Explain:** display the result, the relevant values, and the rule that connects them.
5. **Retry or advance:** a wrong answer leaves the round playable; a correct answer enables Next.
6. **Reflect:** the level summary shows completed rounds, valid attempts, and assistance used.

**Worked interaction:** Level 2, Round 1, "The Half-Wall Goblin." The ticket says: *"I can print to the printer next to me, but nothing else works."* The ipconfig card shows IPv4 192.168.1.130, mask 255.255.255.128 (/25), gateway 192.168.1.1. Because the first three octets match, the player picks **"Host IP settings are valid"** and submits. The goblin shrugs off the hit and the ticket stays open. Feedback: *"Not quite. Matching the first three octets proves the same subnet only when the mask is /24, and this mask is /25. Next step: AND the last octet of the host (130) and of the gateway (1) with 128, then compare the results."* The attempt counter reads 1. The player selects **"Default gateway is outside the host's subnet"** and submits. The goblin is defeated, the ticket is marked Resolved, and the address ruler shows the host inside 192.168.1.128–192.168.1.255 while the gateway lands outside, in 192.168.1.0–192.168.1.127. Feedback: *"Correct. 130 AND 128 = 128, so the host is in 192.168.1.128/25. 1 AND 128 = 0, so the gateway is in 192.168.1.0/25. The host can't reach its gateway directly, so traffic to other networks goes nowhere. The printer works because it shares the host's subnet. Fix: use a gateway in .129–.254, or correct the mask."* Next is enabled.

## Required stories and acceptance criteria

### US1 · Make and understand a decision — P1

As a learner, I want to apply the rule to visible evidence and understand the result.

- **AC1:** Given a fresh session, when I start, then I see the first briefing before answering a challenge.
- **AC2:** Given Level 1, Round 1 (IPv4 169.254.33.7, mask 255.255.0.0 /16, no gateway), when I submit "No DHCP lease: the host self-assigned a 169.254.x.x address", then the ticket monster is defeated, the round is marked Resolved, Next is enabled, and an explanation appears.
- **AC3:** Given that challenge, when I submit "Host IP settings are valid", then feedback identifies the misconception that having any IP address means DHCP worked (169.254.0.0/16 is self-assigned, not a lease), completion stays unchanged, and I can retry.
- **AC4:** Given no selection or malformed input, when I submit, then input guidance appears and attempts/completion remain unchanged.

### US2 · Learn from help and finish the game — P1

As a learner, I want help when stuck and a clear view of my progress.

- **AC5:** A hint first explains the method. Further help can show a worked solution; assistance is recorded without marking the round complete.
- **AC6:** Each valid submission counts as one attempt until the round is solved. Correct submission completes it once; repeated submission after success has no effect.
- **AC7:** A level completes after both of its rounds are solved. Next opens the following round or level; the final round opens a session summary.
- **AC8:** Restart asks for confirmation, then clears the current session and returns to the first briefing. Cancel preserves the session.

### US3 · Play with accessible controls — P1

As a keyboard user, I want to inspect the challenge, choose, submit, get help, and advance without a mouse.

- **AC9:** All core controls have visible focus and accessible names; keyboard interaction reaches every core action.
- **AC10:** Correct/incorrect feedback includes text, remains available to read, and is announced to assistive technology. Motion can be reduced without losing information.

## Version-one content

Default: **three levels, two rounds per level, six rounds total**. Use one new example per round and the same core mechanic throughout. Change these counts and AC7 together if you choose a smaller scope.

| Level | New concept | Prerequisite | Misconception to expose |
| --- | --- | --- | --- |
| 1 | Foundation (LO1), played as Service Desk (T1): a 169.254.x.x self-assigned address versus a real DHCP lease | Recognising a dotted-decimal IPv4 address | "It has an IP address, so DHCP worked," and its opposite, "an unfamiliar address like 10.20.30.44 means something is broken" |
| 2 | Application (LO2), played as NOC Engineer (T2): using the mask to check that the gateway is inside the host's subnet | Level 1 | "Same first three octets means same subnet," and its opposite, "a different third octet means a different subnet" |
| 3 | Transfer or edge case (LO3), played as Network Engineer (T3): DHCP across VLANs and when a relay is required | Level 2 | "The server is healthy, so DHCP can't be the problem," and "every APIPA problem on a VLAN is a missing relay" (even when the server is on the same VLAN) |

**Progression:** sequential on first playthrough; retry without penalty. Completion requires a correct submission in every round. Hints remain available. No points, lives, timer, leaderboard, or streak mechanic in v1.

**Session behavior:** progress is held for the current page session; reload starts again. Saving across reloads is a stretch feature and must be specified before it is added.

## Cases the implementation must satisfy

Write these before generating code. Use real values and independently checked expected results. Include additional cases for every shipped round.

| Case | Input state | Player action | Expected result | Why / source |
| --- | --- | --- | --- | --- |
| Correct | L1R1: host 169.254.33.7/16, no gateway, no topology panel | Submit "No DHCP lease" | Round resolved; explanation says 169.254.0.0/16 is self-assigned | Rule step 2; RFC 3927 §2.1 |
| Plausible mistake | L1R1: host 169.254.33.7/16, no gateway | Submit "Host IP settings are valid" | Not resolved; attempt +1; feedback: "Having an address isn't the same as having a lease. 169.254.x.x is what a host gives itself when DHCP doesn't answer." | Misconception: any address means DHCP worked |
| Correct | L1R2: host 10.20.30.44/24, gateway 10.20.30.1 | Submit "Host IP settings are valid" | Round resolved; explanation says 10.x is a private range a DHCP server may assign, and host and gateway are both in 10.20.30.0/24 | Rule step 4; RFC 1918 §3; RFC 1122 §3.3.1.1 |
| Plausible mistake | L1R2: host 10.20.30.44/24, gateway 10.20.30.1 | Submit "No DHCP lease" | Not resolved; feedback: "Only 169.254.x.x means self-assigned. 10.20.30.44 is a normal private address from DHCP." | Misconception: an unfamiliar address means something is broken |
| Correct | L2R1: host 192.168.1.130/25, gateway 192.168.1.1 | Submit "Default gateway is outside the host's subnet" | Round resolved; host network 192.168.1.128, gateway network 192.168.1.0 | Rule step 3; RFC 1122 §3.3.1.1; RFC 4632 §3.1 |
| Plausible mistake | L2R1: host 192.168.1.130/25, gateway 192.168.1.1 | Submit "Host IP settings are valid" | Not resolved; feedback about /25 versus matching octets (see the worked interaction) | Misconception: same first three octets means same subnet |
| Correct | L2R2: host 172.16.4.200/22 (255.255.252.0), gateway 172.16.5.1 | Submit "Host IP settings are valid" | Round resolved; both addresses AND to 172.16.4.0 (range 172.16.4.0–172.16.7.255) | Rule step 4; RFC 4632 §3.1 |
| Plausible mistake | L2R2: host 172.16.4.200/22, gateway 172.16.5.1 | Submit "Default gateway is outside the host's subnet" | Not resolved; feedback: "With /22, the third octet is part of the host range. 4 AND 252 = 4 and 5 AND 252 = 4, so both are in the same network." | Misconception: a different third octet means a different subnet |
| Correct | L3R1: host 169.254.80.12/16 on VLAN 30; DHCP server 10.0.99.10 on VLAN 99, healthy; VLAN 30 SVI has no helper; VLAN 20 SVI has helper 10.0.99.10 and its users are fine | Submit "No DHCP relay" | Round resolved; explanation says the broadcast never leaves VLAN 30 and the fix is `ip helper-address 10.0.99.10` on the VLAN 30 SVI | Rule step 2 (remote server, no relay); RFC 1542 §4; RFC 2131 §4.1 |
| Plausible mistake | L3R1 as above | Submit "No DHCP lease" | Not resolved; feedback: "True, but incomplete. The server is healthy and VLAN 20 works, so find what's different about VLAN 30's path to the server." | Most-specific rule; misconception: the server is healthy, so DHCP isn't the problem |
| Correct | L3R2: host 169.254.7.200/16 on VLAN 40; DHCP server on VLAN 40 (same VLAN); VLAN 40 SVI has no helper | Submit "No DHCP lease" | Round resolved; explanation says no relay is needed because the server shares the VLAN, so the lease failed for another reason | Rule step 2 (local server); RFC 1542 §4 |
| Plausible mistake | L3R2 as above | Submit "No DHCP relay" | Not resolved; feedback: "A relay is only needed when the server is on a different VLAN. This server is on VLAN 40 with the client, so the broadcast reaches it directly." | Misconception: every APIPA problem on a VLAN is a missing relay |
| Boundary | Host 192.168.1.126/25, gateway 192.168.1.1 | Submit "Host IP settings are valid" | Resolved: both are in 192.168.1.0/25 (.126 is the last usable host) | Rule step 4; RFC 4632 §3.1 |
| Boundary | Host 192.168.1.129/25, gateway 192.168.1.1 | Submit "Default gateway is outside the host's subnet" | Resolved: host is in 192.168.1.128/25 (first usable host), gateway in 192.168.1.0/25 | Rule step 3; RFC 4632 §3.1 |
| Unsupported content | Mask 255.255.0.255 (non-contiguous), or host 192.168.1.128/25 (the network address), or a non-169.254 host with no gateway, or an L3 round missing the server VLAN or relay setting | Open round | Visible content error; no grading or progress | Authoring error, not learner failure |

## Experience direction

- **Visual metaphor:** each ticket is a monster roaming Networklandia. A subnet is a walled town drawn on an address ruler, and the default gateway is the town gate, which must sit inside the town's walls. The DHCP server is a quartermaster handing out addresses, and a relay is the messenger who carries a shout (broadcast) over the castle wall to another town.
- **One memorable moment:** after a Level 2 submission, the host and gateway markers drop onto the address ruler. An off-subnet gateway visibly lands outside the town walls, with matching text such as "Gateway 192.168.1.1 is outside 192.168.1.128–192.168.1.255."
- **Always visible:** the ticket text; the ipconfig values (address, mask in dotted and /prefix form, gateway); in Level 3, the topology facts (client VLAN, DHCP server VLAN and status, relay setting for each SVI); the four diagnosis options; current rank; round "x of 2"; and attempts and hints used.
- **Feedback voice:** patient and specific; explain the observed choice before offering the next step.
- **Layout:** challenge first, action next, explanation beside or below it. Don't hide technical values behind hover-only interactions.

## Non-goals

No user accounts, multiplayer, backend, live infrastructure access, runtime AI, leaderboard, or level editor. No simulation of DNS resolution, Wi-Fi association, the DHCP message exchange and lease timers, ARP, IPv6, or routing beyond the default gateway. Visual polish must fit the existing mechanic.

## Stretch ideas (not required for v1)

Each of these needs a spec change, and where noted a constitution change, before it is built:
- More ticket families that reuse the same mechanic: DNS (ping by IP works, by name fails), Wi-Fi, ACL order, longest-prefix routing.
- A Level 4 Network Architect teaser (traffic engineering).
- Saving progress across reloads.
- Monster art, ticket animations, and rank badges, provided they don't delay feedback (C4).
- An "escalate" choice with its own learning outcome.
- Typed CLI commands as an alternative action.
- Runtime AI tutoring or generated tickets (requires a constitution change, C5).

## Open decisions for clarify

- **XP versus "no points":** the Purpose says players earn XP to level up, but v1 Progression says no points. This spec shows promotion (a rank title) on level completion with no numeric XP. Confirm this, or update the Progression line (and check C3) to allow a non-competitive XP bar.
- **Most-specific acceptance rule:** in a `no-relay` round, "No DHCP lease" is technically true. This spec treats it as true but incomplete: not correct, explained, and retryable. Confirm this, or change what counts as correct by accepting both answers or rewording the diagnosis labels so they can't overlap.
- **Scope narrowing:** the Purpose mentions Wi-Fi, DNS, and traffic engineering, but v1 teaches one thread (IPv4 host configuration, then subnets, then DHCP relay). Confirm that this is the agreed first release.
- **Learning-sequence placement:** this spec maps Foundation → Application → Transfer onto Levels 1 → 2 → 3, as the content table does. The alternative is to run all three phases inside each level, which would need more than two rounds per level and a change to AC7. Confirm the mapping.
- **Time budget:** Context.md says a 90-minute workshop, while the constitution and this spec say a 60-minute build. Confirm that the build budget is 60 minutes.
- **Reference check:** confirm each RFC section link above against the source text before release (C1).

Delete this section when resolved, or record the answer beside each question. Don't let unresolved decisions become silent implementation guesses.

## Release evidence

All required acceptance criteria must have a recorded result. All six rounds and their explanations must be checked against the references. A teammate must complete the core flow using only the keyboard. The README must describe implemented behavior, exact run/test commands, and any remaining limits.