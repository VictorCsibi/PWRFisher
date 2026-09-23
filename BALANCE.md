# Balance check (made by a bot that plays the game)

A bot played the real game code in auto mode with a simple plan: every 5 seconds it buys the cheapest next upgrade it can afford
(rod, line, bait or bucket). A real player is slower than this bot (the bot never wastes money or time), so real progress will be a bit slower.

## How fast it goes

| Game time | Gear tiers (rod/line/bait/bucket) | Rank | Fish kinds found | Fish caught | Money left |
|---|---|---|---|---|---|
| 5 min | 6 / 5 / 6 / 5 | 2 | 12 | 22 | $1,047 |
| 10 min | 11 / 10 / 12 / 11 | 3 | 22 | 51 | $5,400 |
| 15 min | 13 / 12 / 13 / 13 | 3 | 25 | 81 | $9,900 |
| 20 min | 14 / 14 / 15 / 14 | 3 | 26 | 112 | $13,500 |
| 25 min | 17 / 16 / 17 / 16 | 3 | 28 | 146 | $10,100 |

What this tells us:
- **Gear comes very fast.** Gear from tier 8 up now costs only 30% more per step, so in 25 minutes the bot owns tier 16-17 gear (of 24).
  If you want the middle of the game to last longer, raise the starting price of the curve (for example 3200 instead of 2200 at tier 7)
  or lower fish value a little more.
- **Ranks are the slow part.** The bot sits at rank 3 from minute 10 on, because rank 4 needs $150,000 earned AND 32 kinds of fish.
  That is on purpose (you asked for harder ranks), but the gap between rank 3 and 4 may feel long.
- **The first 5 minutes are fine**: about 20 fish, 12 kinds, and a new upgrade every 30-60 seconds.

## Gems

Before the fix the bot had **157 gems after 25 minutes**. That was far too many, because with good bait the water holds many Epic and
Legendary fish and every one of them dropped gems.

What I changed:
- Rare, Epic and Legendary fish now only *sometimes* drop gems (6%, 12% and 25%). Mythic fish always do.
- Quests, weekly goals, boss fish and rank ups give fewer gems.

Result: about **46 gems after 20 minutes** in the bot run before the last small trim, and lower after it. Top-tier gear costs
about 30 gems, so this is roughly one big gem purchase per half hour for a perfect bot, and slower for a person. If that still feels too
fast, the next knobs are the gem numbers in `rewards.js` (GEM_BY_ID) and the drop chances in `fun.js` (search for `chance =`).

## Other checks

- **Hot spots** now only appear in manual mode, always between x=430 and x=780 (close to the dock) and always within your line's reach.
  Auto mode never gets them.
- **Manual vs auto**: manual mode has hot spots, perfect throws (+25%), perfect reels (+25%) and a 30% faster reel, so a good manual player
  earns clearly more than auto. A casual manual player earns about the same.
- **Map ups and downs** were not simulated. The Alien Planet (sell +80%, but line wears 2.5x) and Ember Isle (+50%, wear x2) are the
  ones most likely to be too strong; try them with the bot next.
- **Small and phone-shaped windows** were checked for the start screen and the left buttons (they scale down), but not for every page.

## Things I would test with a real person

1. Does the first 10 minutes feel exciting (first rare fish, first gem, first upgrade)?
2. Does the gap between rank 3 and rank 4 feel too long?
3. Is manual mode fun enough to prefer over auto?
