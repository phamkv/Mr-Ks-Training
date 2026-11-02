---
date: 2026-10-26T09:00:51+00:00
git_commit: "n/a (not a git repository)"
branch: "n/a"
repository: pcogni
topic: "How daily cognitive training (brain game) apps are built, and the main challenges in building your own"
tags: [research, web-research, brain-training, cognitive-games, adaptive-difficulty, scoring, regulation, retention]
status: complete
---

# Research: How daily cognitive training apps are built, and what makes building your own hard

## Research Question
Look into how cognitive apps, where you do simple games daily to keep your brain fit, are done, and what the main challenges are when trying to build your own.

## Scope
- **Repository:** `pcogni` contains only `.claude/skills/` and no application code, so this is entirely web research.
- **Method:** four parallel research agents covered the market landscape, how the games are designed and built, the science and regulation, and practical challenges. Sources are cited inline.
- **Reliability:** many figures come from app store listings, vendor pages or secondary write-ups. They are flagged where known.

## Summary

Every app in the category follows the same blueprint:

1. **Lab tasks dressed as games.** Each mini-game is a reskinned cognitive psychology task. Speed Match is 1-back, Color Match is Stroop, Double Decision is the Useful Field of View test, Memory Matrix is Corsi/spatial span. Games are grouped into 5–7 domains: memory, attention, speed, flexibility, problem solving, math and language.
2. **Adaptive difficulty.** Each game runs a staircase that keeps the player near threshold, at roughly 70–90% correct.
3. **Scores normalized against the user base.** Raw scores (correct answers in a fixed time, or reaction time) are turned into percentiles by age band and mapped to a mean of 100 and SD of 15. They are then combined into a proprietary index such as Lumosity's LPI, Elevate's EPQ, Peak's Brain Score or BrainHQ's stars.
4. **A short daily workout.** 3–5 games taking 5–15 minutes, chosen to rotate domains and weighted toward weak areas.
5. **The same funnel and business model.** A free baseline test ("Fit Test") leads to a score compared with your age group, then a paywall and a 3–7 day trial, then a subscription of about $10–15 a month or $40–95 a year.
6. **Retention copied from Duolingo.** Streaks, streak freezes, leagues, daily quests, widgets and push notifications.
7. **Architecture.** A native app shell hosts dozens of game modules built in Unity, Cocos or HTML5. Lumosity reports "50+ live Unity, Cocos2d, and Cocos Creator games".

The main challenges in building your own are:

- **Engagement falls off quickly.** Health and fitness apps keep only about 3–8% of users at Day 30. Novelty wears off in 2–4 weeks, and a habit takes a median of 66 days to form.
- **The content treadmill.** Competitors ship 40–100+ games, and each polished mini-game costs weeks of work.
- **Practice effects.** Scores rise mostly because users learn the task, then plateau after a few sessions.
- **No norm data.** Without a large user base, percentile scores cannot be honest.
- **Reaction-time noise across devices.** Phone touch-to-display latency ranges from 35 to 140 ms, about the same size as the differences being measured.
- **Weak scientific support.** Far transfer is essentially null in meta-analyses, so claims like "get smarter" or "prevent dementia" are both scientifically weak and legally dangerous. Lumosity paid the FTC $2M in 2016. Claiming to detect or prevent disease turns the app into a regulated medical device under FDA rules and the EU MDR.
- **Hard economics.** The market is saturated, paid installs cost more than the first 60 days of revenue they bring in, and results are winner-take-most.

