import * as Vue from "vue";
import ModalComponent from "./components/Modal";
import LoginComponent from "./components/Login";
import AnnotatorComponent from "./components/Annotator";
import AdminComponent from "./components/Admin";
import AdminLoginComponent from "./components/AdminLogin";
import AdminListComponent from "./components/AdminList";
import UserFeedbackComponent from "./components/UserFeedback";
import * as icons from "./components/icons.json";

const components = {
  "Modal": ModalComponent,
  "Login": LoginComponent,
  "Annotator": AnnotatorComponent,
  "Admin": AdminComponent,
  "AdminLogin": AdminLoginComponent,
  "adminlist": AdminListComponent,
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
