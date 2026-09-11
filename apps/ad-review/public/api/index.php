<?php
declare(strict_types=1);

const STATUSES = ['awaiting_review', 'approved', 'changes_requested', 'rejected'];
const TARGET_TYPES = ['concept', 'ad'];
require_once __DIR__ . '/editor.php';

function respond(array $body, int $status = 200, array $headers = []): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    foreach ($headers as $name => $value) header($name . ': ' . $value);
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function config(): array {
    $file = dirname(__DIR__, 3) . '/ad-previewer-config.php';
    $value = is_file($file) ? require $file : [];
    $url = getenv('SUPABASE_URL') ?: ($value['SUPABASE_URL'] ?? '');
    $key = getenv('SUPABASE_SERVICE_KEY') ?: ($value['SUPABASE_SERVICE_KEY'] ?? '');
    if (!$url || !$key) throw new RuntimeException('Missing database configuration');
    return ['url' => rtrim($url, '/'), 'key' => $key];
}

function db(string $path, string $method = 'GET', ?array $body = null, array $extraHeaders = []): mixed {
    $config = config();
    $curl = curl_init($config['url'] . '/rest/v1/' . $path);
    $headers = ['apikey: ' . $config['key'], 'Authorization: Bearer ' . $config['key'], 'Content-Type: application/json'];
    foreach ($extraHeaders as $header) $headers[] = $header;
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers, CURLOPT_TIMEOUT => 12]);
    if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    $raw = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    if ($raw === false || $status < 200 || $status >= 300) throw new RuntimeException('Database request failed with status ' . $status);
    return $raw === '' ? null : json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
}

function bearer(): string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    return preg_match('/^Bearer\s+(.+)$/i', $header, $match) ? trim($match[1]) : '';
}

function requestBody(): ?array {
    $raw = file_get_contents('php://input');
    if (strlen($raw) > 150000) respond(['error' => 'Request is too large.'], 413);
    $body = json_decode($raw, true);
    return is_array($body) ? $body : null;
}

function originHeaders(string $allowed): array {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $accepted = ($origin === $allowed || $origin === 'https://sortmydigital.site' || preg_match('/^https:\/\/[a-z0-9-]+\.netlify\.app$/', $origin)) ? $origin : $allowed;
    return ['Access-Control-Allow-Origin' => $accepted, 'Access-Control-Allow-Headers' => 'Authorization, Content-Type', 'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS', 'Vary' => 'Origin'];
}

