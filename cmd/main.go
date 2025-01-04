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
				EnvVars: []string{"GOOGLE_CLOUD_LOCATION", "GOOGLE_CLOUD_REGION"},
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
			lib.Config.Project = ctx.String("project")
			lib.Config.Location = ctx.String("location")
			lib.Config.Model = ctx.String("model")
			lib.SetLogLevel(ctx.String("loglevel"))
			slog.Debug("Params", "Project", lib.Config.Project, "Location", lib.Config.Location, "Model", lib.Config.Model)

			if _, err := gemini.Client(ctx.Context); err != nil {
				return cli.Exit(err.Error(), 1)
			}
			return nil
		},
		Action: func(ctx *cli.Context) error {
			result, err := gemini.Text(ctx.Context, "Hi!", nil, &genai.GenerateContentConfig{
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
						Value:   "You are a helpful and careful assistant. Would you reply in Japanese without using English, in an easy-to-read format?",
						Usage:   "LLM の振る舞いを指示",
					},
					&cli.Float64Flag{
						Name:    "temperature",
						Aliases: []string{"t"},
						Value:   0.0,
						Usage:   "0: 安定重視, 1: 創造性重視",
					},
					&cli.StringFlag{
						Name:    "file-uri",
						Aliases: []string{"f"},
						Usage:   "入力ファイルの URI (e.g. https://storage.googleapis.com/cloud-samples-data/generative-ai/image/scones.jpg)",
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
					if ctx.String("file-uri") != "" {
						if name, mime := lib.FileMeta(ctx.String("file-uri"), genai.Ptr(ctx.String("file-type"))); name != "" {
							if mime == "" {
								return cli.Exit(fmt.Errorf("file-type の指定が必要です"), 1)
							}
							slog.Debug("File", "URI", name, "MIME Type", mime)
							file = &genai.Part{FileData: &genai.FileData{FileURI: name, MIMEType: mime}}
							if bytes, err := os.ReadFile(name); err == nil {
								file = &genai.Part{InlineData: &genai.Blob{Data: bytes, MIMEType: mime}}
							}
						}
					}
					result, err := gemini.Text(ctx.Context, prompt, file, &genai.GenerateContentConfig{
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
			{
				Name: "audio",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:    "instruction",
						Aliases: []string{"i"},
						Value:   "You are a helpful and careful assistant. Would you reply in Japanese without using English, in an easy-to-read format?",
						Usage:   "LLM の振る舞いを指示",
					},
					&cli.Float64Flag{
						Name:    "temperature",
						Aliases: []string{"t"},
						Value:   0.0,
						Usage:   "0: 安定重視, 1: 創造性重視",
					},
					&cli.StringFlag{
						Name:    "file-uri",
						Aliases: []string{"f"},
						Usage:   "入力ファイルの URI (e.g. https://storage.googleapis.com/cloud-samples-data/generative-ai/image/scones.jpg)",
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
					if ctx.String("file-uri") != "" {
						if name, mime := lib.FileMeta(ctx.String("file-uri"), genai.Ptr(ctx.String("file-type"))); name != "" {
							if mime == "" {
								return cli.Exit(fmt.Errorf("file-type の指定が必要です"), 1)
							}
							slog.Debug("File", "URI", name, "MIME Type", mime)
							file = &genai.Part{FileData: &genai.FileData{FileURI: name, MIMEType: mime}}
							if bytes, err := os.ReadFile(name); err == nil {
								file = &genai.Part{InlineData: &genai.Blob{Data: bytes, MIMEType: mime}}
							}
						}
					}
					result, err := gemini.Audio(ctx.Context, prompt, file, &genai.GenerateContentConfig{
						SystemInstruction: gemini.Content(ctx.String("instruction")),
						Temperature:       genai.Ptr(ctx.Float64("temperature")),
					})
					if err != nil {
						return cli.Exit(err.Error(), 1)
					}
					filepath, err := lib.SaveFile(result.Data, result.MIMEType, "result")
					if err != nil {
						return cli.Exit(err.Error(), 1)
					}
					fmt.Printf("ファイルを保存しました:%s\n", *filepath)
					return nil
				},
			},
		},
	}
	if err := app.Run(os.Args); err != nil {
		slog.Error(err.Error())
	}
}
