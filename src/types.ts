export abstract class BaseType {}

export class FunctionType extends BaseType {
  constructor(public params: string[]) {
    super();
  }
}

export class ObjectType extends BaseType {
  constructor(public map: Map<string, BaseType>) {
    super();
  }
}
