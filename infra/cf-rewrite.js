function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // If the URI ends with / or has no extension, append index.html
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }

  return request;
}
