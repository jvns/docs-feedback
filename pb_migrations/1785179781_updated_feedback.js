/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cas02ncbda1oy9z")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wz0ojenv",
    "name": "person_id",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "9b9zmkv5lchhsxv",
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
  collection.schema.removeField("wz0ojenv")

  return dao.saveCollection(collection)
})
