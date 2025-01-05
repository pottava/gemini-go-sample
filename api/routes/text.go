package routes

import (
	"context"
	"log/slog"

	"connectrpc.com/connect"
	"github.com/pottava/gemini-go-sample/internal/gemini"
	v2 "github.com/pottava/gemini-go-sample/internal/gen/gemini/v2"
	"github.com/pottava/gemini-go-sample/internal/lib"
	"google.golang.org/genai"
)

type Server struct{}

func (s *Server) Generate(ctx context.Context, req *connect.Request[v2.GenerateRequest]) (*connect.Response[v2.GenerateResponse], error) {
	config := &genai.GenerateContentConfig{
		Temperature:     req.Msg.Temperature,
		TopK:            req.Msg.TopK,
		TopP:            req.Msg.TopP,
		MaxOutputTokens: req.Msg.MaxTokens,
	}
	var file *genai.Part
	if req.Msg.FileUri != nil {
		if name, mime := lib.FileMeta(*req.Msg.FileUri, req.Msg.FileType); name != "" && mime != "" {
			slog.Debug("File", "URI", name, "MIME Type", mime)
			file = &genai.Part{FileData: &genai.FileData{FileURI: name, MIMEType: mime}}
		}
	}
	result, err := gemini.Text(ctx, req.Msg.Prompt, file, config)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&v2.GenerateResponse{Text: *result}), nil
}
