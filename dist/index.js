"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Store: () => Store,
  strictnessEqualComparer: () => strictnessEqualComparer
});
module.exports = __toCommonJS(src_exports);

// src/store.ts
var import_rxjs2 = require("rxjs");
var import_lodash3 = require("lodash");

// src/library.ts
var import_json_pointer = require("json-pointer");
var import_lodash2 = require("lodash");
var import_rxjs = require("rxjs");
var import_clean_deep = __toESM(require("clean-deep"));

// src/sortany.ts
var import_lodash = require("lodash");
var types = {
  undefined: Symbol("undefined"),
  null: Symbol("null"),
  boolean: Symbol("boolean"),
  NaN: Symbol("NaN"),
  number: Symbol("number"),
  string: Symbol("string"),
  symbol: Symbol("symbol"),
  date: Symbol("date"),
  set: Symbol("set"),
  array: Symbol("array"),
  map: Symbol("map"),
  object: Symbol("object")
};
var typesValues = (0, import_lodash.values)(types);
var orderedTypes = (0, import_lodash.zipObject)(typesValues, Object.keys(typesValues).map((key) => Number(key)));
var comparators = {
  [types.array]: compareArray,
  [types.set]: (a, b) => compareArray([...a], [...b]),
  [types.map]: (a, b) => compareObject(Object.fromEntries(a), Object.fromEntries(b)),
  [types.number]: standardCompare,
  [types.object]: compareObject,
  [types.string]: standardCompare,
  [types.symbol]: (a, b) => standardCompare(a.toString().slice(0, -1), b.toString().slice(0, -1))
};
function getOrderByType(type) {
  return orderedTypes[type];
}
function getTypeByValue(value) {
  if (typeof value === "undefined") {
    return types.undefined;
  }
  if (value === null) {
    return types.null;
  }
  if (typeof value === "boolean") {
    return types.boolean;
  }
  if (typeof value === "number" && Number.isNaN(value)) {
    return types.NaN;
  }
  if (typeof value === "number") {
    return types.number;
  }
  if (typeof value === "string") {
    return types.string;
  }
  if (typeof value === "symbol") {
    return types.symbol;
  }
  if (value instanceof Date) {
    return types.date;
  }
  if (value instanceof Set) {
    return types.set;
  }
  if (value instanceof Map) {
    return types.map;
  }
  if (Array.isArray(value)) {
    return types.array;
  }
  return types.object;
}
function standardCompare(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}
function compareArray(first, second) {
  if (first.length < second.length) {
    return -1;
  }
  if (second.length < first.length) {
    return 1;
  }
  const sortedFirst = sortAny(first);
  const sortedSecond = sortAny(second);
  for (let i = 0; i < first.length; i++) {
    const compareResult = compareSimple(sortedFirst[i], sortedSecond[i]);
    if (compareResult) {
      return compareResult;
    }
  }
  for (let i = 0; i < first.length; i++) {
    const compareResult = compareSimple(first[i], second[i]);
    if (compareResult) {
      return compareResult;
    }
  }
  return 0;
}
function compareObject(first, second) {
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  if (firstKeys.length < secondKeys.length) {
    return -1;
  }
  if (secondKeys.length < firstKeys.length) {
    return 1;
  }
  const sortedFirstKeys = sortAny(firstKeys);
  const sortedSecondKeys = sortAny(secondKeys);
  for (let i = 0; i < firstKeys.length; i++) {
    const compareResult = compareSimple(sortedFirstKeys[i], sortedSecondKeys[i]);
    if (compareResult) {
      return compareResult;
    }
  }
  for (let i = 0; i < firstKeys.length; i++) {
    const key = sortedFirstKeys[i];
    const compareResult = compareSimple(first[key], second[key]);
    if (compareResult) {
      return compareResult;
    }
  }
  for (let i = 0; i < firstKeys.length; i++) {
    const compareResult = compareSimple(firstKeys[i], secondKeys[i]);
    if (compareResult) {
      return compareResult;
    }
  }
  return 0;
}
function compareSimple(first, second) {
  const firstType = getTypeByValue(first);
  const secondType = getTypeByValue(second);
  const firstOrder = getOrderByType(firstType);
  const secondOrder = getOrderByType(secondType);
  const differenceByType = firstOrder - secondOrder;
  if (differenceByType) {
    return differenceByType;
  }
  const comparator = comparators[firstType] || standardCompare;
  return comparator(first, second);
}
function compare(a, b) {
  return compareSimple(a, b);
}
var sortAny = (array) => {
  const undefinedsArray = array.filter((x) => typeof x === "undefined");
  const notUndefinedsArray = array.filter((x) => typeof x !== "undefined");
  return [...undefinedsArray, ...[...notUndefinedsArray].sort(compare)];
};

