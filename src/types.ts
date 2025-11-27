export abstract class BaseType {
  abstract readonly kind: string;
}

export class FunctionType extends BaseType {
  readonly kind = 'function';
  params: string[];

  constructor(params: string[]) {
    super();
    this.params = params;
  }
}

export class ObjectType extends BaseType {
  readonly kind = 'object';
  map: Record<string, BaseType>;

  constructor(map: Record<string, BaseType>) {
    super();
    this.map = map;
  }
}
