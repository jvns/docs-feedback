package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("iyprj036ttb4k1l")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"help": "",
			"hidden": false,
			"id": "date2106563550",
			"max": "",
			"min": "",
			"name": "last_viewed",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "date"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("iyprj036ttb4k1l")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("date2106563550")

		return app.Save(collection)
	})
}
