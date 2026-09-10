<?php
declare(strict_types=1);

function rpcResult(array $result, array $headers = []): array {
    if (isset($result['error'])) respond(['error' => $result['error']], $result['status'] ?? 409, $headers);
    return $result;
}

function storage(string $path, string $method = 'POST', mixed $body = null, string $type = 'application/json'): array {
    $config = config();
    $curl = curl_init($config['url'] . '/storage/v1/' . $path);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $config['key'], 'apikey: ' . $config['key'], 'Content-Type: ' . $type, 'x-upsert: false']]);
    if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
    $raw = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    if ($raw === false || $status < 200 || $status >= 300) throw new RuntimeException('Media storage request failed: ' . $status, $status);
    return json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
}

function assetUrls(array $assets): array {
    $paths = [];
    foreach ($assets as $asset) if (str_starts_with($asset['creative_key'], '/media/')) $paths[] = substr($asset['creative_key'], 7);
    $urls = [];
    if ($paths) {
        $signed = storage('object/sign/ad-review-media', 'POST', ['paths' => array_values(array_unique($paths)), 'expiresIn' => 3600]);
        foreach ($signed as $entry) if (!empty($entry['signedURL'])) $urls['/media/' . $entry['path']] = config()['url'] . '/storage/v1' . $entry['signedURL'];
    }
    foreach ($assets as &$asset) $asset['url'] = $urls[$asset['creative_key']] ?? ('https://sortmydigital.site/ad-previewer' . $asset['creative_key']);
    unset($asset);
    return $assets;
}

function tenantAssets(string $slug): array {
    return db('ad_review_assets?tenant_slug=eq.' . rawurlencode($slug) . '&select=creative_key,name,collection,kind,width,height,created_at&order=created_at.desc');
}

function ensureAssets(string $slug, array $campaign): void {
    $known = array_column(tenantAssets($slug), null, 'creative_key');
    foreach ($campaign['concepts'] as $concept) foreach ($concept['ads'] as $ad) {
        $key = $ad['creative_key'];
        if (isset($known[$key])) continue;
        // Agent packages can introduce deployed immutable files, never arbitrary URLs or another tenant's uploads.
        if (!preg_match('#^/creatives/[a-f0-9]{64}\.webp$#', $key)) respond(['error' => 'Image is not in this client library: ' . $ad['id']], 422);
        $file = dirname(__DIR__) . $key;
        if (!is_file($file) || !hash_equals(basename($key, '.webp'), hash_file('sha256', $file))) respond(['error' => 'Creative file is missing or its hash does not match: ' . $ad['id']], 422);
        $size = getimagesize($file);
        db('ad_review_assets', 'POST', ['tenant_slug' => $slug, 'creative_key' => $key, 'name' => $ad['creative_alt'], 'collection' => $campaign['name'], 'width' => $size[0] ?? 0, 'height' => $size[1] ?? 0], ['Prefer: resolution=ignore-duplicates,return=minimal']);
        $known[$key] = true;
    }
}

function uploadAsset(string $slug, array $headers): never {
    $file = $_FILES['image'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK || $file['size'] > 8 * 1024 * 1024 || !is_uploaded_file($file['tmp_name'])) respond(['error' => 'Choose a WebP image under 8 MB.'], 422, $headers);
    $size = getimagesize($file['tmp_name']);
    if (!$size || ($size['mime'] ?? '') !== 'image/webp' || $size[0] < 100 || $size[1] < 100 || $size[0] * $size[1] > 24000000) respond(['error' => 'Use a valid image of at least 100 × 100 pixels and at most 24 megapixels.'], 422, $headers);
    $name = trim($_POST['name'] ?? '');
    $collection = trim($_POST['collection'] ?? '');
    $kind = $_POST['kind'] ?? 'photo';
    if (!$name || strlen($name) > 200 || strlen($collection) > 100 || !in_array($kind, ['photo','artwork'], true)) respond(['error' => 'Add an image name (up to 200 characters) and a valid image type.'], 422, $headers);
    $bytes = file_get_contents($file['tmp_name']);
    $path = $slug . '/' . hash('sha256', $bytes) . '.webp';
    $key = '/media/' . $path;
    $existing = db('ad_review_assets?tenant_slug=eq.' . rawurlencode($slug) . '&creative_key=eq.' . rawurlencode($key));
    if (!$existing) {
        // Content addressed uploads are never overwritten; retries may find an already uploaded object.
        try { storage('object/ad-review-media/' . $path, 'POST', $bytes, 'image/webp'); }
        catch (RuntimeException $error) {
            if ($error->getCode() !== 409) throw $error;
            // A successful signed URL confirms the immutable object exists after a concurrent upload.
            storage('object/sign/ad-review-media/' . $path, 'POST', ['expiresIn' => 60]);
        }
        db('ad_review_assets', 'POST', ['tenant_slug' => $slug, 'creative_key' => $key, 'name' => $name, 'collection' => $collection, 'kind' => $kind, 'width' => $size[0], 'height' => $size[1]], ['Prefer: resolution=ignore-duplicates,return=minimal']);
    }
    $assets = db('ad_review_assets?tenant_slug=eq.' . rawurlencode($slug) . '&creative_key=eq.' . rawurlencode($key));
    respond(['asset' => assetUrls($assets)[0]], 201, $headers);
}

