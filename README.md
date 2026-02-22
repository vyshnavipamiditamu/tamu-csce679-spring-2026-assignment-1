# CSCE 679 — Assignment 1: Hong Kong Temperature Matrix

## Overview
An interactive matrix visualization of Hong Kong's daily temperature data using D3.js. Each cell in the matrix represents one month of a specific year, with background color encoding the temperature and a mini line chart showing daily fluctuations within that month.

---

## Tools & Technologies
| Tool | Purpose |
|------|---------|
| D3.js v7 | Data visualization library |
| HTML5 / CSS3 | Page structure and styling |
| JavaScript (ES6) | Visualization logic |
| VS Code | Code editor |
| Live Server | Local development server |
| Git / GitHub | Version control and submission |

---

## How to Run
1. Clone the repository
2. Open the folder in VS Code
3. Start Live Server (or run `python -m http.server 8000`)
4. Open `http://localhost:5500` (or `8000`) in your browser

---

## Features
- **Matrix Layout** — X-axis shows years (last 10 years), Y-axis shows months (January–December)
- **Color Encoding** — Background color of each cell encodes temperature using the Spectral color scale (blue = 0°C, maroon = 40°C)
- **Click Toggle** — Click any cell to switch between max and min temperature views with a smooth animated transition
- **Tooltip** — Hover over any cell to see the date and corresponding temperature value
- **Mini Line Charts** — Each cell contains a small line chart showing daily temperature changes throughout the month
- **Legend** — Discrete color block legend on the right showing the 0–40°C temperature mapping

---

## Results
The visualization successfully displays 10 years (2008–2017) of Hong Kong temperature data. Key observations visible from the matrix:

- **Summer months** (June–August) are clearly the hottest, shown in deep red/maroon
- **Winter months** (December–February) are the coolest, shown in blue/teal
- **Year-over-year patterns** are consistent, making seasonal trends immediately visible
- The **toggle interaction** allows easy comparison between maximum and minimum temperature distributions across all months and years

---

## File Structure
```
tamu-csce679-spring-2026-assignment-1/
├── index.html            # Main HTML page
├── style.css             # Styling for layout and tooltip
├── main.js               # D3.js visualization logic
├── temperature_daily.csv # Hong Kong daily temperature dataset
├── AI_reflection.md      # AI interaction log and reflection
└── README.md             # This file
```

---

## AI Usage
AI tools (ChatGPT and Claude) were used during development. See `AI_reflection.md` for the full interaction log and reflection.
