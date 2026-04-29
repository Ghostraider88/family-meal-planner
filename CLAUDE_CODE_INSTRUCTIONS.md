# FamilyMealPlanner — Claude Code Implementation Instructions
# Optimized for Claude Sonnet — Work in phases, commit after each

---

## GOAL
Build a full-stack FamilyMealPlanner web app that **exactly matches** the provided HTML prototype
(`FamilyMealPlanner.html`) in layout, spacing, color, typography, and interactions.
Do NOT deviate from the design — treat the prototype as pixel-level spec.

---

## TECH STACK
```
Frontend:  React 18 + Vite + CSS Modules (no Tailwind)
Backend:   Node.js + Express
Database:  PostgreSQL
Auth:      JWT + bcrypt
Realtime:  Socket.io (shopping list sync)
Deploy:    Docker + docker-compose
Proxy:     HAProxy (external — not your concern)
```

---

## DESIGN SYSTEM — EXACT TOKENS (copy verbatim into tokens.css)

```css
:root {
  /* Green scale */
  --green-50:   #f0faf4;
  --green-100:  #d6f2e0;
  --green-200:  #a8e0bc;
  --green-400:  #52b87a;
  --green-500:  #38a05e;
  --green-600:  #2d8a4e;
  --green-700:  #1f6337;

  /* Orange scale */
  --orange-50:  #fff7ed;
  --orange-100: #ffe4c4;
  --orange-300: #ffa94d;
  --orange-400: #ff8c2a;
  --orange-500: #f27108;

  /* Neutral / cream */
  --cream-50:   #fdfaf5;
  --cream-100:  #f6f0e4;
  --cream-200:  #ede4d3;
  --neutral-0:   #ffffff;
  --neutral-50:  #f9f9f8;
  --neutral-100: #f0efec;
  --neutral-200: #e3e1db;
  --neutral-400: #a8a49c;
  --neutral-600: #6b6760;
  --neutral-800: #2e2b26;
  --neutral-900: #1a1814;

  /* Semantic */
  --bg:           var(--cream-50);
  --bg-card:      var(--neutral-0);
  --bg-subtle:    var(--neutral-50);
  --bg-muted:     var(--neutral-100);
  --fg:           var(--neutral-900);
  --fg-muted:     var(--neutral-600);
  --fg-subtle:    var(--neutral-400);
  --primary:      var(--green-500);
  --primary-dark: var(--green-600);
  --primary-bg:   var(--green-50);
  --primary-light:var(--green-100);
  --accent:       var(--orange-400);
  --accent-bg:    var(--orange-50);
  --border:       var(--neutral-200);
  --border-focus: var(--green-400);
  --danger:       #e5383b;

  /* Typography */
  --font-display: 'Syne', sans-serif;       /* Google Fonts */
  --font-body:    'DM Sans', sans-serif;    /* Google Fonts */

  /* Radii */
  --r-sm:   6px;
  --r-md:   10px;
  --r-lg:   16px;
  --r-xl:   22px;
  --r-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.06);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.05);

  /* Spacing (8px grid) */
  --s1: 4px;  --s2: 8px;  --s3: 12px; --s4: 16px;
  --s5: 20px; --s6: 24px; --s8: 32px; --s10: 40px;
}
```

**Fonts — add to index.html head:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
```

---

## APP SHELL LAYOUT

### Mobile (< 768px)
```
┌─────────────────────────┐  height: 60px
│  HEADER                 │  bg: white, border-bottom: 1px solid --border
├─────────────────────────┤
│                         │  flex: 1, overflow-y: auto
│  SCREEN CONTENT         │  padding: 20px, gap: 20px between sections
│                         │
├─────────────────────────┤
│  BOTTOM NAV (4 items)   │  height: 68px, bg: white, border-top
└─────────────────────────┘
```

### Desktop (≥ 768px)
```
┌─────────────────────────────────────┐  height: 60px
│  HEADER (full width)                │
├────────┬────────────────────────────┤
│        │                            │
│SIDEBAR │   SCREEN CONTENT           │  flex: 1, overflow-y: auto
│ 72px   │   max-width: 680px         │
│        │   padding: 32px            │
└────────┴────────────────────────────┘
```

---

## HEADER SPEC
```
height: 60px
padding: 0 20px
background: white
border-bottom: 1px solid var(--border)
display: flex, align-items: center, justify-content: space-between

