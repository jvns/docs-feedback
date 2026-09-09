import template from "./AdminList.html";

import * as util from "../util.js";
const pb = util.pb;

export default {
  template: template,
  data() {
    return {
      documents: undefined,
      newFeedbackCounts: {},
      loggedIn: false,
      error: "",
      doc_name: undefined,
    };
  },

  methods: {
    login() {
      this.loggedIn = true;
      this.sync();
    },
    async sync() {
      if (!this.loggedIn) {
        return;
      }
      this.documents = await this.get_documents();
      this.newFeedbackCounts = await this.get_new_feedback_counts();
    },
    async get_documents() {
      const docs = await pb.collection("documents").getFullList();
      return docs;
    },

    async get_new_feedback_counts() {
      const feedbacks = (await pb.collection("feedback").getFullList({expand: 'document_id'}));
      const counts = new Proxy({}, {
          get: (target, name) => (name in target ? target[name] : 0),
        },
      );

      for (const f of feedbacks) {
        const doc = f.expand.document_id;
        if (f.content == 'test123456') {
          console.log(f.id, doc.last_viewed, f.created);
        }
        if (doc.last_viewed && doc.last_viewed < f.updated) {
          counts[doc.id] += 1;
        }
      }
      return counts;
    },
    async delete_doc(document) {
      const feedbacks = (
        await pb.collection("feedback").getList(1, 200, {
          filter: pb.filter("document_id = {:document_id}", {
            document_id: document.id,
          }),
        })
      ).items;
      count = feedbacks.length;
      result = confirm(
        `Are you sure you want to delete "${document.name}"? This will also delete ${count} feedback items.`,
      );
      if (!result) {
        return;
      }
      await pb.collection("documents").delete(document.id);
      await this.sync();
    },
    async create() {
      try {
        await pb.collection("documents").create({
          content: this.$refs.content.value,
          name: this.$refs.name.value,
          user: pb.authStore.record.id,
          last_viewed: new Date().toISOString(),
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
