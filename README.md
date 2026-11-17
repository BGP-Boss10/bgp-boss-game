# Network-Quest

**Read the evidence, defeat the ticket monster, and climb from the Service Desk to face the BGP Boss.**

Network-Quest is a browser game for people starting out in networking: help desk staff, students and career changers. You play as NetworkSerf, a Service Desk recruit in the realm of Networklandia. For each ticket you decide what the evidence proves, so you can get promoted. Every answer is explained, so you can use what you learned on the next ticket.

A project from **NAF AC6 — Loop Engineering, Spec-Driven Development & the Future of VibeOps**.

| Project | Details |
| --- | --- |
| Status | Playable. Automated checks pass; the manual keyboard-only and human content reviews are still open (see [Verification](#verification)) |
| Networking topic | IPv4 host configuration (self-assigned addresses, subnet masks, default gateways) and BGP best-path selection |
| Typical session | 5–10 minutes for six tickets, with unlimited thinking time |
| Live demo | Not published yet |
| Built by | bgp-boss10 |

## The challenge

A user writes in: *"I can print to the printer next to me, but nothing else works."* Their `ipconfig` shows IPv4 192.168.1.130, mask 255.255.255.128 (/25), gateway 192.168.1.1. You choose one of three diagnoses and submit it.

If you pick "Host IP settings are valid" because the first three octets match, the Half-Wall Goblin shrugs off the hit. The feedback explains that matching octets only proves the same subnet under a /24 mask, and tells you to AND the last octets with 128.

When you choose "Default gateway is outside the host's subnet", the goblin is defeated. An address ruler then shows the host inside 192.168.1.128–192.168.1.255 and the gateway outside it.

In the final level, the BGP Boss shows two or three BGP paths to 203.0.113.0/24, and you pick the one the router will select.

## What you'll learn

| By the end, you can… | You'll practice by… |
| --- | --- |
| Identify whether a host's IPv4 address came from a DHCP lease or was self-assigned (169.254.0.0/16) | Reading an `ipconfig` card and diagnosing "No DHCP lease" versus "settings are valid" (Level 1) |
| Compare a host's and gateway's network addresses using the mask | ANDing addresses with /25 and /22 masks to decide whether the gateway is inside the host's subnet (Level 2) |
| Predict which BGP path a router selects and name the attribute that decides | Comparing weight, local preference, AS-path length, origin and MED in order (Level 3, the BGP Boss) |

**Before playing:** you only need to recognise a dotted-decimal IPv4 address such as 192.168.1.10. Each level's briefing teaches the rest, including what BGP is.

## Play locally

The game is static HTML, CSS and JavaScript modules, with no install step, account or API key. Clone the repository (use the URL from GitHub's **Code** button) and open a terminal in the project root.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows with the Python launcher:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000** in your browser. Keep the terminal running; **Ctrl+C** stops the server. If port 8000 is busy, use 8001 in both the command and the URL.

The game loads JavaScript modules and a JSON file, which browsers only allow over HTTP, so opening `index.html` directly (`file://`) won't work. [Why modules need serving](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

## How to play

1. Read the level briefing: the concept, a worked example, what the level simplifies, and its sources. Then choose **Start Level**.
2. Read the ticket and the evidence (the `ipconfig` card, or the BGP table in Level 3).
3. Choose one answer and **Submit**. A wrong answer explains your specific mistake and leaves the ticket open, so you can retry. A correct answer resolves the ticket and enables **Next ticket**.
4. Stuck? **Hint** shows the method first, then a worked step. **Show solution** gives the full worked solution. Help is recorded separately from completion.
5. Finish all three levels (six tickets) to reach the session summary.

| Control | Action |
| --- | --- |
| Mouse or touch | Select an answer, then press Submit, Hint, Show solution or Next |
| Keyboard | **Tab** / **Shift+Tab** move between controls, **arrow keys** choose an answer, **Enter** submits, **Space** or **Enter** presses a focused button |
| Hint / solution | Hint reveals the method, then the worked step; Show solution reveals the worked solution. Using them is recorded as help but never completes a ticket |
| Restart | **Restart** (top right) asks for confirmation. **Cancel** or **Escape** keeps everything; **Restart** clears the session and returns to the first briefing |

**Progress:**
- **What counts as an attempt:** each valid submission on an unresolved ticket. Submitting with nothing selected only shows guidance.
- **Completing tickets and levels:** a ticket completes once, on a correct answer; submitting again changes nothing. A level completes when both of its tickets are resolved, and you are promoted to the next rank: Service Desk (T1), then NOC Engineer (T2), Network Engineer (T3), and Senior Network Engineer (T4).
- **What is shown:** there are no points, XP, lives or timers. The summaries show tickets resolved, valid attempts and help used as separate figures.
- **Saving:** progress is not saved; reloading the page starts a fresh session.

## What this game models

**Levels 1–2:** a Windows-style `ipconfig` view of an IPv4 DHCP client. The game applies an ordered rule:
1. An address in 169.254.0.0/16 means "No DHCP lease".
2. Otherwise, if the gateway's network under the host's mask differs from the host's network, the gateway is outside the subnet.
3. Otherwise, the settings are valid.

The link is assumed up, the values shown are accurate, and masks are contiguous, between /8 and /30.

**Level 3:** one Cisco IOS-style router choosing among two or three valid paths to one prefix. It compares the following in order, and the first difference decides:
1. Highest weight.
2. Highest local preference.
3. Shortest AS path.
4. Lowest origin (IGP before EGP before incomplete).
5. Lowest MED, compared only between paths whose first AS is the same.

Weight is a Cisco-specific attribute, not part of the BGP standard.

**Outside the model:**
- **DHCP and addressing:** the DHCP message exchange, lease timers, DHCP relay, IPv6, DNS, Wi-Fi association, ARP, routing beyond the default gateway, and /31 or /32 networks.
- **Later BGP steps:** BGP neighbour setup, next-hop reachability, locally originated routes, eBGP-versus-iBGP and the later tie-breakers (IGP metric, path age, router ID, neighbour address), multipath, always-compare-MED, AS_SET, and communities.
- **Unsupported content:** tickets the model can't settle (paths that tie on every attribute, or MED compared across different neighbouring ASes) are rejected as content errors and never graded.

| Reference | What it supports |
| --- | --- |
| [RFC 3927 §2.1](https://www.rfc-editor.org/rfc/rfc3927#section-2.1) Link-Local Address Selection | 169.254/16 is the self-assigned link-local range |
| [RFC 1122 §3.3.1, §3.3.1.1](https://www.rfc-editor.org/rfc/rfc1122#section-3.3.1) Routing Outbound Datagrams; Local/Remote Decision | The mask decides what is on the connected network; other traffic goes to a gateway on a connected network |
| [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632#section-3.1) Basic Concept and Prefix Notation | Prefix (/n) notation and network portions |
| [RFC 1918 §3](https://www.rfc-editor.org/rfc/rfc1918#section-3) Private Address Space | 10/8, 172.16/12 and 192.168/16 are private ranges |
| [RFC 4271 §5.1.1–5.1.5](https://www.rfc-editor.org/rfc/rfc4271#section-5.1) | ORIGIN, AS_PATH, MULTI_EXIT_DISC and LOCAL_PREF attributes |
| [RFC 4271 §9.1.1, §9.1.2.2](https://www.rfc-editor.org/rfc/rfc4271#section-9.1.2.2) | Degree of preference, then ties broken by AS_PATH length, ORIGIN, and MED within the same neighbouring AS |
| [Cisco: Select BGP Best-path Algorithm](https://www.cisco.com/c/en/us/support/docs/ip/border-gateway-protocol-bgp/13753-25.html), "How the Best Path Algorithm Works" | Weight (Cisco-specific, local) before local preference; MED compared only when the first AS matches |
| [RFC 5737 §3](https://www.rfc-editor.org/rfc/rfc5737#section-3), [RFC 6996 §5](https://www.rfc-editor.org/rfc/rfc6996#section-5) | Documentation addresses and private AS numbers used in the examples |

## How it was built

The project follows the workshop's Spec Kit workflow: **constitution → specify → clarify → plan → tasks → analyze → implement**. The verification section below records which behaviours have actually been checked.

- **Stack:** semantic HTML, CSS and native JavaScript modules, with no framework, bundler or runtime dependency.
- **Build tools:** Claude Code with GitHub Spec Kit 1.4.2.dev0.
- **Runtime:** a browser and a static file server; no model, account or API key.
- **Code layout:**
  - `engine/`: pure, DOM-free rules, content validation and session state.
  - `ui/`: rendering only.
  - `data/levels.json`: all ticket content, hints and sources, validated before play.
- **Planning inputs:** `StarterKit/CONSTITUTION.md`, `StarterKit/SPEC.md`, `StarterKit/PLAN.md`.
- **Working artifacts:** `.specify/memory/constitution.md`, `specs/001-ipv4-ticket-diagnosis/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `tasks.md`).
- **One useful design decision:** during clarify, the team replaced the planned DHCP-relay level with a **BGP best-path** level, the "BGP Boss". The best-path rule then needed explicit "content error" cases (paths that tie on every attribute, and MED across different neighbouring ASes), so the game rejects a badly authored ticket instead of guessing.

## Verification

**Last checked:** 2026-11-17, headless Google Chrome on Windows 11, working tree on top of commit `11762b7` (implementation not yet committed).

Start the server, then open:
- **http://127.0.0.1:8000/tests/**: the unit tests (rules, content validation, state). Expected values are typed in by hand from the spec. An empty suite counts as failure.
- **http://127.0.0.1:8000/tests/playthrough.html**: drives the real game from the first briefing to the summary and Restart.

| Check | Result | Evidence / notes |
| --- | --- | --- |
| Correct, incorrect, and boundary cases | Pass | `tests/`: 85 of 85 passed, including every spec reference case: L1R1–L3R2, the /25 boundaries, the weight and MED boundaries, and unsupported content (`bgp-full-tie`, `bgp-med-cross-as`, `mask-non-contiguous`) |
| Content validation | Pass | Every content-error code in `contracts/content.md` is tested on a broken copy of the data. Breaking a mask in `data/levels.json` showed the content-error screen naming `mask-non-contiguous` at `levels[1].rounds[0].host.mask (round L2R1)`, with nothing graded |
| Briefings and explanations checked against sources | Partial | 2026-11-17: every cited section was checked against the RFC and Cisco text (AI-assisted). Two corrections followed: RFC 1122 now cites §3.3.1 as well, and the Cisco page title was fixed. A human teammate review is still needed |
| Retry, hint, duplicate Submit, completion, restart | Pass | `tests/playthrough.html`: 62 of 62 checks passed (empty submit isn't an attempt; wrong answers count; repeated Submit changes nothing; help is recorded; promotions; summaries; Restart cancel and confirm) |
| Keyboard-only core playthrough | Not run | The automated playthrough confirms focus moves to each new heading, to Next after a correct answer, and back to Restart after Cancel. A human keyboard-only run (SC-003) has not been done yet |
| Narrow layout and reduced motion | Pass (headless) | Screenshots at 360 px and 1280 px wide, in light and dark modes, with forced reduced motion. The ipconfig card stacks, the BGP table scrolls inside its own labelled region with a hint, and feedback appears without animation |
| Fresh checkout run instructions | Partial | `py -m http.server` from the working tree. Not yet repeated from a fresh clone |
| Published demo, if used | Not run | Not published |

## Known limitations and next steps

- **Known limitation:** no human has yet done the keyboard-only playthrough or reviewed the teaching content. Both are required before calling this release verified.
- **Known limitation:** on very narrow screens the address ruler's drawing is small. The sentence beneath it carries the same information.
- **Known limitation:** there is no license file yet (see below).
- **Next improvement:** add another ticket family that reuses an existing rule, such as more subnet tickets with /27–/30 masks. The grading engine already accepts new rounds as pure content (spec SC-008), so more practice costs no new code.

Found an incorrect answer or unclear explanation? Open an issue with the level/round, input values, your choice, expected result, actual result, and a reference if available.

## Credits

Created by bgp-boss10. Workshop by John Capobianco, Joksan Flores, and Elliot Conner. Adapted from the [NAF AC6 workshop materials](https://github.com/automateyournetwork/NAF_AC6) and [Networking Video Game Starter Kit](https://github.com/automateyournetwork/NetworkingVideoGameStarterKit), using [GitHub Spec Kit](https://github.com/github/spec-kit).

**Assets and dependencies:** none. All characters (NetworkSerf, the ticket monsters, the BGP Boss), text and drawings are original to this project; the game uses no third-party libraries, fonts or images.

**License:** no license file is included yet. Until one is added, all rights are reserved by the author.
