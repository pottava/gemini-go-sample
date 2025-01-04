# Go 言語による Gemini アプリケーション

## あいさつ

```sh
export GOOGLE_CLOUD_PROJECT=$( gcloud config get-value project )
go run cmd/main.go
```

## プロンプト

```sh
go run cmd/main.go prompt "令和元年元旦生まれの子どもはいま何歳？"
```

## 画像、動画、音声、PDF

URI が拡張子で終わっているものは URI のみの指定で OK です。  
拡張子がないものは `--file-type` も指定が必要です。

```sh
go run cmd/main.go prompt \
    -f "https://storage.googleapis.com/cloud-samples-data/generative-ai/image/scones.jpg" \
    "この写真を説明してください"
```

## REST API

もし .proto の変更が必要なら、編集しつつコードを生成して実装

```sh
vi proto/gemini/v2/text.proto
buf lint proto
buf generate proto
```

API サーバを起動して

```sh
go run server/main.go
```

リクエストを送信

```sh
curl -iXPOST -H "Content-Type: application/json" \
    -d '{"prompt": "この写真を説明してください", "file-uri": "https://storage.googleapis.com/cloud-samples-data/generative-ai/image/scones.jpg"}' \
    http://localhost:8080/api/gemini.v2.GeminiService/Generate
```
