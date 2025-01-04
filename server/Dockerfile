# A sample app with the GenAI SDK for Go

FROM golang:1.23.4-alpine3.21 AS builder
RUN apk --no-cache add gcc musl-dev git
RUN mkdir -p /go/src/github.com/pottava
WORKDIR /go/src/github.com/pottava
RUN git clone https://github.com/pottava/gemini-go-sample.git
WORKDIR /go/src/github.com/pottava/gemini-go-sample
RUN go mod download
RUN go mod verify
RUN githash=$(git rev-parse --short HEAD 2>/dev/null) \
    && today=$(date +%Y-%m-%d --utc) \
    && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags '-s -w -X main.ver=0.1.0 -X main.commit=${githash} -X main.date=${today}' \
    -o /app server/main.go

FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app /gemini-go-sample
ENTRYPOINT ["/gemini-go-sample"]
