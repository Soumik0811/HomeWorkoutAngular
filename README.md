# 30-Day Home Workout Tracker

Responsive Angular fitness tracker built in an Nx-style workspace with one app and one shared library.

## Workspace Structure

- `apps/home-workout-tracker`
  Angular app UI with the dashboard, workout checklist, HIIT timer, push-up tracker, and 30-day grid.
- `libs/workout-tracker-data`
  Shared tracker models, hardcoded workout plan, and localStorage-backed state service.

## Features

- Hardcoded 30-day Push / Pull / Legs workout program
- Per-exercise set checkboxes
- Built-in HIIT timer for 3 rounds of cardio
- Push-up challenge with auto target calculation and history chart
- Weekly overview and 30-day progress calendar
- Dark/light mode toggle
- Local storage persistence for workouts, cardio rounds, push-up data, and theme
- Reset progress action

## Run Locally

```bash
npm install
npm start
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd install
npm.cmd start
```

## Notes

- Data is stored entirely in `localStorage`.
- There is no authentication layer and no backend dependency.
- The workout program starts counting from the first day the app is opened and caps at 30 days until reset.
