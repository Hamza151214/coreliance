const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');

// Tests af den lokale AI-server. OpenAI erstattes af en lille falsk server (mock),
// så testene kan køre uden API-nøgle og uden at bruge penge.
// Kør med: npm test

const validProfile = {
  status: 'Recent Graduate',
  university: 'CBS',
  degree: 'MSc Business Administration',
  desiredRoles: 'Data Analyst',
  industries: ['Data & Analytics'],
  lookingFor: 'I want to turn data into decisions in a Danish company.',
  countryOfOrigin: 'Should never be sent',
};

let mockReply = null;
let lastOpenAIRequest = null;
let mockOpenAI;
let server;
let baseUrl;

function aiReply(matches) {
  return {
    status: 200,
    body: {
      id: 'mock',
      object: 'chat.completion',
      model: 'mock-model',
      choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify({ matches }) } }],
    },
  };
}

const goodMatch = (id) => ({
  careerCaseId: id,
  relevance: 'Strong match',
  summary: 'Similar goals.',
  similarities: ['Both want data roles.'],
  differences: ['Different degree.'],
  lessons: ['Build a portfolio.'],
});

before(async () => {
  // Falsk OpenAI-server, som husker sidste request og svarer med mockReply.
  mockOpenAI = http.createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      lastOpenAIRequest = JSON.parse(body);
      response.writeHead(mockReply.status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(mockReply.body));
    });
  });
  await new Promise((resolve) => mockOpenAI.listen(0, '127.0.0.1', resolve));

  process.env.OPENAI_API_KEY = 'test-key';
  process.env.OPENAI_BASE_URL = `http://127.0.0.1:${mockOpenAI.address().port}/v1`;
  process.env.PORT = '0';

  server = require('./index');
  await new Promise((resolve) => (server.listening ? resolve() : server.on('listening', resolve)));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  mockOpenAI.close();
});

const postMatch = (body, headers = {}) =>
  fetch(`${baseUrl}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

test('returns validated matches and drops unknown or duplicate case ids', async () => {
  mockReply = aiReply([goodMatch('case02'), goodMatch('case99'), goodMatch('case02'), { careerCaseId: 'case01' }]);

  const response = await postMatch({ profile: validProfile });
  const data = await response.json();

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(data.matches.map((match) => match.careerCaseId), ['case02']);
});

test('only whitelisted profile fields and all 14 cases are sent to OpenAI', async () => {
  mockReply = aiReply([]);
  await postMatch({ profile: validProfile });

  const userMessage = JSON.parse(lastOpenAIRequest.messages[1].content);

  assert.strictEqual(lastOpenAIRequest.response_format.type, 'json_schema');
  assert.strictEqual(userMessage.jobSeekerProfile.countryOfOrigin, undefined);
  assert.strictEqual(userMessage.careerCases.length, 14);
  assert.ok(!JSON.stringify(userMessage).includes('nationality'));
});

test('empty result is returned as an empty list', async () => {
  mockReply = aiReply([]);
  const data = await (await postMatch({ profile: validProfile })).json();

  assert.deepStrictEqual(data.matches, []);
});

test('incomplete profile gives 400 invalid_profile', async () => {
  const response = await postMatch({ profile: { university: 'CBS' } });

  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error, 'invalid_profile');
});

test('OpenAI error gives 502 openai_error', async () => {
  mockReply = { status: 400, body: { error: { message: 'Bad request' } } };
  const response = await postMatch({ profile: validProfile });

  assert.strictEqual(response.status, 502);
  assert.strictEqual((await response.json()).error, 'openai_error');
});

test('invalid AI JSON gives 502 invalid_ai_response', async () => {
  mockReply = aiReply([]);
  mockReply.body.choices[0].message.content = 'not json';
  const response = await postMatch({ profile: validProfile });

  assert.strictEqual(response.status, 502);
  assert.strictEqual((await response.json()).error, 'invalid_ai_response');
});

test('missing API key gives 500 missing_api_key', async () => {
  delete process.env.OPENAI_API_KEY;
  const response = await postMatch({ profile: validProfile });
  process.env.OPENAI_API_KEY = 'test-key';

  assert.strictEqual(response.status, 500);
  assert.strictEqual((await response.json()).error, 'missing_api_key');
});

test('CORS is only allowed for localhost origins', async () => {
  const local = await fetch(`${baseUrl}/match`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:8081' } });
  const other = await fetch(`${baseUrl}/match`, { method: 'OPTIONS', headers: { Origin: 'https://example.com' } });

  assert.strictEqual(local.headers.get('access-control-allow-origin'), 'http://localhost:8081');
  assert.strictEqual(other.headers.get('access-control-allow-origin'), null);
});
