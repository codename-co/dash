FROM golang:1-alpine AS builder

WORKDIR /app

COPY src/go.* .
RUN go mod download

COPY src/*.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o /dash


FROM scratch AS runner

LABEL org.opencontainers.image.title "Dash"
LABEL org.opencontainers.image.description "A minimalist Docker landing page with services auto-discovery."
LABEL org.opencontainers.image.url="https://github.com/codename-co/dash"
LABEL org.opencontainers.image.documentation='https://github.com/codename-co/dash/wiki'
LABEL org.opencontainers.image.source='https://github.com/codename-co/dash'
LABEL org.opencontainers.image.vendor='codename'
LABEL org.opencontainers.image.authors='https://codename.co'
LABEL org.opencontainers.image.licenses='MIT'

COPY --from=builder /dash /dash

ENTRYPOINT ["/dash"]

COPY src/static ./static/

ENV PORT 80
EXPOSE $PORT
