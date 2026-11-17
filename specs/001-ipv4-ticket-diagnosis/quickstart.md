# Quickstart: Run and Validate Network-Quest

These steps work once the implementation exists (`index.html`, `engine/`, `data/`, `tests/`).

## Prerequisites

- Python 3 (to serve static files) and a current desktop browser.
- No install step, account, or API key.

## Run

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

On Windows:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

- Game: http://127.0.0.1:8000/
- Tests: http://127.0.0.1:8000/tests/

Opening `index.html` directly with `file://` is not supported, because modules and JSON need
HTTP. If port 8000 is busy, use 8001 in both the command and the URL.

## Automated validation

Open the tests page.

- **Expected:** a non-zero total with 0 failures.
- Zero tests discovered is a failure.
- Failed case IDs (e.g. `L3R2-mistake-C`) are listed by name.

The tests cover:

- the host rule ([contracts/evaluation.md](contracts/evaluation.md)): every L1–L2 reference case
  plus the /25 boundaries;
- the BGP rule: L3R1, L3R2 (both mistakes), the weight and MED boundaries, `bgp-full-tie`, and
  `bgp-med-cross-as`;
- state ([data-model.md](data-model.md#state-transitions)): invalid input, attempts, duplicate
  submit, help, level and session completion, restart confirm and cancel;
- content ([contracts/content.md](contracts/content.md)): every validation code, plus the
  shipped `data/levels.json` validating cleanly.

## Manual validation scenarios

Record each one as pass / fail / not run in the README verification table, with the date,
browser/OS, and commit.

1. **First round (US1):** fresh load shows the L1 briefing. Start L1R1 and submit with nothing
   selected: guidance appears and attempts stay 0. Submit "Host IP settings are valid": "Still
   open ✗", attempts 1, feedback about self-assigned addresses. Submit "No DHCP lease":
   "Resolved ✓", Next enabled. Submit again: nothing changes.
2. **Level 2 ruler:** at L2R1, submit "Default gateway is outside the host's subnet". The ruler
   shows the host inside 192.168.1.128–192.168.1.255 and the gateway outside, with matching text.
3. **BGP Boss (Level 3):** at L3R2, submit Path C. Feedback says C was eliminated at AS-path
   length. Submit Path A: eliminated at origin. Submit Path B: Resolved, and the trace shows
   weight tie → local pref tie → C out → A out on origin.
4. **Help and progress (US2):** use a hint and then the solution on one round. Assistance is
   recorded and the round stays open. Finish all rounds: each level summary shows the promotion,
   and the session summary shows completed rounds, attempts, and assistance separately, with no
   XP figure.
5. **Restart:** Restart → Cancel leaves everything unchanged. Restart → Confirm returns to the
   L1 briefing with cleared counters.
6. **Keyboard only (US3):** complete scenario 1 and the rest of the game with Tab, Shift+Tab,
   arrow keys, Space/Enter, and Escape only. Focus is visible and moves to each new view's
   heading.
7. **Narrow window and reduced motion:** at about 360 px wide, the evidence, choices, and buttons
   stay usable. With reduced motion on, feedback appears immediately and nothing is lost.
8. **Content error:** temporarily change a mask in `data/levels.json` to `255.255.0.255` and
   reload. A content error names the round and `mask-non-contiguous`, and no round can be
   graded. Revert the change.
9. **Fresh checkout:** clone into a new folder, run the command above, and play to the summary.