LEFT — Logo:
  - Green square 32×32px, border-radius: var(--r-md), background: var(--primary)
  - Emoji "🥘" centered inside (font-size: 18px)
  - Text: "Family" + "Meal" (color: var(--primary)) + "Planner" — font: Syne 700 18px

RIGHT — Actions:
  - Search icon button 36×36, bg: var(--bg-muted), radius: var(--r-md)
  - Bell icon button 36×36 (same)
  - Avatar circle 36×36, radius: 50%, bg: var(--green-50), border: 2px solid var(--green-100)
    text: user initials, font: DM Sans 600 14px, color: var(--green-700)
```

---

## BOTTOM NAV SPEC (mobile)
```
4 items: Start(🏠) · Planer(📅) · Rezepte(🍳) · Einkauf(🛒)

Each nav-item:
  flex: 1
  display: flex, flex-direction: column, align-items: center, gap: 3px
  padding: 12px 4px
  font: DM Sans 500 10px, letter-spacing: 0.3px
  color: var(--fg-subtle) default, var(--primary) when active

Active indicator:
  position: absolute, top: 0, left: 25%, right: 25%
  height: 2px, background: var(--primary)
  border-radius: 0 0 6px 6px
  transform: scaleX(0) → scaleX(1) when active

Nav icon wrapper:
  32×28px, border-radius: var(--r-sm)
  background: var(--green-50) when active, transparent default
  font-size: 22px emoji
```

### Sidebar (desktop ≥ 768px)
```
width: 72px
border-right: 1px solid var(--border)
padding: 12px 0

Same 4 nav items, vertical layout
Active: 3px right border, color: var(--primary)
```

---

## SCREEN: DASHBOARD

### Greeting Block
```
<h1> "Guten Abend 👋"
  font: Syne 700 26px, color: var(--fg), line-height: 1.2
<p> "KW 18 · 28. Apr – 4. Mai 2026"
  font: DM Sans 400 13px, color: var(--fg-muted)
```

### Today Strip (hero card)
```
background: linear-gradient(135deg, var(--green-600) 0%, var(--green-400) 100%)
border-radius: var(--r-lg)
padding: 16px 20px
color: white

Title: "Heute · [Wochentag, Datum]"
  font: Syne 700 15px, opacity: 0.9, margin-bottom: 12px

Each meal item:
  display: flex, align-items: center, gap: 12px
  padding: 8px 12px
  background: rgba(255,255,255,0.15)
  border-radius: var(--r-md)

  - Type label: DM Sans 600 11px uppercase, opacity 0.8, min-width: 70px
  - Meal name: DM Sans 500 14px, flex: 1
```

### Quick Actions Grid
```
2 columns mobile, 4 columns desktop (≥ 768px)
gap: 12px

Each action card:
  background: white
  border: 1px solid var(--border)
  border-radius: var(--r-lg)
  padding: 16px
  display: flex, flex-direction: column, gap: 8px
  cursor: pointer
  transition: box-shadow 0.15s, transform 0.15s

  hover: box-shadow var(--shadow-sm), translateY(-1px)
  active: scale(0.98)

  Icon wrapper 40×40, border-radius: var(--r-md):
    Planer:       background: var(--green-50)
    Rezepte:      background: var(--orange-50)
    Einkaufsliste:background: #eef4ff
    Importieren:  background: #f3eeff

  Label: DM Sans 600 13px, color: var(--fg)
  Count: DM Sans 400 11px, color: var(--fg-subtle)
