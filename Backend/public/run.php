<?php
/**
 * ============================================================
 *  CERTENIZE — Browser-Executable Artisan Runner
 * ============================================================
 *  Usage: https://api.yourdomain.com/run.php?token=5f3a9e7d2b8c4a1e9c8b7f6e0d2a1b3c&cmd=status
 *
 *  ⚠️  SECURITY WARNING:
 *  - This file contains a pre-generated secure token below.
 *  - You can change it to another secure value if you prefer.
 *  - DELETE this file from the server immediately after use.
 *  - Never leave this file on a production server unattended.
 * ============================================================
 */

// Enable full error display for debugging the 500 error
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ─── SECURE RUNNER TOKEN (Keep this safe) ─────────────────────────────────────
define('RUNNER_TOKEN', '5f3a9e7d2b8c4a1e9c8b7f6e0d2a1b3c');
// ──────────────────────────────────────────────────────────────────────────────

// ─── Security check ──────────────────────────────────────────────────────────
if (!isset($_GET['token']) || $_GET['token'] !== RUNNER_TOKEN) {
    http_response_code(403);
    die('403 Forbidden — Invalid or missing token.');
}

// ─── Bootstrap Laravel ───────────────────────────────────────────────────────
define('LARAVEL_START', microtime(true));

// run.php lives in /public — artisan & vendor are one level up
$basePath = dirname(__DIR__);

require $basePath . '/vendor/autoload.php';

$app = require_once $basePath . '/bootstrap/app.php';

/** @var \Illuminate\Contracts\Console\Kernel $kernel */
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// ─── Available commands ───────────────────────────────────────────────────────
$commands = [
    'migrate'        => ['command' => 'migrate',          'args' => ['--force' => true], 'label' => 'Run database migrations (--force)'],
    'status'         => ['command' => 'migrate:status',    'args' => [],                  'label' => 'Show migration status'],
    'rollback'       => ['command' => 'migrate:rollback',  'args' => ['--force' => true], 'label' => 'Rollback last migration batch'],
    'db-seed'        => ['command' => 'db:seed',           'args' => ['--force' => true], 'label' => 'Seed database tables'],
    'key-generate'   => ['command' => 'key:generate',      'args' => ['--force' => true], 'label' => 'Generate App Encryption Key'],
    'config-cache'   => ['command' => 'config:cache',      'args' => [],                  'label' => 'Cache configuration files'],
    'config-clear'   => ['command' => 'config:clear',      'args' => [],                  'label' => 'Clear configuration cache'],
    'cache-clear'    => ['command' => 'cache:clear',       'args' => [],                  'label' => 'Flush application data cache'],
    'view-clear'     => ['command' => 'view:clear',        'args' => [],                  'label' => 'Clear compiled blade views'],
    'route-cache'    => ['command' => 'route:cache',       'args' => [],                  'label' => 'Cache application routes'],
    'optimize'       => ['command' => 'optimize',          'args' => [],                  'label' => 'Cache config, routes & views'],
    'optimize-clear' => ['command' => 'optimize:clear', 'args' => [],                  'label' => 'Clear all optimize caches'],
    'storage-link'   => ['command' => 'storage:link',      'args' => [],                  'label' => 'Create public storage symlink'],
    'migrate-fresh'  => ['command' => 'migrate:fresh',     'args' => ['--force' => true], 'label' => '⚠️ FRESH: Wipe & Re-run Migrations'],
];

$cmd = $_GET['cmd'] ?? ($_POST['cmd'] ?? '');
$customCmd = trim($_POST['custom_cmd'] ?? '');
$output = '';
$exitCode = null;
$ran = false;

