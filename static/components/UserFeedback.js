import template from "./UserFeedback.html";

import * as util from "../util.js";
const pb = util.pb;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  template: template,
  data() {
    return {
      document: undefined,
      step: "name",
      feedbacks: [],
      active_feedback: undefined,
      hover_feedback: undefined,
      person_id: undefined,
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
      this.document = await util.getDocument("git-pull");
      document.title = "feedback: " + doc_name;
      await this.$nextTick();
    },
    async setupAnnotator() {
      const person_id = localStorage.getItem("person_id");

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
      this.person_id = localStorage.getItem("person_id");
      this.feedbacks = (await pb.collection("feedback").getList(1, 200, {
        filter: pb.filter("person_id = {:id}", { id: this.person_id }),
      })).items;
      this.feedbacks.sort((a, b) => a.selector[0].start - b.selector[0].start);
      window.getSelection().empty();
    },

    close() {
      this.active_feedback = undefined;
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
      // Make sure "Saving..." shows for at least 500ms
      await sleep(250 - (Date.now() - nowMS));
      this.active_feedback = undefined;
    },
  },
};
