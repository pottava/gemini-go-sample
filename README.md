# Go 言語による Gemini アプリケーション

## あいさつ

```sh
export GOOGLE_CLOUD_PROJECT=$( gcloud config get-value project )
go run cmd/gemini-go/main.go
```

## プロンプト

```sh
go run cmd/gemini-go/main.go prompt "令和元年元旦生まれの子どもはいま何歳？"
```

## 画像、動画、音声、PDF

```sh
go run cmd/gemini-go/main.go prompt --file-uri https://storage.googleapis.com/cloud-samples-data/generative-ai/image/scones.jpg --file-type image/jpeg "この写真を説明してください"
```
