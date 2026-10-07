package model

import "time"

type Entity struct {
	ID          uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string    `json:"name" gorm:"type:varchar(100);not null"`
	Type        string    `json:"type" gorm:"type:enum('vehicle','iot','facility');not null"`
	Status      string    `json:"status" gorm:"type:enum('active','inactive','maintenance');not null"`
	Latitude    float64   `json:"latitude" gorm:"type:decimal(10,7);not null"`
	Longitude   float64   `json:"longitude" gorm:"type:decimal(11,7);not null"`
	Description string    `json:"description" gorm:"type:varchar(500)"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
