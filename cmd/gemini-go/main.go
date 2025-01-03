package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/pottava/gemini-go-sample/internal/gemini"
	"github.com/urfave/cli/v2"
)

var (
	project  string
	location string
	model    string
)

func main() {
	app := &cli.App{
		Name: "Gemini CLI",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "project",
				Aliases: []string{"p"},
				Usage:   "Project ID",
				EnvVars: []string{"GOOGLE_CLOUD_PROJECT"},
			},
			&cli.StringFlag{
				Name:    "location",
				Aliases: []string{"l"},
				Value:   "us-central1",
				Usage:   "API location",
				EnvVars: []string{"GOOGLE_CLOUD_LOCATION"},
			},
			&cli.StringFlag{
				Name:    "model",
				Aliases: []string{"m"},
				Value:   "gemini-2.0-flash-exp",
				Usage:   "Gemini model",
			},
		},
		UseShortOptionHandling: true,
		Before: func(ctx *cli.Context) error {
			slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
				Level: slog.LevelDebug,
			})))
			project = ctx.String("project")
			location = ctx.String("location")
			model = ctx.String("model")

			if _, err := gemini.Client(ctx.Context, project, location); err != nil {
				return cli.Exit(err.Error(), 1)
			}
			return nil
		},
		Action: func(ctx *cli.Context) error {
			result, err := gemini.Text(ctx.Context, project, location, model, "Hi!", nil)
			if err != nil {
				return cli.Exit(err.Error(), 1)
			}
			fmt.Println(*result)
			return nil
		},
		Commands: []*cli.Command{},
	}
	if err := app.Run(os.Args); err != nil {
		slog.Error(err.Error())
	}
}
