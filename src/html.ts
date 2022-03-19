export interface Property<T> {
  get?(): T;

  set?(value: T): void;
}

export function resolve<T>(value: T | Property<T>): Property<T> {
  return {
    set(v: T) {
      value = v;
    },
  };
}

export interface DocumentDescriptor {
  title?: Property<string> | string;
  body?: ElementPrototype[];
  head?: ElementPrototype[];
}

export function document(descriptor: DocumentDescriptor) {
  if (descriptor.title) {
    if (typeof descriptor.title === "string") {
      window.document.title = descriptor.title;
    } else if (descriptor.title.get) {
      window.document.title = descriptor.title.get();
    }
    if (typeof descriptor.bind === "function") {
      descriptor.title.bind({
        set(value: string) {
          window.document.title = value;
        },
      });
    }
  }
  if (descriptor.body) element("body").extend(descriptor.body).create(window.document.body);
  if (descriptor.head) element("head").extend(descriptor.head).create(window.document.head);
}

export interface ElementDescriptor {
  tag?: string;
  attributes?: { [key: string]: string };
  styles?: { [key: string]: string };
  children?: ElementDescriptor[];
  text?: string;
  html?: string;
}

export interface ElementPrototype {
  tag: string;
  attributes: { [key: string]: string };
  styles: { [key: string]: string };
  children: ElementPrototype[];
  text?: string;
  html?: string;

  create(element?: HTMLElement): HTMLElement;

  destroy(element?: HTMLElement): void;

  extend(descriptor: ElementDescriptor | ElementPrototype[] | string | number): ElementPrototype;
}

export const div = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("div").extend(descriptor);
export const h1 = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("h1").extend(descriptor);
export const h2 = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("h2").extend(descriptor);
export const h3 = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("h3").extend(descriptor);
export const h4 = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("h4").extend(descriptor);
export const h5 = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("h5").extend(descriptor);
export const h6 = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("h6").extend(descriptor);
export const p = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("p").extend(descriptor);
export const span = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("span").extend(descriptor);
export const a = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("a").extend(descriptor);
export const img = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("img").extend(descriptor);
export const button = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("button").extend(descriptor);
export const input = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("input").extend(descriptor);
export const textarea = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("textarea").extend(descriptor);
export const select = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("select").extend(descriptor);
export const option = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("option").extend(descriptor);
export const ul = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("ul").extend(descriptor);
export const li = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("li").extend(descriptor);
export const table = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("table").extend(descriptor);
export const tr = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("tr").extend(descriptor);
export const td = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("td").extend(descriptor);
export const th = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("th").extend(descriptor);
export const form = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("form").extend(descriptor);
export const label = (descriptor: ElementDescriptor | ElementPrototype[] | string | number) => element("label").extend(descriptor);


export function element(tag = "div"): ElementPrototype {
  return {
    tag: tag,
    attributes: {},
    styles: {},
    children: [],
    extend(descriptor) {
      // TODO
      if (typeof descriptor === "string" || typeof descriptor === "number") {
        descriptor = { text: descriptor.toString() };
      } else if (Array.isArray(descriptor)) {
        descriptor = { children: descriptor };
      }

      return Object.assign(Object.create(this), descriptor);
    },
    create(el) {
      el = el || window.document.createElement(this.tag);

      for (const key in this.attributes) {
        if (typeof this.attributes[key] === "string") {
          el.setAttribute(key, this.attributes[key]);
        } else {
          el[key] = this.attributes[key];
        }
      }

      for (const key in this.styles) {
        el.style[key] = this.styles[key];
      }

      // TODO: Handle children, text or html being set at the same time
      if (this.text) {
        el.innerText = this.text;
      } else if (this.html) {
        el.innerHTML = this.html;
      } else for (const child of this.children) {
        el.append(child.create());
      }

      return el;
    },
    destroy(el) {

    },
  };
}
