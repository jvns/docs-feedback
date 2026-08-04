import template from "./Annotator.html";

import * as util from "../util.js";

import RecogitoJS from "../js/text-annotator.umd.js";
window.process = { browser: true, env: { ENVIRONMENT: "BROWSER" } }; // Recogito needs this for some reason, idk why
const { createTextAnnotator } = RecogitoJS;
let anno = undefined;

export default {
  template: template,
  props: [
    "active_feedback",
    "hover_feedback",
    "person_id",
    "document",
    "feedbacks",
  ],

  computed: {
    selectedAnnotationID() {
      return this.active_feedback?.id || this.hover_feedback?.id;
    },
  },

  watch: {
    feedbacks: function (new_feedbacks, _old_feedback) {
      const annotations = new_feedbacks.map(util.fromRecord);
      anno.setAnnotations(annotations, replace = true);
    },
    active_feedback: function (new_feedback, _old_feedback) {
      if (new_feedback?.id) {
        anno.scrollIntoView(new_feedback.id);
      }
    },
    selectedAnnotationID(new_id, _old_id) {
      anno.setSelected(new_id);
    },
  },

  mounted() {
    // we need to set this manually so
    // Vue doesn't try to manage the HTML
    this.$refs.html.innerHTML = this.document.content;
    anno = createTextAnnotator(this.$refs.html, {
      "user": { "id": this.person_id },
    });

    anno.on("clickAnnotation", (annotation) => {
      this.$emit("update:active_feedback", util.toRecord(annotation));
    });

    anno.on("createAnnotation", (annotation) => {
      // immediately remove it in case we cancel the annotation
      anno.removeAnnotation(annotation);
      annotation.id = undefined; // API should set the initial ID
      annotation.bodies = [{
        document_id: this.document.id,
        content: "",
      }];
      this.$emit("update:active_feedback", util.toRecord(annotation));
    });
  },

  methods: {
    scrollTo(id) {
      anno.scrollIntoView(id);
    },
  },
};
