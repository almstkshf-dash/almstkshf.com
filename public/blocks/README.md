# /public/blocks — Custom Asset Pack

This directory holds all pixel-art/game-UI sprite assets referenced by the
custom block components in `src/components/ui/`.

## Directory structure

```
public/blocks/
├── cards/
│   ├── main_Card_bg.png               ← Full-canvas backing layer (all BlockCard variants)
│   ├── image_block_campaignsheets.png ← Campaign sheet overlay
│   ├── image_block_charactersheets.png← Character sheet overlay
│   ├── image_block_gamemastersheets.png← Game master panel overlay
│   └── image_block_generatorsheets.png← Generator output overlay
│
├── ui/
│   ├── TitleBlock_start.png           ← 3-slice title banner — start cap
│   ├── TitleBlock_middle.png          ← 3-slice title banner — repeating middle fill
│   ├── TitleBlock_end.png             ← 3-slice title banner — end cap
│   │
│   ├── DropDown-start.png             ← Select control — start cap
│   ├── DropDown-mid.png               ← Select control — repeating middle fill
│   ├── DropDown-end.png               ← Select control — end cap (arrow area)
│   ├── DropDown-arrow.png             ← Select control — indicator arrow sprite
│   │
│   ├── Checkbox-unchecked.png         ← Checkbox — default state sprite
│   ├── Checkbox-checked.png           ← Checkbox — checked state sprite
│   │
│   ├── Radial-unchecked.png           ← Radio button — default state sprite
│   └── Radial-checked.png             ← Radio button — selected state sprite
│
└── scrollbar/
    ├── scrollbar_start.png            ← Scrollbar — top arrow track
    ├── scrollbar_middle.png           ← Scrollbar — connecting rail (repeat-y)
    ├── scrollbar_end.png              ← Scrollbar — bottom arrow track
    └── scrollbar_tracker.png          ← Scrollbar — draggable thumb handle
```

## Component mapping

| Component                              | Asset(s) used                                       |
|----------------------------------------|-----------------------------------------------------|
| `src/components/ui/BlockCard.tsx`      | `cards/main_Card_bg.png` + variant sheet            |
| `src/components/ui/TitleBlock.tsx`     | `ui/TitleBlock_start/middle/end.png`                |
| `src/components/ui/CustomDropDown.tsx` | `ui/DropDown-start/mid/end/arrow.png`               |
| `src/components/ui/CustomCheckbox.tsx` | `ui/Checkbox-unchecked/checked.png`                 |
| `src/components/ui/CustomRadio.tsx`    | `ui/Radial-unchecked/checked.png`                   |
| `src/app/globals.css` (.scrollbar-custom) | `scrollbar/scrollbar_*.png`                      |

## 9-slice layout for BlockCard

```
┌──────────────────────────────┐
│  [main_Card_bg.png — full]   │  ← Layer 1: absolute fill
│  ┌──────────────────────┐    │
│  │ variant sheet overlay│    │  ← Layer 2: object-right-top overlay
│  └──────────────────────┘    │
│  ┌──────────────────────┐    │
│  │    children / slot   │    │  ← Layer 3: z-10 content
│  └──────────────────────┘    │
└──────────────────────────────┘
```

## 3-slice layout for TitleBlock / CustomDropDown

```
[START cap][────── MIDDLE (repeat-x) ──────][END cap]
```

The middle section uses `background-repeat: repeat-x` + `background-size: auto 100%`
so the tile's height fills exactly the control height while tiling horizontally to match
the dynamic content width.
