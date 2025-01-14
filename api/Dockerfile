# A sample app with the GenAI SDK for Go

FROM golang:1.23.4-alpine3.21 AS api
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
    -ldflags "-s -w -X main.ver=1.0.0 -X main.commit=${githash} -X main.date=${today}" \
    -o /app api/main.go

FROM node:22-alpine3.20 AS web
RUN apk --no-cache add git
WORKDIR /app
RUN git clone https://github.com/pottava/gemini-go-sample.git
WORKDIR /app/gemini-go-sample/web
RUN npm install
RUN npm run build

FROM scratch
COPY --from=api /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=api /app /gemini-go-sample
COPY --from=web /app/gemini-go-sample/web/dist /web/
ENTRYPOINT ["/gemini-go-sample"]
