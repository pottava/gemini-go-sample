package gemini

import (
	"context"
	"errors"

	"dario.cat/mergo"
	"github.com/pottava/gemini-go-sample/internal/lib"
	"google.golang.org/genai"
)

// @see https://cloud.google.com/vertex-ai/generative-ai/docs/gemini-v2#speech-generation
func Audio(ctx context.Context, prompt string, file *genai.Part, config *genai.GenerateContentConfig) (*genai.Blob, error) {
	client, err := Client(ctx)
	if err != nil {
		return nil, err
	}
	if config == nil {
		config = &genai.GenerateContentConfig{}
	}
	mergo.Merge(config, &genai.GenerateContentConfig{
		SystemInstruction:  Content("Would you reply in Japanese without using English?"),
		Temperature:        genai.Ptr(0.0),
		ResponseModalities: []string{"AUDIO"},
		SpeechConfig: &genai.SpeechConfig{
			VoiceConfig: &genai.VoiceConfig{
				PrebuiltVoiceConfig: &genai.PrebuiltVoiceConfig{
					VoiceName: "Aoede", // Zephyr (default), Puck, Charon, Kore, Fenrir, Leda, Orus, Aoede.
				},
			},
		},
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
	return result.Candidates[0].Content.Parts[0].InlineData, nil
}
