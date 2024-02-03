import { remove, get, set, has } from 'json-pointer';
import { cloneDeep, isArray, isEqual, isPlainObject, mapValues } from 'lodash';
import { distinctUntilChanged } from 'rxjs';
import cleanDeep from 'clean-deep';
import { sortAny } from './sortany';
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
    if (!isArray(obj)) {
        if (!isPlainObject(obj))
            return obj;
        return mapValues(obj, sortDeep);
    }
    return sortAny(obj.map(sortDeep));
};
export const longestCommonPrefix = (ptrs) => {
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
export const removeDeepUndefined = (obj, no_clone, options) => {
    return cleanDeep(no_clone ? obj : cloneJson(obj), options || CLEAN_DEEP_OPTS);
};
/**
 * Compare two objects taking strictness constraint into consideration
 * @param obj1
 * @param obj2
 * @param strictness One of 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none', or string if using custom
 * @param comparer A custom comparer to use with a custom strictness that supplements the default comparer.
 * @returns
 */
export const strictnessEqualComparer = (obj1, obj2, strictness = 'none', comparer) => {
    if (strictness === 'none')
        return false;
    if (typeof obj1 == 'undefined' && typeof obj2 == 'undefined')
        return true;
    if (typeof obj1 == 'undefined' || typeof obj2 == 'undefined')
        return false;
    if (strictness === 'strict')
        return obj1 === obj2;
    if (strictness == 'isEqual')
        return isEqual(obj1, obj2);
    else if (strictness == 'isEqualRemoveUndefined')
        return isEqual(removeDeepUndefined(obj1), removeDeepUndefined(obj2));
    else if (strictness == 'isEqualRemoveUndefinedSorted')
        return isEqual(sortDeep(removeDeepUndefined(obj1)), sortDeep(removeDeepUndefined(obj2)));
    else if (comparer)
        return comparer(obj1, obj2, strictness);
    else
        return false;
};
export const distinctUntilChangedEq = (strictness = 'none', comparer) => distinctUntilChanged((a, b) => strictnessEqualComparer(a, b, strictness, comparer));
export const ptrGet = (source, ptr) => {
    return ptr === '/' ?
        source :
        get(source, ptr);
};
export const ptrSet = (source, ptr, val) => {
    try {
        return ptr === '/' ?
            voidObject(source, val) :
            set(source, ptr, val);
    }
    catch { }
};
export const ptrHas = (source, ptr) => {
    try {
        return ptr === '/' ?
            typeof source != 'undefined' :
            has(source, ptr);
    }
    catch { }
};
export const ptrRemove = (source, ptr) => {
    try {
        remove(source, ptr);
    }
    catch { }
};
export function cloneJson(value) {
    try {
        if (typeof value == 'undefined')
            return undefined;
        return cloneDeep(value);
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=library.js.map