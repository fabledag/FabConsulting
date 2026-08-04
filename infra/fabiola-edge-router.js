/**
 * CloudFront Function (viewer-request) for distribution E18GECI52IMNB3.
 *
 * WHY THIS IS ONE FUNCTION AND NOT TWO
 * CloudFront allows exactly one function per event type per cache behavior.
 * This account previously had `www-to-apex-redirect` and `fabiola-path-rewrite`
 * fighting over the single viewer-request slot: attaching one silently detached
 * the other, which is why the path rewrite kept "reverting on its own" and why
 * the site fell back to hash routing (`/#/login`). Both jobs now live here.
 *
 * WHAT IT DOES
 *  1. Redirects www.fabdesign.digital → fabdesign.digital (301), preserving the
 *     path AND query string — magic-link tokens arrive as `?token=…` and would
 *     otherwise be dropped on the redirect.
 *  2. Serves files that have an extension (/_next/*.js, /og-image.jpg,
 *     /sitemap.xml, /llms.txt) untouched.
 *  3. Maps directory-style URLs to the file Next's static export actually
 *     wrote: `/asesorias/mentoria/` → `/asesorias/mentoria/index.html`.
 *     The S3 origin is a REST endpoint, so it does not resolve index documents
 *     for sub-paths on its own — only DefaultRootObject handles `/`.
 *  4. Redirects extensionless URLs without a trailing slash to the slashed
 *     form (301), so `/asesorias/mentoria` and `/asesorias/mentoria/` don't
 *     both get indexed as duplicate content.
 *
 * This pairs with `trailingSlash: true` in frontend/next.config.js. Changing
 * that flag without changing this function will start 404ing every clean URL.
 */

function buildQueryString(querystring) {
  var parts = [];
  for (var key in querystring) {
    var param = querystring[key];
    if (param.multiValue) {
      for (var i = 0; i < param.multiValue.length; i++) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(param.multiValue[i].value));
      }
    } else if (param.value === '') {
      parts.push(encodeURIComponent(key));
    } else {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(param.value));
    }
  }
  return parts.length > 0 ? '?' + parts.join('&') : '';
}

function permanentRedirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      location: { value: location },
      'cache-control': { value: 'max-age=3600' }
    }
  };
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var host = request.headers.host ? request.headers.host.value : 'fabdesign.digital';
  var query = buildQueryString(request.querystring);

  // 1. Canonical host.
  if (host === 'www.fabdesign.digital') {
    return permanentRedirect('https://fabdesign.digital' + uri + query);
  }

  // 2. Anything with a file extension is a real object in S3.
  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') !== -1) {
    return request;
  }

  // 3. Directory-style URL → the exported index.html.
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
    return request;
  }

  // 4. Extensionless, no trailing slash → canonical slashed URL.
  return permanentRedirect('https://' + host + uri + '/' + query);
}
