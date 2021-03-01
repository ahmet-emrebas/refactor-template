export class Errors {
  static throwArgumentTypeException(): never {
    throw new Error("Argument type is not valid");
  }
}