function editImage(string $slug, array $editor, array $headers, string $action): never {
    $input = requestBody();
    if (!$input || !is_int($input['base_revision'] ?? null)) respond(['error' => 'A current campaign revision is required.'], 422, $headers);
    $rows = db('ad_review_campaigns?tenant_slug=eq.' . rawurlencode($slug) . '&campaign_id=eq.' . rawurlencode($input['campaign_id'] ?? '') . '&order=revision.desc&limit=1&select=package');
    if (!$rows) respond(['error' => 'Campaign not found.'], 404, $headers);
    $package = $rows[0]['package'];
    $campaign = &$package['campaign'];
    if ($campaign['revision'] !== $input['base_revision']) respond(['error' => 'This campaign has changed. Close the editor and refresh before saving.'], 409, $headers);
    $found = false;
    foreach ($campaign['concepts'] as &$concept) foreach ($concept['ads'] as &$ad) {
        if ($ad['id'] !== ($input['ad_id'] ?? '')) continue;
        $found = true;
        if (!hash_equals($ad['fingerprint'], $input['fingerprint'] ?? '')) respond(['error' => 'This ad has changed. Refresh before saving.'], 409, $headers);
        if ($action === 'edit-image') {
            $assets = db('ad_review_assets?tenant_slug=eq.' . rawurlencode($slug) . '&creative_key=eq.' . rawurlencode($input['creative_key'] ?? ''));
            if (!$assets) respond(['error' => 'Choose an image from this client library.'], 422, $headers);
            $crop = $input['crop'] ?? ['x' => 50, 'y' => 50];
            foreach (['x','y'] as $axis) if (!isset($crop[$axis]) || !is_numeric($crop[$axis]) || $crop[$axis] < 0 || $crop[$axis] > 100) respond(['error' => 'Invalid crop position.'], 422, $headers);
            $asset = $assets[0];
            if ($asset['kind'] === 'artwork') {
                [$w,$h] = array_map('intval', explode(':', $ad['ratio']));
                if (!$asset['height'] || abs($asset['width'] / $asset['height'] - $w / $h) > 0.02) respond(['error' => 'Finished artwork must match this ad’s aspect ratio. Upload an appropriately sized version.'], 422, $headers);
                $crop = ['x' => 50, 'y' => 50];
            }
            $ad['creative_key'] = $asset['creative_key'];
            $ad['creative_alt'] = $asset['name'];
            $ad['crop'] = ['x' => (float) $crop['x'], 'y' => (float) $crop['y']];
            $ad['revision']++;
            $ad['fingerprint'] = fingerprint($ad);
        }
    }
    unset($concept,$ad);
    if (!$found) respond(['error' => 'Ad not found.'], 404, $headers);
    $campaign['revision']++;
    if ($action === 'edit-image') $campaign['status'] = 'awaiting_review';
    $package['provenance'] = ['created_by' => $editor['name'], 'source' => 'manual-image-editor'];
    unset($package['idempotency_key']);
    $result = db('rpc/ad_review_write_revision', 'POST', ['p_tenant' => $slug, 'p_package' => $package, 'p_base_revision' => $input['base_revision'], 'p_actor' => $editor['name'], 'p_mode' => $action === 'edit-image' ? 'edit' : 'unlock', 'p_target' => $input['ad_id']]);
    respond(rpcResult($result, $headers), 200, $headers);
}
