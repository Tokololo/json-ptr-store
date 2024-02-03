"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneJson = exports.ptrRemove = exports.ptrHas = exports.ptrSet = exports.ptrGet = exports.distinctUntilChangedEq = exports.strictnessEqualComparer = exports.removeDeepUndefined = exports.longestCommonPrefix = void 0;
const json_pointer_1 = __importDefault(require("json-pointer"));
const lodash_1 = require("lodash");
const rxjs_1 = require("rxjs");
const clean_deep_1 = __importDefault(require("clean-deep"));
const sortany_1 = require("./sortany");
const CLEAN_DEEP_OPTS = {
    emptyArrays: true,
    emptyObjects: true,
    emptyStrings: true,
    NaNValues: false,
    nullValues: true,
    undefinedValues: true
};
const voidObject = (source, val) => {
    Object.keys(source).forEach(key => delete source[key]);
    Object.assign(source, val);
};
const sortDeep = (obj) => {
    if (!(0, lodash_1.isArray)(obj)) {
        if (!(0, lodash_1.isPlainObject)(obj))
            return obj;
        return (0, lodash_1.mapValues)(obj, sortDeep);
    }
    return (0, sortany_1.sortAny)(obj.map(sortDeep));
};
const longestCommonPrefix = (ptrs) => {
    if (!ptrs.length)
        return '/';
    let prefixParts = ptrs[0].split('/');
    for (let i = 1; i < ptrs.length; i++) {
        const iPrefixParts = ptrs[i].split('/');
        let j = 0;
        while (prefixParts[j] == iPrefixParts[j])
            j++;
        prefixParts = prefixParts.slice(0, j);
    }
    return prefixParts.length === 1 ? '/' : prefixParts.join('/');
};
exports.longestCommonPrefix = longestCommonPrefix;
const removeDeepUndefined = (obj, no_clone, options) => {
    return (0, clean_deep_1.default)(no_clone ? obj : cloneJson(obj), options || CLEAN_DEEP_OPTS);
};
exports.removeDeepUndefined = removeDeepUndefined;
/**
 * Compare two objects taking strictness constraint into consideration
 * @param obj1
 * @param obj2
 * @param strictness One of 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none', or string if using custom
 * @param comparer A custom comparer to use with a custom strictness that supplements the default comparer.
 * @returns
 */
const strictnessEqualComparer = (obj1, obj2, strictness = 'none', comparer) => {
    if (strictness === 'none')
        return false;
    if (typeof obj1 == 'undefined' && typeof obj2 == 'undefined')
        return true;
    if (typeof obj1 == 'undefined' || typeof obj2 == 'undefined')
        return false;
    if (strictness === 'strict')
        return obj1 === obj2;
    if (strictness == 'isEqual')
        return (0, lodash_1.isEqual)(obj1, obj2);
    else if (strictness == 'isEqualRemoveUndefined')
        return (0, lodash_1.isEqual)((0, exports.removeDeepUndefined)(obj1), (0, exports.removeDeepUndefined)(obj2));
    else if (strictness == 'isEqualRemoveUndefinedSorted')
        return (0, lodash_1.isEqual)(sortDeep((0, exports.removeDeepUndefined)(obj1)), sortDeep((0, exports.removeDeepUndefined)(obj2)));
    else if (comparer)
        return comparer(obj1, obj2, strictness);
    else
        return false;
};
exports.strictnessEqualComparer = strictnessEqualComparer;
const distinctUntilChangedEq = (strictness = 'none', comparer) => (0, rxjs_1.distinctUntilChanged)((a, b) => (0, exports.strictnessEqualComparer)(a, b, strictness, comparer));
exports.distinctUntilChangedEq = distinctUntilChangedEq;
const ptrGet = (source, ptr) => {
    return ptr === '/' ?
        source :
        json_pointer_1.default.get(source, ptr);
};
exports.ptrGet = ptrGet;
const ptrSet = (source, ptr, val) => {
    try {
        return ptr === '/' ?
            voidObject(source, val) :
            json_pointer_1.default.set(source, ptr, val);
    }
    catch (_a) { }
};
exports.ptrSet = ptrSet;
const ptrHas = (source, ptr) => {
    try {
        return ptr === '/' ?
            typeof source != 'undefined' :
            json_pointer_1.default.has(source, ptr);
    }
    catch (_a) { }
};
exports.ptrHas = ptrHas;
const ptrRemove = (source, ptr) => {
    try {
        json_pointer_1.default.remove(source, ptr);
    }
    catch (_a) { }
};
exports.ptrRemove = ptrRemove;
function cloneJson(value) {
    try {
        if (typeof value == 'undefined')
            return undefined;
        return (0, lodash_1.cloneDeep)(value);
    }
    catch (error) {
        throw error;
    }
}
exports.cloneJson = cloneJson;
