package gemini

import (
	"context"

	"github.com/pottava/gemini-go-sample/internal/lib"
	"google.golang.org/genai"
)

const (
	GEMINI_2_0_FLASH          = "gemini-2.0-flash-exp"
	GEMINI_2_0_FLASH_THINKING = "gemini-2.0-flash-thinking-exp-1219"
)

func Client(ctx context.Context) (*genai.Client, error) {
	return genai.NewClient(ctx, &genai.ClientConfig{
		Project:  lib.Config.Project,
		Location: lib.Config.Location,
		Backend:  genai.BackendVertexAI,
	})
}

func Content(value string) *genai.Content {
	return &genai.Content{Parts: []*genai.Part{{Text: value}}}
}
