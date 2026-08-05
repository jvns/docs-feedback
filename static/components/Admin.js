import template from "./Admin.html";

import * as util from "../util.js";
const pb = util.pb;

export default {
  template: template,
  props: ["doc_name"],
  data() {
    return {
      loggedIn: false,
      document: undefined,
      feedbacks: [],
      active_feedback: undefined,
      hover_feedback: undefined,
    };
  },

  async mounted() {
    this.document = await util.getDocument(this.doc_name);
    await this.sync();
  },

  methods: {
    async sync() {
      this.feedbacks = (await pb.collection("feedback").getList(1, 200, {
        filter: pb.filter("document_id = {:id}", { id: this.document.id }),
        expand: "person_id",
      })).items;
      this.feedbacks.sort((a, b) => a.selector[0].start - b.selector[0].start);
    },
  },
};
