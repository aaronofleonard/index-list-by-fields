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
  field: string | Array<string>,
  lastBaseObject?: IndexedField<M> | IndexedState<M>
): boolean {
  let value: any,
    nextFields: Array<string>,
    currentField: string,
    changes = false;

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
    changes = indexIntoObject(
      baseObject[value] as IndexedField<M>,
      item,
      nextFields,
      lastBaseObject ? (lastBaseObject[value] as IndexedField<M>) || null : null
    );
  } else {
    ensureKeyOnObject(baseObject, value, []);
    const insertionPoint = baseObject[value] as Array<M>;
    if (
      !lastBaseObject ||
      !lastBaseObject[value] ||
      lastBaseObject[value][insertionPoint.length] != item
    ) {
      changes = true;
    }

    insertionPoint.push(item);
  }

  return changes;
}

export const indexListByFields = (...fields: Array<string | string[]>) => {
  let lastIndexedObj;
  const config = {
    memoize: true,
  };

  const indexer = <M extends object>(list: Array<M>): IndexedState<M> => {
    // preinitialize all fields
    let indexedBaseObj: IndexedState<M> = fields.reduce(
      (obj: object, field) => {
        if (typeof field === 'string') {
          obj[field] = {};
        } else if (Array.isArray(field)) {
          obj[field.join('')] = {};
        }
        return obj;
      },
      {}
    );

    for (let j = 0, subLen = fields.length; j < subLen; j++) {
      let field = fields[j];

      let innerChanged = {};
      const key = Array.isArray(field) ? field.join('') : field;

      for (let i = 0, len = list.length; i < len; i++) {
        let item: M = list[i];

        const itemChange = indexIntoObject(
          indexedBaseObj[key],
          item,
          field,
          lastIndexedObj ? lastIndexedObj[key] : null
        );

        if (itemChange) {
          if (typeof field === 'string') {
            innerChanged[item[field]] = true;
          }
        }
      }

      if (config.memoize) {
        if (lastIndexedObj) {
          const values = Object.keys(indexedBaseObj[key]);
          values.forEach(valueKey => {
            if (
              !innerChanged.hasOwnProperty(valueKey) &&
              Object.keys(indexedBaseObj[key][valueKey] as M[]).length ===
                Object.keys(lastIndexedObj[key][valueKey]).length
            ) {
              indexedBaseObj[key][valueKey] = lastIndexedObj[key][valueKey];
            }
          });
        }

        lastIndexedObj = indexedBaseObj;
      }
    }
    return indexedBaseObj;
  };

  return indexer;
};
