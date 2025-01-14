package gemini

import (
	"context"
	"errors"

	"dario.cat/mergo"
	"github.com/pottava/gemini-go-sample/internal/lib"
	"google.golang.org/genai"
)

func Text(ctx context.Context, prompt string, file *genai.Part, config *genai.GenerateContentConfig) (*string, error) {
	client, err := Client(ctx)
	if err != nil {
		return nil, err
	}
	if config == nil {
		config = &genai.GenerateContentConfig{}
	}
	var tools []*genai.Tool
	if lib.Config.Model == GEMINI_2_0_FLASH { // gemini-2.0-flash-thinking does not support Google Search yet.
		tools = []*genai.Tool{{GoogleSearch: &genai.GoogleSearch{}}}
	}
	mergo.Merge(config, &genai.GenerateContentConfig{
		SystemInstruction: Content("You are a helpful and careful assistant. Would you reply in Japanese without using English, in an easy-to-read format?"),
		Temperature:       genai.Ptr(0.0),
		Tools:             tools,
		CandidateCount:    0,
		MaxOutputTokens:   genai.Ptr(int64(2048)),
	})
	contents := genai.Text(prompt)
	if file != nil {
		contents[0].Parts = append(contents[0].Parts, file)
	}
	result, err := client.Models.GenerateContent(ctx, lib.Config.Model, contents, config)
	if err != nil {
		return nil, err
	}
	if len(result.Candidates) == 0 || len(result.Candidates[0].Content.Parts) == 0 {
		return nil, errors.New("nothing returned from the model")
	}
	return genai.Ptr(result.Candidates[0].Content.Parts[0].Text), nil
}
