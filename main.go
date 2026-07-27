package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

//go:embed static
var StaticDir embed.FS

func main() {
	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// DistDirFS is from embed.go
		staticFS, _ := fs.Sub(StaticDir, "static")
		se.Router.GET("/{path...}", apis.Static(staticFS, false))

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
