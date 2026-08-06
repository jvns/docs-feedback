package main

import (
	"embed"
	"html/template"
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

//go:embed templates
var TemplatesDir embed.FS

func main() {
	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		staticFS, _ := fs.Sub(StaticDir, "static")

		adminListTmpl, _ := template.ParseFS(TemplatesDir, "templates/admin-list.html")
		adminTmpl, _ := template.ParseFS(TemplatesDir, "templates/admin.html")
		userFeedbackTmpl, _ := template.ParseFS(TemplatesDir, "templates/user-feedback.html")

		se.Router.GET("/admin/", func(e *core.RequestEvent) error {
			e.Response.Header().Set("Content-Type", "text/html")
			return adminListTmpl.Execute(e.Response, nil)
		})

		se.Router.GET("/admin/{doc_name}", func(e *core.RequestEvent) error {
			docName := e.Request.PathValue("doc_name")
			e.Response.Header().Set("Content-Type", "text/html")
			return adminTmpl.Execute(e.Response, map[string]string{"DocName": docName})
		})

		se.Router.GET("/feedback/{doc_name}", func(e *core.RequestEvent) error {
			docName := e.Request.PathValue("doc_name")
			e.Response.Header().Set("Content-Type", "text/html")
			return userFeedbackTmpl.Execute(e.Response, map[string]string{"DocName": docName})
		})

		se.Router.GET("/{path...}", apis.Static(staticFS, false))

		return se.Next()
	})

	// auto create migration files when making collection changes in the Dashboard
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: osutils.IsProbablyGoRun(),
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
