import * as html from "./html";
import * as css from "./css";

function state(value) {
  const dependencies = [];
  return {
    bind(dependency) {
      dependencies.push(dependency);
      return Object.assign(Object.create(this), dependency, { prototype: this });
    },
    get() {
      return value;
    },
    set(next) {
      value = next;
      dependencies.forEach(d => d.set(next));
    },
    destroy() {
      dependencies.forEach(d => d.destroy());
      dependencies.length = 0;
    },
  };
}

function array(value) {
  return {
    replace(item, index) {

    },
    insert(item, index) {

    },
    remove(item) {

    },
    append(item) {

    },
  }
}

const title = state("Hello World");
const mapped = title.bind({
  get() {
    const value = this.prototype.get();
    console.log('get:', value);
    return value;
  },
  set(value) {
    console.log('set:', value);
    return value;
  },
});

console.log(mapped.get());

setInterval(() => {
  title.set(`It's ${new Date().toLocaleTimeString()}`);
}, 1000);

html.document({
  title: title,
  head: [
    css.sheet({
      body: {
        fontFamily: "sans-serif",
      },
    }),
  ],
  body: [
    html.div({
      children: [
        html.h1({ text: "Hello, World!" }),
        html.p({ text: "This is a paragraph." }),
      ],
    }),
  ],
});
