const app = Vue.createApp({
    data() {
        return {
            message: "bnana"
        }
    },
    methods: {
        testMethod() {
            return this.message + "!";
        }
    }
})
app.mount('#app')

window.process = { browser: true, env: { ENVIRONMENT: 'BROWSER' } };

const { createTextAnnotator } = RecogitoJS;
const anno = createTextAnnotator(document.getElementById('asdf'), {'user': {'id': 'asdf', 'name': 'Julia'}});
anno.on('createAnnotation', annotation => {
  console.log('new annotation', annotation);
});     
