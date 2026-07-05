# GALACTIC RAIDER — COLOR SYSTEM & DESIGN TOKENS

**Design System Reference for Development**
**Status: Final**

---

## CORE COLOR PALETTE

### Primary Colors (Copy-Paste Ready)

```javascript
// Exact hex values for implementation
export const COLORS = {
  // Success / Gains / Action
  success: "#16A34A",
  green_dark: "#14532D",
  green_light: "#86EFAC",
  green_bg: "rgba(22,163,74,.15)",
  green_border: "rgba(22,163,74,.3)",
  green_hover: "rgba(22,163,74,.2)",

  // Danger / Losses / Warnings
  danger: "#DC2626",
  red_dark: "#7F1D1D",
  red_light: "#FCA5A5",
  red_bg: "rgba(220,38,38,.15)",
  red_border: "rgba(220,38,38,.3)",
  red_hover: "rgba(220,38,38,.2)",

  // Info / Secondary
  info: "#1D4ED8",
  blue_dark: "#1E3A8A",
  blue_light: "#93C5FD",
  blue_bg: "rgba(29,78,216,.15)",
  blue_border: "rgba(29,78,216,.3)",
  blue_hover: "rgba(29,78,216,.2)",

  // Accent / Highlight
  accent: "#D97706",
  yellow_dark: "#78350F",
  yellow_light: "#FDE68A",
  yellow_bg: "rgba(217,119,6,.15)",
  yellow_border: "rgba(217,119,6,.3)",

  // Tertiary
  purple: "#7C3AED",
  purple_light: "#C4B5FD",
  purple_bg: "rgba(124,58,237,.2)",

  // Dark theme base
  dark_base: "#0F172A",
  dark_card: "#1E293B",
  dark_hover: "#334155",
  dark_border: "rgba(255,255,255,.08)",
  dark_border_light: "rgba(255,255,255,.15)",

  // Text
  text_primary: "#F8FAFC",
  text_secondary: "rgba(255,255,255,.5)",
  text_muted: "rgba(255,255,255,.3)",
  text_faint: "rgba(255,255,255,.15)",
};

// CSS custom properties for web
:root {
  --color-success: #16A34A;
  --color-danger: #DC2626;
  --color-info: #1D4ED8;
  --color-accent: #D97706;
  --color-dark-base: #0F172A;
  --color-text-primary: #F8FAFC;
}
```

---

## SEMANTIC COLOR USAGE

### DO USE THESE COMBINATIONS

**Success State (Action successful)**
- Background: #E8F5E9 or rgba(22,163,74,.15)
- Text: #86EFAC or #14532D
- Border: rgba(22,163,74,.3)
- Icon: #16A34A
- Example: "✅ Stock purchased successfully"

**Error State (Action failed / Danger)**
- Background: #FFEBEE or rgba(220,38,38,.15)
- Text: #FCA5A5 or #7F1D1D
- Border: rgba(220,38,38,.3)
- Icon: #DC2626
- Example: "⚠️ Insufficient Trading Wallet funds"

**Info State (Informational message)**
- Background: #E3F2FD or rgba(29,78,216,.15)
- Text: #93C5FD or #1E3A8A
- Border: rgba(29,78,216,.3)
- Icon: #1D4ED8
- Example: "ℹ️ Tax era changed to High Tax"

**Warning State (Important but not critical)**
- Background: #FFF8E1 or rgba(217,119,6,.15)
- Text: #FDE68A or #78350F
- Border: rgba(217,119,6,.3)
- Icon: #D97706
- Example: "⏰ Liquidation active — cannot buy"

**Default State (Neutral/Secondary action)**
- Background: transparent or rgba(255,255,255,.04)
- Text: rgba(255,255,255,.5)
- Border: rgba(255,255,255,.08)
- Example: "← Back" button

---

## COMPONENT-SPECIFIC COLORS

### Buttons

**Primary Action Button (Buy, Deposit, Confirm)**
```css
background-color: #16A34A;  /* Green */
color: #FFFFFF;
border: none;

:hover {
  background-color: #15803D;  /* Darker green */
}

:disabled {
  background-color: rgba(255,255,255,.05);
  color: rgba(255,255,255,.2);
}
```

