ARG GO_VERSION=1
FROM golang:${GO_VERSION}-bookworm as builder

WORKDIR /usr/src/app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .
RUN go build -v -o /docs-feedback .


FROM debian:bookworm

COPY --from=builder /docs-feedback /usr/local/bin/
RUN apt-get update 
RUN apt-get install -y ca-certificates
RUN mkdir /pb
WORKDIR /pb

CMD ["docs-feedback", "serve", "--http=0.0.0.0:8080"]
