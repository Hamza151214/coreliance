const http = require('http');

const { matchProfile } = require('./matching');

// Minimal lokal server til People Like Me.
// Den har kun ét endpoint: POST /match. Appen sender profilen, serveren kalder OpenAI
// med nøglen fra server/.env og sender matches tilbage. Intet gemmes på serveren.
//
// Som standard lytter serveren kun på denne computer (127.0.0.1).
// Til demo på en fysisk telefon sættes HOST=0.0.0.0 (se README).
const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST || '127.0.0.1';
const MAX_BODY_BYTES = 20000;

// Fejlkoder fra matching.js oversat til HTTP-statuskoder.
const ERROR_STATUS = {
  invalid_profile: 400,
  missing_api_key: 500,
  openai_error: 502,
  invalid_ai_response: 502,
};

// Web-versionen af appen kører på en anden port, så browseren kræver CORS-headers.
// Jeg tillader kun sider fra localhost.
function setCorsHeaders(request, response) {
  const origin = request.headers.origin || '';

  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

// Læser request-body og stopper, hvis den er unormalt stor.
function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;

      if (body.length > MAX_BODY_BYTES) {
        reject(new Error('too_large'));
        request.destroy();
      }
    });

    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('invalid_json'));
      }
    });
  });
}

const server = http.createServer(async (request, response) => {
  setCorsHeaders(request, response);

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  // Et simpelt tjek, så man kan se om serveren kører: http://localhost:3001/health
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { ok: true, hasApiKey: Boolean(process.env.OPENAI_API_KEY) });
    return;
  }

  if (request.method !== 'POST' || request.url !== '/match') {
    sendJson(response, 404, { error: 'not_found' });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const result = await matchProfile(body && body.profile);

    sendJson(response, 200, result);
  } catch (error) {
    // Fejl fra readJsonBody (for stor eller ugyldig JSON) behandles som en ugyldig profil.
    const isBadRequest = error.message === 'too_large' || error.message === 'invalid_json';
    const code = error.code || (isBadRequest ? 'invalid_profile' : 'server_error');

    if (code === 'server_error') {
      console.error(error);
    }

    sendJson(response, ERROR_STATUS[code] || 500, { error: code, message: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Coreliance AI server running on http://${HOST}:${server.address().port}`);

  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY is missing. Copy server/.env.example to server/.env.');
  }
});

module.exports = server;
