#!/bin/bash
cd "C:\Users\Vaishali\OneDrive\Desktop\project\sai\Major_project_AI\server"
node dist/server.js &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to start
for i in {1..10}; do
  if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "Server is ready"
    break
  fi
  sleep 1
done

echo ""
echo "=== Test 1: Register user ==="
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"login-test@example.com","password":"TestPassword123"}' | head -100

echo ""
echo ""
echo "=== Test 2: Login user ==="
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"login-test@example.com","password":"TestPassword123"}')

echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "accessToken"; then
  echo ""
  echo "✓ LOGIN SUCCESSFUL! Token received."
else
  echo ""
  echo "✗ LOGIN FAILED - No token in response"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null || true
