function toRecord(ann) {
  const body = ann.bodies[0];
  return {
    "id": ann.id,
    "emoji": body.emoji,
    "document_id": body.document_id,
    "content": body.content,
    "selector": ann.target.selector,
    "person_id": ann.target.creator.id, // wrong?
  };
}

function fromRecord(record) {
  return {
    "id": record.id,
    "bodies": [{
      "emoji": record.emoji,
      "content": record.content,
      "document_id": record.document_id,
    }],
    "target": {
      "annotation": record.id,
      "selector": record.selector,
      "creator": {
        "id": record.person_id, // wrong?
      },
    },
  };
}

export {fromRecord, toRecord}
