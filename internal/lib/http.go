package lib

import (
	"compress/gzip"
	"compress/zlib"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"

	"connectrpc.com/cors"
)

func PreflightAPI(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handler.ServeHTTP(w, r)
	})
}

// WrapHandler wraps every handlers
func WrapHandler(handler func(w http.ResponseWriter, r *http.Request)) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		proc := time.Now()
		addr := r.RemoteAddr
		if ip, found := header(r, "X-Forwarded-For"); found {
			addr = ip
		}
		// CORS
		if strings.EqualFold(r.Method, http.MethodOptions) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", strings.Join([]string{http.MethodOptions, http.MethodHead, http.MethodGet, http.MethodPost}, ","))
			w.Header().Set("Access-Control-Allow-Headers", "Accept,Authorization,Content-Type,Origin")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		origin := "*"
		region, f1 := os.LookupEnv("GOOGLE_CLOUD_REGION")
		number, f2 := os.LookupEnv("GOOGLE_CLOUD_PROJECT_NUMBER")
		if f1 && f2 {
			origin = fmt.Sprintf("https://gemini-go-%s.%s.run.app", number, region)
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", strings.Join(cors.AllowedMethods(), ","))
		w.Header().Set("Access-Control-Allow-Headers", strings.Join(cors.AllowedHeaders(), ","))
		w.Header().Set("Access-Control-Expose-Headers", strings.Join(cors.ExposedHeaders(), ","))

		// Content-Encoding
		ioWriter := w.(io.Writer)
		if encodings, found := header(r, "Accept-Encoding"); found {
			for _, encoding := range splitCsvLine(encodings) {
				if encoding == "gzip" {
					w.Header().Set("Content-Encoding", "gzip")
					g := gzip.NewWriter(w)
					defer g.Close()
					ioWriter = g
					break
				}
				if encoding == "deflate" {
					w.Header().Set("Content-Encoding", "deflate")
					z := zlib.NewWriter(w)
					defer z.Close()
					ioWriter = z
					break
				}
			}
		}
		// Handle HTTP requests
		writer := &wrapper{Writer: ioWriter, ResponseWriter: w, status: http.StatusOK}
		handler(writer, r)

		slog.Info(fmt.Sprintf("[%s] %.3f %d %s %s", addr, time.Since(proc).Seconds(), writer.status, r.Method, r.URL))
	})
}

func header(r *http.Request, key string) (string, bool) {
	if r.Header == nil {
		return "", false
	}
	if candidate := r.Header[key]; len(candidate) > 0 {
		return candidate[0], true
	}
	return "", false
}

func splitCsvLine(csv string) []string {
	data := strings.SplitN(csv, ",", -1)
	parsed := make([]string, len(data))
	for i, val := range data {
		parsed[i] = strings.TrimSpace(val)
	}
	return parsed
}

type wrapper struct {
	io.Writer
	http.ResponseWriter
	status int
}

func (c *wrapper) Write(b []byte) (int, error) {
	if c.Header().Get("Content-Type") == "" {
		c.Header().Set("Content-Type", http.DetectContentType(b))
	}
	return c.Writer.Write(b)
}

func (c *wrapper) WriteHeader(status int) {
	c.ResponseWriter.WriteHeader(status)
	c.status = status
}
