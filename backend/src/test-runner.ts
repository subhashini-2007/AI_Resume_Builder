import { Request, Response } from 'express';
import { apiRateLimiter, aiRateLimiter } from './middleware/rateLimiter';
import { validateProfile, validateResume } from './middleware/validate';

// Setup Mock HTTP Response generator
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jestLikeFn((code: number) => {
    res.statusCode = code;
    return res as Response;
  });
  res.json = jestLikeFn((data: any) => {
    res.body = data;
    return res as Response;
  });
  return res as Response;
};

const jestLikeFn = (fn: Function) => {
  const mock = (...args: any[]) => {
    mock.calls.push(args);
    return fn(...args);
  };
  mock.calls = [] as any[];
  return mock;
};

// Test Runner framework
let testsRun = 0;
let testsFailed = 0;

const assert = (condition: boolean, message: string) => {
  testsRun++;
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
};

const runTests = async () => {
  console.log('Starting System Security & Validation unit tests...\n');

  // --- 1. RATE LIMITER TESTS ---
  console.log('Testing: Rate Limiter Middleware');
  {
    const req = { ip: '1.2.3.4', socket: {} } as Request;
    const res = mockResponse();
    const next = jestLikeFn(() => {});

    // First request should pass
    apiRateLimiter(req, res, next);
    assert(next.calls.length === 1, 'First API request should call next()');

    // Simulate 100 requests (exceeding limit of 100)
    const nextMock = jestLikeFn(() => {});
    const resMock = mockResponse();
    
    for (let i = 0; i < 105; i++) {
      apiRateLimiter(req, resMock, nextMock);
    }
    
    assert(resMock.statusCode === 429, '101st API request should trigger HTTP 429 Too Many Requests');
    assert(resMock.body.error === 'Too Many Requests', 'Error response payload should indicate Rate Limit breach');
  }

  // --- 2. PROFILE VALIDATOR TESTS ---
  console.log('\nTesting: Input Validation Middleware - Profile');
  {
    // Invalid email test
    const req = { body: { email: 'bad-email-format', firstName: 'Alice' } } as Request;
    const res = mockResponse();
    const next = jestLikeFn(() => {});

    validateProfile(req, res, next);
    assert(res.statusCode === 400, 'Invalid email format should trigger HTTP 400 Bad Request');
    assert(res.body.message.includes('email'), 'Error details should mention email formatting issue');

    // HTML Sanitization test
    const sanitizeReq = { body: { email: 'test@example.com', firstName: '<script>alert("hack")</script>Bob' } } as Request;
    const sanitizeRes = mockResponse();
    const sanitizeNext = jestLikeFn(() => {});

    validateProfile(sanitizeReq, sanitizeRes, sanitizeNext);
    assert(sanitizeNext.calls.length === 1, 'Sanitized payload should proceed');
    assert(sanitizeReq.body.firstName === 'alert("hack")Bob', 'HTML script tags should be stripped from fields');
  }

  // --- 3. RESUME VALIDATOR TESTS ---
  console.log('\nTesting: Input Validation Middleware - Resume');
  {
    // Invalid experience array
    const req = { body: { title: 'Resume v1', experience: 'not-an-array' } } as Request;
    const res = mockResponse();
    const next = jestLikeFn(() => {});

    validateResume(req, res, next);
    assert(res.statusCode === 400, 'Non-array experience should trigger HTTP 400 Bad Request');
    assert(res.body.message.includes('Experience must be an array'), 'Error details should flag experience array requirements');

    // Valid resume payload
    const validReq = { body: { title: 'Resume v1', experience: [], education: [] } } as Request;
    const validRes = mockResponse();
    const validNext = jestLikeFn(() => {});

    validateResume(validReq, validRes, validNext);
    assert(validNext.calls.length === 1, 'Valid resume schema payload should call next()');
  }

  console.log(`\nTest Summary: ${testsRun - testsFailed}/${testsRun} assertions passed.`);
  if (testsFailed > 0) {
    console.error(`\nSecurity Suite Failed with ${testsFailed} issues.`);
    process.exit(1);
  } else {
    console.log('\nSecurity Suite completed successfully!');
    process.exit(0);
  }
};

runTests().catch(err => {
  console.error('Test runner crash:', err);
  process.exit(1);
});