```

### Week Overview List
```
Section header: "Diese Woche" (Syne 700 18px) + "Alle →" link (DM Sans 600 13px, color: var(--primary))

Each day row:
  background: white
  border: 1px solid var(--border)
  border-radius: var(--r-lg)
  padding: 12px 16px
  display: grid, grid-template-columns: 60px 1fr
  gap: 12px, align-items: center

  Left — day info:
    Day name: DM Sans 700 14px
    Date: DM Sans 400 11px, color: var(--fg-subtle)

  Right — meal preview:
    Each planned meal: flex row, gap: 8px
      Colored dot 6×6px, border-radius: 50%
        dinner → #6b9fff, snack → var(--accent), default → var(--primary)
      Meal name: DM Sans 400 12px, color: var(--fg-muted)
    If no meals: "Keine Mahlzeiten" italic 12px var(--fg-subtle)
```

---

## SCREEN: WEEK PLANNER

### Week Nav Bar
```
display: flex, align-items: center, justify-content: space-between
background: white, border: 1px solid var(--border), border-radius: var(--r-lg)
padding: 10px 16px

Prev/Next buttons:
  32×32px, border-radius: var(--r-md), background: var(--bg-muted)
  border: none, color: var(--fg-muted), font-size: 16px
  hover: background var(--green-50), color var(--primary)

Label: Syne 700 15px center
```

### Day Block (×7)
```
background: white
border: 1px solid var(--border)
border-radius: var(--r-lg)
overflow: hidden
margin-bottom: 12px

Header:
  padding: 12px 16px
  background: var(--bg-subtle)
  border-bottom: 1px solid var(--border)
  flex row, justify-content: space-between
  Day name: DM Sans 700 14px
  Date: DM Sans 400 12px, color: var(--fg-subtle)

4 Meal Slots (Frühstück, Mittagessen, Vesper, Abendessen):
  display: flex, align-items: center, gap: 12px
  padding: 12px 16px
  border-bottom: 1px solid var(--border) (except last)
  min-height: 52px
  cursor: pointer
  hover: background var(--bg-subtle)
  transition: background 0.15s

  Icon 32×32, border-radius: var(--r-sm):
    Frühstück:   background var(--orange-50), emoji 🥣
    Mittagessen: background var(--green-50),  emoji 🍽️
    Vesper:      background #fff0f6,           emoji 🥪
    Abendessen:  background #eef4ff,           emoji 🌙

  Type label: DM Sans 600 10px uppercase, letter-spacing: 0.4px, color: var(--fg-subtle)
  Meal name:  DM Sans 500 14px, color: var(--fg) — OR italic 13px var(--fg-subtle) if empty

  Add button (right):
    24×24, border-radius: var(--r-full), background: var(--bg-muted)
    color: var(--fg-subtle), font-size: 16px
    slot:hover → background var(--green-50), color var(--primary)
    If filled: show "✎" (edit) instead of "+"
```

---

## SCREEN: MEAL EDITOR

Triggered when tapping a meal slot.

```
Back button: "← Zurück" DM Sans 600 14px, color: var(--fg-muted)

Hero card:
  background: white, border: 1px solid var(--border), border-radius: var(--r-lg)
  padding: 16px 20px, text-align: center
  Meal emoji (28px), Meal type title (Syne 700 17px), Date (DM Sans 400 13px muted)

Section card — "📚 Aus dem Kochbuch wählen":
  Each recipe row:
    padding: 12px 16px, border-bottom: 1px solid var(--border)
    flex row, align-items: center, gap: 12px
    hover: background var(--bg-subtle)
    - Emoji 22px
    - Name: DM Sans 600 14px
    - Meta: DM Sans 400 12px muted "⏱ X Min · 👥 X Port."
    - Arrow: › color var(--fg-subtle)

