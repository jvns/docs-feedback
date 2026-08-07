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
      if (!this.loggedIn) {
        return;
      }
      this.documents = (
        await pb.collection("documents").getList(1, 200, {
          filter: pb.filter("user = {:id}", { id: pb.authStore.record.id }),
        })
      ).items;
    },
    async create() {
      try {
        await pb.collection("documents").create({
          content: this.$refs.content.value,
          name: this.$refs.name.value,
          user: pb.authStore.record.id,
        });
        this.$refs.name.value = "";
        this.$refs.content.value = "";
        await this.sync();
      } catch (e) {
        this.error = e;
        h;
      }
    },
  },
};
