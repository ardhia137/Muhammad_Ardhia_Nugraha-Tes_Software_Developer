package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validationMessages = map[string]string{
	"name|required":      "wajib diisi",
	"name|max":           "maksimal 100 karakter",
	"type|required":      "wajib diisi",
	"type|oneof":         "harus salah satu dari vehicle, iot, facility",
	"status|required":    "wajib diisi",
	"status|oneof":       "harus salah satu dari active, inactive, maintenance",
	"latitude|required":  "wajib diisi",
	"latitude|min":       "harus antara -90 dan 90",
	"latitude|max":       "harus antara -90 dan 90",
	"longitude|required": "wajib diisi",
	"longitude|min":      "harus antara -180 dan 180",
	"longitude|max":      "harus antara -180 dan 180",
	"description|max":    "maksimal 500 karakter",
}

func bindInput(c *gin.Context, out any) bool {
	err := c.ShouldBindJSON(out)
	if err == nil {
		return true
	}

	var validationErrs validator.ValidationErrors
	if errors.As(err, &validationErrs) {
		c.JSON(http.StatusBadRequest, gin.H{"errors": messagesFrom(validationErrs)})
		return false
	}

	var typeErr *json.UnmarshalTypeError
	if errors.As(err, &typeErr) && typeErr.Field != "" {
		c.JSON(http.StatusBadRequest, gin.H{"errors": map[string]string{typeErr.Field: "format tidak valid"}})
		return false
	}

	c.JSON(http.StatusBadRequest, gin.H{"errors": map[string]string{"body": "body tidak valid"}})
	return false
}

func messagesFrom(errs validator.ValidationErrors) map[string]string {
	messages := make(map[string]string, len(errs))
	for _, fe := range errs {
		field := strings.ToLower(fe.Field())
		message, ok := validationMessages[field+"|"+fe.Tag()]
		if !ok {
			message = "nilai tidak valid"
		}
		messages[field] = message
	}
	return messages
}

func respondNotFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, gin.H{"error": "entity tidak ditemukan"})
}

func respondInternalError(c *gin.Context) {
	c.JSON(http.StatusInternalServerError, gin.H{"error": "kesalahan server"})
}
