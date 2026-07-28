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
      loggedIn: pb.authStore.isValid,
      errors: [],
      annotations: [],
      active_feedback: undefined,
      icons: icons,
    };
  },

  async mounted() {
    if (this.loggedIn) {
      await this.setupAnnotator();
    }
  },
  methods: {
    async setupAnnotator() {
      this.loggedIn = pb.authStore.isValid;
      this.document = await pb.collection("documents").getFirstListItem(
        'name="git-pull"',
      );
      await this.$nextTick();

      anno = createTextAnnotator(this.$refs.html, {
        "user": { "id": "ldtfc30bzuf73ws", "name": "Julia" },
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
    async sync() {
      this.loggedIn = pb.authStore.isValid;
      const feedbacks = await pb.collection("feedback").getList(1, 200, {
        filter: 'person_id = "ldtfc30bzuf73ws"',
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
