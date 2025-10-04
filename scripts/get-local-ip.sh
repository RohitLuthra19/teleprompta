#!/bin/bash

# Get the local IP address (macOS)
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "🌐 Your local IP address is: $LOCAL_IP"
echo ""
echo "For physical device testing, update your .env.local file to:"
echo "EXPO_PUBLIC_API_BASE_URL=http://$LOCAL_IP:3000"
echo ""
echo "For simulator/emulator testing, use:"
echo "EXPO_PUBLIC_API_BASE_URL=http://localhost:3000"