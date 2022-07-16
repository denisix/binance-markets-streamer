FROM node:16-slim

# install deps
WORKDIR /app

COPY *.js *.json /app/

RUN npm ci --no-audit --no-scripts

FROM gcr.io/distroless/nodejs:16
COPY --from=0 --chown=nonroot:nonroot /app /app
WORKDIR /app
USER nonroot

CMD [ "index.js" ]
