package gemini

import (
	"context"
	"errors"

	"dario.cat/mergo"
	"google.golang.org/genai"
)

func Text(ctx context.Context, project, location, model, prompt string, file *genai.Part, config *genai.GenerateContentConfig) (*string, error) {
	client, err := Client(ctx, project, location)
	if err != nil {
		return nil, err
	}
	if config == nil {
		config = &genai.GenerateContentConfig{}
	}
	var tools []*genai.Tool
	if model == GEMINI_2_0_FLASH { // gemini-2.0-flash-thinking does not support Google Search yet.
		tools = []*genai.Tool{{GoogleSearch: &genai.GoogleSearch{}}}
	}
	mergo.Merge(config, &genai.GenerateContentConfig{
		SystemInstruction: Content("Would you reply in Japanese without using English, in an easy-to-read format?"),
		Temperature:       genai.Ptr(0.0),
		Tools:             tools,
		CandidateCount:    0,
	})
	contents := genai.Text(prompt)
	if file != nil {
		contents[0].Parts = append(contents[0].Parts, file)
	}
	result, err := client.Models.GenerateContent(ctx, model, contents, config)
	if err != nil {
		return nil, err
	}
	if len(result.Candidates) == 0 || len(result.Candidates[0].Content.Parts) == 0 {
		return nil, errors.New("nothing returned from the model")
	}
	return genai.Ptr(result.Candidates[0].Content.Parts[0].Text), nil
}
