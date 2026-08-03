const { within } = TestingLibraryDom;

function StorageMock() {
  // from https://stackoverflow.com/a/26177872
  let storage = {};

  return {
    setItem: function (key, value) {
      storage[key] = value || "";
    },
    getItem: function (key) {
      return key in storage ? storage[key] : null;
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

QUnit.module("Modal", function () {
  QUnit.test("placeholder text matches icon", function (assert) {
    const { div } = mountComponent(
      '<Modal v-bind:feedback="feedback" page_id=2 />',
      { feedback: testFeedback },
    );
    assert.ok(div.getByPlaceholderText("What did you love?"));
  });
});

QUnit.module("UserFeedback", function (hooks) {
  hooks.beforeEach(function () {
    const r = (Math.random() + 1).toString(36).substring(7);
    localStorage.setItem("person_id", r);
  });

  QUnit.test("component renders", function (assert) {
    const { div } = mountComponent(
      "<userfeedback />",
      {},
    );
    assert.ok(div.getByText("Your comments"));
  });
});
