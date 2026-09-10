const { within } = TestingLibraryDom;
import * as Vue from "../js/vue.esm-browser.js";

function StorageMock() {
  // from https://stackoverflow.com/a/26177872
  let storage = {};

  return {
    setItem: function (key, value) {
      storage[key] = value;
    },
    getItem: function (key) {
      return storage[key];
    },
    removeItem: function (key) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: function (i) {
      const keys = Object.keys(storage);
      return keys[i] || null;
    },
    clear: function() {
      storage = {};
    },
  };
}

/* mock localStorage so that we don't overwrite our local storage*/
const fakeStorage = new StorageMock();
Object.defineProperty(window, "localStorage", {
  value: fakeStorage,
  writable: true,
  configurable: true,
});

async function waitFor(fn, assert, timeout = 2000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const result = fn();
    if (result) {
      assert.ok(result);
      return result;
    }
    await new Promise((r) => setTimeout(r, 5));
  }
  throw new Error("timed out");
}

const testFeedback = {
  id: "3",
  emoji: "heart",
  content: "loved this section",
  selector: [{ start: 0, end: 10 }],
};

function mountComponent(template, data) {
  const app = Vue.createApp({
    template: template,
    data: () => data,
  });
  for (const [c, v] of Object.entries(window._components)) {
    app.component(c, v);
  }
  app.config.globalProperties.icons = window._icons;
  const div = document.createElement("div");
  document.getElementById("qunit-fixture").appendChild(div);
  const instance = app.mount(div);
  return { div: within(div), app, instance };
}

function reset() {
  fakeStorage.clear();
  return fetch("/api/reset_test_data", { method: "POST" });
}

QUnit.module("Modal", function () {
  QUnit.test("placeholder text matches icon", function (assert) {
    const { div } = mountComponent(
      '<Modal v-bind:feedback="feedback" page_id=2 />',
      { feedback: testFeedback },
    );
    assert.ok(div.getByPlaceholderText("What did you love?"));
  });
});

QUnit.module("UserFeedback", function () {
  QUnit.test("document appears after login", async function (assert) {
    await reset();
    const { div } = mountComponent('<userfeedback doc_name="test-doc" />');
    await waitFor(() => div.queryByText(/Welcome to the Wizard Zines feedback site!/), assert);
    const nameInput = div.getByLabelText("Name:");
    nameInput.value = "Test User";
    nameInput.dispatchEvent(new Event("input"));
    div.getByText("Continue").click();
    await waitFor(() => div.queryByText(/Your comments/), assert);
    await waitFor(() => div.queryByText(/This Is A Test Document/), assert);
  });
});

function adminLogin(div) {
    const usernameInput = div.getByLabelText(/Username/);
    usernameInput.value = "test@example.com";
    usernameInput.dispatchEvent(new Event("input"));

    const passwordInput = div.getByLabelText(/Password/);
    passwordInput.value = "testpassword123";
    passwordInput.dispatchEvent(new Event("input"));

    div.getByText("Login").click();
}

QUnit.module("AdminList", function () {
  QUnit.test("document list appears after login", async function (assert) {
    await reset();
    const { div } = mountComponent("<adminlist />");
    await waitFor(() => div.queryByText(/Username/), assert);

    adminLogin(div)

    await waitFor(() => div.queryByText(/Create new/), assert);
    await waitFor(() => div.queryByText(/test-doc/), assert);
  });
});

QUnit.module("Admin view feedback", function () {
  QUnit.test("feedback appears after login", async function (assert) {
    await reset();
    const { div } = mountComponent("<admin doc_name='test-doc' />");

    adminLogin(div)

    await waitFor(() => div.queryByText(/loved this section/), assert);
  });
});
