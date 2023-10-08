FROM golang:1-alpine AS builder

WORKDIR /app

COPY src/go.* .
RUN go mod download

COPY src/*.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o /dash


FROM scratch

COPY --from=builder /dash /dash

ENTRYPOINT ["/dash"]

COPY src/static ./static/

ENV PORT 80
EXPOSE $PORT
