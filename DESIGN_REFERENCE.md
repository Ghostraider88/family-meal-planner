# Design Reference — Essensplan App

**Status:** High-Fidelity, Pixel-Perfect
**Framework:** React (zu implementieren)
**Design System:** smapOne (Farben, Typography, Spacing)

---

## 🎨 Design Tokens

### Farben (smapOne)
```
Primary:
- smapBlue:     #00C5FF (dominante Brand-Farbe)
- smurple:      #550AA8 (Akzente)
- Black:        #000000
- White:        #FFFFFF

Secondary:
- smapYellow:   #FFDD00 (Highlights)
- darkBlue:     #003457 (Dunkle Backgrounds)
- lightBlue:    #D4EDFC (Soft Backgrounds)

Greys:
- grey-180:     #403E4E
- grey-80:      #8B91A3
- grey-50:      #B2B7C7
- grey-20:      #E3E6EF
- grey-5:       #F0F2F9

Signal:
- signalRed:    #FF0048
- approvalGreen: #3DB384
```

### Typography
```
Headlines:    Poppins Bold (700) — sizes 24px to 60px
Body:         Inter Regular (400) — 16px base
UI Labels:    Poppins SemiBold (600) — 14px
Captions:     Inter (400) — 12px
Line Height:  1.5 (body), 1.2 (headlines)
```

### Spacing (8px base)
```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px
```

### Border Radius
```
4px (sm), 8px (md), 12px (lg), 16px (xl), 24px (2xl), 9999px (full)
```

### Shadows
```
sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
md:  0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)
lg:  0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)
```

---

## 📱 Responsive Breakpoints

```
Mobile:  < 600px   (Primary Optimization)
Tablet:  600-1024px
Desktop: > 1024px
```

---

## 🖼️ Screens & Components

### 1. Auth Screen
**Purpose:** Login/Register
**Layout:** Centered form, full-viewport
**Key Elements:**
- Logo + Headline
- Email input
- Password input
- "Sign Up" / "Sign In" buttons
- Link to toggle between modes
- Error messages (red)

### 2. Dashboard
**Purpose:** Home, Quick Navigation
**Layout:** Flex column, scrollable
**Key Elements:**
- Header: "Diese Woche", Week KW display
- 4 Quick Action Cards (2x2 grid on mobile, 4x1 on desktop):
  - 📅 Wochenplan
  - 🍳 Rezepte
  - 🛒 Einkauf
  - 📥 Importieren
- Week Overview: 7 Day Cards showing meals
  - Day name, date
  - 3 meals listed (breakfast, lunch, dinner)
  - Meal type label + recipe name

### 3. Recipes Screen
**Purpose:** Browse, Search, Add Recipes
**Layout:** Flex column, scrollable
**Key Elements:**
- Import Section (gradient bg)
  - "🌐 Rezepte automatisch importieren"
  - Button: "URL einfügen"
- Search Input + Filter Chips
  - Chips: Vegetarisch, Vegan, Glutenfrei, Schnell, etc.
- Recipe Cards Grid (1 col mobile, 2-3 col desktop)
  - Card: Image placeholder emoji (40px), Name, Time/Servings/Difficulty, Tags

### 4. Recipe Detail Screen
**Purpose:** View recipe, add ingredients to shopping list, add to week
**Layout:** Flex column, scrollable
**Key Elements:**
- Back Button
- Header: Big emoji, Name, Time/Servings/Difficulty, Source
- Ingredients Section
  - List of ingredients with checkbox
  - Each: checkbox, ingredient name, amount, "Zur Einkaufsliste" button
- Instructions Section
  - Numbered steps (1, 2, 3, ...)
- Bottom: "📅 Zur Woche hinzufügen" button

### 5. Week Planner Screen
**Purpose:** Plan weekly meals
**Layout:** Flex column, scrollable
**Key Elements:**
- Week Selector (prev/next buttons, week label)
- 7 Day Sections (one per day):
  - Day header: Day name, date
  - 4 Meal Slots (breakfast, lunch, snack, dinner)
    - Each slot: draggable, shows emoji + recipe name or "+ Hinzufügen"
    - Slot appearance changes when filled vs empty

### 6. Meal Editor (Popup/Screen)
**Purpose:** Add/edit meal for specific day/type
**Layout:** Modal or full screen
**Key Elements:**
- Header: Meal type + Date
- "Aus dem Kochbuch" section
  - List of recipes with emoji, name, time/servings
  - Clickable to select
- "Freier Eintrag" section
  - Text input for custom meal name
- "Für wen?" selector
  - Radio buttons: Alle, Kinder, Erwachsene
- Actions: Cancel, Save

### 7. Shopping List Screen
**Purpose:** Manage shopping lists
**Layout:** Flex column, scrollable
**Key Elements:**
- Store Mode Toggle (sticky top on mobile)
  - 📋 Planung | 🛒 Im Laden
