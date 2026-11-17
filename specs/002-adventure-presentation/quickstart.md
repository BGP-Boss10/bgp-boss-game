# Quickstart: Validate the Adventure Presentation

Run the game exactly as in [feature 001's quickstart](../001-ipv4-ticket-diagnosis/quickstart.md)
(`py -m http.server 8000 --bind 127.0.0.1`), then:

1. **Unit tests:** open http://127.0.0.1:8000/tests/. Expect a non-zero total with 0 failures,
   including `art-*` tests and the new content codes.
2. **Automated playthrough:** open http://127.0.0.1:8000/tests/playthrough.html. Expect PASS,
   including the battle, boss, map, and gear checks.
3. **Battle (manual):** in L1R1, use **All-Clear Ward**. Expect "Blocked!", full monster health,
   the caption "…blocked…", and the log explanation. Then use **Lease Lance**. Expect the hit,
   health 0, "defeated", and Next enabled.
4. **Boss:** the second ticket of every level shows a "Boss" label and a larger monster.
5. **Map and gear:** each briefing marks "You are here"; the T2, T3, and T4 summaries show the
   headset, cape, and crown; the session summary shows the cleared map.
6. **Reduced motion:** turn on the operating system's reduced-motion setting (or start Chrome
   with `--force-prefers-reduced-motion`). Using a move shows the outcome immediately, with no
   animation.
7. **Narrow window (360 px) and keyboard-only:** the stage scales, the menu stacks, every
   control can be reached, and arrow keys choose moves.
