// Makes the generated Android project behave like a real app:
//  - fullscreen "immersive" mode (no status bar / navigation bar; swipe from an edge to peek)
//  - Pocket Arcade launcher icon (adaptive + legacy)
// Safe to run more than once. Run from the project folder:  node tools/apply-native.js
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');
if (!fs.existsSync(androidDir)) { console.error('No android folder yet. Run:  npx cap add android'); process.exit(1); }

const cfg = JSON.parse(fs.readFileSync(path.join(root, 'capacitor.config.json'), 'utf8'));
const pkg = cfg.appId;
const javaDir = path.join(androidDir, 'app/src/main/java', ...pkg.split('.'));
fs.mkdirSync(javaDir, { recursive: true });
fs.writeFileSync(path.join(javaDir, 'MainActivity.java'), `package ${pkg};

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    private void hideSystemBars() {
        Window window = getWindow();
        View decor = window.getDecorView();
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(window, decor);
        if (c == null) return;
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
`);
console.log('✓ MainActivity.java (fullscreen)');

// icons
const src = path.join(__dirname, 'res'), dst = path.join(androidDir, 'app/src/main/res');
function copyDir(a, b) {
  for (const e of fs.readdirSync(a, { withFileTypes: true })) {
    const s = path.join(a, e.name), d = path.join(b, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyDir(s, d); } else fs.copyFileSync(s, d);
  }
}
copyDir(src, dst);
console.log('✓ launcher icons');

// make sure rotation does not restart the activity (Capacitor's template already sets this; verify)
const mf = path.join(androidDir, 'app/src/main/AndroidManifest.xml');
let m = fs.readFileSync(mf, 'utf8');
if (!/configChanges/.test(m)) { m = m.replace('<activity ', '<activity android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout|uiMode" '); fs.writeFileSync(mf, m); console.log('✓ manifest configChanges'); }
console.log('Done. Now run:  npx cap sync android');
