// Integration and unit test for Forgot Password & OTP Flow
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== Starting Forgot Password & OTP Test Suite ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Test 1: Request OTP with invalid email
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.error, "Request OTP rejects invalid email format (400)");
  } catch (e) {
    assert(false, `Request OTP invalid email error: ${e.message}`);
  }

  // Test 2: Request OTP with empty body
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    assert(res.status === 400, "Request OTP rejects empty body (400)");
  } catch (e) {
    assert(false, `Request OTP empty body error: ${e.message}`);
  }

  // Test 3: Request OTP for non-existent account returns generic 200 (anti-enumeration)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent-user-9999@hirelens.ai" }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.success && data.message.includes("If an account exists"),
      "Request OTP protects account privacy with generic anti-enumeration response"
    );
  } catch (e) {
    assert(false, `Request OTP anti-enumeration error: ${e.message}`);
  }

  // Test 4: Verify OTP rejects non-6-digit codes
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", otp: "123" }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.error.includes("6-digit"), "Verify OTP rejects short codes (400)");
  } catch (e) {
    assert(false, `Verify OTP short code error: ${e.message}`);
  }

  // Test 5: Verify OTP rejects invalid session
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unknown-account@example.com", otp: "123456" }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.error.includes("expired"), "Verify OTP rejects non-existent session (400)");
  } catch (e) {
    assert(false, `Verify OTP non-existent session error: ${e.message}`);
  }

  // Test 6: Reset Password rejects weak password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        resetToken: "fake-token",
        newPassword: "short",
      }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.error.includes("at least 8 characters"), "Reset Password rejects short password (400)");
  } catch (e) {
    assert(false, `Reset Password weak password error: ${e.message}`);
  }

  // Test 7: Reset Password rejects missing special char / uppercase
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        resetToken: "fake-token",
        newPassword: "alllowercasepassword123",
      }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.error.includes("uppercase"), "Reset Password rejects missing uppercase (400)");
  } catch (e) {
    assert(false, `Reset Password uppercase check error: ${e.message}`);
  }

  // Test 8: Reset Password rejects invalid / fabricated token
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        resetToken: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        newPassword: "StrongPassword@2026!",
      }),
    });
    const data = await res.json();
    assert(res.status === 400 || res.status === 403, "Reset Password rejects fake token (400/403)");
  } catch (e) {
    assert(false, `Reset Password fake token error: ${e.message}`);
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
