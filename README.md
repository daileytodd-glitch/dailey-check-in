# Daily Check-In

A one-tap-a-day family mood board. Everyone picks their name, taps how their day went on today's category
(weather, battery, traffic light, golf score, report card, or final score), and it shows up instantly on the
TV board and on every phone. Every day brings a new riddle, quote and scripture; yesterday's riddle answer is
revealed the next day. Everything rolls over at 4:00 AM Eastern.

Live at **https://dailey-check-in.vercel.app**

## Screens

| URL                                      | What it is                                                            |
| ---------------------------------------- | --------------------------------------------------------------------- |
| https://dailey-check-in.vercel.app/      | The check-in screen for phones and iPads. Add it to the Home Screen.  |
| https://dailey-check-in.vercel.app/tv    | The board. Open it in the TV's browser and leave it up. Updates live. |

## How it works

- **Next.js** app hosted on **Vercel**.
- **Supabase** Postgres holds check-ins and reminder subscriptions. Realtime pushes changes to every screen.
- Content banks live in `content/*.json` (366 quotes, riddles, and RSV-CE verses). The item for a day is picked
  by the day number, so every device agrees without a server.
- The category of the day rotates automatically in the order listed in `lib/categories.tsx`.
- A new day starts at 4:00 AM Eastern so late check-ins count for the right day.
- The daily reminder is a web push notification at 5:30 PM Eastern, sent only to people who have not checked in.
  Supabase `pg_cron` calls `send_checkin_reminders()`, which POSTs the pending subscriptions to `/api/reminders`.

## Changing things

| Want to change                     | Edit                                            |
| ---------------------------------- | ----------------------------------------------- |
| Family names or colors             | `FAMILY` in `lib/config.ts`                     |
| Reminder time, 4 AM rollover       | constants in `lib/config.ts` (reminder time also in `supabase/migrations`) |
| Categories, labels, icons          | `lib/categories.tsx`                            |
| Quotes, riddles, verses            | `content/quotes.json`, `content/riddles.json`, `content/verses.json` |

## Local development

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev
```

Environment variables:

| Name                            | Purpose                                            |
| ------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable key                           |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`  | Web push public key                                |
| `VAPID_PRIVATE_KEY`             | Web push private key (server only)                 |
| `VAPID_SUBJECT`                 | `mailto:` contact for push services                |
| `REMINDER_SECRET`               | Shared secret the Supabase cron job sends          |

Database schema: `supabase/migrations/20260926_init.sql`. After deploying, store the reminder endpoint once:

```sql
insert into public.reminder_config (url, secret)
values ('https://YOUR-APP.vercel.app/api/reminders', 'YOUR_REMINDER_SECRET')
on conflict (id) do update set url = excluded.url, secret = excluded.secret;
```

## Putting it on the TV

Samsung Frame TV: open the **Internet** app (Samsung's browser), go to `dailey-check-in.vercel.app/tv`, and bookmark
it. The board fills the screen, updates live, dims itself between 10 PM and 6 AM, and drifts slowly so no pixel
stays put. Switch inputs to watch TV; reopen the browser to bring the board back. Any spare tablet or laptop on the
TV's HDMI works the same way.

## Hosting

- Vercel project `daily-check-in` (team "todd-dailey-s-projects"), deployed from this repository.
- Supabase project "dailey.todd@gmail.com's Project" holds the tables from `supabase/migrations/`.

## Content credits

Scripture quotations are from the Revised Standard Version of the Bible, Catholic Edition, copyright 1965, 1966
the Division of Christian Education of the National Council of the Churches of Christ in the USA. Used for
private family use.
