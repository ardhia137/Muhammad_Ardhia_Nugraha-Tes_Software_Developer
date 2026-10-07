package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"takehometest/backend/internal/config"
	"takehometest/backend/internal/handler"
	"takehometest/backend/internal/model"
	"takehometest/backend/internal/repository"
	"takehometest/backend/internal/service"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

const (
	connectAttempts = 30
	connectDelay    = 2 * time.Second
)

func main() {
	cfg := config.Load()

	db, err := connectDB(cfg.DSN())
	if err != nil {
		log.Fatalf("gagal menyiapkan database: %v", err)
	}

	if err := db.AutoMigrate(&model.Entity{}); err != nil {
		log.Fatalf("gagal migrasi database: %v", err)
	}

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	svc := service.NewEntityService(repository.NewEntityRepository(db))
	handler.Register(router, svc)

	addr := ":" + cfg.HTTPPort
	log.Printf("server berjalan di http://localhost%s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("gagal menjalankan server: %v", err)
	}
}

func connectDB(dsn string) (*gorm.DB, error) {
	var lastErr error

	for attempt := 1; attempt <= connectAttempts; attempt++ {
		db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			raw, rawErr := db.DB()
			if rawErr != nil {
				err = rawErr
			} else {
				ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
				err = raw.PingContext(ctx)
				cancel()
				if err == nil {
					raw.SetMaxOpenConns(20)
					raw.SetMaxIdleConns(5)
					raw.SetConnMaxLifetime(time.Hour)
					return db, nil
				}
			}
		}
		lastErr = err
		log.Printf("mysql belum siap (percobaan %d/%d): %v", attempt, connectAttempts, lastErr)
		time.Sleep(connectDelay)
	}

	return nil, fmt.Errorf("mysql tidak dapat dihubungi setelah %d percobaan: %w", connectAttempts, lastErr)
}