Divider: "oder eigener Eintrag"
  line left/right via flex + pseudo-elements, text DM Sans 600 12px var(--fg-subtle)

Section card — Free entry:
  Text input: form-input style (see below)
  People selector (radio-style):
    Alle / Kinder / Erwachsene
    Each option: flex row, padding 12px 16px, background var(--bg-muted), border-radius var(--r-md)
    Selected: background var(--green-50), border: 1.5px solid var(--green-100)
    Circle check: 20×20, border-radius 50%, selected fills with var(--primary)

Actions: Cancel (btn-secondary) + Save (btn-primary), flex row, gap 8px
```

---

## SCREEN: RECIPES

### Import Banner
```
background: linear-gradient(135deg, #2e2b26 0%, #1a1814 100%)  ← neutral-800 to neutral-900
border-radius: var(--r-lg)
padding: 16px 20px
display: flex, align-items: center, justify-content: space-between, gap: 16px

Left:
  Title: "🌐 Rezept importieren" Syne 700 14px white
  Sub: "Hello Fresh · Chefkoch · REWE · und mehr" DM Sans 400 12px rgba(255,255,255,0.6)

Right:
  "URL" button — btn-primary btn-sm (small green button)
```

### Search Input
```
width: 100%
padding: 10px 12px 10px 38px  ← 38px left for icon
border: 1.5px solid var(--border)
border-radius: var(--r-md)
background: white
font: DM Sans 400 15px

focus:
  border-color: var(--green-400)
  box-shadow: 0 0 0 3px rgba(56,160,94,0.12)
```

### Filter Bar (horizontal scroll, no scrollbar)
```
Chips: padding 6px 14px, border-radius: var(--r-full), border: 1.5px solid var(--border)
Default: bg white, color var(--fg-muted)
Active:  bg var(--primary), border-color var(--primary), color white
```

### Recipe Card List
```
Each card:
  background: white, border: 1px solid var(--border), border-radius: var(--r-lg)
  display: flex, align-items: center, gap: 12px, padding: 12px 16px
  cursor: pointer
  hover: box-shadow var(--shadow-sm), translateX(2px)

  Thumb: 56×56, border-radius: var(--r-md), background: var(--bg-muted), emoji 28px centered
  
  Info (flex:1):
    Name: DM Sans 600 15px, white-space: nowrap, overflow: hidden, text-overflow: ellipsis
    Meta row: gap 12px, font 12px color var(--fg-subtle)
      items: "⏱ X Min", "👥 X", "📊 Difficulty"
    Tags: flex wrap, gap 4px
      Each tag: padding 2px 8px, border-radius: var(--r-full), bg var(--green-50), color var(--green-600), font 11px 500

  Arrow: › 16px, color var(--fg-subtle), flex-shrink: 0

Desktop ≥ 1024px: 2-column grid
```

---

## SCREEN: RECIPE DETAIL

```
Back button: top, "← Zurück"

Hero card (centered):
  bg white, border, border-radius: var(--r-xl), padding: 24px 20px, text-align: center
  Emoji: 72px
  Title: Syne 700 22px
  Stats row (3 items, justify-content: center, gap: 24px):
    Each: value (Syne 700 20px, color var(--primary)) + label (DM Sans 500 11px muted)
  Tags: flex center, gap 6px
    chip-green: bg var(--green-50), color var(--green-600)
    chip-muted: bg var(--neutral-100), color var(--neutral-600)

Ingredients section card:
  Header: "🧺 Zutaten" Syne 700 14px, bg var(--bg-subtle), padding 12px 16px, border-bottom
  Each ingredient row:
    flex, align-items: center, gap: 12px, padding: 12px 16px, border-bottom
    hover: background var(--bg-subtle)
    checked: opacity 0.5, name has text-decoration: line-through

    Checkbox 20×20, border-radius var(--r-sm), border 2px var(--border)
    checked: background var(--primary), border-color var(--primary), color white, shows "✓"

    Name: DM Sans 500 14px, flex: 1
    Amount: DM Sans 400 13px var(--fg-muted)
    "+ Liste" button: padding 4px 10px, border-radius var(--r-full), bg var(--green-50), color var(--green-600)
      font 11px 600, hover: bg var(--primary), color white

Instructions section card:
  Header: "👨‍🍳 Zubereitung"
  Each step:
    flex, gap: 12px, padding: 12px 16px, border-bottom
    Number circle: 24×24, border-radius 50%, bg var(--primary), color white, font 12px 700
    Step text: DM Sans 400 14px, line-height: 1.55

CTA button: "📅 Zur Woche hinzufügen" — btn-primary full-width
```

---

## SCREEN: SHOPPING LIST

### Store Mode Toggle
```
Container: display flex, background: var(--bg-muted), border-radius: var(--r-lg), padding: 3px, gap: 3px

Each button:
  flex: 1, padding: 8px 12px, border-radius: var(--r-md)
  font: DM Sans 600 13px
  Default: bg transparent, color var(--fg-muted)
  Active: bg white, color var(--fg), box-shadow: var(--shadow-xs)
  transition: all 0.2s
```

### List Tabs (horizontal scroll)
```
Each tab: padding 6px 14px, border-radius var(--r-full), border 1.5px solid var(--border)
Default: bg white, color var(--fg-muted)
Active: bg var(--primary), border-color var(--primary), color white
font: DM Sans 600 13px
```

### Action Row
```
flex, gap: 8px
"+ Neue Liste" → btn-secondary
"+ Artikel"    → btn-primary
```

### Category Block (Planning Mode)
```
Category header:
  display flex, align-items: center, justify-content: space-between
  padding: 8px 16px
  background: var(--bg-subtle)
  border-radius: var(--r-md) var(--r-md) 0 0
  border: 1px solid var(--border)
  cursor: pointer (collapse/expand toggle)

  Title: DM Sans 700 12px uppercase, letter-spacing: 0.5px, color: var(--fg-muted)
  Badge: bg var(--primary), color white, font 10px 700, padding 2px 7px, border-radius var(--r-full)

Items container:
  bg white, border: 1px solid var(--border), border-top: none
  border-radius: 0 0 var(--r-md) var(--r-md)
```

### Shopping Item
```
display: flex, align-items: center, gap: 12px
padding: 12px 16px
border-bottom: 1px solid var(--border) (last: none)
transition: background 0.15s
hover: background var(--bg-subtle)
cursor: grab
draggable: true

Checkbox 22×22, border-radius var(--r-sm), border 2px var(--border)
checked: background var(--primary), border-color var(--primary), shows "✓" in white

Details (flex: 1):
  Name: DM Sans 500 14px
  Meta row: gap 8px
    Qty pill: padding 1px 6px, bg var(--bg-muted), border-radius var(--r-sm), font DM Sans 500 12px
    Price: DM Sans 400 12px var(--fg-muted)

Delete button: 18px ×, color var(--fg-subtle)
  hover: bg #fff0f0, color var(--danger)

checked item: opacity 0.55, name text-decoration: line-through, color var(--fg-subtle)
dragging: opacity 0.4, background var(--green-50)
drag-over: border-top 2px solid var(--primary)
```

### Store (Im Laden) Mode — override
```
Apply class "store-mode" to list container. CSS overrides:
  .store-mode .shop-item { min-height: 68px }
  .store-mode .shop-check { width: 36px; height: 36px; font-size: 16px; border-width: 2.5px }
  .store-mode .shop-name  { font-size: 16px; font-weight: 600 }
  .store-mode .shop-qty   { bg var(--green-50); color var(--green-700); font-weight: 600; font-size: 13px }
  .store-mode .shop-delete { display: none }
  .store-mode .shop-price  { display: none }
  .store-mode .cat-header  { display: none }  ← flat list, no headers
```

### Completed Section (always at bottom)
```
margin-top: 20px

Header row:
  flex, align-items: center, justify-content: space-between
  padding: 8px 16px, cursor: pointer (toggle visibility)

  Title: DM Sans 700 12px uppercase, var(--fg-subtle), flex row with checkmark icon
  Toggle button: "ausblenden ›" / "anzeigen ›" DM Sans 400 12px var(--fg-subtle)

Items container:
  background: white, border: 1px solid var(--border), border-radius: var(--r-lg)
  overflow: hidden
  Same item layout as above but always opacity 0.55, name struck through
```

---

## ADD ARTICLE MODAL

```
1. Category select (affects default qty/unit)
2. Article name input with AUTOCOMPLETE dropdown:
   - On typing, filter known articles list
   - Dropdown: bg white, border 1.5px var(--border-focus), border-radius var(--r-md)
   - Each suggestion: padding 10px 12px, hover: bg var(--green-50), color var(--primary)
3. Menge (number input) + Einheit (select) — side by side (grid 1fr 1fr, gap 12px)

Default qty/unit per category:
  Gemüse:                1 kg
  Obst:                  1 kg
  Fleisch & Fisch:     500 g
  Kühlregal:             1 Stk
  Milch & Milchprodukte: 1 Stk
  Trockenwaren:        500 g
  Backwaren:             1 Stk
  Getränke:              1 l
  Zutaten & Gewürze:   100 g
  Haushalt:              1 Stk
  Hygiene:               1 Stk

Units: g · kg · ml · l · Stk · Pck · Dose · Glas · Flasche · EL · TL
New articles auto-saved to the known list for future autocomplete.
```

---

## MODAL SHEET SPEC

```
Overlay: position fixed, inset 0, bg rgba(0,0,0,0.45), z-index: 200

Sheet (mobile):
  position: bottom of screen
  bg white, width: 100%, border-radius: 22px 22px 0 0
  padding: 20px, max-height: 88vh, overflow-y: auto
  animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)

  Drag handle: 36×4px, bg var(--neutral-200), border-radius: var(--r-full)
  margin: 0 auto 16px

