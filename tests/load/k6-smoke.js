/* eslint-disable */
// k6 runtime globals (__ENV, k6/http) are unknown to the repo ESLint config
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://example.com';
const VUS = Number(__ENV.VUS) || 50;
const DURATION = __ENV.DURATION || '1m';

export const options = {
  stages: [
    { duration: '15s', target: VUS }, // ramp up
    { duration: DURATION, target: VUS }, // hold
    { duration: '15s', target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const home = http.get(`${BASE_URL}/`, { tags: { name: 'home' } });
  check(
    home,
    {
      'home: status is 200': (r) => r.status === 200,
      'home: body not empty': (r) => r.body && r.body.length > 0,
    },
    { name: 'home' },
  );

  sleep(1);

  const health = http.get(`${BASE_URL}/api/health`, { tags: { name: 'health' } });
  check(
    health,
    {
      'health: status is 200': (r) => r.status === 200,
      'health: status field is healthy': (r) => {
        try {
          return JSON.parse(r.body).status === 'healthy';
        } catch {
          return false;
        }
      },
    },
    { name: 'health' },
  );

  sleep(1);
}
