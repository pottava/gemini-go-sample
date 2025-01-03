package lib

import (
	"fmt"
	"mime"
	"os"
)

func SaveFile(data []byte, mimeType string, filename string) (*string, error) {
	exts, err := mime.ExtensionsByType(mimeType)
	if err != nil || len(exts) == 0 {
		return nil, fmt.Errorf("could not retrieve extension from the MIME type: %s", mimeType)
	}
	filepath := filename + exts[0]
	if e := os.WriteFile(filepath, data, 0644); e != nil {
		return nil, e
	}
	return &filepath, nil
}
