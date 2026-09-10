package main

import (
	"embed"
	"html/template"
	"io/fs"
	"log"

	_ "github.com/jvns/text-feedback/migrations"

	"github.com/pocketbase/dbx"
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

func createRecord(app *pocketbase.PocketBase, collectionName string, values map[string]interface{}) (*core.Record, error) {
	collection, err := app.FindCollectionByNameOrId(collectionName)
	if err != nil {
		return nil, err
	}
	record := core.NewRecord(collection)
	for k, v := range values {
		record.Set(k, v)
	}

	if err := app.Save(record); err != nil {
		return nil, err
	}
	return record, nil
}

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

		se.Router.GET("/doc/{doc_name}", func(e *core.RequestEvent) error {
			docName := e.Request.PathValue("doc_name")
			e.Response.Header().Set("Content-Type", "text/html")
			return userFeedbackTmpl.Execute(e.Response, map[string]string{"DocName": docName})
		})

		se.Router.GET("/{path...}", apis.Static(staticFS, false))

		se.Router.POST("/api/reset_test_data", func(e *core.RequestEvent) error {
			if !osutils.IsProbablyGoRun() {
				return e.NotFoundError("", nil)
			}

			const testUsername = "testuser"
			const testPassword = "testpassword123"
			const testEmail = "test@example.com"
			const testPersonName = "Test Person"
			const testDocName = "test-doc"
			const testDocContent = "This Is A Test Document With Some Content"

			// delete old data
			if user, _ := app.FindAuthRecordByEmail("users", "test@example.com"); user != nil {
				err := app.Delete(user)
				if err != nil {
					return e.BadRequestError("Failed to create test user", err)
				}
			}

			people, _ := app.FindAllRecords("people", dbx.HashExp{"name": testPersonName})
			for _, p := range people {
				err := app.Delete(p)
				if err != nil {
					return e.BadRequestError("Failed to create test user", err)
				}
			}

			// create new data
			user, err := createRecord(app, "users", map[string]interface{}{
				"username": testUsername,
				"password": testPassword,
				"email":    testEmail,
				"role":     "admin",
			})
			if err != nil {
				return e.BadRequestError("Failed to create test user", err)
			}

			person, err := createRecord(app, "people", map[string]interface{}{
				"name": testPersonName,
			})
			if err != nil {
				return e.BadRequestError("Failed to create test person", err)
			}

			document, err := createRecord(app, "documents", map[string]interface{}{
				"name":    testDocName,
				"content": testDocContent,
				"user":    user.Id,
			})
			if err != nil {
				return e.BadRequestError("Failed to create test user", err)
			}

			feedbackCollection, _ := app.FindCollectionByNameOrId("feedback")
			testFeedbacks := []map[string]any{
				{"emoji": "heart", "content": "loved this section! wow!"},
				{"emoji": "confused", "content": "what is a wlurblifiglet?"},
			}

			for _, fb := range testFeedbacks {
				record := core.NewRecord(feedbackCollection)
				record.Set("person_id", person.Id)
				record.Set("document_id", document.Id)
				record.Set("emoji", fb["emoji"])
				record.Set("content", fb["content"])
				record.Set("selector", `[{"start": 0, "end": 5}]`)
				if err := app.Save(record); err != nil {
					return e.BadRequestError("Failed to create test feedback", err)
				}
			}

			return e.JSON(200, map[string]any{
				"user_id":   user.Id,
				"person_id": person.Id,
				"doc_id":    document.Id,
			})
		})

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
