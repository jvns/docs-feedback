package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("cas02ncbda1oy9z")
		if err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"cascadeDelete": false,
			"collectionId": "iyprj036ttb4k1l",
			"help": "",
			"hidden": false,
			"id": "ayidnkzc",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "document_id",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("cas02ncbda1oy9z")
		if err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
			"cascadeDelete": false,
			"collectionId": "iyprj036ttb4k1l",
			"help": "",
			"hidden": false,
			"id": "ayidnkzc",
			"maxSelect": 1,
			"minSelect": 0,
			"name": "document_id",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "relation"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
