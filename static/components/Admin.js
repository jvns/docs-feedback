import template from "./Admin.html";

import * as util from "../util.js";
const pb = util.pb;

export default {
  template: template,
  data() {
    return {
      loggedIn: false,
      document: undefined,
    };
  },

  async mounted() {
    this.document = await util.getDocument("git-pull");
  },

  async sync() {
    const feedbacks = await pb.collection("feedback").getList(1, 200, {
      filter: pb.filter("person_id = {:id}", { id: this.document.id }),
    });

    feedbacks.items.sort((a, b) => a.selector[0].start - b.selector[0].start);
    const annotations = feedbacks.items.map(util.fromRecord);
    anno.setAnnotations(annotations, replace = true);
    this.annotations = feedbacks.items;
  },

  methods: {},
};
