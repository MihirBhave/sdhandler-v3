import type { ButtonOptions } from "../typings/Button";

export class Button {
  constructor(options: ButtonOptions) {
    Object.assign(this, options);
  }
}
