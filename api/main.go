package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	"github.com/pottava/gemini-go-sample/api/routes"
	"github.com/pottava/gemini-go-sample/internal/gen/gemini/v2/geminiv2connect"
	"github.com/pottava/gemini-go-sample/internal/lib"
)

var (
	ver    = "dev"
	commit string
	date   string
)

func main() {
	lib.InitConfig()
	lib.Config.Version = ver

	api := http.NewServeMux()
	api.HandleFunc("/version", func(w http.ResponseWriter, r *http.Request) {
		if len(commit) > 0 && len(date) > 0 {
			fmt.Fprintf(w, "%s-%s (built at %s)\n", ver, commit, date)
			return
		}
		fmt.Fprintln(w, ver)
	})

	// APIs
	path, handler := geminiv2connect.NewGeminiServiceHandler(&routes.GeminiServer{})
	api.Handle(path, lib.WrapHandler(handler.ServeHTTP))
	api.Handle("/files/", lib.WrapHandler(routes.FileUtils))
	api.Handle("/api/", http.StripPrefix("/api", api))
	server := &http.Server{
		Addr:    "0.0.0.0:8080",
		Handler: h2c.NewHandler(api, &http2.Server{}),
	}

	// Web
	api.Handle("/", http.FileServer(http.Dir("web/dist")))

	// Graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		for sig := range c {
			if sig == os.Interrupt || sig == syscall.SIGTERM {
				slog.Info("Shutting down the server")
				server.Shutdown(context.Background())
			}
		}
	}()

	// Start the API server
	slog.Info(fmt.Sprintf("[service] listening on %s", "8080"))
	err := server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		slog.Error("ListenAndServe", "error", err.Error())
	}
}
