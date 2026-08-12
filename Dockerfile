ARG GO_VERSION=1
FROM golang:${GO_VERSION}-bookworm as builder

WORKDIR /usr/src/app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
RUN go install github.com/evanw/esbuild/cmd/esbuild@latest
COPY . .
RUN sh scripts/build_prod.sh
RUN go build -v -o /docs-feedback .


FROM debian:bookworm

WORKDIR /pb
COPY --from=builder /docs-feedback /usr/local/bin/

RUN apt-get update 
RUN apt-get install -y ca-certificates curl
RUN mkdir -p /pb
COPY migrations ./

CMD ["docs-feedback", "serve", "--http=0.0.0.0:8080"]
