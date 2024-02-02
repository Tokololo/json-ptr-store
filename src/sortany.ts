import { values, zipObject } from "lodash";

const types = {
    undefined: Symbol('undefined'),
    null: Symbol('null'),
    boolean: Symbol('boolean'),
    NaN: Symbol('NaN'),
    number: Symbol('number'),
    string: Symbol('string'),
    symbol: Symbol('symbol'),
    date: Symbol('date'),
    set: Symbol('set'),
    array: Symbol('array'),
    map: Symbol('map'),
    object: Symbol('object')
};

const typesValues = values(types);
const orderedTypes = zipObject(typesValues, Object.keys(typesValues).map(key => Number(key)));

const comparators: any = {
    [types.array]: compareArray,
    [types.set]: (a: any, b: any) => compareArray([...a], [...b]),
    [types.map]: (a: any, b: any) => compareObject(Object.fromEntries(a), Object.fromEntries(b)),
    [types.number]: standardCompare,
    [types.object]: compareObject,
    [types.string]: standardCompare,
    [types.symbol]: (a: any, b: any) => standardCompare(a.toString().slice(0, -1), b.toString().slice(0, -1))
};

function getOrderByType(type: any) {
    return orderedTypes[type];
}

function getTypeByValue(value: any) {
    if (typeof value === 'undefined') {
        return types.undefined;
    }
    if (value === null) {
        return types.null;
    }
    if (typeof value === 'boolean') {
        return types.boolean;
    }
    if (typeof value === 'number' && Number.isNaN(value)) {
        return types.NaN;
    }
    if (typeof value === 'number') {
        return types.number;
    }
    if (typeof value === 'string') {
        return types.string;
    }
    if (typeof value === 'symbol') {
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

function standardCompare(a: any, b: any) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }

    return 0;
}

function compareArray(first: any, second: any) {
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

function compareObject(first: any, second: any) {
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

function compareSimple(first: any, second: any) {
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

function compare(a: any, b: any) {
    return compareSimple(a, b);
}

export const sortAny = (array: any) => {
    const undefinedsArray = array.filter((x: any) => typeof x === 'undefined');
    const notUndefinedsArray = array.filter((x: any) => typeof x !== 'undefined');

    return [...undefinedsArray, ...[...notUndefinedsArray].sort(compare)];
}