# iOS CI — App Store / TestFlight builds

This repo builds a signed IPA for the **existing** App Store Connect listing:

| Field | Value |
| --- | --- |
| App Store Connect Apple ID | `6766993130` |
| Bundle ID | `com.base69facdfe1fbc3700e00a8387.app` |
| Display name | YouNeeK Pro Radar |

The Capacitor `appId` and Xcode `PRODUCT_BUNDLE_IDENTIFIER` must stay on that bundle ID. Do not invent a new one.

## Workflow

GitHub Actions workflow: [`.github/workflows/ios-app-store.yml`](../.github/workflows/ios-app-store.yml)

- Runner: `macos-15` (or newer)
- Xcode: **26** (iOS 26 SDK) via `maxim-lobanov/setup-xcode` — required for App Store uploads
- Jobs:
  1. **Unsigned compile** — `fastlane ios compile_unsigned` (no secrets; runs on PRs and pushes that touch iOS-related paths)
  2. **Signed IPA** — `fastlane ios build_ipa` with automatic signing + Apple cloud signing (needs secrets; **workflow_dispatch only**)
  3. Optional **TestFlight upload** — `fastlane ios upload_ipa` when you dispatch the workflow with `upload: true`

### Run it

1. Add the repository secrets below (Settings → Secrets and variables → Actions).
2. Actions → **iOS App Store** → **Run workflow**.
3. Leave **Upload the signed IPA…** checked to send the build to App Store Connect / TestFlight after the IPA is produced.
4. Uncheck upload to only produce and attach the IPA artifact.

Local equivalent (on a Mac with Xcode 26 and Node.js 22+ — Capacitor CLI requires Node ≥22):

```bash
npm ci
npm run build:ios
bundle install
bundle exec fastlane ios compile_unsigned   # no signing
# with ASC secrets exported in the shell:
bundle exec fastlane ios beta               # build_ipa + upload_ipa
```

## Required GitHub secrets

Add these separately. **Never commit** `.p8` files, certificates, or passwords.

| Secret | Purpose |
| --- | --- |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID from App Store Connect → Users and Access → Integrations → App Store Connect API |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID on that same page |
| `APP_STORE_CONNECT_API_KEY_P8` | Full contents of the downloaded `.p8` (PEM text including `BEGIN PRIVATE KEY`, or base64 of that file) |
| `APPLE_TEAM_ID` | 10-character Apple Developer Team ID (Membership details) |

### API key role

Cloud-managed distribution signing (used by `xcodebuild -exportArchive` with `-allowProvisioningUpdates` and the authentication key flags) requires an App Store Connect API key with **Admin** access. App Manager / Developer keys fail with a cloud signing permission error.

Create the key in App Store Connect, download the `.p8` once, store it only as `APP_STORE_CONNECT_API_KEY_P8`, and revoke it if it leaks.

## Signing approach

There is **no** iOS Distribution private key in this repository. The signed job prefers:

1. Xcode **automatic signing** (`CODE_SIGN_STYLE = Automatic`)
2. App Store Connect API key authentication on `xcodebuild` (`-authenticationKeyPath` / `-authenticationKeyID` / `-authenticationKeyIssuerID`)
3. Apple **cloud signing** for the App Store export step (no local Distribution `.p12` committed or invented)

Fastlane metadata under `fastlane/metadata/` is left alone for the listing copy. This workflow builds and uploads the binary; it does not rewrite store listing text.

## Extra secrets (only if needed)

Do **not** add these unless the signed job fails because the runner cannot create or use a local Development certificate during `archive` (cloud signing covers Distribution export, not always the archive identity on a fresh CI machine):

| Secret | Why |
| --- | --- |
| `IOS_DEVELOPMENT_CERT_P12_BASE64` | Base64-encoded `.p12` of an **Apple Development** certificate whose private key the ephemeral runner does not have |
| `IOS_DEVELOPMENT_CERT_PASSWORD` | Password for that `.p12` |

If those become necessary, import them into the keychain in the workflow before `build_ipa`. Prefer fixing Admin API key + automatic signing first. Do not add placeholder certificates to the repo.
