import template from "./AdminLogin.html";

import { pb } from "../util.js";

export default {
  template: template,
  emits: ["logged-in"],
  data() {
    return {
      error: "",
      state: "login",
    };
  },

  mounted() {
    if (pb.authStore.isValid) {
      this.$emit("logged-in");
    }
  },

  methods: {
    async login() {
      try {
        await pb
          .collection("users")
          .authWithPassword(
            this.$refs.username.value,
            this.$refs.password.value,
          );
      } catch {
        this.error = "wrong password";
        this.$refs.username.value = "";
        this.$refs.password.value = "";
      }
      if (pb.authStore.isValid) {
        this.$emit("logged-in");
      }
    },

    async reset() {
      await pb.collection("users").requestPasswordReset(this.$refs.email.value);
      this.error = "If you have an account, we've sent you a reset email! Come back here once you've reset your password.";
      this.state = "login";
    },
  },
};
