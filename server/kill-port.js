/* ── Super Collection · kill-port.js ─────────────────────────────
   npm run dev se pehle chalta hai — port 5000 (ya PORT env) par koi
   stale process ho to use force-kill kar deta hai, taaki
   "EADDRINUSE: address already in use" jaisa error kabhi na aaye. */

const { execSync } = require('child_process');

const PORT = process.env.PORT || 5000;

/* Windows PowerShell se port par LISTEN karne wala PID dhundo */
function findPidPS(port) {
  try {
    const ps = `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`;
    const out = execSync(ps, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (!out) return null;
    const first = out.split(/\r?\n/).map((s) => s.trim()).find((s) => /^\d+$/.test(s));
    return first ? Number(first) : null;
  } catch {
    return null;
  }
}

function killPid(pid) {
  try {
    execSync(`powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const pid = findPidPS(PORT);
if (pid) {
  console.log(`🔧 Port ${PORT} is busy (PID ${pid}) — freeing it...`);
  if (killPid(pid)) {
    // Windows pe port release hone me thoda time lagta hai
    execSync('powershell -NoProfile -Command "Start-Sleep -Milliseconds 800"', { stdio: 'ignore' });
    console.log(`✅ Port ${PORT} is now free.`);
  } else {
    console.log(`⚠️  Could not kill PID ${pid}. Please close the terminal/process using port ${PORT} and retry.`);
    process.exit(1);
  }
} else {
  console.log(`✅ Port ${PORT} is already free.`);
}