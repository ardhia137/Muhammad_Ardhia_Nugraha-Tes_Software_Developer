package dto

type EntityInput struct {
	Name        string   `json:"name" binding:"required,max=100"`
	Type        string   `json:"type" binding:"required,oneof=vehicle iot facility"`
	Status      string   `json:"status" binding:"required,oneof=active inactive maintenance"`
	Latitude    *float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude   *float64 `json:"longitude" binding:"required,min=-180,max=180"`
	Description string   `json:"description" binding:"max=500"`
}
