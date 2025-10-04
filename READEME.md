To run your project, navigate to the directory and run one of the following pnpm commands.

- cd apps/mobile
- pnpm run android
- pnpm run ios
- pnpm run web

# Development Setup

## 1. Install dependencies
```bash
pnpm install
```

## 2. Configure environment variables
```bash
# Copy example environment file
cp apps/mobile/.env.example apps/mobile/.env.local

# Update the API URL in .env.local if needed
# For simulator/emulator: http://localhost:3000
# For physical device: http://YOUR_LOCAL_IP:3000
```

## 3. Start backend
```bash
pnpm --filter backend dev
```
Backend will run on http://localhost:3000

## 4. Start expo mobile app
```bash
pnpm --filter mobile start
```

### Alternative commands:
```bash
cd apps/backend
pnpm dev
```

```bash
cd apps/mobile
npx expo start --web
```

## Troubleshooting

### API Connection Issues
If your mobile app can't connect to the backend:

1. **For iOS Simulator/Android Emulator**: Use `http://localhost:3000`
2. **For Physical Device**: Use your computer's IP address
   ```bash
   # Run this script to find your local IP
   ./scripts/get-local-ip.sh
   ```
3. **Update your environment file** (`apps/mobile/.env.local`):
   ```
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3000
   ```

### Running the project

or

cd apps/mobile
npx expo start --web
