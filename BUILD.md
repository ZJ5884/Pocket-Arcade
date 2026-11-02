# Pocket Arcade 2.0 – from scratch to an installed app (Windows)

Total time: about 30–40 minutes the first time (mostly downloads). Do these once; later updates take 2 minutes.

## Part 1 – Install the tools (one time)
1. **Node.js**: go to nodejs.org, download the LTS installer, run it, accept the defaults, restart PowerShell afterwards.
2. **Android Studio**: go to developer.android.com/studio, download and install it. Open it once and let the
   first-run wizard finish downloading the SDK (choose "Standard"). This takes a while.
3. **Java** is bundled with Android Studio, so you don't need to install it.

## Part 2 – Set up the project
4. Unzip `pocket-arcade-apk-project.zip` somewhere simple, e.g. `C:\Users\<you>\Downloads\Game android`.
5. Open PowerShell in that folder (File Explorer: click the address bar, type `powershell`, press Enter).
6. If you see "running scripts is disabled", either use `npm.cmd` instead of `npm` below, or run once:
   `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` and answer Y.
7. Run: `npm.cmd run setup`
   This downloads the app's parts, creates the `android` folder, applies the fullscreen mode and icon, and syncs.
   It takes a few minutes. If it ends with an error, copy the last lines and send them to me.

## Part 3 – Build the APK
8. Run: `npm.cmd run open` (Android Studio opens the project).
9. Wait for the bottom bar to say Gradle sync finished (first time: 5–10 minutes). If asked to update Gradle or
   the Android plugin, choose "Don't remind me" / skip.
10. Menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**. When it finishes, click **locate** in the popup.
    The file is `android\app\build\outputs\apk\debug\app-debug.apk`.

## Part 4 – Install on your phone / AYN Thor
11. Copy `app-debug.apk` to the device (USB cable, Google Drive, or Telegram to yourself).
12. On the device open the file and tap Install. If asked, allow "Install unknown apps" for the app you opened it from.
13. Open **Pocket Arcade**. Connect a controller if you have one (the Thor's built-in buttons work automatically).
14. Open Settings once: pick a theme, set the orientation to Landscape on the Thor, and turn on vibration if you like.

## Updating later (new version of the files)
1. Replace the `www` folder contents with the new `index.html` (and icons), and `package.json` / `capacitor.config.json` if included.
2. `npm.cmd install` (only if package.json changed), then `npm.cmd run update`, then `npm.cmd run open`.
3. Build the APK again and **install it over the old app** (don't uninstall first) so your saves are kept.

## If you already have the older android folder
You can keep it. Follow "Updating later" above; step 2 adds the new plugins and fullscreen mode.

## Saving
Everything saves automatically (scores per difficulty, favourites, recent games, play time, trophies, name, settings).
It is stored in the app's own storage, which survives closing the app and clearing the web cache.
Settings > Back up progress shares a small file; Restore from backup loads it (use this before uninstalling or on a new device).

## Controls
D-pad / left stick: move. A: confirm. B: back. X: difficulty (menu) / undo or fine aim. Y: favourite (menu) / hint.
L1/R1: category (menu) or difficulty (in a game). Start: settings (menu) or restart (in a game). Select: progress.
If A and B feel swapped, turn on Swap A and B in Settings > Controller.

## Troubleshooting
* "npm is not recognized": close and reopen PowerShell after installing Node.
* Gradle sync fails with a Java error: in Android Studio, File > Settings > Build Tools > Gradle, set Gradle JDK to the embedded/jbr option.
* App shows an old version: you forgot `npm.cmd run update` before building, or built before it finished.
* Phone says "App not installed": uninstall the old copy once, then install (you'll lose old saves, so back up first).
