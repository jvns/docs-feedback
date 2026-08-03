window.process = { browser: true, env: { ENVIRONMENT: "BROWSER" } }; // Recogito needs this for some reason, idk why
const { createTextAnnotator } = RecogitoJS;

const pb = new PocketBase("http://127.0.0.1:8090");
let anno = undefined;

import ModalComponent from "./components/Modal";
import LoginComponent from "./components/Login";
import * as icons from "./components/icons.json";
import { fromRecord, toRecord } from "./util.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const components = {
  "Modal": ModalComponent,
  "Login": LoginComponent,
};

const app = Vue.createApp({
  data() {
    return {
      pb: pb,
      document: undefined,
      step: "name",
      errors: [],
      annotations: [],
      active_feedback: undefined,
      hover_feedback: undefined,
      icons: icons,
    };
  },

  async mounted() {
    this.step = this.getStep();
    await this.getDocument();
    if (this.step == "name") {
      this.$refs.dialog.showModal();
    }
    if (this.step == "feedback") {
      await this.setupAnnotator();
    }
  },

  computed: {
    selectedAnnotationID() {
      return this.active_feedback?.id || this.hover_feedback?.id;
    }
  },

  watch: {
    selectedAnnotationID(new_id, _old_id) {
      anno.setSelected(new_id);
    },
  },

  methods: {
    getStep() {
      if (!localStorage.getItem("person_id")) {
        return "name";
      } else {
        return "feedback";
      }
    },
    async getDocument() {
      const doc_name = "git-pull";
      this.document = await pb.collection("documents").getFirstListItem(
        pb.filter("name={:id}", { id: doc_name }),
      );
      document.title = "feedback: " + doc_name;
      await this.$nextTick();
    },
    async setupAnnotator() {
      const person_id = localStorage.getItem("person_id");

      anno = createTextAnnotator(this.$refs.html, {
        "user": { "id": person_id, "name": "Julia" },
      });
      anno.on("clickAnnotation", (annotation) => {
        this.active_feedback = toRecord(annotation);
      });

      anno.on("createAnnotation", (annotation) => {
        // immediately remove it in case we cancel the annotation
        anno.removeAnnotation(annotation);
        annotation.id = undefined; // API should set the initial ID
        annotation.bodies = [{
          document_id: this.document.id,
          content: "",
        }];
        this.active_feedback = toRecord(annotation);
      });
      await this.sync();
    },
    async save_name_email() {
      const record = await pb.collection("people").create({
        name: this.$refs.name,
        // email: this.$refs.email,
      });
      localStorage.setItem("person_id", record.id);
      this.step = "feedback";
      await this.setupAnnotator();
    },
    async sync() {
      this.loggedIn = pb.authStore.isValid;

      const person_id = localStorage.getItem("person_id");
      const feedbacks = await pb.collection("feedback").getList(1, 200, {
        filter: pb.filter("person_id = {:id}", { id: person_id }),
      });
      const annotations = feedbacks.items.map(fromRecord);
      anno.setAnnotations(annotations, replace = true);
      this.annotations = feedbacks.items;
    },
    close() {
      this.active_feedback = undefined;
      window.getSelection().empty();
      this.sync();
    },
    async submit() {
      const nowMS = Date.now();
      if (this.active_feedback.id) {
        await pb.collection("feedback").update(
          this.active_feedback.id,
          this.active_feedback,
        );
      } else {
        await pb.collection("feedback").create(this.active_feedback);
      }
      await this.sync();
      window.getSelection().empty();
      // Make sure "Saving..." shows for at least 500ms
      await sleep(250 - (Date.now() - nowMS));
      this.active_feedback = undefined;
    },
    setActive(feedback_item) {
      anno.scrollIntoView(feedback_item.id);
      this.active_feedback = feedback_item;
    },
  },
});
for (const [c, v] of Object.entries(components)) {
  app.component(c, v);
}
app.mount("#app");
