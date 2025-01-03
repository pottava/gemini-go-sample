package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/pottava/gemini-go-sample/internal/gemini"
	"github.com/pottava/gemini-go-sample/internal/lib"
	"github.com/urfave/cli/v2"
	"google.golang.org/genai"
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
				Usage:   "Project ID",
				EnvVars: []string{"GOOGLE_CLOUD_PROJECT"},
			},
			&cli.StringFlag{
				Name:    "location",
				Value:   "us-central1",
				Usage:   "API ロケーション",
				EnvVars: []string{"GOOGLE_CLOUD_LOCATION"},
			},
			&cli.StringFlag{
				Name:    "model",
				Aliases: []string{"m"},
				Value:   gemini.GEMINI_2_0_FLASH,
				Usage:   fmt.Sprintf("Gemini モデル (%s, %s など)", gemini.GEMINI_2_0_FLASH, gemini.GEMINI_2_0_FLASH_THINKING),
				EnvVars: []string{"GEMINI_MODEL"},
			},
			&cli.StringFlag{
				Name:    "loglevel",
				Value:   "INFO",
				EnvVars: []string{"LOG_LEVEL"},
			},
		},
		Before: func(ctx *cli.Context) error {
			project = ctx.String("project")
			location = ctx.String("location")
			model = ctx.String("model")
			lib.SetLogLevel(ctx.String("loglevel"))
			slog.Debug("Params", "Project", project, "Location", location, "Model", model)

			if _, err := gemini.Client(ctx.Context, project, location); err != nil {
				return cli.Exit(err.Error(), 1)
			}
			return nil
		},
		Action: func(ctx *cli.Context) error {
			result, err := gemini.Text(ctx.Context, project, location, model, "Hi!", nil, &genai.GenerateContentConfig{
				SystemInstruction: gemini.Content(
					"Would you reply in Japanese without using English, and include one piece of trivia, in an easy-to-read format?",
				),
				Temperature: genai.Ptr(1.0),
			})
			if err != nil {
				return cli.Exit(err.Error(), 1)
			}
			fmt.Println(*result)
			return nil
		},
		Commands: []*cli.Command{
			{
				Name: "prompt",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:    "instruction",
						Aliases: []string{"i"},
						Value:   "You are a helpful assistant. Would you reply in Japanese without using English, in an easy-to-read format?",
						Usage:   "LLM の振る舞いを指示",
					},
					&cli.Float64Flag{
						Name:    "temperature",
						Aliases: []string{"t"},
						Value:   0.0,
						Usage:   "0: 安定重視, 1: 創造性重視",
					},
					&cli.StringFlag{
						Name:  "file-uri",
						Usage: "入力ファイルの URI (e.g. https://storage.googleapis.com/cloud-samples-data/generative-ai/image/scones.jpg)",
					},
					&cli.StringFlag{
						Name:  "file-type",
						Usage: "入力ファイルの MIME タイプ (image/jpeg, application/pdf , audio/mp3, video/mp4 など)",
					},
				},
				Action: func(ctx *cli.Context) error {
					prompt := "Hi!"
					if ctx.Args().Len() > 0 {
						prompt = ctx.Args().Get(0)
					}
					var file *genai.Part
					if ctx.String("file-uri") != "" && ctx.String("file-type") != "" {
						file = &genai.Part{FileData: &genai.FileData{FileURI: ctx.String("file-uri"), MIMEType: ctx.String("file-type")}}
					}
					result, err := gemini.Text(ctx.Context, project, location, model, prompt, file, &genai.GenerateContentConfig{
						SystemInstruction: gemini.Content(ctx.String("instruction")),
						Temperature:       genai.Ptr(ctx.Float64("temperature")),
					})
					if err != nil {
						return cli.Exit(err.Error(), 1)
					}
					fmt.Println(*result)
					return nil
				},
			},
		},
	}
	if err := app.Run(os.Args); err != nil {
		slog.Error(err.Error())
	}
}