**Secondary Action Button (Sell, Withdraw, Cancel)**
```css
background-color: rgba(220,38,38,.15);  /* Red bg */
color: #FCA5A5;  /* Red text */
border: 1px solid rgba(220,38,38,.3);

:hover {
  background-color: rgba(220,38,38,.25);
}
```

**Tertiary Action Button (Back, More Info)**
```css
background-color: transparent;
color: rgba(255,255,255,.5);
border: 1.5px solid rgba(255,255,255,.15);

:hover {
  background-color: rgba(255,255,255,.05);
  border-color: rgba(255,255,255,.25);
}
```

**Toggle / Selected Button**
```css
background-color: rgba(22,163,74,.15);  /* Green tinted */
color: #86EFAC;  /* Bright green */
border: 2px solid #16A34A;  /* Green border */
```

### Cards / Containers

**Default Card**
```css
background-color: rgba(255,255,255,.04);  /* Very subtle */
border: 1px solid rgba(255,255,255,.08);
border-radius: 13px;
padding: 12-16px;
```

**Success Card (Positive information)**
```css
background-color: rgba(22,163,74,.08);  /* Very faint green */
border: 1px solid rgba(22,163,74,.3);
color: #86EFAC;  /* Green text */
```

**Warning Card (Important info)**
```css
background-color: rgba(217,119,6,.08);  /* Very faint yellow */
border: 1px solid rgba(217,119,6,.3);
color: #FDE68A;  /* Yellow text */
```

**Error Card (Critical info)**
```css
background-color: rgba(220,38,38,.08);  /* Very faint red */
border: 1px solid rgba(220,38,38,.3);
color: #FCA5A5;  /* Red text */
```

### Text Inputs

```css
background-color: rgba(255,255,255,.04);
border: 1.5px solid rgba(255,255,255,.15);
color: #F8FAFC;
border-radius: 11px;

::placeholder {
  color: rgba(255,255,255,.3);
}

:focus {
  border-color: rgba(22,163,74,.5);
  outline: none;
}
```

### Progress Bars

**Green (Success/Gains)**
```css
background: linear-gradient(90deg, #16A34A, #86EFAC);
```

**Red (Danger/Losses)**
```css
background: linear-gradient(90deg, #DC2626, #FCA5A5);
```

**Blue (Info/Neutral)**
```css
background: linear-gradient(90deg, #1D4ED8, #93C5FD);
```

**Stacked (Multi-value)**
```css
/* For wealth composition bar */
.cash { background: #16A34A; }
.savings { background: #1D4ED8; }
.trading { background: #D97706; }
.stocks { background: #86EFAC; }
```

---

## DARK THEME SPECIFICATIONS

### Why Dark Theme?

1. **Reduces eye strain** for long play sessions
2. **Feels premium** — financial apps use dark for authority
3. **Maximizes contrast** — text pops on dark
4. **Mobile battery** — OLED screens consume less power on dark
5. **Focus** — dark backgrounds make colorful UI elements stand out

### Never Use In Dark Theme

