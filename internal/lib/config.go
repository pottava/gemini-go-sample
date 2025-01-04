package lib

import (
	"fmt"
	"log"
	"log/slog"

	"github.com/caarlos0/env"
)

var Config config

type config struct {
	Project  string `env:"GOOGLE_CLOUD_PROJECT"`
	Location string `env:"GOOGLE_CLOUD_LOCATION" envDefault:"us-central1"`
	Model    string `env:"GEMINI_MODEL" envDefault:"gemini-2.0-flash-exp"`
	LogLevel string `env:"LOG_LEVEL" envDefault:"INFO"`
}

func InitConfig() {
	if err := env.Parse(&Config); err != nil {
		log.Fatal(err)
	}
	if Config.Project == "" {
		log.Fatal(fmt.Errorf("GOOGLE_CLOUD_PROJECT should be set as an environment variable"))
	}
	SetLogLevel(Config.LogLevel)
	slog.Debug("Configs", "Project", Config.Project, "Location", Config.Location, "Model", Config.Model)
}
