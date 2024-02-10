import { BehaviorSubject, filter, map, Observable, takeWhile } from "rxjs";
import { isArray, isPlainObject } from "lodash";
import { cloneJson, distinctUntilChangedEq, longestCommonPrefix, ptrGet, ptrRemove, ptrSet, removeDeepUndefined, strictnessType, customStrictnessComparerType, ptrHas, ptrTypeof, ptrHasParent } from "./library";

const flagValue = (overrideFlag: boolean | undefined, flag: boolean | undefined) =>
    typeof overrideFlag === 'boolean' ?
        overrideFlag :
        flag;

export interface IStoreValue { [tag: string]: any }
export interface IStorePtr { ptr: string, value: any }

export interface IStoreFlags<Strictness extends string = strictnessType> {
    nextTick?: boolean,
    strictness?: Strictness,
    coerceUndefinedArray?: boolean
}

export class Store<Strictness extends string = strictnessType> {

    private _sub = new BehaviorSubject<{ last_set_ptrs: string[], value: IStoreValue }>({ last_set_ptrs: [], value: {} });
    private _running = true;

    /**
     * Store Constructor
     * @param initial Optional initial object literal value to seed the store with
     * @param _flags Optional flags: { nextTick?: boolean, strictness?: string }. Default is { nextTick?: false, strictness?: 'none' }
     * @param _comparer Optional supplemental comparer to use with a custom defined strictness: (obj1: any, obj2: any, strictness: string) => boolean
     */
    constructor(
        initial?: IStoreValue,
        private _flags?: IStoreFlags<Strictness>,
        private _comparer?: customStrictnessComparerType<Strictness>) {

        this._flags = this._flags || {};

        if (!this._flags?.strictness)
            this._flags.strictness = 'none' as Strictness;

        if (initial)
            this._sub.next({ last_set_ptrs: ['/'], value: isPlainObject(initial) ? initial : {} });

    }

    private _setDel(sets: IStorePtr[], dels: string[], coerceUndefinedArray?: boolean) {
        const val = this._sub.value.value;
        sets.forEach(datum => ptrSet(val, datum.ptr, datum.value, coerceUndefinedArray || this._flags?.coerceUndefinedArray));
        dels.forEach(ptr => ptrRemove(val, ptr));
        const ptrs = [...sets.map(s => s.ptr), ...dels];
        if (ptrs.length)
            this._sub.next({ last_set_ptrs: ptrs, value: val });
    }

    /**
     * Set and delete json pointer path values
     * @param sets The json pointer path values to set: { ptr: string, value: any }[]
     * @param dels The json pointer paths to delete: string[]
     * @param flags Flags to control the bahavior: { nextTick?: boolean }. If nextTick is set it is done on a timeout.
     */
    setDel(sets: IStorePtr[], dels: string[], flags?: { nextTick?: boolean, coerceUndefinedArray?: boolean }) {

        if (flagValue(flags?.nextTick, this._flags?.nextTick))
            setTimeout(() => this._setDel(sets, dels), 0, flags?.coerceUndefinedArray);
        else
            this._setDel(sets, dels, flags?.coerceUndefinedArray);

    }

    private _set(data: IStorePtr[], coerceUndefinedArray?: boolean) {

        const val = this._sub.value.value;
        data.forEach(datum =>
            ptrSet(val, datum.ptr, datum.value, flagValue(coerceUndefinedArray, this._flags?.coerceUndefinedArray))
        );
        const ptrs = data.map(s => s.ptr);
        if (ptrs.length)
            this._sub.next({ last_set_ptrs: ptrs, value: val });

    }

    /**
     * Set json pointer path values
     * @param data The pointer path values to set: { ptr: string, value: any }[]
     * @param flags Flags to control the bahavior: { nextTick?: boolean }. If nextTick is set it is done on a timeout.
     */
    set(data: IStorePtr[], flags?: { nextTick?: boolean, coerceUndefinedArray?: boolean }) {

        if (flagValue(flags?.nextTick, this._flags?.nextTick))
            setTimeout(() => this._set(data), 0, flags?.coerceUndefinedArray);
        else
            this._set(data, flags?.coerceUndefinedArray);

    }

