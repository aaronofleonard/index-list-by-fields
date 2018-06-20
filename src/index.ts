export interface IndexedField<M> {
  [value: string]: Array<M> | IndexedField<M>;
}

export interface IndexedState<M> {
  [field: string]: IndexedField<M>;
}

export interface IndexedMemoizableFunction<M> {
  (...args: Array<any>): IndexedState<M>;
}

function ensureKeyOnObject<M>(
  obj: IndexedField<M>,
  key: string,
  defaultValue: any
) {
  if (!obj.hasOwnProperty(key)) {
    obj[key] = defaultValue;
  }
}

function indexIntoObject<M>(
  baseObject: IndexedField<M> | IndexedState<M>,
  item: M,
  field: string | Array<string>
): IndexedField<M> {
  let value: any, nextFields: Array<string>, currentField: string;

  if (Array.isArray(field)) {
    [currentField, ...nextFields] = field;
  } else {
    currentField = field;
  }

  value = item[currentField];

  if (value === null) {
    return;
  }

  if (Array.isArray(nextFields) && nextFields.length) {
    ensureKeyOnObject(baseObject, value, {});
    indexIntoObject(baseObject[value] as IndexedField<M>, item, nextFields);
  } else {
    ensureKeyOnObject(baseObject, value, []);
    (baseObject[value] as Array<M>).push(item);
  }
}

export const indexListByFields = (...fields: Array<string | string[]>) => <
  M extends object
>(
  list: Array<M>
): IndexedState<M> => {
  // preinitialize all fields
  let indexedBaseObj: IndexedState<M> = fields.reduce((obj: object, field) => {
    if (typeof field === 'string') {
      obj[field] = {};
    } else if (Array.isArray(field)) {
      obj[field.join('')] = {};
    }
    return obj;
  }, {});

  for (let i = 0, len = list.length; i < len; i++) {
    let item = list[i];

    for (let j = 0, subLen = fields.length; j < subLen; j++) {
      let field = fields[j];

      const key = Array.isArray(field) ? field.join('') : field;

      indexIntoObject(indexedBaseObj[key], item, field);
    }
  }

  return indexedBaseObj;
};

function isArrayEqual<T>(a: Array<T>, b: Array<T>) {
  // step 1: if one is something and the other is nothing, clearly not the same
  if ((!a && b) || (a && !b) || !a.length || !b.length) {
    return false;
  }

  // step 2: if they are not the same length, clearly not the same
  if (a.length !== b.length) {
    return false;
  }

  // step 3: if they contain different objects at the same index, clearly not the same
  for (let i = a.length - 1; i >= 0; i--) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export const memoizeIndexedArray = <M>(fn: IndexedMemoizableFunction<M>) => {
  let lastResult: IndexedState<M>;

  return (...args: Array<any>) => {
    let nextResult: IndexedState<M> = fn(...args);

    if (lastResult) {
      let outerChanged = false;
      const fields = Object.keys(nextResult);

      const nextIndexed: IndexedState<M> = fields.reduce(
        (state, field) => {
          let innerChanged = false;

          const fieldKeys = Object.keys(nextResult[field]);

          let nextValueIndexedList = fieldKeys.reduce(
            (acc, value) => {
              if (
                isArrayEqual(lastResult[field][value] as Array<M>, nextResult[field][value] as Array<M>)
              ) {
                acc[value] = lastResult[field][value];
              } else {
                innerChanged = true;
                acc[value] = nextResult[field][value];
              }

              return acc;
            },
            {}
          );

          if (fieldKeys.length === 0) {
            innerChanged = true;
          }

          state[field] = innerChanged
            ? nextValueIndexedList
            : lastResult[field];

          outerChanged = innerChanged || outerChanged;

          return state;
        },
        {}
      );

      return outerChanged ? (lastResult = nextIndexed) : lastResult;
    } else {
      return (lastResult = nextResult);
    }
  };
};
