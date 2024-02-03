import jsonPointer from 'json-pointer';
import { CleanOptions } from 'clean-deep';
/**
 * The strictness values used by the default comparer
 */
export type strictnessType = 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none';
export type strictnessComparerType<Stricktness extends string = strictnessType> = (obj1: any, obj2: any, strictness: strictnessType, comparer?: customStrictnessComparerType<Stricktness>) => boolean;
export type customStrictnessComparerType<Stricktness extends string> = (obj1: any, obj2: any, strictness: Stricktness) => boolean;
export declare const longestCommonPrefix: (ptrs: string[]) => string;
export declare const removeDeepUndefined: <T>(obj: T, no_clone?: boolean, options?: CleanOptions) => T;
/**
 * Compare two objects taking strictness constraint into consideration
 * @param obj1
 * @param obj2
 * @param strictness One of 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none', or string if using custom
 * @param comparer A custom comparer to use with a custom strictness that supplements the default comparer.
 * @returns
 */
export declare const strictnessEqualComparer: <Strictness extends string = strictnessType>(obj1: any, obj2: any, strictness?: Strictness, comparer?: customStrictnessComparerType<Strictness> | undefined) => boolean;
export declare const distinctUntilChangedEq: <T, Strictness extends string = strictnessType>(strictness?: Strictness, comparer?: customStrictnessComparerType<Strictness> | undefined) => import("rxjs").MonoTypeOperatorFunction<T>;
export declare const ptrGet: <T>(source: any, ptr: string) => T;
export declare const ptrSet: (source: any, ptr: string, val: any) => void | jsonPointer.Api;
export declare const ptrHas: (source: any, ptr: string) => boolean | undefined;
export declare const ptrRemove: (source: any, ptr: string) => void;
export declare function cloneJson<T>(value: T): T | undefined;
