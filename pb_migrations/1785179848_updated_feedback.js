/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cas02ncbda1oy9z")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "n8um3gkc",
    "name": "emoji",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "akhdik96",
    "name": "annotation",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cas02ncbda1oy9z")

  // remove
  collection.schema.removeField("n8um3gkc")

  // remove
  collection.schema.removeField("akhdik96")

  return dao.saveCollection(collection)
})
