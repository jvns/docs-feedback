import template from "./Modal.html";

export default {
  template: template,
  props: ["feedback", "page_id", "admin"],
  emits: ["modal-close", "modal-submit"],
  mounted: function () {
    this.$el.focus();
    this.$el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
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
  },
  computed: {
    button_text() {
      if (this.saving) {
        return "Saving...";
      } else if (this.feedback.id == "undefined") {
        return "Add Comment";
      } else {
        return "Update";
      }
    },
  },
};
