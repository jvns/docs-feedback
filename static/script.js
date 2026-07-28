window.process = { browser: true, env: { ENVIRONMENT: "BROWSER" } }; // Recogito needs this for some reason, idk why
const { createTextAnnotator } = RecogitoJS;

const pb = new PocketBase("http://127.0.0.1:8090");
let anno = undefined;

import ModalComponent from "./components/Modal";
import LoginComponent from "./components/Login";
import * as icons from "./components/icons.json";
import { fromRecord, toRecord } from "./util.js";

const components = {
  "Modal": ModalComponent,
  "Login": LoginComponent,
};

const app = Vue.createApp({
  data() {
    return {
      pb: pb,
      document: undefined,
      step: "login",
      errors: [],
      annotations: [],
      active_feedback: undefined,
      icons: icons,
    };
  },

  async mounted() {
    this.step = this.getStep();
    if (this.step == "feedback") {
      await this.setupAnnotator();
    }
  },

  methods: {
    getStep() {
      if (!pb.authStore.isValid) {
        return "login";
      } else if (!localStorage.getItem("person_id")) {
        return "name";
      } else {
        return "feedback";
      }
    },
    async setupAnnotator() {
      const person_id = localStorage.getItem("person_id");
      this.document = await pb.collection("documents").getFirstListItem(
        'name="git-pull"',
      );
      await this.$nextTick();

      anno = createTextAnnotator(this.$refs.html, {
        "user": { "id": person_id, "name": "Julia" },
      });
      anno.on("clickAnnotation", (annotation) => {
        this.active_feedback = toRecord(annotation);
      });

      anno.on("createAnnotation", (annotation) => {
        annotation.id = undefined; // API should set the initial ID
        annotation.bodies = [{
          document_id: this.document.id,
          content: "",
        }];
        this.active_feedback = toRecord(annotation);
        // pb.collection("feedback").create(feedback);
      });
      await this.sync();
    },
    async save_name_email() {
      const record = await pb.collection("people").create({
        name: this.$refs.name,
        email: this.$refs.email,
      });
      localStorage.setItem("person_id", record.id);
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
      await this.sync();
      this.close();
    },
  },
});
for (const [c, v] of Object.entries(components)) {
  app.component(c, v);
}
app.mount("#app");
