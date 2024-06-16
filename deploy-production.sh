#!/bin/sh
git fetch origin && git reset --hard origin/main && git clean -f -d && git pull && \ 
docker compose -f docker-compose.production.yml up --build -d