import template from "./Login.html";

export default {
  template: template,
  props: ['pb'],
  emits: ["success"],
  methods: {
    async login() {
      const password = this.$refs.password.value;
      try {
        await this.pb.collection("users").authWithPassword(
          "anonymous",
          password,
        );
        this.$emit('success');
      } catch {
        this.errors = ["wrong password"];
      }
    },
  },
};