- Pure white (#FFFFFF) — use #F8FAFC instead
- Pure black (#000000) — use #0F172A (dark blue-gray, warmer)
- Desaturated grays — breaks the cohesion
- Bright neon colors — looks cheap
- White/dark borders without context — they float

### Always Ensure

- Minimum contrast ratio 4.5:1 for text on colored backgrounds
- Use border shadows or outlines for definition, not flat colors
- Opacity for subtle elements (rgba), not desaturation
- Consistent padding/margin (8px grid) for breathing room

---

## COLOR BY SCREEN

### Home Screen (Dashboard)

```
Background: #0F172A (dark_base)
Card backgrounds: #1E293B (dark_card)
Net worth number: #D97706 (yellow, big 34px)
Tax era indicator: 
  - Active bar: linear-gradient(90deg, #1D4ED8, #60A5FA)
  - Background: rgba(255,255,255,.1)
Wallet labels: rgba(255,255,255,.5)
Wallet values: #F8FAFC
Liquidation alert: #FDE68A on rgba(217,119,6,.15)
Bankruptcy alert: #FCA5A5 on rgba(220,38,38,.15)
```

### Markets Screen

```
Company row backgrounds: rgba(255,255,255,.04)
Company name: #F8FAFC
Analyst badge: 
  - STRONG BUY: #14532D bg, #86EFAC text
  - BUY: #166534 bg, #BBF7D0 text
  - HOLD: #78350F bg, #FDE68A text
  - SELL: #7F1D1D bg, #FCA5A5 text
Stock chart line: green if up, red if down
Price change %: green if +, red if −
```

### Company Detail Screen

```
Header gradient: linear-gradient(135deg, #052e16, #14532d)
Company name: #F8FAFC (white)
Price (huge): #F8FAFC (monospace)
P/E ratio: #F8FAFC (monospace)
Price change: green if +, red if −
Analyst consensus banner:
  - STRONG BUY: #14532D
  - BUY: #166534
  - HOLD: #78350F
  - SELL: #7F1D1D
Analyst individual blocks: rgba(255,255,255,.04) with colored left border
Buy button: #16A34A (green)
Sell button: rgba(220,38,38,.15) with #FCA5A5 text
```

### Wallets Screen

```
Wallet cards: #1E293B background with border left (colored stripe)
  - Cash: #D97706 stripe
  - Savings: #1D4ED8 stripe
  - Trading: #16A34A stripe
Wallet value: #F8FAFC
Available/Protected label: rgba(255,255,255,.3)
Transfer buttons: 
  - Selected: #16A34A border + rgba(22,163,74,.15) bg
  - Unselected: rgba(255,255,255,.1) border + transparent
Loan repay buttons:
  - Enabled: #16A34A
  - Disabled: rgba(255,255,255,.05)
```

### Bonds & Assets Screen

```
Bond rating badge:
  - AAA: #14532D (green)
  - AA: #166534 (light green)
  - BBB: #78350F (yellow)
  - BB: #E65100 (orange)
  - B: #7F1D1D (red)
Yield (live): #F8FAFC (monospace)
Commodity/crypto chart: green if up, red if down
Forex position (open):
  - Long: #16A34A button
  - Short: #DC2626 button
P&L (open position): green if profit, red if loss
```

### News Screen

```
News item background: rgba(255,255,255,.04)
News category label (COMPANY/ECONOMY/INDUSTRY): rgba(255,255,255,.3)
News title: #F8FAFC
News body: rgba(255,255,255,.5)
Left border stripe color:
  - Good news (gains): #16A34A
  - Bad news (losses): #DC2626
  - Neutral: #1D4ED8
Error toast (bottom): #FCA5A5 text on rgba(220,38,38,.15) bg
```

---

## ACCESSIBILITY NOTES

### Contrast Ratios (WCAG AA minimum 4.5:1)

✅ PASS:
- #F8FAFC on #0F172A (text primary on background): 18:1
- #86EFAC on #14532D (green text on green bg): 8.5:1
- #93C5FD on #1E3A8A (blue text on blue bg): 7.2:1
- #FDE68A on #78350F (yellow text on yellow bg): 6.3:1

❌ FAIL (do not use):
- #F8FAFC on #1E293B: Only 3.8:1 (barely readable)
- rgba(255,255,255,.5) on #0F172A: 3.2:1 (for captions only, not body text)

### Color-Blind Friendly

- Green/Red always paired with icons (✓ and ✗) or text (Up/Down)
- Yellow used sparingly, never as sole indicator
- Blue/Red never together without contrast
- Chart lines have pattern distinction (solid vs dashed) in addition to color

---

## IMPLEMENTATION CHECKLIST

- [ ] Define color constants in project (colors.js or constants.ts)
- [ ] Set :root CSS variables for web
- [ ] Create color utility functions (e.g., `getStatusColor(status)`)
- [ ] Apply to all buttons (primary, secondary, tertiary)
- [ ] Apply to all cards/containers
- [ ] Apply to text (primary, secondary, muted)
- [ ] Test on OLED phone (brightness, battery drain)
- [ ] Test on computer monitor (contrast, eye strain)
- [ ] Verify all status messages use correct color
- [ ] Check all charts use green/red with pattern fallback

---

## FINAL REMINDER

**These colors work because they are:**
- **Saturated but not neon** — clear but not aggressive
- **Consistent** — same green always means "good"
- **Accessible** — high contrast on dark backgrounds
- **Themed** — financial + space game feel
- **Tested** — used in the prototype, players liked them

Manus: **Use these exact hex values.** Do not substitute Tailwind colors or Material Design colors. The cohesion depends on the specific palette.

---

**End of Color System Documentation**
