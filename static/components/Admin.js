import template from "./Admin.html";

import { fromRecord, pb, toRecord } from "../util.js";

export default {
  template: template,
  data() {
    return {
      loggedIn: false,
      error: "",
    };
  },

  mounted() {
    console.log("hi");
    if (pb.authStore.isValid) {
      this.loggedIn = true;
      console.log(pb.authStore);
    }
  },

  methods: {
    async login() {
      try {
        await pb.collection("users").authWithPassword(
          this.$refs.username.value,
          this.$refs.password.value,
        );
      } catch {
        this.error = "wrong password";
        this.$refs.username.value = "";
        this.$refs.password.value = "";
      }
      this.loggedIn = pb.authStore.isValid;
    },
  },
};
