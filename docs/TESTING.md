# Release checks

Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npx expo install --check`, and `npx expo export --platform web` before publishing changes.

Test the following on Android, iOS, and web. Use a disposable app installation or browser profile so that failure testing never touches real tasks.

- Fresh launch: no tutorial screen or startup overlay remains; loading settles into the empty state.
- Add: blank/whitespace-only input is disabled; normal, Unicode, and 200-character titles save. A new task is visible even when adding from Done.
- Edit: tapping Edit scrolls to the composer; changing the title persists; Cancel keeps the old task. An edited completed task stays completed.
- Completion: toggle and reopen tasks; progress and All/Active/Done results match.
- Delete: Cancel leaves the task intact; confirmation removes only that task. Deleting the task being edited clears its composer only after a successful save.
- Restart/reload: titles and completion states survive.
- Errors: deny storage or simulate quota exhaustion; show a useful error, preserve existing tasks and draft, and allow retry. Malformed saved JSON must never be silently replaced.
- Repeated taps: no duplicate submission or overlapping storage writes.
- Layout: check 320px-wide screens, large text, long titles, keyboard open, safe areas, and long lists. Row actions remain reachable.
- Accessibility: keyboard navigation on web, task checkbox state, filter selection, input labels, and screen-reader error announcements.
- Native release builds: verify splash screen, icon, status bar, Android back behavior, and persistence across process termination. Native config changes require rebuilding; existing generated Android files are not the source of truth.

No automated native-device or screenshot test is configured. Do not interpret lint, type checks, storage tests, or web export as proof of a bug-free native release.

## Review results (2026-11-03)

- Lint, TypeScript checks, six storage regression tests, production web export, and Expo SDK dependency validation passed.
- Expo Doctor passed all 20 checks.
- npm production dependency audit reported 12 moderate findings in the Expo tooling dependency chain (glob/minimatch), with no high or critical findings. The suggested forced fix downgrades Expo to SDK 51; it has not been applied because it would break the SDK 58 project. Recheck upstream compatible fixes before release. Audit against `https://registry.npmjs.org`; the configured npm mirror does not implement the audit endpoint.
- Interactive browser testing was blocked by the computer-use tool's inability to determine Chrome's current URL. iOS device testing has not been performed.
- Starter icon artwork remains. Replace and verify branding in native release builds before app store submission.

## Purple and pink redesign (2026-11-03)

- Verified on the connected Xiaomi 23028RNCAG Android phone: task creation, completion, Active empty state, Done filter, editing a completed task, persistence after force-stop/relaunch, reopening, canceling deletion, and confirming deletion.
- Used a temporary QA task and removed it afterward. Existing Work and Study tasks and their completed states were preserved.
- Visually inspected the native screen and keyboard flow. Purple progress card, pink progress fill, white task surfaces, and filters render successfully.
- Animations use Reanimated's system Reduce Motion support. Physical testing of screen readers, Reduce Motion, large text, iOS, and narrow web layouts remains part of the release checklist.
- Lint, TypeScript, six storage tests, and production web export passed. Node's test runner needed permission to spawn its child process outside the sandbox.
