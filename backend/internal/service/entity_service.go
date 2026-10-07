package service

import (
	"takehometest/backend/internal/dto"
	"takehometest/backend/internal/model"
	"takehometest/backend/internal/repository"
)

var ErrNotFound = repository.ErrNotFound

type EntityService struct {
	repo repository.EntityRepository
}

func NewEntityService(repo repository.EntityRepository) *EntityService {
	return &EntityService{repo: repo}
}

func (s *EntityService) List(q, status, entityType string) ([]model.Entity, error) {
	return s.repo.List(q, status, entityType)
}

func (s *EntityService) Get(id uint) (model.Entity, error) {
	return s.repo.GetByID(id)
}

func (s *EntityService) Create(input dto.EntityInput) (model.Entity, error) {
	entity := model.Entity{
		Name:        input.Name,
		Type:        input.Type,
		Status:      input.Status,
		Latitude:    *input.Latitude,
		Longitude:   *input.Longitude,
		Description: input.Description,
	}
	if err := s.repo.Create(&entity); err != nil {
		return model.Entity{}, err
	}
	return entity, nil
}

func (s *EntityService) Update(id uint, input dto.EntityInput) (model.Entity, error) {
	entity, err := s.repo.GetByID(id)
	if err != nil {
		return model.Entity{}, err
	}

	entity.Name = input.Name
	entity.Type = input.Type
	entity.Status = input.Status
	entity.Latitude = *input.Latitude
	entity.Longitude = *input.Longitude
	entity.Description = input.Description

	if err := s.repo.Update(&entity); err != nil {
		return model.Entity{}, err
	}
	return entity, nil
}

func (s *EntityService) Delete(id uint) error {
	return s.repo.Delete(id)
}
