# Little List

A small, offline todo app for Android, iOS, and web, built with Expo SDK 58, React Native, TypeScript, and Expo Router.

## Features

- Purple, pink, and white interface with animated progress, task entrances, and completion controls that respect the system Reduce Motion setting.
- Add and edit tasks (up to 200 characters; blank titles are rejected).
- Complete and reopen tasks; filter by All, Active, or Done.
- Confirm or cancel task deletion.
- Track completed tasks and remaining work.
- Keep tasks across restarts with AsyncStorage.
- Retry failed loading without overwriting saved data; failed saves keep the previous list and editor text.
- Responsive layout, keyboard support, screen-reader labels, and large touch targets.

Tasks stay on the current device or browser. There is no account, cloud sync, reminder service, or backup. Clearing app/browser data or uninstalling can remove tasks. Storage is not encrypted; avoid storing secrets. Concurrent editing in multiple browser tabs is not supported.

## Run

Requires Node.js 22.20 or newer and npm.

```sh
npm ci
npm start
```

Press `w` for web, or open a compatible Expo Go client on a device. For a native development build, use `npm run android` or `npm run ios` with the appropriate platform tooling. iOS local builds require macOS. EAS cloud builds are also supported through Expo's CLI workflow; this repository does not yet include EAS project configuration.

```sh
npm run lint
npm run typecheck
npm test
npx expo install --check
npx expo export --platform web
```

The tests cover storage round trips, validation, corrupt data, and read/write failures. They do not replace native device testing. See [the release checklist](docs/TESTING.md).

## Structure

- `src/app/index.tsx`: todo screen and interaction state.
- `src/components/task-row.tsx`: animated task cards, editing actions, and deletion confirmation.
- `src/components/task-progress.tsx`: accessible progress summary and animation.
- `src/constants/palette.ts`: shared interface colors.
- `src/app/_layout.tsx`: root navigation and status bar.
- `src/app/explore.tsx`: redirects legacy starter links home.
- `src/hooks/use-tasks.ts`: loading, save state, and protection against overlapping writes.
- `src/storage/tasks.ts`: task schema and validated persistence.
- `tests/`: dependency-free storage regression tests.
- `plugins/`: Android CMake path compatibility for Windows builds.

The unused components and illustration assets from the Expo starter remain available for reference, but are not part of the todo screen. App icons still use the starter artwork; replace them with your own branding before a store release. Native directories are generated and ignored by Git. Change native configuration through `app.json` and config plugins, then regenerate/rebuild as needed.

## GitHub

Commit source, assets, `package.json`, and `package-lock.json`. Keep generated builds, `node_modules`, signing keys, and environment files out of Git. No secrets or environment variables are required to run the app. GitHub Actions runs lint, type checking, and tests on pushes and pull requests.

The app is currently styled for light mode. Existing application identifiers and deep-link scheme have been preserved. The MIT license retains the original Expo attribution.