Sheet (desktop ≥ 768px):
  centered in overlay
  width: 480px, border-radius: 22px
  animation: fadeScale

Modal header:
  flex, justify-content: space-between, align-items: center, margin-bottom: 20px
  Title: Syne 700 18px
  Close button: 32×32, border-radius: 50%, bg var(--bg-muted), "✕" 16px

Footer actions:
  flex, gap: 8px, margin-top: 20px
  Cancel: btn-secondary flex:1
  Confirm: btn-primary flex:1
```

---

## BUTTON SYSTEM

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 10px 20px;
  border-radius: var(--r-md); font: 600 14px var(--font-body);
  border: none; transition: all 0.15s; white-space: nowrap;
}

.btn-primary  { background: var(--primary); color: white; }
.btn-primary:hover  { background: var(--primary-dark); }
.btn-primary:active { transform: scale(0.98); }

.btn-secondary { background: var(--bg-muted); color: var(--fg); border: 1px solid var(--border); }
.btn-secondary:hover { background: var(--border); }

.btn-ghost { background: transparent; color: var(--primary); padding: 8px 12px; }
.btn-ghost:hover { background: var(--green-50); }

.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: var(--r-sm); }
.btn-full { width: 100%; }
```

---

## ANIMATIONS & TRANSITIONS