// src/library.ts
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
  if (!(0, import_lodash2.isArray)(obj)) {
    if (!(0, import_lodash2.isPlainObject)(obj))
      return obj;
    return (0, import_lodash2.mapValues)(obj, sortDeep);
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
  return (0, import_clean_deep.default)(no_clone ? obj : cloneJson(obj), options || CLEAN_DEEP_OPTS);
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
    return (0, import_lodash2.isEqual)(
      obj1,
      obj2
    );
  else if (strictness == "isEqualRemoveUndefined")
    return (0, import_lodash2.isEqual)(
      removeDeepUndefined(obj1),
      removeDeepUndefined(obj2)
    );
  else if (strictness == "isEqualRemoveUndefinedSorted")
    return (0, import_lodash2.isEqual)(
      sortDeep(removeDeepUndefined(obj1)),
      sortDeep(removeDeepUndefined(obj2))
    );
  else if (comparer)
    return comparer(obj1, obj2, strictness);
  else
    return false;
};
var distinctUntilChangedEq = (strictness = "none", comparer) => (0, import_rxjs.distinctUntilChanged)((a, b) => strictnessEqualComparer(a, b, strictness, comparer));
var ptrGet = (source, ptr) => {
  return ptr === "/" ? source : (0, import_json_pointer.get)(source, ptr);
};
var ptrSet = (source, ptr, val) => {
  try {
    return ptr === "/" ? voidObject(source, val) : (0, import_json_pointer.set)(source, ptr, val);
  } catch {
  }
};
var ptrRemove = (source, ptr) => {
  try {
    (0, import_json_pointer.remove)(source, ptr);
  } catch {
  }
};
function cloneJson(value) {
  try {
    if (typeof value == "undefined")
      return void 0;
    return (0, import_lodash2.cloneDeep)(value);
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
    this._sub = new import_rxjs2.BehaviorSubject({ last_set_ptrs: [], value: {} });
    this._running = true;
    this._flags = this._flags || {};
    if (!this._flags?.strictness)
      this._flags.strictness = "none";
    if (initial)
      this._sub.next({ last_set_ptrs: ["/"], value: (0, import_lodash3.isPlainObject)(initial) ? initial : {} });
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
    if ((0, import_lodash3.isArray)(val) && (0, import_lodash3.isArray)(data.value))
      this.set([{ ptr: data.ptr, value: [...val, ...data.value] }], { nextTick });
    else if ((0, import_lodash3.isPlainObject)(val) && (0, import_lodash3.isPlainObject)(data.value))
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
      (0, import_rxjs2.takeWhile)((_) => !!this._running),
      (0, import_rxjs2.filter)((value) => n++ == 0 || value.last_set_ptrs.some((lptr) => lptr.indexOf(ptr) == 0 || ptr.indexOf(lptr) == 0)),
      (0, import_rxjs2.map)((value) => ptrGet(value.value, ptr)),
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Store,
  strictnessEqualComparer
});
//# sourceMappingURL=index.js.map