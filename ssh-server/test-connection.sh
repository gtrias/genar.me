#!/bin/bash

# Test SSH connection to local server
# Usage: ./test-connection.sh

echo "Testing SSH connection to localhost:23234..."
echo ""
echo "Connecting in 3 seconds..."
sleep 3

# Connect with password auth (any password works in demo mode)
# Use -o StrictHostKeyChecking=no to skip host key verification for testing
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null localhost -p 23234
