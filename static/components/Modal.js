import template from "./Modal.html";

export default {
  template: template,
  props: ["feedback", "page_id", "admin"],
  emits: ["modal-close", "modal-submit"],
  mounted: async function () {
    this.$el.focus();
    this.scrollIntoView();
    await this.$nextTick();
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
      saving: false,
    };
  },
  methods: {
    save() {
      this.saving = true;
      this.$emit("modal-submit");
    },
    scrollIntoView() {
      /* We can't use the element's .scrollIntoView() because the annotation
       library is also using it, and we need to scroll two different elements
       simultaneously
       */
      const container = this.$el.parentElement;
      const parentRect = container.getBoundingClientRect();
      const rect = this.$el.getBoundingClientRect();

      if (rect.top >= parentRect.top && rect.bottom <= parentRect.bottom) {
        return;
      }
      container.scrollBy({
        top: rect.top - parentRect.top -
          (container.clientHeight - rect.height) / 2,
        // behavior: "smooth",
      });
    },
  },
  computed: {
    button_text() {
      if (this.saving) {
        return "Saving...";
      } else if (this.feedback.id == undefined) {
        return "Add Comment";
      } else {
        return "Update";
      }
    },
  },
};