- List Tabs (scrollable)
  - Each tab: list name, clickable
- Action Buttons
  - + Neue Liste
  - + Artikel
- Items by Category (Planning Mode)
  - Category header (collapsible, shows count)
  - Items with checkbox, name, quantity+unit, price, delete button
- "Erledigt" Section (bottom)
  - Separate category for checked items
  - Collapsible
  - Greyed out

**Store Mode (Mobile):**
- Sticky toggle at top
- Flat list (no category headers)
- Large checkboxes (40x40)
- Large text (18px)
- Quantity shown in colored pill
- No delete buttons, no prices
- "Erledigt" section still at bottom but always visible

---

## 🎯 Interactions & States

### Hover States
- Buttons: Slight shadow increase, color darken
- Cards: Scale up 2-4px, shadow increase
- List items: Background color change

### Active/Checked States
- Checkboxes: Blue bg, white checkmark
- Toggle buttons: Blue bg, white text
- Tabs: Blue bg, white text

### Loading States
- Skeleton loaders for lists
- Spinner for API calls

### Error States
- Red text for error messages
- Red border on failed inputs

### Responsive Behavior
- Mobile: Single column, full width
- Desktop: Multi-column grids, sidebars

---

## 🔄 Component Library (React)

**Reusable Components to Build:**

```
components/
├── Auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── AuthGuard.jsx
├── Common/
│   ├── Header.jsx
│   ├── Navigation.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   └── Checkbox.jsx
├── Recipe/
│   ├── RecipeCard.jsx
│   ├── RecipeList.jsx
│   ├── RecipeDetail.jsx
│   ├── IngredientItem.jsx
│   └── InstructionStep.jsx
├── MealPlanner/
│   ├── WeekSelector.jsx
│   ├── DayCard.jsx
│   ├── MealSlot.jsx
│   ├── MealEditor.jsx
│   └── MealList.jsx
└── Shopping/
    ├── ShoppingList.jsx
    ├── ShoppingItem.jsx
    ├── CategorySection.jsx
    ├── StoreModToggle.jsx
    └── ItemForm.jsx
```

---

## 📐 Layout Patterns

### Full Viewport (Mobile)
```
<Header height=64px />
<Content flex=1, overflow-y=auto />
<BottomNav height=70px />
```

### Sidebar (Desktop)
```
<Header />
<Container flex>
  <Sidebar width=80px, vertical nav />
  <Content flex=1 />
</Container>
```

### Modal
```
<Overlay rgba(0,0,0,0.5) />
<Modal max-width=500px, rounded, from-bottom on mobile />
```

---

## 📊 Data Flow

**Frontend → API:**
```
User Action → Local State Update → API Call → API Response → State Update → Re-render
```

**Example (Add Article):**
```
1. User clicks "+ Artikel"
2. Modal opens (local state)
3. User fills form, clicks "Hinzufügen"
4. POST /api/shopping-lists/:id/items { name, quantity, unit, category }
5. API returns created item
6. Frontend adds to local list
7. List re-renders
```

---

## 🧠 State Management (React Context)

```
AppContext:
├── user (logged-in user)
├── family (current family)
├── recipes (list of recipes)
├── meals (weekly meal plan)
├── shoppingLists (all lists)
├── currentList (selected shopping list)
└── functions (updateRecipe, addMeal, etc.)
```

---

## 🎬 Animations (Optional, Phase 2)

- Screen transitions: 200ms fade-in
- Button clicks: 100ms scale (0.98)
- Checkboxes: 200ms color change
- Lists: Stagger 50ms per item

---

## 🔌 API Integration Points

**Frontend → Backend:**
1. Auth: `/api/auth/register`, `/api/auth/login`
2. Recipes: `/api/recipes` (GET, POST, PUT, DELETE)
3. Meals: `/api/meals` (GET, POST, PUT, DELETE)
4. Shopping: `/api/shopping-lists`, `/api/shopping-items`
5. Users: `/api/users/me`, `/api/family/members`

**Example Request:**
```javascript
const response = await fetch('/api/recipes', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📋 Accessibility Checklist

- [ ] All buttons have ARIA labels
- [ ] Form inputs have associated labels
- [ ] Color not only way to convey info
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Images have alt text
- [ ] Semantic HTML

---

## ✅ Implementation Checklist

- [ ] All screens match design
- [ ] Colors exactly match hex values
- [ ] Typography matches (Poppins/Inter, sizes, weights)
- [ ] Spacing follows 8px grid
- [ ] Responsive breakpoints work
- [ ] Hover/active states implemented
- [ ] Mobile store-mode optimized (40px checkboxes, 18px text)
- [ ] Drag-drop works on shopping list
- [ ] Category collapsing works
- [ ] Completed items section appears/hides correctly
