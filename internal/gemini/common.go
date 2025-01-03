package gemini

import (
	"context"

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
