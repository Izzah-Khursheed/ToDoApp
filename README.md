# Little List

A focused, offline task app built with Expo SDK 58, React Native 0.88, TypeScript, and Expo Router. The interface combines purple, pink, and white with subtle animations and a simple task workflow.

**Mobile development uses an installed development build with `expo-dev-client`.** The daily workflow below targets a physical Android phone connected to a Windows computer over USB.

## Features

- Create and edit tasks, with a 200-character title limit and blank-title validation.
- Complete and reopen tasks; switch between All, Active, and Done filters.
- View completion progress and remaining task counts.
- Confirm or cancel deletion before removing a task.
- Keep tasks across app restarts using AsyncStorage.
- Retry failed loading without overwriting saved data. Failed saves preserve the previous list and editor text.
- Animated progress, task entrances, and completion controls with system Reduce Motion support.
- Accessible control labels, large touch targets, keyboard handling, and a responsive light interface.

## Requirements

- Node.js **22.20.0 or newer** and npm.
- Android SDK Platform-Tools (`adb`) available in your terminal.
- A physical Android phone with Developer options and USB debugging enabled.
- A data-capable USB cable. Unlock the phone and accept its USB debugging authorization prompt for your computer.
- An installed development build of this project. To compile it locally, also configure the Android SDK and a compatible JDK using the [Expo Android environment setup guide](https://docs.expo.dev/get-started/set-up-your-environment/).

No API keys, backend services, or environment variables are needed to run the app.

## First-time setup

From the repository root:

```powershell
npm ci
adb devices -l
```

Your phone should appear with the status `device`. If it says `unauthorized`, unlock the phone and accept the debugging prompt before continuing.

### Build and install the Android development app

If this project's development build is already installed on the phone, skip this step and use the daily workflow below.

```powershell
npx expo run:android --device
```

Select your physical phone when prompted. This command compiles and installs the native Android app and starts the development server. The equivalent command through the repository's npm script is:

```powershell
npm run android -- --device
```

Use one of these commands, not both. A first native build takes longer because Gradle downloads dependencies and compiles native code. Once the app is installed, ordinary JavaScript, TypeScript, and styling changes do not require another native build.

## Daily workflow: run on your Android phone over USB

These are the commands used for the USB connection when resolving the phone's project-loading error. Run them from the project root. For this Windows checkout:

```powershell
cd F:\Apps\ToDoApp
```

### Terminal 1: connect the phone and start Metro

```powershell
adb devices -l
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client --localhost --port 8081
```

Keep this terminal running. Metro serves the app's JavaScript bundle. `--dev-client` selects the installed development build, and `adb reverse` forwards the phone's port 8081 to the computer's port 8081 over USB.

If Metro is already running for this project on port 8081, reuse it instead of starting a second instance.

### Terminal 2: open the installed development build

With Metro ready, run this exact command in a second terminal:

```powershell
adb shell am start -a android.intent.action.VIEW -d 'myfirstapp://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081' com.haseebusman.MyFirstApp
```

This opens **Little List** and explicitly connects it to `http://127.0.0.1:8081` through the USB forwarding rule. It avoids reusing an outdated Wi-Fi address saved by the development launcher.

Save a source file to see changes through Fast Refresh. Press `r` in Metro's terminal to reload the connected app. Press `Ctrl+C` in that terminal when you finish development.

**Keep the USB cable connected and Metro running during this workflow.** The installed development build needs Metro to load the current project; it is not a standalone release build. Rerun `adb reverse tcp:8081 tcp:8081` after reconnecting the phone or restarting ADB.

## Run over Wi-Fi instead

Connect the computer and phone to the same network, then start Metro in LAN mode:

```powershell
npx expo start --dev-client --lan --port 8081
```

Scan the terminal's QR code to open the project in the installed development build. Allow the development server through your computer's firewall when prompted. If the network isolates devices or the connection times out, use the USB workflow above.

Stop an existing localhost Metro session before switching to LAN mode on the same port.

## When a native rebuild is needed

Rebuild and reinstall the development app after adding or upgrading a dependency with native code, changing native configuration in `app.json` or a config plugin, or upgrading Expo/React Native:

```powershell
npx expo run:android --device
```

Install new libraries using Expo's SDK-compatible package resolver:

```powershell
npx expo install <package-name>
```

Native directories are generated and ignored by Git. Configure native behavior in `app.json` and `plugins/` rather than editing generated files by hand. The repository includes a Windows Android CMake path compatibility plugin.

For iOS, local device builds require macOS and Xcode. Windows users can use [EAS development builds](https://docs.expo.dev/develop/development-builds/create-a-build/); this repository does not currently include an EAS project configuration or `eas.json`.

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| “There was a problem loading the project” or a connection timeout | Confirm Metro is running, rerun `adb reverse tcp:8081 tcp:8081`, and use the explicit USB launch command above. A saved LAN address can become unreachable. |
| `adb` is not recognized | Add the Android SDK `platform-tools` directory to `PATH`, then open a new terminal. |
| Phone is missing or `unauthorized` | Unlock it, accept USB debugging authorization, and check the cable and USB connection. Run `adb devices -l` again. |
| Port 8081 is already in use | Reuse the existing server if it belongs to this project. Otherwise, stop that server in its own terminal before starting this one. |
| Unknown module after Fast Refresh or stale UI | Reload with `r` in Metro. If needed, stop Metro and restart with `npx expo start --dev-client --localhost --port 8081 --clear`, then run the USB launch command again. |
| Native module is missing or incompatible | Rebuild the development app after checking dependency compatibility with `npx expo install --check`. Restarting Metro alone does not add native code to the installed app. |
| App works while connected but cannot load after Metro stops | Expected for this development workflow. Reconnect Metro, or create a standalone preview/release build for use without a development server. |

## Validation

```powershell
npm run lint
npm run typecheck
npm test
npx expo install --check
npx expo-doctor
npx expo export --platform web
```

Storage tests cover validation, create/edit/complete/delete round trips, corrupt saved data, and read/write failures. Android interaction checks have also been performed on a physical phone. Automated checks do not replace iOS, accessibility, or release-build testing; see [the testing and release checklist](docs/TESTING.md) for coverage and remaining checks.

For browser development, run `npm run web`. The web export command above verifies the web bundle; it does not produce an Android APK.

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/app/index.tsx` | Task screen, composer, filters, and interaction state |
| `src/app/_layout.tsx` | Root navigation and status bar |
| `src/app/explore.tsx` | Redirect for legacy starter links |
| `src/components/task-row.tsx` | Animated task cards and edit/delete actions |
| `src/components/task-progress.tsx` | Accessible completion summary and animation |
| `src/constants/palette.ts` | Shared interface colors |
| `src/hooks/use-tasks.ts` | Loading, saving, errors, and overlapping-write protection |
| `src/storage/tasks.ts` | Task schema and validated persistence |
| `tests/` | Storage regression tests |
| `plugins/` | Native configuration plugins |
| `.github/workflows/` | Continuous integration checks |

## Data and project scope

Tasks are stored locally on the current device or browser. There is no account, cloud sync, reminder service, or backup. Uninstalling the app or clearing its storage can remove tasks. Storage is not encrypted; avoid storing secrets. Concurrent editing in multiple browser tabs is not supported.

The current design targets light mode. Some unused Expo starter components and illustration assets remain in the repository. App icons still use starter artwork and should be replaced before a store release.

## Contributing and GitHub

Commit source code, assets, configuration, `package.json`, and `package-lock.json`. Generated native folders, `node_modules`, `.expo`, `dist`, signing credentials, and local environment files are excluded from version control. GitHub Actions runs lint, type checking, and storage tests on pushes and pull requests.

## References

- [Using an Expo development build](https://docs.expo.dev/develop/development-builds/use-development-builds/)
- [Expo CLI commands and connection modes](https://docs.expo.dev/more/expo-cli/)
- [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/)

## License

MIT. See [LICENSE](LICENSE). Original Expo attribution is retained.
