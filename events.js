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
     author    who made the board — credited on the card (and set
               meta.author in the event's config.js for the in-board credit)
     kind      "board" (a real game night) or "template" (a starting point);
               the gallery groups cards into sections by this
     cards     true → also link the printable team-cards.html page
     play      [index.html] the file the "Open" button links to inside the
               event folder — set for non-engine events
   ===================================================================== */
window.TRIVIA_EVENTS = [
  {
    slug: "2026-06-15-rvt-trivia",
    title: "RVT Trivia — June 2026",
    subtitle: "World Cup Edition · 5-category quiz board",
    date: "June 15, 2026",
    author: "Praveen Gupta",
    kind: "board",
    cards: true,
  },
  {
    slug: "demo",
    title: "Demo Board",
    subtitle: "The copy-me template — every field, fully commented",
    date: "Template",
    author: "Praveen Gupta",
    kind: "template",
    cards: true,
  },
];
