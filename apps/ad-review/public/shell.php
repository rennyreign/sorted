<?php
declare(strict_types=1);

$tenant = $_GET['tenant'] ?? '';
if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $tenant)) {
    http_response_code(404);
    exit('Not found');
}
$origin = 'https://sortmydigital.site/ad-previewer';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
?>
<!doctype html>
<html lang="en" data-tenant="<?= htmlspecialchars($tenant, ENT_QUOTES, 'UTF-8') ?>" data-origin="<?= $origin ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Ad Review | Sorted</title>
  <link rel="stylesheet" href="<?= $origin ?>/styles.css">
</head>
<body>
  <div id="app"><main class="loading"><span></span><p>Opening Ad Review</p></main></div>
  <script type="module" src="<?= $origin ?>/app.js"></script>
</body>
</html>
