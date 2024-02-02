import { Observable } from 'rxjs';

/**
 * The strictness values used by the default comparer
 */
type strictnessType = 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none';
type customStrictnessComparerType<Stricktness extends string> = (obj1: any, obj2: any, strictness: Stricktness) => boolean;
/**
 * Compare two objects taking strictness constraint into consideration
 * @param obj1
 * @param obj2
 * @param strictness One of 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none', or string if using custom
 * @param comparer A custom comparer to use with a custom strictness that supplements the default comparer.
 * @returns
 */
declare const strictnessEqualComparer: <Strictness extends string = strictnessType>(obj1: any, obj2: any, strictness?: Strictness, comparer?: customStrictnessComparerType<Strictness> | undefined) => boolean;

interface IStoreValue {
    [tag: string]: any;
}
interface IStorePtr {
    ptr: string;
    value: any;
}
interface IStoreFlags<Strictness extends string = strictnessType> {
    nextTick?: boolean;
    strictness?: Strictness;
}

declare class Store<Strictness extends string = strictnessType> {
    private _flags?;
    private _comparer?;
    private _sub;
    private _running;
    /**
     * Store Constructor
     * @param initial Optional initial object literal value to seed the store with
     * @param _flags Optional flags: { nextTick?: boolean, strictness?: string }. Default is { nextTick?: false, strictness?: 'none' }
     * @param _comparer Optional supplemental comparer to use with a custom defined strictness: (obj1: any, obj2: any, strictness: string) => boolean
     */
    constructor(initial?: IStoreValue, _flags?: IStoreFlags<Strictness> | undefined, _comparer?: customStrictnessComparerType<Strictness> | undefined);
    private _setDel;
    /**
     * Set and delete json pointer path values
     * @param sets The json pointer path values to set: { ptr: string, value: any }[]
     * @param dels The json pointer paths to delete: string[]
     * @param flags Flags to control the bahavior: { nextTick?: boolean }. If nextTick is set it is done on a timeout.
     */
    setDel(sets: IStorePtr[], dels: string[], flags?: {
        nextTick?: boolean;
    }): void;
    private _set;
    /**
     * Set json pointer path values
     * @param data The pointer path values to set: { ptr: string, value: any }[]
     * @param flags Flags to control the bahavior: { nextTick?: boolean }. If nextTick is set it is done on a timeout.
     */
    set(data: IStorePtr[], flags?: {
        nextTick?: boolean;
    }): void;
    private _del;
    /**
     * Delete pointer path values in the store
     * @param ptrs An array of pointer paths to delete
     * @param flags Flags to control the bahavior: { nextTick?: boolean, atomic?: boolean }. If nextTick is set it is done on a timeout. If atomic is set pointer operations only take effect on completion of all operations.
     */
    del(ptrs: string[], flags?: {
        nextTick?: boolean;
        atomic?: boolean;
    }): void;
    /**
     * Assign array/object literal values to the store
     * @param data The pointer paths with its array/object literals: { ptr: string, value: any[] | Object }
     * @param nextTick If set the operation is done on a timeout
     */
    assign(data: {
        ptr: string;
        value: any[] | Object;
    }, nextTick?: boolean): void;
    /**
     * Get an observable that is updated when the pointer path value changes
     * @param ptr The json pointer path
     * @param strictness Override store configured strictness
     * @returns An observable that emits on changes at the json pointer path
     */
    get<T = any>(ptr: string, strictness?: Strictness): Observable<T>;
    /**
     * Get a slice from the store at a json pointer path
     * @param ptr The json pointer path
     * @param clone True to return a cloned slice
     * @param defaultValue The default value to return if no value is found
     * @returns The value found at the ptr
     */
    slice<T = any>(ptr: string, clone?: boolean, defaultValue?: T): T | undefined;
    /**
     * Initialise the store with new values
     * @param value An object literal
     */
    initialise(value: IStoreValue): void;
    /**
     * Release all subscriptions into the store
     */
    destroy(): void;
}

export { Store, strictnessEqualComparer };
