# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv libpq5 \
    && rm -rf /var/lib/apt/lists/*
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
WORKDIR /app/backend

# Build psycopg2 in a separate stage; keep compilers out of the application image.
FROM base AS python-dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*
COPY agent/requirements.txt /tmp/requirements.txt
RUN python3 -m venv /opt/venv \
    && pip install --no-cache-dir -r /tmp/requirements.txt

FROM base AS application
COPY --from=python-dependencies /opt/venv /opt/venv
COPY --chown=node:node backend/ ./
COPY --chown=node:node agent/ /app/agent/
RUN mkdir -p uploads/certificates && chown -R node:node uploads

FROM application AS test
RUN npm ci && npm cache clean --force
ENV NODE_ENV=test
USER node
CMD ["sh", "-c", "npm run test:bootstrap && npm test"]

FROM base AS production-dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM application AS runtime
COPY --from=production-dependencies /app/backend/node_modules ./node_modules
ENV NODE_ENV=production
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "app.js"]
