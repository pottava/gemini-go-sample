package gemini

import (
	"context"
	"errors"

	"google.golang.org/genai"
)

func Client(ctx context.Context, project, location string) (*genai.Client, error) {
	return genai.NewClient(ctx, &genai.ClientConfig{
		Project:  project,
		Location: location,
		Backend:  genai.BackendVertexAI,
	})
}

func Content(value string) *genai.Content {
	return &genai.Content{Parts: []*genai.Part{{Text: value}}}
}

func Text(ctx context.Context, project, location, model, prompt string, config *genai.GenerateContentConfig) (*string, error) {
	client, err := Client(ctx, project, location)
	if err != nil {
		return nil, err
	}
	if config == nil {
		config = &genai.GenerateContentConfig{
			SystemInstruction: Content("Would you reply in Japanese without using English, and include one piece of trivia, in an easy-to-read format?"),
			Temperature:       genai.Ptr(1.0),
			CandidateCount:    0,
		}
	}
	result, err := client.Models.GenerateContent(ctx, model, genai.Text(prompt), config)
	if err != nil {
		return nil, err
	}
	if len(result.Candidates) == 0 || len(result.Candidates[0].Content.Parts) == 0 {
		return nil, errors.New("nothing returned from the model")
	}
	return genai.Ptr(result.Candidates[0].Content.Parts[0].Text), nil
}
