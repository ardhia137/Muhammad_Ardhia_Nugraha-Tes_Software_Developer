package handler

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"takehometest/backend/internal/dto"
	"takehometest/backend/internal/model"
	"takehometest/backend/internal/service"
)

type EntityService interface {
	List(q, status, entityType string) ([]model.Entity, error)
	Get(id uint) (model.Entity, error)
	Create(input dto.EntityInput) (model.Entity, error)
	Update(id uint, input dto.EntityInput) (model.Entity, error)
	Delete(id uint) error
}

type entityHandler struct {
	svc EntityService
}

func Register(r gin.IRouter, svc EntityService) {
	h := &entityHandler{svc: svc}

	group := r.Group("/api/v1")
	group.GET("/entities", h.List)
	group.GET("/entities/:id", h.Get)
	group.POST("/entities", h.Create)
	group.PUT("/entities/:id", h.Update)
	group.DELETE("/entities/:id", h.Delete)
}

func (h *entityHandler) List(c *gin.Context) {
	entities, err := h.svc.List(
		strings.TrimSpace(c.Query("q")),
		strings.TrimSpace(c.Query("status")),
		strings.TrimSpace(c.Query("type")),
	)
	if err != nil {
		respondInternalError(c)
		return
	}
	if entities == nil {
		entities = []model.Entity{}
	}
	c.JSON(http.StatusOK, entities)
}

func (h *entityHandler) Get(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	entity, err := h.svc.Get(id)
	if errors.Is(err, service.ErrNotFound) {
		respondNotFound(c)
		return
	}
	if err != nil {
		respondInternalError(c)
		return
	}
	c.JSON(http.StatusOK, entity)
}

func (h *entityHandler) Create(c *gin.Context) {
	var input dto.EntityInput
	if !bindInput(c, &input) {
		return
	}

	entity, err := h.svc.Create(input)
	if err != nil {
		respondInternalError(c)
		return
	}
	c.JSON(http.StatusCreated, entity)
}

func (h *entityHandler) Update(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	var input dto.EntityInput
	if !bindInput(c, &input) {
		return
	}

	entity, err := h.svc.Update(id, input)
	if errors.Is(err, service.ErrNotFound) {
		respondNotFound(c)
		return
	}
	if err != nil {
		respondInternalError(c)
		return
	}
	c.JSON(http.StatusOK, entity)
}

func (h *entityHandler) Delete(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		return
	}

	if err := h.svc.Delete(id); errors.Is(err, service.ErrNotFound) {
		respondNotFound(c)
		return
	} else if err != nil {
		respondInternalError(c)
		return
	}
	c.Status(http.StatusNoContent)
}

func parseID(c *gin.Context) (uint, bool) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || id == 0 {
		respondNotFound(c)
		return 0, false
	}
	return uint(id), true
}
