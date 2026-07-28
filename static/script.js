const pb = new PocketBase("http://127.0.0.1:8090");
window.process = { browser: true, env: { ENVIRONMENT: "BROWSER" } };
const { createTextAnnotator } = RecogitoJS;

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

const app = Vue.createApp({
  data() {
    return {
      anno: undefined,
      document: undefined,
    };
  },

  async mounted() {
    this.document = await pb.collection("documents").getFirstListItem(
      'name="git-pull"',
    );
    await this.$nextTick();

    this.anno = createTextAnnotator(this.$refs.html, {
      "user": { "id": "ldtfc30bzuf73ws", "name": "Julia" },
    });

    this.anno = this.anno.on("createAnnotation", (annotation) => {
      console.log("new annotation", annotation);
      annotation.id = undefined; // API should set the initial ID
      annotation.bodies = [{emoji: 'confused', document_id: this.document.id, content: 'test'}];
      const feedback = toRecord(annotation);
      pb.collection('feedback').create(feedback);
    });
  },
  methods: {
    testMethod() {
      return this.message + "!";
    },
  },
});
app.mount("#app");
