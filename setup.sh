#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TaskFlow — Local Setup Script         ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed. Install from https://nodejs.org (v18+)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo ""

# Backend setup
echo -e "${YELLOW}[1/4] Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}[2/4] Generating Prisma client and running migrations...${NC}"
npx prisma generate
npx prisma migrate deploy
echo -e "${GREEN}✓ Database schema applied${NC}"
echo ""

echo -e "${YELLOW}[3/4] Seeding demo data...${NC}"
npx ts-node prisma/seed.ts
echo -e "${GREEN}✓ Demo users and tasks seeded${NC}"
echo ""

cd ..

# Frontend setup
echo -e "${YELLOW}[4/4] Installing frontend dependencies...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

cd ..

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Setup complete! 🚀                   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Start the backend:  cd backend && npm run start:dev"
echo "Start the frontend: cd frontend && npm run dev"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@taskapp.com / admin123"
echo "  User:  user@taskapp.com  / user123"
echo ""
