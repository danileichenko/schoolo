---
status: Draft
owner: Volodymyr Danileichenko
updated_at: 2026-10-02
depth: hard
---

# Idea brief — schoolo

## 1. Raw idea

Smart School app (web / iOS / Android). Student profile (...maybe diary), schadule, food menu, homework, teachers feedbacks, grades, communication (chat with teachers), AI features - summary, trends, tips, motivation.

## 2. Problem

Schools already run a mandatory digital journal or LMS, but students rarely treat it as their daily hub—experience is admin-centric, fragmented, and easy to ignore. A full cutover only works if teachers enter grades, homework, and feedback in one official place; when even a minority keep using the old system or paper, students see stale or missing data and stop trusting the app. The cost of a failed mandatory rollout is collapsed student usage and a reputational hit with both the school and families before any “smart” layer can matter.

## 3. Users

**Students (primary)** — daily sufferers of scattered homework, schedule, grades, and teacher messages; they need one mobile-first place they actually open.

**Teachers** — must publish homework, grades, and feedback reliably; if the product adds burden without replacing the old workflow, they become the bottleneck.

**School administration** — buys and mandates rollout; cares about replacing the existing LMS, compliance, and audit-friendly communication.

**Parents (secondary, monetization)** — expected in many markets to see progress; premium AI summaries are a later revenue angle, not the v1 daily actor for the student-first wedge.

## 4. Why now

No single external trigger was named in the interview—the driver is strategic: position **schoolo** as the student-facing replacement for an incumbent school LMS, sold as a mandatory whole-school switch rather than an optional side app. Timing is tied to willingness to run a high-intensity pilot (big-bang replace) to win a reference school, not to a stated contract or regulatory deadline.

## 5. Out of scope

- **Food menu in v1** — canteen or vendor integrations are a separate ops feed; v1 focuses on journal core, not cafeteria ERP.
- **Diary as a separate product pillar in v1** — optional later; day view may overlap schedule plus homework without committing to a full “diary” module now.
- **Open messenger-style DM with teachers** — v1 uses structured async threads (homework or class tied, hours, moderation), not WhatsApp-like 1:1 chat.
- **AI as authoritative on grades** — summaries, trends, tips, and motivation are assistant-only; school and product share guardrails; AI does not change official grades.
- **Read-only parent portal in v1** — interview chose parent **premium** with AI as the parent story; a free parent mirror was explicitly not the v1 path (deal risk in some schools remains open).

## 6. Risks

- **Assumes near-total teacher compliance from day one; false if ~30% dual-enter or slack** — incomplete data collapses student trust (agreed in interview); AI summaries then mislead and accelerate churn.
- **Big-bang full replace on the first pilot** — highest coherence for sales, highest simultaneous failure surface (training, parity, teacher revolt) versus a phased cutover.
- **Parent premium plus student-first v1** — adds monetization, child-data consent, and school expectations for parent visibility while v1 de-scopes food and optional diary.
- **Mandatory school sale without naming the incumbent** — migration parity and integration work are unknown until a specific LMS is chosen.
- **Three-surface delivery (iOS, Android, teacher web)** — pilot commits to mobile-first students and web for teachers/admin; equal three-platform parity from day one was rejected as too costly during migration.

## 7. Recommendation

Build **schoolo** as a **school-mandatory LMS replacement**: student **iOS/Android** for schedule, homework, grades, teacher feedback, and **structured async** teacher communication; **web** for teachers and admins as the write path. Ship **v1 core only** (no food menu; diary deferred), with **AI as a non-authoritative assistant** (school plus product liability posture). Run the first pilot as **big-bang full replace**, and judge it by **~80% on-time teacher data entry** and **~60% student weekly actives**—the metrics that match the “trust collapses on bad data” insight. Treat **parent premium with AI progress views** as the parent strategy, and resolve school demands for a free parent mirror before signing mandatory deals.

## 8. Open questions

- **Which incumbent LMS(s) must the first pilot replace?** — owner: product / founder (blocks parity checklist and migration plan).
- **Parent premium in pilot vs after teacher compliance is proven?** — owner: product (tension with v1 core-only and no parent login).
- **Is “diary” a distinct UX or the same as schedule + homework day view?** — owner: product / design.
- **Geography and child-data rules for chat archives and parent AI?** — owner: founder / legal (not discussed in interview).
