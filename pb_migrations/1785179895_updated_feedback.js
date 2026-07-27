/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cas02ncbda1oy9z")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ayidnkzc",
    "name": "document_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "iyprj036ttb4k1l",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cas02ncbda1oy9z")

  // remove
  collection.schema.removeField("ayidnkzc")

  return dao.saveCollection(collection)
})
