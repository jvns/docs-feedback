import * as Vue from "vue";
import ModalComponent from "./components/Modal";
import LoginComponent from "./components/Login";
import AdminComponent from "./components/Admin";
import AdminLoginComponent from "./components/AdminLogin";
import UserFeedbackComponent from "./components/UserFeedback";
import * as icons from "./components/icons.json";

const components = {
  "Modal": ModalComponent,
  "Login": LoginComponent,
  "Admin": AdminComponent,
  "AdminLogin": AdminLoginComponent,
  "userfeedback": UserFeedbackComponent,
};

const app = Vue.createApp({});

/* for testing */
window._components = components;
window._icons = icons;

app.config.globalProperties.icons = icons;
for (const [c, v] of Object.entries(components)) {
  app.component(c, v);
}
app.mount("#app");
