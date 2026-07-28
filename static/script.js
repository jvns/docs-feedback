const pb = new PocketBase("http://127.0.0.1:8090");
window.process = { browser: true, env: { ENVIRONMENT: "BROWSER" } };
const { createTextAnnotator } = RecogitoJS;

const app = Vue.createApp({
  data() {
    return {
      content: "",
    };
  },

  async mounted() {
    const record = await pb.collection("documents").getFirstListItem(
      'name="git-pull"',
    );
    this.content = record.content;
    // this.$refs.html;
  },
  methods: {
    testMethod() {
      return this.message + "!";
    },
  },
});
app.mount("#app");

const anno = createTextAnnotator(document.getElementById("asdf"), {
  "user": { "id": "asdf", "name": "Julia" },
});
anno.on("createAnnotation", (annotation) => {
  console.log("new annotation", annotation);
});
