export abstract class BaseType {}

export class FunctionType extends BaseType {
  params: string[];

  constructor(params: string[]) {
    super();
    this.params = params;
  }
}

export class ObjectType extends BaseType {
  map: Record<string, BaseType>;

  constructor(map: Record<string, BaseType>) {
    super();
    this.map = map;
  }
}
