var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/store.ts
import { BehaviorSubject, filter, map, takeWhile } from "rxjs";
import { isArray as isArray2, isPlainObject as isPlainObject2 } from "lodash";

// src/library.ts
import { remove, get, set, has } from "json-pointer";
import { cloneDeep, isArray, isEqual, isPlainObject, mapValues } from "lodash";
import { distinctUntilChanged } from "rxjs";
var cleanDeep = __require("clean-deep");
var sortAny = __require("sort-any");
var CLEAN_DEEP_OPTS = {
  emptyArrays: true,
  emptyObjects: true,
  emptyStrings: true,
  NaNValues: false,
  nullValues: true,
  undefinedValues: true
};
var voidObject = (source, val) => {
  Object.keys(source).forEach((key) => delete source[key]);
  Object.assign(source, val);
};
var sortDeep = (obj) => {
  if (!isArray(obj)) {
    if (!isPlainObject(obj))
      return obj;
    return mapValues(obj, sortDeep);
  }
  return sortAny(obj.map(sortDeep));
};
var longestCommonPrefix = (ptrs) => {
  if (!ptrs.length)
    return "/";
  let prefixParts = ptrs[0].split("/");
  for (let i = 1; i < ptrs.length; i++) {
    const iPrefixParts = ptrs[i].split("/");
    let j = 0;
    while (prefixParts[j] == iPrefixParts[j])
      j++;
    prefixParts = prefixParts.slice(0, j);
  }
  return prefixParts.length === 1 ? "/" : prefixParts.join("/");
};
var removeDeepUndefined = (obj, no_clone, options) => {
  return cleanDeep(no_clone ? obj : cloneJson(obj), options || CLEAN_DEEP_OPTS);
};
var strictnessEqualComparer = (obj1, obj2, strictness = "none", comparer) => {
  if (strictness === "none")
    return false;
  if (typeof obj1 == "undefined" && typeof obj2 == "undefined")
    return true;
  if (typeof obj1 == "undefined" || typeof obj2 == "undefined")
    return false;
  if (strictness === "strict")
    return obj1 === obj2;
  if (strictness == "isEqual")
    return isEqual(
      obj1,
      obj2
    );
  else if (strictness == "isEqualRemoveUndefined")
    return isEqual(
      removeDeepUndefined(obj1),
      removeDeepUndefined(obj2)
    );
  else if (strictness == "isEqualRemoveUndefinedSorted")
    return isEqual(
      sortDeep(removeDeepUndefined(obj1)),
      sortDeep(removeDeepUndefined(obj2))
    );
  else if (comparer)
    return comparer(obj1, obj2, strictness);
  else
    return false;
};
var distinctUntilChangedEq = (strictness = "none", comparer) => distinctUntilChanged((a, b) => strictnessEqualComparer(a, b, strictness, comparer));
var ptrGet = (source, ptr) => {
  return ptr === "/" ? source : get(source, ptr);
};
var ptrSet = (source, ptr, val) => {
  try {
    return ptr === "/" ? voidObject(source, val) : set(source, ptr, val);
  } catch {
  }
};
var ptrRemove = (source, ptr) => {
  try {
    remove(source, ptr);
  } catch {
  }
};
function cloneJson(value) {
  try {
    if (typeof value == "undefined")
      return void 0;
    return cloneDeep(value);
  } catch (error) {
    throw error;
  }
}

