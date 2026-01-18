#!/bin/bash

cd "C:\Users\Vaishali\OneDrive\Desktop\project\sai\Major_project_AI\server"
node dist/server.js &
SERVER_PID=$!

# Wait for server to start
for i in {1..10}; do
  if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "Server is ready"
    break
  fi
  sleep 1
done

echo ""
echo "=== Testing Story 1.3-1.7: Complete Profile & Token Management ==="
echo ""

echo "Step 1: Register a test user"
REGISTER=$(curl -s -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"profile-test@example.com","password":"TestPassword123","name":"Profile Test User"}')
echo "$REGISTER"
echo ""

echo "Step 2: Login to get tokens"
LOGIN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"profile-test@example.com","password":"TestPassword123"}')

ACCESS_TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)
REFRESH_TOKEN=$(echo "$LOGIN" | grep -o '"refreshToken":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "✓ Got access token (length: ${#ACCESS_TOKEN})"
echo "✓ Got refresh token (length: ${#REFRESH_TOKEN})"
echo ""

echo "Step 3: Get profile (Story 1.3: Display User Profile)"
PROFILE=$(curl -s -X GET http://localhost:5001/api/v1/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$PROFILE"
echo ""

echo "Step 4: Update profile (Story 1.4: Save Changes)"
UPDATE=$(curl -s -X PUT http://localhost:5001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"name":"Updated Profile User"}')
echo "$UPDATE"
echo ""

echo "Step 5: Get updated profile (Verify accuracy)"
UPDATED_PROFILE=$(curl -s -X GET http://localhost:5001/api/v1/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$UPDATED_PROFILE"
echo ""

echo "Step 6: Refresh token (Story 1.7: Token Refresh)"
REFRESH=$(curl -s -X POST http://localhost:5001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
echo "$REFRESH"
echo ""

echo "Step 7: Test unauthorized access (Story 1.3: Protected)"
UNAUTH=$(curl -s -X GET http://localhost:5001/api/v1/auth/profile)
echo "$UNAUTH"
echo ""

echo "=== Testing Complete! ==="

# Cleanup
kill $SERVER_PID 2>/dev/null || true
