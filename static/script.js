const pb = new PocketBase("http://127.0.0.1:8090");
window.process = { browser: true, env: { ENVIRONMENT: "BROWSER" } }; // Recogito needs this for some reason, idk why
const { createTextAnnotator } = RecogitoJS;

import ModalComponent from "./components/Modal";

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

const components = {
  "Modal": ModalComponent,
};

const app = Vue.createApp({
  data() {
    return {
      pb: pb,
      anno: undefined,
      annotations: [],
      document: undefined,
      loggedIn: pb.authStore.isValid,
      errors: [],
      active_feedback: undefined,
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
    await this.refresh();
    this.anno.setUserSelectAction((annotation) => {
      this.active_feedback = toRecord(annotation);
    });

    result = this.anno.on("createAnnotation", (annotation) => {
      annotation.id = undefined; // API should set the initial ID
      annotation.bodies = [{
        emoji: "confused",
        document_id: this.document.id,
        content: "test",
      }];
      this.active_feedback = toRecord(annotation);
      // pb.collection("feedback").create(feedback);
    });
  },
  methods: {
    async refresh() {
      console.log("refreshing");
      const feedbacks = await pb.collection("feedback").getList(1, 200, {
        filter: 'person_id = "ldtfc30bzuf73ws"',
      });
      const annotations = feedbacks.items.map(fromRecord);
      this.anno.setAnnotations(annotations, replace = true);
    },
    testMethod() {
      return this.message + "!";
    },
    close() {
      this.active_feedback = undefined;
    },
    async submit() {
      if (this.active_feedback.id) {
        await pb.collection("feedback").update(
          this.active_feedback.id,
          this.active_feedback,
        );
      } else {
        await pb.collection("feedback").create(this.active_feedback);
      }
      await this.refresh();
      this.close();
    },
    async login() {
      const password = this.$refs.password.value;
      try {
        await pb.collection("users").authWithPassword(
          "anonymous",
          password,
        );
      } catch {
        this.errors = ["wrong password"];
      }
      this.loggedIn = pb.authStore.isValid;
    },
  },
});
for (const [c, v] of Object.entries(components)) {
  app.component(c, v);
}
app.mount("#app");