### Overview (no local code; key external references grouped by area)
```
Landscape (products)
├── Lumosity ......... 40+ games, Fit Test, LPI, Unity/Cocos/HTML5 modules in a native shell
├── Elevate .......... ~40 games, EPQ 0–5000, leagues and quests (Duolingo-style)
├── Peak ............. 45+ games, Brain Map, age and profession comparison
├── CogniFit ......... 100+ games, 22 sub-skills, a clinical assessment battery (CAB)
├── BrainHQ .......... 2-minute "bites", Double Decision (UFOV, ACTIVE trial), percentile stars
├── NeuroNation ...... a consumer app plus NeuroNation MED (German reimbursable app, DiGA)
├── Impulse .......... aggressive weekly subscriptions
└── Brain Age ........ one-off purchase, daily Brain Age Check (20–80)
Design and tech
├── Paradigms ........ n-back, Corsi, Stroop, flanker, go/no-go, UFOV, mental rotation, span, trail making
├── Adaptivity ....... Levitt staircases, QUEST/QUEST+/Psi, Elo/Glicko
├── Scoring .......... residualize or rank-normalize → N(100,15) → composite (Sternberg 2013, Hardy 2015)
├── Timing ........... Bridges 2020, Anwyl-Irvine 2021, touchscreen latency studies
└── Tooling .......... jsPsych, lab.js, PsychoJS, Phaser, Flame, RN Skia, Brain Workshop
Science and regulation
├── Evidence ......... Owen 2010, Melby-Lervåg 2016, Simons 2016, Sala 2019, Cochrane 2020, ACTIVE
└── Rules ............ FTC (Lumosity, LearningRx, Carrot), FDA wellness policy, EU MDR Rule 11,
                       Apple 1.4.1 / 5.1.3, Google Play health declaration, GDPR Art. 9, FTC HBNR
```

### How the pieces fit together
```
 Onboarding                Daily loop (5–15 min)                           Long-term
┌────────────┐  baseline  ┌──────────────────────────────────────┐       ┌─────────────────┐
│ Fit Test / │──────────▶ │ Workout generator                    │       │ Composite score │
│ placement  │            │  - rotate domains, no repeats per day│       │ (LPI/EPQ/stars) │
└────────────┘            │  - weight toward weak / high-gain    │       │ vs age-band     │
      │                   └──────────────┬───────────────────────┘       │ norms           │
      ▼                                  ▼ 3–5 games                     └────────▲────────┘
 score vs age group       ┌──────────────────────────────────────┐                │
      │                   │ Game = gamified lab task              │  raw score    │
      ▼                   │  trial: stimulus → response → feedback├──────────────▶┤
  paywall / trial         │  staircase keeps accuracy ~70–90%     │ percentile→N(100,15)
                          └──────────────┬───────────────────────┘
                                         ▼
                  Retention layer: streak, freezes, quests, leagues, push/CRM
```

## Detailed Findings

### 1. The product landscape: how incumbents structure their apps

