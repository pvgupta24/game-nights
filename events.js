/* =====================================================================
   game-nights · gallery manifest
   =====================================================================
   One entry per event. The root index.html renders a card for each.
   When you create a new event (copy events/demo → events/<slug>), add a
   line here so it shows up on the gallery.

   Fields:
     slug      folder name under events/  (REQUIRED)
     title     card heading
     subtitle  one line under the title
     date      free-form date/label shown as a chip
     cards     true → also link the printable team-cards.html page
     play      [index.html] the file the "Open" button links to inside the
               event folder — set for non-engine events (e.g. an exported deck)
   ===================================================================== */
window.TRIVIA_EVENTS = [
  {
    slug: "2026-06-15-rvt-trivia",
    title: "RVT Trivia — June 2026",
    subtitle: "World Cup Edition · 5-category Jeopardy board",
    date: "June 15, 2026",
    cards: true,
  },
  {
    slug: "demo",
    title: "Demo Board",
    subtitle: "The copy-me template — every field, fully commented",
    date: "Template",
    cards: true,
  },
  {
    slug: "2026-03-rvt-trivia",
    title: "RVT Music Trivia — March 2026",
    subtitle: "Music round (archived JeopardyLabs export)",
    date: "March 2026",
    cards: false,
  },
];
