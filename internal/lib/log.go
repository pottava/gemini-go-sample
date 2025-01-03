package lib

import (
	"log/slog"
	"os"
	"strings"
)

func SetLogLevel(loglevel string) {
	level := slog.LevelInfo
	switch strings.ToUpper(loglevel) {
	case "DEBUG":
		level = slog.LevelDebug
	case "WARN":
		level = slog.LevelWarn
	case "ERROR":
		level = slog.LevelError
	}
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level})))
}
