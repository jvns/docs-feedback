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
    login() {
      this.loggedIn = true;
      this.sync()
    },
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
    async delete_doc(document) {
      const feedbacks = (await pb.collection("feedback").getList(1, 200, {
        filter: pb.filter(
          "document_id = {:document_id}",
          {document_id: document.id },
        ),
      })).items;
      count = feedbacks.length;
      result = confirm(`Are you sure you want to delete "${document.name}"? This will also delete ${count} feedback items.`)
      if (!result) {
        return
      }
      await pb.collection('documents').delete(document.id);
      await this.sync();
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