**Lumosity (Lumos Labs)**
- **Domains:** speed, memory, attention, flexibility, problem solving, math and words. 40+ adaptive games. ([App Store](https://apps.apple.com/us/app/lumosity-brain-training/id577232024))
- **Example games:** Speed Match (match the previous card), Pinball Recall, Eagle Eye (peripheral flash), Color Match (Stroop), Pet Detective (planning), Memory Matrix, Raindrops. ([WPI analysis](https://web.cs.wpi.edu/~rich/courses/imgd4600-c15/analyses/lumosity/index.html))
- **Onboarding:** a 10-minute "Fit Test" sets a baseline compared with your age group.
- **Score:** the LPI, averaged across domains.
- **Daily workout:** about 5 games for premium users and about 3 for free users (third-party sources).
- **Retention:** lifecycle messaging through Braze, with streak-gated rewards. ([Braze case study](https://www.braze.com/customers/lumos-labs-case-study))
- **Tech history:** the games started in Flash and were rebuilt in HTML5. A job post describes "50+ live Unity, Cocos2d, and Cocos Creator games" embedded in a "host native application", with shared libraries and CI/CD for games. ([job post](https://hitmarker.net/jobs/lumos-labs-staff-games-engineer-726085))

**Elevate**
- About 40 games covering focus, memory, speed, math and language (Brevity, Processing, Retention).
- The daily set has 3–5 personalized games.
- The EPQ score runs 0–5,000 and also rewards consistency and variety. ([Internet Matters](https://internetmatters.org/advice/apps-and-platforms/skills-building/elevate))
- Late 2025 added Duolingo-style leagues (Bronze → Diamond), daily quests and coins for streak freezes. ([review](https://www.anuradhasridharan.com/2025/12/the-brain-training-app-that-i-love.html))
- Price: about $9.99 a month or $39.99 a year.

**Peak**
- 45+ games.
- A "Brain Map" compares you with others by age and profession.
- Themed workouts such as Coffee Break and Weakest Link.
- Advanced modules built with Cambridge (Sahakian) and UCL. ([App Store](https://apps.apple.com/us/app/peak-brain-training/id806223188))

**CogniFit**
- 100+ games covering 5 areas and 22–23 sub-skills, with a score from 0 to 100 and a "Brain Age".
- It also sells a separate clinical assessment battery (CAB), registered as an exempt cognitive assessment aid. ([GUDID](https://accessgudid.nlm.nih.gov/devices/00860009958104))

**BrainHQ (Posit Science)**
- 2-minute exercise "bites", each continuously adaptive.
- Stars from 1 to 5 show your percentile at each level; there are also age-matched percentiles and a heat-map of all exercises. ([BrainHQ](https://www.brainhq.com/why-brainhq/brain-training-your-way/understand-progress))
- The flagship Double Decision is the Useful Field of View task used in the ACTIVE trial.
- Price: $13.99 a month or $94.99 a year.

**NeuroNation**
- 30+ exercises, a placement test, and results shown on a normal-distribution chart.
- A separate **NeuroNation MED** app is reimbursable under Germany's DiGA scheme for prescribable digital health apps. ([App Store DE](https://apps.apple.com/DE/app/id821549680))

**Impulse**
- An aggressive subscription funnel: a 3-day trial, then $9.99 a week. ([App Store](https://apps.apple.com/us/app/1451295827))
- Reportedly uses fake "psych test" ad creatives on Facebook. ([Substack](https://felixbraberg.substack.com/p/impulse-brain-training-games-a-hyper-175))

**Nintendo Brain Age**
- 33M copies sold on DS, with handwriting and voice input.
- The Switch version's daily Brain Age Check uses 3 tests and gives a score from 20 to 80; only the first attempt each day is charted.
- Stamps for daily play unlock more activities.
- A one-off purchase. ([Wikipedia](https://en.wikipedia.org/wiki/Brain_Age), [review](https://miketendo64.com/2020/01/14/review-dr-kawashimas-brain-training-for-nintendo-switch-nintendo-switch/))

**Newer apps (2025–26)**
- Neura, Neuradle, Brain1 and Mindrush lean on daily challenges, leagues, widgets and Live Activities.
- There is a broader Wordle-style trend toward single-mechanic daily puzzles.

**Patterns across the category**
- 5–7 domains.
- 1–3 minute adaptive games.
- A baseline test, then a paywall.
- 3–5 games a day.
- A proprietary composite score, sometimes used to gate progression (Peak).
- Duolingo-style retention mechanics.
- Subscriptions (Nintendo is the exception).
- A native shell with embedded game modules.
- A consumer app alongside a separate regulated arm: NeuroNation MED, CogniFit CAB, Lumos Labs' ADHD therapeutic work.

### 2. Game design: source paradigms and how they are gamified

| Paradigm | What it measures | Typical gamified form |
|---|---|---|
| n-back (Kirchner 1958), dual n-back | working memory updating | Speed Match (1-back), Memory Match (2-back) |
| Corsi block-tapping (1972) | visuospatial span | Memory Matrix, tile recall |
| Stroop (1935) | inhibition / interference | Color Match |
| Eriksen flanker (1974) | selective attention | arrow and fish-school games |
| Go/no-go | response inhibition | tap except on targets you must not tap |
| Task switching | flexibility | switch the sorting rule mid-round |
| Useful Field of View (Ball & Roenker) | processing speed, divided attention | BrainHQ Double Decision, Lumosity Eagle Eye |
| Mental rotation (Shepard & Metzler 1971) | spatial reasoning | rotate-and-match puzzles |
| Digit span / trail making | span / sequencing and switching | number-sequence and connect-the-dots games |

Sources: [Sternberg et al. 2013](https://www.frontiersin.org/articles/10.3389/fnhum.2013.00292/full) maps Lumosity games to paradigms. Lumosity raw scores are mostly counts of correct answers under a time limit (for example 45 s), or a threshold.

**Does gamification help?** A systematic review found that gamified assessments usually validate well. Gamified training raises engagement, but its effects on performance are mixed. ([Lumsden et al. 2016, JMIR Serious Games](https://games.jmir.org/2016/2/e11))

### 3. Adaptive difficulty

**Levitt (1971) transformed up/down staircases.** The rule sets the accuracy the player converges to:

| Rule | Converges to |
|---|---|
| 1-up/1-down | 50% |
| 1-up/2-down | 70.7% |
| 1-up/3-down | 79.4% |
| 1-up/4-down | 84.1% |

So a target of about 80% means a 3-down/1-up rule. ([Levitt PDF](https://moodle2.units.it/pluginfile.php/553227/mod_resource/content/0/Levitt_1971_SCALA.pdf))

**What vendors use:**
- A Posit Science-style patent describes "3 correct → harder, 1 wrong → easier ≈ 80%". ([USPTO](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7186116))
- BrainHQ states a target of 70–90% correct. A clinical-trial protocol using it adapts after every trial to about 85% correct. ([protocol](https://cdn.clinicaltrials.gov/large-docs/38/NCT02664038/Prot_SAP_000.pdf))
- Lumosity's Memory Matrix uses a variant of 1-up/1-down. (Sternberg 2013)

**Bayesian methods:** QUEST, QUEST+ and Psi estimate threshold (and slope) with fewer trials. PsychoPy ships `StairHandler`, `QuestHandler`, `QuestPlusHandler`, `PsiHandler` and `MultiStairHandler`. ([PsychoPy API](https://psychopy.org/api/data.html))

**Elo/Glicko:** each answer is treated as a "match" between the user and an item, so both ratings update together. ([Pelánek 2016](https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf))
- It has been used in web-based cognitive rehabilitation tasks. ([JMIR 2021](https://medinform.jmir.org/2021/11/e28090))
- Ratings may not converge when items are chosen adaptively from those same ratings; the proposed fix is two parallel rating chains. ([Tilburg](https://research.tilburguniversity.edu/en/publications/keeping-elo-alive-evaluating-and-improving-measurement-properties/))
- No public evidence shows that Lumosity or BrainHQ use Elo.

**Session-level rule in open source:** Brain Workshop moves up a level after 3 consecutive sessions at 80% or above (immediately on 100%), and down after 3 sessions below 50%. ([GitHub](https://github.com/brain-workshop/brainworkshop))

### 4. Scoring and normalization

**[Sternberg et al. 2013](https://www.frontiersin.org/articles/10.3389/fnhum.2013.00292/full)** (Lumosity's own researchers) analysed more than 600M task results from about 36M users and used two methods:
- Residualize raw scores against age (polynomial up to 4th degree), education and gender.
- Build a scaling table by inverse rank normalization, mapping percentiles to N(100, 15).

It **does not** describe the LPI.

**[Hardy et al. 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0134467)** gives the closest published composite:
1. Reverse-code tests where lower is better.
2. Percentile-rank normalize each test within 5-year age bins.
3. Map the result to N(100, 15).
4. Sum the scores and normalize the sum again to get the "Grand Index".

The LPI likely follows the same pattern, but no official formula is public (an inference).

**BrainHQ** uses percentile stars per level, an overall percentile against users who gave their age, and baseline and best scores, often in milliseconds.

### 5. Measuring reaction time on web and mobile

**Browser experiment software**
- [Bridges et al. 2020 (PeerJ)](https://peerj.com/articles/9414) measured timing with hardware. Lab software achieved under 1 ms. Online, PsychoJS kept RT standard deviation under 3.5 ms across browsers and OSes; jsPsych and lab.js were mostly under 10 ms. macOS was the weakest platform for visual timing.
- [Anwyl-Irvine et al. 2021](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8367876/) found "no single platform stands out" and timing reasonable overall.
- jsPsych's own documentation says 1–2 frames of error (17–33 ms) and RTs about 10–40 ms longer than lab software. ([jsPsych](https://www.jspsych.org/latest/overview/timing-accuracy/))

**Touchscreens and phones**
- Total display-plus-touch latency is 35–140 ms across 26 phones. ([PubMed 35953659](https://pubmed.ncbi.nlm.nih.gov/35953659/))
- Android phone users score significantly slower than laptop or desktop users. ([PubMed 33954913](https://pubmed.ncbi.nlm.nih.gov/33954913/))
- iOS versions of a psychomotor vigilance test overestimated RT by 29.6–48.6%. ([DCU](https://doras.dcu.ie/27535))
- Touches register about 70 ms after contact. A constant offset can be calibrated away; it is the variability that limits precision. ([NASA](https://ntrs.nasa.gov/api/citations/20160000581/downloads/20160000581.pdf))

**Browser timer:** `performance.now()` is coarsened to 100 µs in Chrome, or 5 µs with cross-origin isolation (COOP/COEP headers). Other browsers may coarsen to about 1 ms. ([Chrome](https://developer.chrome.com/blog/cross-origin-isolated-hr-timers))

**Implications from the sources:**
- Prefer within-person contrasts (for example, Stroop incongruent minus congruent) over absolute milliseconds.
- Log the device.
- Don't compare RT across devices without calibration.

### 6. Daily workout generation and scheduling

**Lumosity** is the only vendor with a published algorithm description ([Hardy et al. 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0134467)):
- 5 tasks per session, about 15 minutes.
- Balanced "in clusters across days without repeating individual tasks on a given day".
- A target of 5 days a week for 10 weeks.

**BrainHQ:** the "Personal Trainer" picks exercises from your history that are predicted to give the most gain. This description comes from search-result text only.

**Spacing:** no commercial app was found using spaced repetition.
- A meta-analysis in older adults favoured fewer than 3 sessions a week. ([Frontiers 2023](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1165275/pdf))
- Penner et al. 2012 found 2 sessions a week beat 4.

### 7. Open-source tools and existing implementations

**Experiment frameworks** (with validated timing):
- [jsPsych](https://joss.theoj.org/papers/10.21105/joss.05351), which has a Corsi plugin in jspsych-contrib
- lab.js
- PsychoPy/PsychoJS

**Game engines:**
- Phaser 3 (HTML5, WebGL)
- Flutter Flame
- React Native Skia
- Unity and Cocos (Lumosity's choice)

**Existing tasks and apps:**
- [Brain Workshop](https://github.com/brain-workshop/brainworkshop): Python, GPL-2.0, dual n-back. Largely unmaintained since about 2015.
- [tmlbl/nback](https://github.com/tmlbl/nback): a JavaScript dual n-back.
- jsPsych Stroop, flanker and Simon tasks.

### 8. The science: does daily brain training work?

**Trained-task improvement is reliable; far transfer is not**
- [Owen et al. 2010, *Nature*](https://pmc.ncbi.nlm.nih.gov/articles/PMC2884087): 11,430 participants over 6 weeks. Trained tasks improved, but there was no transfer, even to closely related tasks (effect sizes 0.01–0.22).
- [Melby-Lervåg et al. 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4968033): 87 publications. Working memory training produced near-transfer gains but no far transfer against active controls.
- [Simons et al. 2016, PSPI](https://www.psychologicalscience.org/publications/brain-training.html): about 130 studies. Strong evidence for gains on the trained tasks, less for related tasks, little for everyday cognition. Most studies had major design flaws, including every study the companies cited.
- [Sala et al. 2019](https://pure.fujita-hu.ac.jp/en/publications/near-and-far-transfer-in-cognitive-training-a-second-order-meta-a/) (second-order meta-analysis) and [Gobet & Sala 2022](https://researchonline.lse.ac.uk/id/eprint/113888): far transfer is essentially zero once placebo effects and publication bias are controlled.

**The 2014 dispute**
- The [Stanford/Max Planck consensus letter](https://longevity.stanford.edu/a-consensus-on-the-brain-training-industry-from-the-scientific-community/) (70+ signatories) was skeptical.
- A counter-letter led by Merzenich (133 signatories) cited 132 studies. Some researchers signed both. ([Chronicle](https://www.chronicle.com/blogs/wiredcampus/do-brain-training-games-work-it-depends-on-which-scientists-you-ask))

**Cochrane review 2020:** computerised training may give a small short-term gain in global cognition for healthy older adults, but nothing at 12 months, and the evidence quality is low. ([Cochrane CD012277](https://www.cochrane.org/zh-hant/evidence/CD012277_computerised-cognitive-training-maintaining-cognitive-function-cognitively-healthy-people-late-life))

**ACTIVE trial: the notable exception**
- Design: about 2,800 adults aged 65 and over. Sources give 2,802 or 2,832.
- At 10 years, speed-of-processing (UFOV) training was linked to about 29% lower dementia risk. The press reported about 8% lower risk per additional session. ([ScienceDaily](https://www.sciencedaily.com/releases/2017/11/171116104955.htm))
- At 20 years (February 2026), only speed training *with booster sessions* showed a benefit: hazard ratio 0.75 (95% CI 0.59–0.95), from Medicare claims for 2,021 participants. ([UF Health](https://ufhealth.org/news/2026/decades-later-brain-training-lowers-dementia-risk))
- Memory and reasoning training showed no effect at either point.
- The result is specific to this training format. BrainHQ sells the exercise, so it has a stake in promoting the result.

**Akili's EndeavorRx:** FDA-authorized in 2020, but the company abandoned the prescription model and was sold for about $34M in 2024, after a valuation of roughly $1B. ([STAT](https://www.statnews.com/2024/05/29/virtual-therapeutics-acquire-akili-video-games-adhd/)) This shows that even regulatory approval does not guarantee commercial success.

### 9. Regulation and legal constraints

**FTC (US)**
- **Lumos Labs (2016):** $2M for unsupported claims about work and school performance and age-related decline, plus testimonials that were solicited through prize contests without disclosure. ([FTC](https://ftc.gov/news-events/press-releases/2016/01/lumosity-pay-2-million-settle-ftc-deceptive-advertising-charges))
- **LearningRx (2016):** claims about ADHD, autism and Alzheimer's; future claims require RCTs. ([FTC](https://www.ftc.gov/news-events/press-releases/2016/05/marketers-one-one-brain-training-programs-settle-ftc-charges))
- **Carrot Neurotechnology (2015):** claims to improve vision, using research by its own chief scientist without disclosing the connection.
- **2022 Health Products Compliance Guidance:** substantiation generally means RCTs, and hedges like "may help" don't cure an unsupported claim.
- **Amended Health Breach Notification Rule (2024):** now covers non-HIPAA health apps; sharing health data without authorization counts as a breach. ([WSGR](https://wsgr.com/en/insights/ftc-final-rule-officially-broadens-health-breach-notification-rule-targets-health-and-wellness-apps.html))

**FDA (US)**
- The General Wellness policy (revised January 2026) means FDA does not actively regulate low-risk wellness products.
- Claims to diagnose, treat, prevent or detect disease make the app Software as a Medical Device (SaMD), which needs clearance. EndeavorRx went through the De Novo route. ([K&S](https://www.kslaw.com/insights/articles/fda-updates-general-wellness-and-clinical-decision-support-guidance-documents))

**EU MDR**
- Classification depends on intended purpose; well-being software is not a device.
- "Prediction" and "prognosis" count as medical purposes, so a dementia risk score would make the app a device.
- Under Rule 11, such software is typically Class IIa or higher, which needs a notified body. ([Johner](https://blog.johner-institute.com/regulatory-affairs/mdr-rule-11/))

**App stores**
- Apple 1.4.1: medical-accuracy claims need disclosed data and methodology.
- Apple 5.1.3: no use of health data for advertising or data mining.
- Google Play: every app must complete the Health apps declaration. ([Apple](https://developer.apple.com/app-store/review/guidelines/), [Google](https://support.google.com/googleplay/android-developer/answer/14738291))

**GDPR**
- Cognitive scores tied to a person, especially over time or alongside age, are likely special-category health data under Art. 9, which needs explicit consent. This is an inference: no source addresses cognitive scores directly.

**Marketing wording**

| Lower risk | High risk |
|---|---|
| "fun daily puzzles" | "clinically proven" |
| "challenge yourself" | "boost IQ / memory / focus / work performance" |
| "track your scores on these games" | "prevent or delay dementia" |
| | anything about ADHD, autism, concussion or stroke |
| | "detects cognitive decline" or risk scores |

### 10. Practical challenges in building your own

1. **Retention collapses.**
   - Health and fitness apps keep about 3–8% of users at Day 30. ([Business of Apps](https://businessofapps.com/data/health-fitness-app-benchmarks), [Braze](https://www.braze.com/resources/articles/mobile-app-retention.md))
   - Use drops after 2–4 weeks as novelty wears off. ([JMIR MH 2022](https://mental.jmir.org/2022/8/e33545))
   - A habit takes a median of 66 days, with a range of 18–254. ([UCL/Lally 2010](https://www.ucl.ac.uk/news/2009/aug/how-long-does-it-take-form-habit))
   - Duolingo's streak experiments produced single-digit percentage lifts measured on millions of users. A small app cannot detect effects that size. ([Duolingo blog](https://blog.duolingo.com/improving-the-streak))
   - Rigid streaks can also cause anxiety and drop-off once broken (practitioner reports, not peer-reviewed).
2. **The content treadmill.**
   - Competitors ship 40–100+ games.
   - Agency estimates for one polished hyper-casual game are $15k–40k and 6–10 weeks. ([StudioKrew](https://studiokrew.com/blog/mobile-game-development-cost/), likely inflated)
   - Art, sound and "juice" (screen shake, particles, haptics) are the hidden cost.
3. **The plateau problem.**
   - Retest gains plateau after about the third administration. ([Scharfen et al. 2018](https://www.Gwern.net/doc/iq/2018-scharfen.pdf))
   - Practice effects are large. ([Calamia et al. 2012](https://repository.lsu.edu/psychology_pubs/84))
   - So early score rises are mostly task learning, and once the score flattens, motivation drops.
4. **No norm data (cold start).** Lumosity's norms rest on 35M+ users. An indie app cannot honestly say "better than X% of people your age" at launch. The alternatives are personal baselines or published lab norms.
5. **Reaction-time noise across devices** (section 5). It confounds both comparisons with other people and a single user's history across their own devices.
6. **Validity and legal exposure** (sections 8 and 9).
7. **Saturated market and poor unit economics.**
   - RevenueCat 2025: median revenue per install after 60 days is $0.63 for Health & Fitness, and about 30% of annual subscriptions are cancelled in month 1. ([RevenueCat](https://www.revenuecat.com/blog/company/the-state-of-subscription-apps-2025-launch.md))
   - Hard paywalls convert 10.7% of installs by Day 35, against 2.1% for freemium. ([SaaStr summary](https://saastr.com/the-top-10-learnings-from-revenuecats-state-of-subscription-apps-how-115000-mobile-apps-deliver-16b-in-revenue-whats-working-whats-quietly-killing-growth))
   - A paid install costs about $1–2+ globally and more in the US and UK, so paid acquisition loses money unless lifetime value is well above average.
   - Only about 5% of Health & Fitness apps reach $10k in their first two years. ([AthleTech](https://athletechnews.com/fitness-apps-monetizable-winner-take-all-or-most/))
8. **Accessibility.**
   - Colour blindness affects about 1 in 12 men, which breaks Stroop and colour-match games that rely on colour alone.
   - Older adults are a core audience: 44% of Americans 50+ game monthly ([AARP](https://www.aarp.org/research/topics/technology/info-2019/2020-gaming-trends-older-americans/)), and they need large, well-spaced targets.
   - WCAG 2.5.8 sets a minimum target size of 24×24 CSS px.
   - WCAG 2.2.1 (Timing Adjustable) conflicts with speed games, so untimed or slower modes are needed.
9. **Privacy.** FTC breach-notification exposure, and Apple's ban on using health data for ads, make third-party analytics and ad SDKs risky.
10. **What builders report.**
    - No substantive postmortem was found.
    - "Show HN" brain-training launches (2024–26) got 1–2 points and no comments.
    - The Reflex: Brain Reaction developer reports that it took 2 years, cross-device performance was hard, and building the n-back game meant reading papers. ([dev.to](https://dev.to/reflex/from-idea-to-app-store-my-two-year-journey-creating-reflex-brain-reaction-1fkp))
    - Hobby projects like Brain Workshop tend to go unmaintained.

## Code References
None: the `pcogni` repository contains no application code (only `.claude/skills/rpi-*`).

## Architecture Documentation (patterns observed across the industry)
- **Game as a module:** each mini-game is a self-contained, independently shippable module inside a native host app (Lumosity: Unity, Cocos, HTML5). Shared libraries supply common timing, input, scoring and telemetry.
- **Trial loop:** stimulus → response (timestamped) → feedback → staircase update. Rounds last a fixed time (about 45 s to 2 min).
- **Two kinds of adaptivity:** within a session, a per-trial staircase (accuracy target 70–90%); across sessions, level progression with a baseline and "beat your best".
- **Scoring pipeline:** raw count or RT → reverse-code if needed → percentile within an age band against a reference dataset → N(100, 15) → aggregate by domain → composite index.
- **Workout generator:** choose N games, balance domains across days, avoid repeats within a day, weight toward weak areas or recent gains.
- **Retention layer:** streaks, freezes, quests and currency, leagues, push or CRM (Braze), widgets.
- **Business layer:** baseline assessment, then a score against age-group norms, then paywall and trial, then subscription. A separate regulated product line where there is clinical evidence.

## Open Questions
- The LPI, EPQ and Peak Brain Score formulas are not public. The only published scoring methods are Sternberg 2013 and Hardy 2015.
- Vendors do not publish their workout-selection algorithms; BrainHQ's Personal Trainer description comes only from search snippets.
- No public evidence shows Elo or Glicko in major apps.
- The ACTIVE 20-year paper's DOI and authors could not be retrieved. Sample sizes differ between sources (2,802 vs 2,832).
- The FDA wellness guidance (January 2026) and the FTC 2022 guidance were read through law-firm summaries, not the full text.
- No first-hand indie postmortem was found, and no reliable 2025 data on how many App Store downloads come from search.
- The game engines behind Peak and Elevate are unconfirmed.
