#!/usr/bin/env python3
"""
Empire AI — Agent Alpha: The Reddit Sniper

Scans 13 high-signal subreddits for high-ticket B2B buying intent.
Scores each post across three vectors:
  1. Reddit engagement  (score + comment velocity)
  2. Keyword intent     (16 buying-signal regex patterns)
  3. Recency boost      (posts < 6h old score 2×)

Output: JSON written to $SCOUT_OUTPUT_PATH (default: .scout_output.json)
"""

import os
import re
import sys
import json
import datetime

import praw

# ── Config ───────────────────────────────────────────────────────────────────-

CLIENT_ID     = os.environ["REDDIT_CLIENT_ID"]
CLIENT_SECRET = os.environ["REDDIT_CLIENT_SECRET"]
USER_AGENT    = os.environ.get("REDDIT_USER_AGENT", "EmpireAI-AlphaScout/1.0")
OUTPUT_PATH   = os.environ.get("SCOUT_OUTPUT_PATH", ".scout_output.json")
THRESHOLD     = int(os.environ.get("LEAD_SCORE_THRESHOLD", "50"))

# 13 subreddits with highest density of decision-makers
TARGETS = [
    "entrepreneur",
    "startups",
    "smallbusiness",
    "business",
    "sales",
    "marketing",
    "agency",
    "consulting",
    "SaaS",
    "digitalnomad",
    "ecommerce",
    "growmybusiness",
    "b2b",
]

# Buying-intent keyword patterns — each hit adds 10 to lead_score
INTENT_PATTERNS = [
    r"\bneed.{0,25}(developer|agency|consultant|solution|platform|software|tool|engineer)\b",
    r"\blooking for.{0,25}(developer|agency|consultant|automation|integration|freelancer)\b",
    r"\bhiring.{0,25}(freelancer|agency|developer|consultant|contractor)\b",
    r"\brfp\b",
    r"\brequest for proposal\b",
    r"\bquote\b",
    r"\boutsorc\\w+\b",
    r"\b(scale|scaling|scaled)\b",
    r"\b(crm|erp|saas|api|integration|automation|pipeline)\b",
    r"\b(arr|mrr|revenue|churn|ltv|cac)\b",
    r"\bpain point\b",
    r"\b(recommend|suggestion|advice).{0,20}(tool|platform|software|service|stack)\b",
    r"\bstruggling with\b",
    r"\b(wasted?|losing?).{0,20}(hours?|time|money|revenue)\b",
    r"\bbudget.{0,20}(for|of|around|under|over)\b",
    r"\bhow do (you|we|i).{0,30}(automate|handle|manage|scale)\b",
]

COMPILED = [re.compile(p, re.IGNORECASE) for p in INTENT_PATTERNS]

POSTS_PER_SUB = 75     # hot + new combined
MIN_REDDIT_SCORE = 3   # filter noise
RECENCY_HOURS = 6      # posts younger than this get 2× multiplier


def kw_hits(text: str) -> int:
    return sum(1 for p in COMPILED if p.search(text))


def recency_multiplier(created_utc: float) -> float:
    age_h = (datetime.datetime.utcnow().timestamp() - created_utc) / 3600
    return 2.0 if age_h < RECENCY_HOURS else 1.0


def score_post(post) -> int:
    body    = (post.selftext or "").lower()
    title   = (post.title   or "").lower()
    hits    = kw_hits(title + " " + body)
    mult    = recency_multiplier(post.created_utc)
    return int((post.score + post.num_comments * 2 + hits * 10) * mult)


def scrape() -> list[dict]:
    reddit = praw.Reddit(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        user_agent=USER_AGENT,
        read_only=True,
    )

    leads     = []
    seen_ids  = set()
    scraped_at = datetime.datetime.utcnow().isoformat() + "Z"

    for sub_name in TARGETS:
        try:
            sub = reddit.subreddit(sub_name)
            streams = [sub.hot(limit=POSTS_PER_SUB), sub.new(limit=30)]
            for stream in streams:
                for post in stream:
                    if post.id in seen_ids:
                        continue
                    if post.stickied or post.score < MIN_REDDIT_SCORE:
                        continue

                    body    = post.selftext or ""
                    title   = post.title    or ""
                    hits    = kw_hits(title + " " + body)
                    if hits == 0:
                        continue

                    seen_ids.add(post.id)
                    ls = score_post(post)

                    leads.append({
                        "id":           post.id,
                        "title":        title.strip(),
                        "subreddit":    sub_name,
                        "url":          f"https://reddit.com{post.permalink}",
                        "score":        post.score,
                        "comments":     post.num_comments,
                        "kw_hits":      hits,
                        "lead_score":   ls,
                        "author":       str(post.author) if post.author else "[deleted]",
                        "preview":      (body[:400] + "…") if len(body) > 400 else body,
                        "created_utc":  datetime.datetime.utcfromtimestamp(
                                            post.created_utc
                                        ).isoformat() + "Z",
                        "scraped_at":   scraped_at,
                        "qualified":    ls >= THRESHOLD,
                    })

        except Exception as exc:
            print(f"[AlphaScout] r/{sub_name} error: {exc}", file=sys.stderr)

    leads.sort(key=lambda x: x["lead_score"], reverse=True)
    print(f"[AlphaScout] ✅ {len(leads)} leads found, "
          f"{sum(1 for l in leads if l['qualified'])} qualified (threshold={THRESHOLD})",
          file=sys.stderr)
    return leads


if __name__ == "__main__":
    results = scrape()
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"[AlphaScout] Written to {OUTPUT_PATH}")