// Handle custom artisan command input
if (!empty($customCmd)) {
    try {
        ob_start();
        $parts = explode(' ', $customCmd);
        $commandName = array_shift($parts);
        $args = [];
        foreach ($parts as $part) {
            if (str_starts_with($part, '--')) {
                $eq = strpos($part, '=');
                if ($eq !== false) {
                    $k = substr($part, 0, $eq);
                    $v = substr($part, $eq + 1);
                    $args[$k] = $v;
                } else {
                    $args[$part] = true;
                }
            } else {
                $args[] = $part;
            }
        }
        $exitCode = $kernel->call($commandName, $args);
        $output = $kernel->output();
        ob_end_clean();
        $ran = true;
        $cmdNameDisplay = "php artisan " . $customCmd;
    } catch (\Throwable $e) {
        $ran = true;
        $exitCode = 999;
        $output = "Exception running custom command:\n\n" . $e->getMessage() . "\n\n" . $e->getTraceAsString();
        $cmdNameDisplay = "php artisan " . $customCmd;
    }
} elseif ($cmd && isset($commands[$cmd])) {
    try {
        ob_start();
        $exitCode = $kernel->call($commands[$cmd]['command'], $commands[$cmd]['args']);
        $output = $kernel->output();
        ob_end_clean();
        $ran = true;
        $cmdNameDisplay = "php artisan " . $commands[$cmd]['command'];
    } catch (\Throwable $e) {
        $ran = true;
        $exitCode = 999;
        $output = "An exception occurred while executing 'php artisan " . $commands[$cmd]['command'] . "':\n\n" .
                  "Message: " . $e->getMessage() . "\n" .
                  "File: " . $e->getFile() . " (Line " . $e->getLine() . ")\n\n" .
                  "Stack Trace:\n" . $e->getTraceAsString();
        $cmdNameDisplay = "php artisan " . $commands[$cmd]['command'];
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CERTENIZE — Web Artisan Runner</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #090d16;
            color: #f1f5f9;
            padding: 24px;
            min-height: 100vh;
        }
        .container { max-width: 900px; margin: 0 auto; }
        header {
            border-bottom: 1px solid #1e293b;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        header h1 { font-size: 1.5rem; color: #a78bfa; font-weight: 700; }
        header p { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
        .warning {
            background: #7f1d1d;
            border: 1px solid #b91c1c;
            color: #fca5a5;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 0.85rem;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-bottom: 28px; }
        .cmd-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 14px 16px;
            text-decoration: none;
            display: block;
            transition: border-color 0.2s, background 0.2s;
        }
        .cmd-card:hover { border-color: #8b5cf6; background: #2e1065; }
        .cmd-card.active { border-color: #a78bfa; background: #4c1d95; }
        .cmd-card code { display: block; color: #c084fc; font-size: 0.8rem; font-family: monospace; margin-bottom: 4px; }
        .cmd-card span { color: #94a3b8; font-size: 0.8rem; }
        .output-box {
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
        }
        .output-box h2 {
            font-size: 0.95rem;
            color: #38bdf8;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 0.72rem;
            font-weight: 600;
        }
        .badge-ok  { background: #065f46; color: #34d399; }
        .badge-err { background: #991b1b; color: #f87171; }
        pre {
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 0.85rem;
            white-space: pre-wrap;
            word-break: break-word;
            color: #e2e8f0;
            background: #000;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #0f172a;
            line-height: 1.6;
        }
        .empty { color: #64748b; font-style: italic; }
        footer { margin-top: 48px; font-size: 0.75rem; color: #475569; text-align: center; }
    </style>
</head>
<body>
<div class="container">
    <header>
        <div>
            <h1>🔒 CERTENIZE — Web Artisan Runner</h1>
            <p>Execution Tool for Laravel on Shared/cPanel Hosting</p>
        </div>
    </header>

    <div class="warning">
        <strong>⚠️ DANGER / SECURITY REMINDER:</strong> Delete this file (<code>run.php</code>) from your server's <code>public/</code> folder as soon as you have finished running migrations/seeding. Leaving this file on a live server is a severe security risk!
    </div>

    <div class="grid">
        <?php foreach ($commands as $key => $def): ?>
        <a href="?token=<?= htmlspecialchars(RUNNER_TOKEN) ?>&cmd=<?= $key ?>"
           class="cmd-card <?= ($cmd === $key) ? 'active' : '' ?>">
            <code>?cmd=<?= $key ?></code>
            <span><?= htmlspecialchars($def['label']) ?></span>
        </a>
        <?php endforeach; ?>
    </div>

    <!-- Custom Command Input Form -->
    <form method="POST" action="?token=<?= htmlspecialchars(RUNNER_TOKEN) ?>" style="margin-bottom: 24px; display: flex; gap: 8px;">
        <input type="text" name="custom_cmd" placeholder="Type custom artisan command (e.g. migrate --force, route:list, db:seed)..." 
               value="<?= htmlspecialchars($customCmd) ?>"
               style="flex: 1; padding: 12px 16px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #f8fafc; font-family: monospace; font-size: 0.9rem; outline: none;">
        <button type="submit" style="padding: 12px 20px; border-radius: 8px; border: none; background: #7c3aed; color: #fff; font-weight: 600; cursor: pointer; font-size: 0.9rem; white-space: nowrap;">
            Run Artisan Command
        </button>
    </form>

    <div class="output-box">
        <?php if ($ran): ?>
            <h2>
                Command Output: <code style="color:#f1f5f9;font-size:0.9rem"><?= htmlspecialchars($cmdNameDisplay ?? '') ?></code>
                <span class="badge <?= $exitCode === 0 ? 'badge-ok' : 'badge-err' ?>">
                    <?= $exitCode === 0 ? 'Success' : ($exitCode === 999 ? 'Exception Thrown' : "Exit Code $exitCode") ?>
                </span>
            </h2>
            <pre><?= htmlspecialchars(trim($output) ?: '(No output returned)') ?></pre>
        <?php else: ?>
            <p class="empty">Click any command above or type a custom command to run it on the server. Output will appear here.</p>
        <?php endif; ?>
    </div>

    <footer>
        Certenize MVP Utility · run.php · Ensure you delete this file after execution.
    </footer>
</div>
</body>
</html>
