import type { ElementPrototype } from "./html";

export function sheet(descriptor: { [key: string]: Partial<CSSStyleDeclaration> }): ElementPrototype {
  const style = document.createElement("style");
  create("html", descriptor);

  function create(selector: string, descriptor) {
    for (const key in descriptor) {
      if (typeof descriptor[key] === "object" && descriptor[key] !== null) {
        create(selector + " " + key, descriptor[key]);
      } else if (typeof descriptor[key] === "string" || typeof descriptor[key] === "number") {
        style.append(`${selector} {${key.replace(/[A-Z]/g, "-$&").toLowerCase()}:${descriptor[key]}}`);
      }
    }
  }

  return {
    create() {
      return style;
    },
    destroy() {

    },
  };
}
