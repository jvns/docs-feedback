import template from "./Modal.html";
import * as icons from "./icons.json";

export default {
  template: template,
  props: ["feedback", "page_id", "admin"],
  emits: ["modal-close", "modal-submit"],
  mounted: function () {
    this.$el.focus();
    // focus the content when it comes into view
    const observer = new MutationObserver(() => {
      if (this.$refs.content) {
        this.$refs.content.focus();
        observer.disconnect();
      }
    });
    observer.observe(this.$el, { childList: true, subtree: true });
  },
  data() {
    return {
      icons: icons,
    };
  },
};