    private _del(ptrs: string[], atomic?: boolean) {

        const val = this._sub.value.value;

        if (atomic) {
            ptrs.forEach(ptr => ptrSet(val, ptr, undefined));
            const ptr = longestCommonPrefix(ptrs);
            const value = removeDeepUndefined(ptrGet(val, ptr));
            this.set([{ ptr, value }]);
        }
        else {
            ptrs.forEach(ptr => ptrRemove(val, ptr));
            this._sub.next({ last_set_ptrs: ptrs, value: val });
        }

    }

    /**
     * Delete pointer path values in the store
     * @param ptrs An array of pointer paths to delete
     * @param flags Flags to control the bahavior: { nextTick?: boolean, atomic?: boolean }. If nextTick is set it is done on a timeout. If atomic is set pointer operations only take effect on completion of all operations.
     */
    del(ptrs: string[], flags?: { nextTick?: boolean, atomic?: boolean }) {

        if (flagValue(flags?.nextTick, this._flags?.nextTick))
            setTimeout(() => this._del(ptrs, flags?.atomic), 0);
        else
            this._del(ptrs, flags?.atomic);

    }

    /**
     * Assign array/object literal values to the store 
     * @param data The pointer paths with its array/object literals: { ptr: string, value: any[] | Object }
     * @param nextTick If set the operation is done on a timeout 
     */
    assign(data: { ptr: string, value: any[] | Object }, nextTick?: boolean) {

        const val = this.slice(data.ptr);
        if (isArray(val) && isArray(data.value))
            this.set([{ ptr: data.ptr, value: [...val, ...data.value] }], { nextTick });
        else if (isPlainObject(val) && isPlainObject(data.value))
            this.set([{ ptr: data.ptr, value: { ...val, ...data.value } }], { nextTick });
        else
            this.set([data], { nextTick });

    }

    /**
     * Get an observable that is updated when the pointer path value changes
     * @param ptr The json pointer path
     * @param strictness Override store configured strictness
     * @returns An observable that emits on changes at the json pointer path
     */
    get<T = any>(ptr: string, strictness?: Strictness): Observable<T | undefined> {

        let n = 0;

        return this._sub.pipe(
            takeWhile(_ => !!this._running),
            filter(value =>
                (n++ == 0) ||
                (value.last_set_ptrs.some(lptr => lptr.indexOf(ptr) == 0 || ptr.indexOf(lptr) == 0))),
            map(value => ptrGet<any>(value.value, ptr)),
            distinctUntilChangedEq<T, Strictness>(strictness || this._flags!.strictness!, this._comparer)
        );

    }

    /**
     * Check if a json pointer value exists.
     * @param ptr 
     * @returns True if the pointer value exists. If the value has an entry of undefined it returns true.
     */
    has(ptr: string): boolean | undefined {

        return ptrHas(this._sub.value.value, ptr);

    }

    /**
     * Return the type of the value at the json pointer.
     * @param ptr 
     * @returns True if the value exists, false if it does not exist or is undefined.
     */
    typeof(ptr: string) {

        return ptrTypeof(this._sub.value.value, ptr);

    }

    /**
     * Check if a value at the json poitner parent has a value.
     * @param ptr 
     * @returns 
     */
    hasParent(ptr: string) {

        return ptrHasParent(this._sub.value.value, ptr);

    }

    /**
     * Get a slice from the store at a json pointer path
     * @param ptr The json pointer path
     * @param clone True to return a cloned slice
     * @param defaultValue The default value to return if no value is found
     * @returns The value found at the ptr
     */
    slice<T = any>(ptr: string, clone?: boolean, defaultValue?: T): T | undefined {

        const value = ptrGet<T>(this._sub.value.value, ptr);
        return clone ? cloneJson<T | undefined>(typeof value != 'undefined' ? value : defaultValue) : (typeof value != 'undefined' ? value : defaultValue);

    }

    /**
     * Initialise the store with new values
     * @param value An object literal
     */
    initialise(value: IStoreValue) {

        this._sub.next({ last_set_ptrs: ['/'], value });

    }

    /**
     * Release all subscriptions into the store
     */
    destroy() {

        this._running = false;
        this._sub.next({ last_set_ptrs: ['/'], value: {} });

    }

}