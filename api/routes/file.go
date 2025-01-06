package routes

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"

	"cloud.google.com/go/storage"
	"github.com/pottava/gemini-go-sample/internal/lib"
	"google.golang.org/api/iterator"
)

type FileInfo struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

func FileUtils(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/files/":
		switch r.Method {
		case http.MethodGet:
			client, err := storage.NewClient(r.Context())
			if err != nil {
				http.Error(w, "GCS クライアントの作成に失敗しました", http.StatusInternalServerError)
				return
			}
			defer client.Close()

			it := client.Bucket(lib.Config.Bucket).Objects(r.Context(), nil)
			var files []FileInfo
			for {
				attrs, err := it.Next()
				if err == iterator.Done {
					break
				}
				if err != nil {
					http.Error(w, "ファイルの一覧取得に失敗しました", http.StatusInternalServerError)
					return
				}
				files = append(files, FileInfo{
					Name: attrs.Name,
					URL:  fmt.Sprintf("gs://%s/%s", lib.Config.Bucket, attrs.Name),
				})
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(files)

		case http.MethodPost:
			if lib.Config.Bucket == "" {
				http.Error(w, "保存先の GCS バケットが設定されていません", http.StatusNotAcceptable)
				return
			}
			file, header, err := r.FormFile("file")
			if err != nil {
				http.Error(w, "ファイルの取得に失敗しました", http.StatusBadRequest)
				return
			}
			defer file.Close()

			client, err := storage.NewClient(r.Context())
			if err != nil {
				http.Error(w, "GCS クライアントの作成に失敗しました", http.StatusInternalServerError)
				return
			}
			defer client.Close()

			writer := client.Bucket(lib.Config.Bucket).Object(header.Filename).NewWriter(r.Context())
			defer writer.Close()

			if _, err = io.Copy(writer, file); err != nil {
				http.Error(w, "GCS へのアップロードに失敗しました", http.StatusInternalServerError)
				return
			}
			slog.Debug("Routes.FileUtils", "file saved:", header.Filename)

		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	default:
		http.NotFound(w, r)
	}
}
