const { within } = TestingLibraryDom;

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

QUnit.module("UserFeedback", function () {
  QUnit.test("component renders", function (assert) {
    const { div } = mountComponent(
      '<userfeedback />',
      {},
    );
    assert.ok(div.getByText("Your comments"));
  });
});
