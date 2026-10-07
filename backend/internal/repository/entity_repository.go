package repository

import (
	"errors"
	"strings"

	"takehometest/backend/internal/model"

	"gorm.io/gorm"
)

var ErrNotFound = errors.New("entity tidak ditemukan")

type EntityRepository interface {
	List(q, status, entityType string) ([]model.Entity, error)
	GetByID(id uint) (model.Entity, error)
	Create(entity *model.Entity) error
	Update(entity *model.Entity) error
	Delete(id uint) error
}

type gormEntityRepository struct {
	db *gorm.DB
}

func NewEntityRepository(db *gorm.DB) EntityRepository {
	return &gormEntityRepository{db: db}
}

func (r *gormEntityRepository) List(q, status, entityType string) ([]model.Entity, error) {
	entities := make([]model.Entity, 0)

	query := r.db.Model(&model.Entity{})
	if q != "" {
		query = query.Where("LOWER(name) LIKE ?", "%"+strings.ToLower(q)+"%")
	}
	if status != "" {
		query = query.Where("`status` = ?", status)
	}
	if entityType != "" {
		query = query.Where("`type` = ?", entityType)
	}

	if err := query.Order("id").Find(&entities).Error; err != nil {
		return nil, err
	}
	return entities, nil
}

func (r *gormEntityRepository) GetByID(id uint) (model.Entity, error) {
	var entity model.Entity
	err := r.db.First(&entity, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return model.Entity{}, ErrNotFound
	}
	if err != nil {
		return model.Entity{}, err
	}
	return entity, nil
}

func (r *gormEntityRepository) Create(entity *model.Entity) error {
	return r.db.Create(entity).Error
}

func (r *gormEntityRepository) Update(entity *model.Entity) error {
	return r.db.Save(entity).Error
}

func (r *gormEntityRepository) Delete(id uint) error {
	result := r.db.Delete(&model.Entity{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}
