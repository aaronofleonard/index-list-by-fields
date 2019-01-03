export interface IndexedField<M> {
    [value: string]: Array<M> | IndexedField<M>;
}
export interface IndexedState<M> {
    [field: string]: IndexedField<M>;
}
export interface IndexedMemoizableFunction<M> {
    (...args: Array<any>): IndexedState<M>;
}
export declare const indexListByFields: (...fields: (string | string[])[]) => <M extends object>(list: M[], processor?: <P>(item: M) => P) => IndexedState<M>;
export declare const memoizeIndexedArray: <M>(fn: IndexedMemoizableFunction<M>) => (...args: any[]) => IndexedState<M>;
