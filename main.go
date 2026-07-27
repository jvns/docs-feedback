package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/osutils"
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

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the IsProbablyGoRun check is to enable it only during development)
		Automigrate: osutils.IsProbablyGoRun(),
	})
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
