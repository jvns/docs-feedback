import template from "./AdminList.html";

import * as util from "../util.js";
const pb = util.pb;

export default {
  template: template,
  data() {
    return {
      documents: undefined,
      loggedIn: false,
    };
  },

  async mounted() {
    this.documents = (await pb.collection("documents").getList(1, 200, {
      // filter: pb.filter("document_id = {:id}", { id: this.document.id }),
    })).items;
  },

  methods: {
    async sync() {
    },
  },
};
