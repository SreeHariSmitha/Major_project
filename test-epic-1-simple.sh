#!/bin/bash

echo "Starting server on port 5001..."
export PORT=5001
cd "C:\Users\Vaishali\OneDrive\Desktop\project\sai\Major_project_AI\server"
node dist/server.js &
SERVER_PID=$!

# Wait for server
echo "Waiting for server to start..."
for i in {1..15}; do
  if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "Server is ready!"
    break
  fi
  echo "Attempt $i..."
  sleep 1
done

echo ""
echo "=== Testing Story 1.3-1.7 ==="
echo ""

# Test 1.3: View Profile
echo "Test 1: Register user"
REG=$(curl -s -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"epic1@example.com","password":"TestPassword123","name":"Epic 1 User"}')
echo "$REG" | head -50
USER_ID=$(echo "$REG" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
echo "User ID: $USER_ID"
echo ""

echo "Test 2: Login"
LOGIN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"epic1@example.com","password":"TestPassword123"}')
echo "$LOGIN" | head -50
TOKEN=$(echo "$LOGIN" | grep -o '"accessToken":"[^"]*' | tail -1 | cut -d'"' -f4)
REFRESH=$(echo "$LOGIN" | grep -o '"refreshToken":"[^"]*' | tail -1 | cut -d'"' -f4)
echo "Token: ${TOKEN:0:30}..."
echo ""

echo "Test 3: Get Profile (Story 1.3)"
curl -s -X GET http://localhost:5001/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN" | head -50
echo ""

echo "Test 4: Update Profile (Story 1.4)"
curl -s -X PUT http://localhost:5001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Epic 1 Updated"}' | head -50
echo ""

echo "Test 5: Get Updated Profile"
curl -s -X GET http://localhost:5001/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN" | head -50
echo ""

echo "Test 6: Refresh Token (Story 1.7)"
curl -s -X POST http://localhost:5001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH\"}" | head -50
echo ""

echo "Test 7: Unauthorized (Story 1.3)"
curl -s -X GET http://localhost:5001/api/v1/auth/profile | head -50
echo ""

kill $SERVER_PID 2>/dev/null || true
echo "Server stopped"
