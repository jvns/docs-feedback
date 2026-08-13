import template from "./UserFeedback.html";

import * as util from "../util.js";
const pb = util.pb;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  template: template,
  props: ["doc_name"],
  data() {
    return {
      document: undefined,
      step: "name",
      feedbacks: [],
      active_feedback: undefined,
      hover_feedback: undefined,
      person_id: undefined,
      firstSyncDone: false,
      modal_error: undefined,
      modal_saving: false,
    };
  },

  async mounted() {
    // close modal on Esc
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.close();
      }
    });
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
      this.document = await util.getDocument(this.doc_name);
      await this.$nextTick();
    },
    async setupAnnotator() {
      await this.sync();
    },
    async save_name_email() {
      const record = await pb.collection("people").create({
        name: this.$refs.name.value,
      });
      localStorage.setItem("person_id", record.id);
      this.step = "feedback";
      await this.setupAnnotator();
    },
    async sync() {
      this.person_id = localStorage.getItem("person_id");
      this.feedbacks = (
        await pb.collection("feedback").getList(1, 200, {
          filter: pb.filter(
            "person_id = {:person_id} && document_id = {:document_id}",
            { person_id: this.person_id, document_id: this.document.id },
          ),
        })
      ).items;
      this.feedbacks.sort((a, b) => a.selector[0].start - b.selector[0].start);
      window.getSelection().empty();
      this.firstSyncDone = true;
    },

    async close() {
      this.modal_error = undefined;
      this.modal_saving = false;
      this.active_feedback = undefined;
      await this.sync();
    },

    async close_slow(start) {
      // close slowly so it feels more like we're "really" saving
      this.modal_error = undefined;
      await this.sync();
      await sleep(250 - (Date.now() - start));
      this.modal_saving = false;
      this.active_feedback = undefined;
    },

    async submit() {
      const nowMS = Date.now();
      this.modal_saving = true;
      this.modal_error = undefined;
      try {
        if (this.active_feedback.id) {
          await pb
            .collection("feedback")
            .update(this.active_feedback.id, this.active_feedback);
        } else {
          await pb.collection("feedback").create(this.active_feedback);
        }
      } catch (e) {
        console.log(e);
        // add a fake delay so it feels more like we're "trying" to save
        await sleep(500);
        this.modal_error = "Error saving feedback";
        this.modal_saving = false;
        return;
      }
      await this.close_slow(nowMS);
    },
  },
};