```
Screen enter: opacity 0→1 + translateY(6px→0), duration 200ms ease-out
Modal open:   slideUp (translateY 100%→0), 250ms cubic-bezier(0.34,1.56,0.64,1)
Overlay fade: opacity 0→1, 150ms

Button hover:     all 0.15s
Card hover:       box-shadow + translateY, 0.15s
Checkbox toggle:  background + border-color, 0.15s
Nav active:       transform scaleX, 0.2s
```

---

## COMPONENT TREE (React)

```
App
├── AppHeader
│   ├── BrandLogo
│   └── HeaderActions (SearchBtn, NotifBtn, Avatar)
├── AppContent
│   ├── DashboardScreen
│   │   ├── GreetingBlock
│   │   ├── TodayStrip
│   │   ├── QuickActionsGrid (4× QuickCard)
│   │   └── WeekOverview (7× DayRow)
│   ├── WeekPlannerScreen
│   │   ├── WeekNav
│   │   └── PlannerDay ×7
│   │       └── MealSlot ×4
│   ├── MealEditorScreen
│   │   ├── MealEditorHero
│   │   ├── RecipePickList
│   │   ├── Divider
│   │   └── FreeEntryForm (input + PeopleSelector)
│   ├── RecipesScreen
│   │   ├── ImportBanner
│   │   ├── SearchInput
│   │   ├── FilterBar
│   │   └── RecipeCard ×N
│   ├── RecipeDetailScreen
│   │   ├── RecipeHero (emoji, title, stats, tags)
│   │   ├── IngredientsSection (IngredientRow ×N)
│   │   └── InstructionsSection (StepRow ×N)
│   └── ShoppingScreen
│       ├── StoreModeToggle
│       ├── ListTabsBar
│       ├── ListActions
│       └── ShoppingList
│           ├── CategoryBlock ×N (planning mode)
│           │   ├── CategoryHeader (collapsible)
│           │   └── ShoppingItem ×N (draggable)
│           └── CompletedSection
├── AppNav (BottomNav mobile / Sidebar desktop)
└── Modals
    ├── ImportModal
    ├── NewListModal
    └── AddArticleModal (with autocomplete)
```

