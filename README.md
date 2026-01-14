# Task Manager V1

Desktop task manager built with SvelteKit, Tailwind, and Tauri. It supports:
- Status-based task boards with drag and drop
- Local storage persistence (no backend required)
- Users and assignments
- Custom statuses with colors and visibility
- Filters by status, tag, and date

## Installation

Prerequisites:
- Bun
- Rust + Cargo
- Tauri prerequisites for your OS

Install dependencies:
```bash
bun install
```

Run the app:
```bash
bun run tauri dev
```

Build installers (current OS only):
```bash
bun run tauri build
```

## License

MIT License. You are free to use, modify, and distribute this project, including for commercial use, as long as the original copyright and license notice are included in copies or substantial portions of the software.

## Contributing

Contributions are welcome. Please:
1. Fork the repo and create a feature branch.
2. Keep changes focused and documented.
3. Run the app locally to verify behavior.
4. Open a pull request with a clear summary and screenshots for UI changes.
