import template from "./AdminList.html";

import * as util from "../util.js";
const pb = util.pb;

export default {
  template: template,
  data() {
    return {
      documents: undefined,
      loggedIn: false,
      error: "",
      doc_name: undefined,
    };
  },

  async mounted() {
    await this.sync();
  },

  methods: {
    async sync() {
      this.documents = (await pb.collection("documents").getList(1, 200, {
        // filter: pb.filter("document_id = {:id}", { id: this.document.id }),
      })).items;
    },
    async create() {
      try {
        await pb.collection("documents").create({
          name: this.$refs.name.value,
          content: this.$refs.name.value,
        });
        await this.sync();
      } catch (e) {
        this.error = e;
        h;
      }
    },
  },
};