---

## REACT STATE STRUCTURE (Zustand recommended)

```typescript
interface AppState {
  // Navigation
  activeScreen: 'dashboard' | 'week-planner' | 'recipes' | 'recipe-detail' | 'meal-editor' | 'shopping'
  weekOffset: number

  // Data
  recipes: Recipe[]
  meals: Record<string, Record<MealType, MealEntry>>  // "YYYY-MM-DD" → {breakfast,lunch,snack,dinner}
  shoppingLists: ShoppingList[]

  // UI
  currentListId: number
  storeModeActive: boolean
  selectedRecipeId: number | null
  currentMealEdit: { dateStr: string; mealType: MealType } | null
  knownArticles: string[]  // grows as new articles are added
}

type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner'
```

---

## DRAG & DROP (shopping items)

Use HTML5 native drag API (no library needed for MVP):
```
draggable="true"
onDragStart → store item id
onDragOver  → e.preventDefault(), add visual indicator (border-top 2px primary)
onDrop      → swap items in array, re-render
onDragEnd   → cleanup classes
```

---

## PHASE PLAN (token-efficient for Claude Sonnet)

**Session 1:** Project setup + Design tokens + App shell + Header + Nav
**Session 2:** Dashboard screen (complete, with mock data)
**Session 3:** Week Planner + Meal Editor screens
**Session 4:** Recipes list + Recipe detail screen
**Session 5:** Shopping list (Planning mode + Store mode + Completed section + Drag-drop)
**Session 6:** All Modals (Import, NewList, AddArticle with autocomplete)
**Session 7:** Backend API (Express + PostgreSQL) — Auth, Recipes, Meals, Shopping
**Session 8:** Connect frontend to API, error states, loading states
**Session 9:** Docker-compose + README + deployment guide

---

## REFERENCE FILE
`FamilyMealPlanner.html` — contains the complete working prototype with all interactions.
Use this as the visual ground-truth. When in doubt, inspect the HTML/CSS in that file.

The prototype uses vanilla JS + inline CSS. Your job is to recreate this exact UI in React with
the token system above — no visual differences should be visible to the user.