function fingerprint(array $value): string {
    unset($value['fingerprint']);
    return hash('sha256', json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}

function validatePackage(?array $input): array {
    $errors = [];
    $slug = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';
    if (($input['schema_version'] ?? null) !== 1) $errors[] = 'schema_version must be 1';
    if (!preg_match($slug, $input['idempotency_key'] ?? '')) $errors[] = 'idempotency_key is invalid';
    if (!preg_match($slug, $input['client_slug'] ?? '')) $errors[] = 'client_slug is invalid';
    $campaign = $input['campaign'] ?? null;
    if (!is_array($campaign) || !preg_match($slug, $campaign['id'] ?? '') || !is_int($campaign['revision'] ?? null) || $campaign['revision'] < 1) $errors[] = 'campaign identity is invalid';
    if (($campaign['platform'] ?? '') !== 'meta' || !trim($campaign['name'] ?? '') || !trim($campaign['objective'] ?? '')) $errors[] = 'campaign fields are invalid';
    if (empty($campaign['concepts']) || !is_array($campaign['concepts'])) $errors[] = 'campaign concepts are required';
    $conceptIds = []; $adIds = [];
    foreach (($campaign['concepts'] ?? []) as $concept) {
        $id = $concept['id'] ?? '';
        if (!preg_match($slug, $id) || isset($conceptIds[$id])) $errors[] = 'concept id is invalid or duplicated: ' . $id;
        $conceptIds[$id] = true;
        foreach (['name', 'strategy', 'audience', 'proposition'] as $field) if (!trim($concept[$field] ?? '')) $errors[] = 'concept ' . $id . ' missing ' . $field;
        if (!is_int($concept['revision'] ?? null) || $concept['revision'] < 1 || empty($concept['ads'])) $errors[] = 'concept ' . $id . ' metadata is invalid';
        foreach (($concept['ads'] ?? []) as $ad) {
            $adId = $ad['id'] ?? '';
            if (!preg_match('/^[A-Za-z0-9-]+$/', $adId) || isset($adIds[$adId])) $errors[] = 'ad id is invalid or duplicated: ' . $adId;
            $adIds[$adId] = true;
            if (!is_int($ad['revision'] ?? null) || $ad['revision'] < 1 || !in_array($ad['placement'] ?? '', ['facebook_feed', 'instagram_feed'], true) || !in_array($ad['ratio'] ?? '', ['4:5', '1:1', '16:9'], true) || !in_array($ad['cta'] ?? '', ['BOOK_NOW', 'LEARN_MORE', 'SIGN_UP'], true)) $errors[] = 'ad metadata is invalid: ' . $adId;
            foreach (['primary_text', 'headline', 'description', 'creative_key', 'creative_alt', 'destination_url'] as $field) if (!trim($ad[$field] ?? '')) $errors[] = 'ad ' . $adId . ' missing ' . $field;
            if (!preg_match('#^/(?:creatives|media/[a-z0-9-]+)/[a-f0-9]{64}\.webp$#', $ad['creative_key'] ?? '')) $errors[] = 'ad ' . $adId . ' creative key is not immutable';
            if (isset($ad['crop'])) foreach (['x','y'] as $axis) if (!isset($ad['crop'][$axis]) || !is_numeric($ad['crop'][$axis]) || $ad['crop'][$axis] < 0 || $ad['crop'][$axis] > 100) $errors[] = 'Invalid crop: ' . $adId;
            $destination = parse_url($ad['destination_url'] ?? '');
            if (($destination['scheme'] ?? '') !== 'https' || empty($destination['host'])) $errors[] = 'ad ' . $adId . ' destination is invalid';
        }
    }
    return $errors;
}

try {
    $action = $_GET['action'] ?? 'portal';
    if ($action === 'ingest') {
        if (!in_array($_SERVER['REQUEST_METHOD'], ['GET','POST'], true)) respond(['error' => 'Method not allowed.'], 405);
        $tokenHash = hash('sha256', bearer());
        $keys = db('ad_review_agent_keys?token_hash=eq.' . $tokenHash . '&revoked_at=is.null&select=tenant_slug');
        $tenantSlug = $keys[0]['tenant_slug'] ?? '';
        if (!$tenantSlug) respond(['error' => 'Invalid ingestion credential.'], 401);
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $rows = db('ad_review_campaigns?tenant_slug=eq.' . rawurlencode($tenantSlug) . '&campaign_id=eq.' . rawurlencode($_GET['campaign_id'] ?? '') . '&order=revision.desc&limit=1&select=package');
            $locks = db('ad_review_image_locks?tenant_slug=eq.' . rawurlencode($tenantSlug) . '&campaign_id=eq.' . rawurlencode($_GET['campaign_id'] ?? '') . '&select=ad_id,selection');
            respond(['package' => $rows[0]['package'] ?? null, 'base_revision' => $rows[0]['package']['campaign']['revision'] ?? 0, 'image_locks' => $locks, 'assets' => tenantAssets($tenantSlug)]);
        }
        $input = requestBody();
        $errors = validatePackage($input);
        if ($errors) respond(['error' => 'Campaign package failed validation.', 'fields' => $errors], 422);
        if ($input['client_slug'] !== $tenantSlug) respond(['error' => 'Credential is not authorised for this client.'], 403);
        if (!is_int($input['base_revision'] ?? null) || $input['base_revision'] < 0) respond(['error' => 'Fetch the latest campaign and supply base_revision (0 for a new campaign).'], 422);
        $tenantRows = db('ad_review_tenants?slug=eq.' . rawurlencode($tenantSlug) . '&select=allowed_destination_hosts');
        $allowedHosts = $tenantRows[0]['allowed_destination_hosts'] ?? [];
        foreach ($input['campaign']['concepts'] as $concept) foreach ($concept['ads'] as $ad) if (!in_array(parse_url($ad['destination_url'], PHP_URL_HOST), $allowedHosts, true)) respond(['error' => 'Destination host is not allowed for ' . $ad['id'] . '.'], 422);
        $payloadHash = hash('sha256', json_encode($input, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        $previous = db('ad_review_ingestions?tenant_slug=eq.' . rawurlencode($tenantSlug) . '&idempotency_key=eq.' . rawurlencode($input['idempotency_key']) . '&select=payload_hash,campaign_id,campaign_revision');
        if ($previous) {
            if (hash_equals($previous[0]['payload_hash'], $payloadHash)) respond(['ok' => true, 'idempotent' => true, 'campaign_id' => $previous[0]['campaign_id'], 'revision' => $previous[0]['campaign_revision']]);
            respond(['error' => 'Idempotency key was already used for different content.'], 409);
        }
        foreach ($input['campaign']['concepts'] as &$concept) {
            $concept['fingerprint'] = fingerprint(array_intersect_key($concept, array_flip(['revision', 'name', 'strategy', 'audience', 'proposition'])));
            foreach ($concept['ads'] as &$ad) $ad['fingerprint'] = fingerprint($ad);
        }
        unset($concept, $ad);
        $campaign = $input['campaign'];
        ensureAssets($tenantSlug, $campaign);
        $result = db('rpc/ad_review_write_revision', 'POST', ['p_tenant' => $tenantSlug, 'p_package' => $input, 'p_base_revision' => $input['base_revision'], 'p_actor' => 'agent', 'p_mode' => 'agent', 'p_idempotency_key' => $input['idempotency_key'], 'p_hash' => $payloadHash]);
        respond(rpcResult($result), 201);
    }

    $slug = $_GET['tenant'] ?? '';
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) respond(['error' => 'Workspace not found.'], 404);
    $tenants = db('ad_review_tenants?slug=eq.' . rawurlencode($slug) . '&select=slug,name,allowed_origin,access_token_hash,access_expires_at,access_revoked_at');
    $tenant = $tenants[0] ?? null;
    if (!$tenant) respond(['error' => 'Workspace not found.'], 404);
    $headers = originHeaders($tenant['allowed_origin']);
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') respond([], 204, $headers);
    $ipHash = hash('sha256', $_SERVER['HTTP_X_NF_CLIENT_CONNECTION_IP'] ?? explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 'unknown')[0]);
    $since = rawurlencode(gmdate('c', time() - 900));
    $attempts = db('ad_review_access_audit?tenant_slug=eq.' . rawurlencode($slug) . '&ip_hash=eq.' . $ipHash . '&success=eq.false&created_at=gte.' . $since . '&select=id&limit=20');
    if (count($attempts) >= 20) respond(['error' => 'Too many attempts. Try again later.'], 429, $headers);
    $expired = !empty($tenant['access_expires_at']) && strtotime($tenant['access_expires_at']) <= time();
    $valid = bearer() !== '' && !$expired && empty($tenant['access_revoked_at']) && hash_equals($tenant['access_token_hash'], hash('sha256', bearer()));
    db('ad_review_access_audit', 'POST', ['tenant_slug' => $slug, 'ip_hash' => $ipHash, 'success' => $valid, 'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 300)], ['Prefer: return=minimal']);
    if (!$valid) respond(['error' => 'That access code is not valid.'], 401, $headers);
    $editor = ['name' => 'Portal editor'];

    if (in_array($action, ['upload','edit-image','edit-copy','unlock-image'], true)) {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['error' => 'Method not allowed.'], 405, $headers);
        if ($action === 'upload') uploadAsset($slug, $headers);
        if ($action === 'edit-copy') editCopy($slug, $editor, $headers);
        editImage($slug, $editor, $headers, $action);
    }
    if ($action === 'history') {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(['error' => 'Method not allowed.'], 405, $headers);
        $rows = db('ad_review_campaigns?tenant_slug=eq.' . rawurlencode($slug) . '&campaign_id=eq.' . rawurlencode($_GET['campaign_id'] ?? '') . '&order=revision.desc&select=revision,package,provenance,created_at');
        $history = [];
        foreach ($rows as $row) foreach ($row['package']['campaign']['concepts'] as $concept) foreach ($concept['ads'] as $ad) if ($ad['id'] === ($_GET['ad_id'] ?? '')) $history[] = ['ad' => $ad, 'campaign_revision' => $row['revision'], 'actor' => $row['provenance']['actor'] ?? 'Agent', 'mode' => $row['provenance']['mode'] ?? 'agent', 'created_at' => $row['created_at']];
        respond(['history' => $history], 200, $headers);
    }
    if ($action !== 'portal') respond(['error' => 'Unknown action.'], 404, $headers);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $rows = db('ad_review_campaigns?tenant_slug=eq.' . rawurlencode($slug) . '&select=campaign_id,revision,package,created_at&order=revision.desc');
        $campaigns = [];
        foreach ($rows as $row) if (!isset($campaigns[$row['campaign_id']])) $campaigns[$row['campaign_id']] = $row['package']['campaign'];
        $decisions = db('ad_review_decisions?tenant_slug=eq.' . rawurlencode($slug) . '&select=id,campaign_id,campaign_revision,target_type,target_id,fingerprint,status,comment,reviewer,created_at&order=created_at.asc');
        $locks = db('ad_review_image_locks?tenant_slug=eq.' . rawurlencode($slug) . '&select=campaign_id,ad_id,editor');
        $assets = tenantAssets($slug);
        respond(['tenant' => ['slug' => $tenant['slug'], 'name' => $tenant['name']], 'role' => 'editor', 'editor_name' => $editor['name'], 'assets' => assetUrls($assets), 'image_locks' => $locks, 'campaigns' => array_values($campaigns), 'decisions' => $decisions], 200, $headers);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['error' => 'Method not allowed.'], 405, $headers);
    $input = requestBody();
    if (!$input || !in_array($input['target_type'] ?? '', TARGET_TYPES, true) || !in_array($input['status'] ?? '', STATUSES, true) || (($input['status'] ?? '') === 'awaiting_review' && ($input['target_type'] ?? '') !== 'concept')) respond(['error' => 'Invalid decision.'], 400, $headers);
    $reviewer = trim($input['reviewer'] ?? '');
    $comment = trim($input['comment'] ?? '');
    if (!$reviewer || strlen($reviewer) > 100 || strlen($comment) > 2000 || ($input['status'] === 'changes_requested' && !$comment)) respond(['error' => 'Add your name and the requested change.'], 400, $headers);
    $rows = db('ad_review_campaigns?tenant_slug=eq.' . rawurlencode($slug) . '&campaign_id=eq.' . rawurlencode($input['campaign_id'] ?? '') . '&revision=eq.' . (int) ($input['campaign_revision'] ?? 0) . '&select=package');
    $campaign = $rows[0]['package']['campaign'] ?? null;
    if (!$campaign) respond(['error' => 'Campaign revision not found.'], 409, $headers);
    $target = null;
    foreach ($campaign['concepts'] as $concept) {
        if (($input['target_type'] === 'concept') && $concept['id'] === ($input['target_id'] ?? '')) $target = $concept;
        foreach ($concept['ads'] as $ad) if (($input['target_type'] === 'ad') && $ad['id'] === ($input['target_id'] ?? '')) $target = $ad;
    }
    if (!$target || !hash_equals($target['fingerprint'], $input['fingerprint'] ?? '')) respond(['error' => 'This item has changed. Refresh before reviewing it.'], 409, $headers);
    $input['comment'] = $comment;
    $input['reviewer'] = $reviewer;
    respond(rpcResult(db('rpc/ad_review_save_decision', 'POST', ['p_tenant' => $slug, 'p_decision' => $input]), $headers), 201, $headers);
} catch (Throwable $error) {
    error_log('Ad previewer: ' . $error->getMessage());
    respond(['error' => 'Ad previewer is temporarily unavailable.'], 503);
}