// src/store.ts
var flagValue = (flag1, flag2) => typeof flag1 === "boolean" ? flag1 : flag2;
var Store = class {
  /**
   * Store Constructor
   * @param initial Optional initial object literal value to seed the store with
   * @param _flags Optional flags: { nextTick?: boolean, strictness?: string }. Default is { nextTick?: false, strictness?: 'none' }
   * @param _comparer Optional supplemental comparer to use with a custom defined strictness: (obj1: any, obj2: any, strictness: string) => boolean
   */
  constructor(initial, _flags, _comparer) {
    this._flags = _flags;
    this._comparer = _comparer;
    this._sub = new BehaviorSubject({ last_set_ptrs: [], value: {} });
    this._running = true;
    this._flags = this._flags || {};
    if (!this._flags?.strictness)
      this._flags.strictness = "none";
    if (initial)
      this._sub.next({ last_set_ptrs: ["/"], value: isPlainObject2(initial) ? initial : {} });
  }
  _setDel(sets, dels) {
    const val = this._sub.value.value;
    sets.forEach((datum) => ptrSet(val, datum.ptr, datum.value));
    dels.forEach((ptr) => ptrRemove(val, ptr));
    const ptrs = [...sets.map((s) => s.ptr), ...dels];
    if (ptrs.length)
      this._sub.next({ last_set_ptrs: ptrs, value: val });
  }
  /**
   * Set and delete json pointer path values
   * @param sets The json pointer path values to set: { ptr: string, value: any }[]
   * @param dels The json pointer paths to delete: string[]
   * @param flags Flags to control the bahavior: { nextTick?: boolean }. If nextTick is set it is done on a timeout.
   */
  setDel(sets, dels, flags) {
    if (flagValue(flags?.nextTick, this._flags?.nextTick))
      setTimeout(() => this._setDel(sets, dels), 0);
    else
      this._setDel(sets, dels);
  }
  _set(data) {
    const val = this._sub.value.value;
    data.forEach((datum) => ptrSet(val, datum.ptr, datum.value));
    const ptrs = data.map((s) => s.ptr);
    if (ptrs.length)
      this._sub.next({ last_set_ptrs: ptrs, value: val });
  }
  /**
   * Set json pointer path values
   * @param data The pointer path values to set: { ptr: string, value: any }[]
   * @param flags Flags to control the bahavior: { nextTick?: boolean }. If nextTick is set it is done on a timeout.
   */
  set(data, flags) {
    if (flagValue(flags?.nextTick, this._flags?.nextTick))
      setTimeout(() => this._set(data), 0);
    else
      this._set(data);
  }
  _del(ptrs, atomic) {
    const val = this._sub.value.value;
    if (atomic) {
      ptrs.forEach((ptr2) => ptrSet(val, ptr2, void 0));
      const ptr = longestCommonPrefix(ptrs);
      const value = removeDeepUndefined(ptrGet(val, ptr), true);
      this.set([{ ptr, value }]);
    } else {
      ptrs.forEach((ptr) => ptrRemove(val, ptr));
      this._sub.next({ last_set_ptrs: ptrs, value: val });
    }
  }
  /**
   * Delete pointer path values in the store
   * @param ptrs An array of pointer paths to delete
   * @param flags Flags to control the bahavior: { nextTick?: boolean, atomic?: boolean }. If nextTick is set it is done on a timeout. If atomic is set pointer operations only take effect on completion of all operations.
   */
  del(ptrs, flags) {
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
  assign(data, nextTick) {
    const val = this.slice(data.ptr);
    if (isArray2(val) && isArray2(data.value))
      this.set([{ ptr: data.ptr, value: [...val, ...data.value] }], { nextTick });
    else if (isPlainObject2(val) && isPlainObject2(data.value))
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
  get(ptr, strictness) {
    let n = 0;
    return this._sub.pipe(
      takeWhile((_) => !!this._running),
      filter((value) => n++ == 0 || value.last_set_ptrs.some((lptr) => lptr.indexOf(ptr) == 0 || ptr.indexOf(lptr) == 0)),
      map((value) => ptrGet(value.value, ptr)),
      distinctUntilChangedEq(strictness || this._flags.strictness, this._comparer)
    );
  }
  /**
   * Get a slice from the store at a json pointer path
   * @param ptr The json pointer path
   * @param clone True to return a cloned slice
   * @param defaultValue The default value to return if no value is found
   * @returns The value found at the ptr
   */
  slice(ptr, clone, defaultValue) {
    const value = ptrGet(this._sub.value.value, ptr);
    return clone ? cloneJson(typeof value != "undefined" ? value : defaultValue) : typeof value != "undefined" ? value : defaultValue;
  }
  /**
   * Initialise the store with new values
   * @param value An object literal
   */
  initialise(value) {
    this._sub.next({ last_set_ptrs: ["/"], value });
  }
  /**
   * Release all subscriptions into the store
   */
  destroy() {
    this._running = false;
    this._sub.next({ last_set_ptrs: ["/"], value: {} });
  }
};
export {
  Store
};
//# sourceMappingURL=index.mjs.map