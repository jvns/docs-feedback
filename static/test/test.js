const { within } = TestingLibraryDom;
import * as Vue from "../js/vue.esm-browser.js";
import { pb } from "../util.js";

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
  // we're using this instead of testing library's built in
  // WaitFor because this one retries when you return false
  // and the testing library one requires you to throw an exception and I don't
  // like that
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


const testEmail = "test@example.com"
const testPassword = "testpassword123"
const testPersonName = "Test Person"
const testDocName = "test-doc"

async function createPerson() {
  const record = await pb.collection("people").create({
    name: testPersonName,
  });
  fakeStorage.setItem("person_id", record.id);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

QUnit.module("UserFeedback", function () {
  QUnit.test("document appears after login", async function (assert) {
    assert.expect(0);
    await reset();
    const { div } = mountComponent('<userfeedback doc_name="test-doc" />');
    await div.findByText(/Welcome to the Wizard Zines feedback site!/);
    const nameInput = div.getByLabelText("Name:");
    nameInput.value = "Test User";
    div.getByText("Continue").click();
    await div.findByText(/Your comments/);
    await div.findByText(/This Is A Test Document/);
  });

  QUnit.test("selecting text opens modal", async function (assert) {
    await reset();
    await createPerson();
    const { div } = mountComponent('<userfeedback doc_name="test-doc" />');
    await div.findByText(/This Is A Test Document/);
    const html = div.queryByText(/This Is A Test Document/);
    const selection = window.getSelection();
    selection.empty();
    html.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await sleep(20);
    selection.selectAllChildren(html);
    // if we don't manually trigger this pointerup  & down event, the annotator
    // library seems to ignore the selection event
    html.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await div.findByText(/I learned something/);
    div.getByText("I love this!").click();
    const loveInput = await div.findByPlaceholderText("What did you love?");
    loveInput.value = "the bananas were great";
    div.getByText("Add Comment").click();    
    loveInput.dispatchEvent(new Event("input"));
    const c = div.getByText("Add Comment")
    c.click();
    await waitFor(() => !div.queryByRole("dialog"), assert);
  });
});

function adminLogin(div) {
    const usernameInput = div.getByLabelText(/Username/);
    usernameInput.value = testEmail;

    const passwordInput = div.getByLabelText(/Password/);
    passwordInput.value = testPassword;

    div.getByText("Login").click();
}

QUnit.module("AdminList", function () {
  QUnit.test("document list appears after login", async function (assert) {
    assert.expect(0);
    await reset();
    const { div } = mountComponent("<adminlist />");
    await div.findByText(/Username/);

    adminLogin(div)

    await div.findByText(/Create new/);
    await div.findByText(/test-doc/);
  });
});

QUnit.module("Admin view feedback", function () {
  QUnit.test("feedback appears after login", async function (assert) {
    assert.expect(0);
    await reset();
    const { div } = mountComponent("<admin doc_name='test-doc' />");

    adminLogin(div)

    await div.findByText(/loved this section/);
  });
});
