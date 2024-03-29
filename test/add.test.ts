import { skip, take } from 'rxjs';
import { Store } from '../src';
import { strictnessType } from '../src/library';

test('create the store', () => {
    const store = new Store();
    expect(store instanceof Store).toBe(true);
});

test('store has initial value', () => {
    const store = new Store();
    expect(store.slice<any>('/')).toEqual({});
});

test('slice the root value of the store', () => {
    const store = new Store({ hello: 'world' });
    expect(store.slice<any>('/')).toEqual({ hello: 'world' });
});

test('slice deep literal value', () => {
    const store = new Store({ hello: { our: 'world' } });
    expect(store.slice<any>('/hello/our')).toBe('world');
});

test('store has value at an ptr #1', () => {
    const store = new Store({ hello: { our: 'world' } });
    expect(store.has('/hello/our')).toBe(true);
});

test('store has value at an ptr #2', () => {
    const store = new Store({ arr: ['world'] });
    expect(store.has('/arr/0')).toBe(true);
});

test('store has value at an ptr #3', () => {
    const store = new Store({ arr: [undefined] });
    expect(store.has('/arr/0')).toBe(true);
});

test('store does not have value at ptr #1', () => {
    const store = new Store({ hello: { our: 'world' } });
    expect(store.has('/hello/your')).toBe(false);
});

test('store does not have value at ptr #2', () => {
    const store = new Store({ arr: ['world'] });
    expect(store.has('/arr/1')).toBe(false);
});

test('store does not have value at ptr #3', () => {
    const store = new Store({ arr: ['world'] });
    expect(store.has('/arr/-')).toBe(false);
});

test('set a literal property value', () => {
    const store = new Store();
    store.set([{ ptr: '/hello/our', value: 'world' }]);
    expect(store.slice<any>('/')).toEqual({ hello: { our: 'world' } });
});

test('set an array value', () => {
    const store = new Store();
    store.set([{ ptr: '/myarray', value: [1, 2, 3] }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 2, 3] });
});

test('add a value to the end of an array #1', () => {
    const store = new Store({ myarray: [1, 2, 3] });
    store.set([{ ptr: '/myarray/-', value: 4 }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 2, 3, 4] });
});

test('add a value to the end of an array #2', () => {
    const store = new Store();
    store.set([{ ptr: '/myarray/-', value: 4 }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [4] });
});

test('set a value at an array index', () => {
    const store = new Store({ myarray: [1, 2, 3] });
    store.set([{ ptr: '/myarray/1', value: 4 }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 4, 3] });
});

test('set a value at an non-existing array index #1', () => {
    const store = new Store({ myarray: [1, 2, 3] });
    store.set([{ ptr: '/myarray/4', value: 5 }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 2, 3, undefined, 5] });
});

test('set a value at an non-existing array index #2', () => {
    const store = new Store();
    store.set([{ ptr: '/myarray/0', value: 5 }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [5] });
});

test('set a value at an non-existing array index #3', () => {
    const store = new Store({ myarray: [{ hi: 1 }, { hi: 2 }, { hi: 3 }] });
    store.set([{ ptr: '/myarray/3', value: { hi: 4 } }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [{ hi: 1 }, { hi: 2 }, { hi: 3 }, { hi: 4 }] });
});

test('set a value at an non-existing array index #4', () => {
    const store = new Store();
    store.set([{ ptr: '/myarray/0', value: { hi: 1 } }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [{ hi: 1 }] });
});

test('set a value at an non-existing array index #5', () => {
    const store = new Store({ myarray: [] });
    store.set([{ ptr: '/myarray/0', value: { hi: 1 } }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [{ hi: 1 }] });
});

test('set a value at an non-existing array index at a undefined root', () => {
    const store = new Store({ myarray: undefined });
    store.set([{ ptr: '/myarray/0', value: { hi: 1 } }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [{ hi: 1 }] });
});

test('set a scalar value at a undefined root', () => {
    const store = new Store({ myprop: undefined });
    store.set([{ ptr: '/myprop', value: 'test' }]);
    expect(store.slice<any>('/')).toEqual({ myprop: 'test' });
});

test('set an object at a undefined root', () => {
    const store = new Store({ myprop: undefined });
    store.set([{ ptr: '/myprop', value: { hi: 'test' } }]);
    expect(store.slice<any>('/')).toEqual({ myprop: { hi: 'test' } });
});

test('set a value at an non-existing array index #1', () => {
    const store = new Store({ myobj: { myarray: undefined, myprop: 4 } });
    store.set([{ ptr: '/myobj/myarray/0', value: 'test' }]);
    expect(store.slice<any>('/')).toEqual({ myobj: { myarray: ['test'], myprop: 4 } });
});

test('set a value at an non-existing array index #2', () => {
    const store = new Store({ myarray: undefined, myprop: 4 });
    store.set([{ ptr: '/myarray/0', value: { hi: 1 } }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [{ hi: 1 }], myprop: 4 });
});

test('set a value at an non-existing array index #3', () => {
    const store = new Store({ myobj: { myarray: undefined, myprop: 4 } });
    store.set([{ ptr: '/myobj/myarray/0', value: { hi: 1 } }]);
    expect(store.slice<any>('/')).toEqual({ myobj: { myarray: [{ hi: 1 }], myprop: 4 } });
});

test('set a value at an non-existing array index #4', () => {
    const store = new Store({ myarray: [], myprop: 4 });
    store.set([{ ptr: '/myarray/0', value: { hi: 1 } }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [{ hi: 1 }], myprop: 4 });
});

test('set a value at a non-existing property #5', () => {
    const store = new Store({ myobj: undefined, myprop: 4 });
    store.set([{ ptr: '/myobj/newprop', value: { hi: 1 } }]);
    expect(store.slice<any>('/')).toEqual({ myobj: { newprop: { hi: 1 } }, myprop: 4 });
});

test('set a value at a non-existing property #6', () => {
    const store = new Store({ myobj: {}, myprop: 4 });
    store.set([{ ptr: '/myobj/newprop', value: { hi: 1 } }]);
    expect(store.slice<any>('/')).toEqual({ myobj: { newprop: { hi: 1 } }, myprop: 4 });
});

test('set an undefined value at an existing property #1', () => {
    const store = new Store({ myobj: 4 });
    store.set([{ ptr: '/myobj', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myobj: undefined });
    expect(store.has('/myobj')).toEqual(true);
});

test('set an undefined value at an existing property #2', () => {
    const store = new Store({ myarr: [] });
    store.set([{ ptr: '/myarr/0', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myarr: [undefined] });
    expect(store.has('/myarr/0')).toEqual(true);
});

test('set an undefined value at an existing property #3', () => {
    const store = new Store({ myarr: [] });
    store.set([{ ptr: '/myarr/1', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myarr: [undefined, undefined] });
    expect(store.slice<any>('/myarr').length).toEqual(2);
});

test('set an undefined value at an existing property #4', () => {
    const store = new Store({ myarr: [undefined] });
    store.set([{ ptr: '/myarr/-', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myarr: [undefined, undefined] });
    expect(store.slice<any>('/myarr').length).toEqual(2);
});

test('set an undefined value at an non-existing property #1', () => {
    const store = new Store();
    store.set([{ ptr: '/myobj/test', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myobj: { test: undefined } });
    expect(Object.keys(store.slice<any>('/myobj'))).toEqual(["test"]);
});

test('set an undefined value at an non-existing property #2', () => {
    const store = new Store();
    store.set([{ ptr: '/myobj/-/test', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myobj: [{ test: undefined }] });
});

test('set an undefined value at an non-existing property #3', () => {
    const store = new Store();
    store.set([{ ptr: '/myobj/0/test', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myobj: [{ test: undefined }] });
});

test('set an undefined value at an non-existing property #4', () => {
    const store = new Store();
    store.set([{ ptr: '/myobj/1/test', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myobj: [undefined, { test: undefined }] });
    expect(store.slice<any[]>('/myobj')?.length).toEqual(2);
});

test('set an undefined value at an non-existing property and array index #1', () => {
    const store = new Store();
    store.set([{ ptr: '/myarr/-', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myarr: [undefined] });
    expect(store.slice<any>('/myarr').length).toEqual(1);
});

test('set an undefined value at an non-existing property and array index #2', () => {
    const store = new Store();
    store.set([{ ptr: '/myarr/1', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ myarr: [undefined, undefined] });
    expect(store.slice<any>('/myarr').length).toEqual(2);
});

test('set a value at an undefined property #1', () => {
    const store = new Store({ myarr: undefined });
    store.set([{ ptr: '/myarr/-', value: 5 }]);
    expect(store.slice<any>('/')).toEqual({ myarr: [5] });
});

test('set a value at an undefined property #2', () => {
    const store = new Store({ myarr: undefined });
    store.set([{ ptr: '/myarr/0', value: 5 }]);
    expect(store.slice<any>('/')).toEqual({ myarr: [5] });
});

test('set a value at an undefined property #3', () => {
    const store = new Store({ myobj: undefined });
    store.set([{ ptr: '/myobj/prop', value: 5 }]);
    expect(store.slice<any>('/')).toEqual({ myobj: { prop: 5 } });
});

test('set a defined value at an undefined property #1', () => {
    const store = new Store({ titles: undefined });
    store.set([{ ptr: '/titles/-', value: 'mytitle' }]);
    expect(store.slice<any>('/')).toEqual({ titles: ['mytitle'] });
});

test('set a defined value at an undefined property #2', () => {
    const store = new Store({ titles: undefined });
    store.set([{ ptr: '/titles/0', value: 'mytitle' }]);
    expect(store.slice<any>('/')).toEqual({ titles: ['mytitle'] });
    expect(store.slice<any>('/titles').length).toEqual(1);
});

test('set a defined value at an undefined property #3', () => {
    const store = new Store({ book: undefined });
    store.set([{ ptr: '/book/title', value: "mytitle" }]);
    expect(store.slice<any>('/')).toEqual({ book: { title: "mytitle" } });
    expect(Object.keys(store.slice<any>('/book'))).toEqual(["title"]);
});

test('set an undefined value at an undefined property #1', () => {
    const store = new Store({ book: undefined });
    store.set([{ ptr: '/book', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ book: undefined });
});

test('set an undefined value at an undefined property #2', () => {
    const store = new Store({ book: undefined });
    store.set([{ ptr: '/book/title', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ book: { title: undefined } });
});

test('set an undefined value at an undefined property #3', () => {
    const store = new Store({ book: { title: undefined } });
    store.set([{ ptr: '/book/title', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ book: { title: undefined } });
});

test('set an undefined value at an undefined property #4', () => {
    const store = new Store({ arr: [undefined] });
    store.set([{ ptr: '/arr/-', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined, undefined] });
    expect(Object.keys(store.slice<any>('/arr')).length).toEqual(2);
});

test('set an undefined value at an undefined property #5', () => {
    const store = new Store({ arr: [undefined] });
    store.set([{ ptr: '/arr/1', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined, undefined] });
    expect(store.slice<any>('/arr').length).toEqual(2);
});

test('set an undefined value at an undefined property #6', () => {
    const store = new Store({ arr: [undefined] });
    store.set([{ ptr: '/arr/2', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined, undefined, undefined] });
    expect(store.slice<any>('/arr').length).toEqual(3);
});

test('set an undefined value at an undefined property #7', () => {
    const store = new Store({ arr: undefined });
    store.set([{ ptr: '/arr/-', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined] });
    expect(Object.keys(store.slice<any>('/arr')).length).toEqual(1);
});

test('set an undefined value at an undefined property #8', () => {
    const store = new Store({ arr: undefined });
    store.set([{ ptr: '/arr/1', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined, undefined] });
    expect(store.slice<any>('/arr').length).toEqual(2);
});

test('set an undefined value at an undefined property #9', () => {
    const store = new Store({ arr: undefined });
    store.set([{ ptr: '/arr/2', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined, undefined, undefined] });
    expect(store.slice<any>('/arr').length).toEqual(3);
});

test('set an undefined value at an defined array #1', () => {
    const store = new Store({ arr: [] });
    store.set([{ ptr: '/arr/-', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined,] });
    expect(store.slice<any>('/arr').length).toEqual(1);
});

test('set an undefined value at an defined array #2', () => {
    const store = new Store({ arr: [] });
    store.set([{ ptr: '/arr/1', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined, undefined] });
    expect(store.slice<any>('/arr').length).toEqual(2);
});

test('set an undefined value at an defined array #3', () => {
    const store = new Store({ arr: [] });
    store.set([{ ptr: '/arr/2', value: undefined }]);
    expect(store.slice<any>('/')).toEqual({ arr: [undefined, undefined, undefined] });
    expect(store.slice<any>('/arr').length).toEqual(3);
});

test('append an array value deeply', () => {
    const store = new Store();
    store.set([{ ptr: '/titles/-/color', value: 'red' }]);
    expect(store.slice<any>('/')).toEqual({ titles: [{ color: 'red' }] });
});

test('does a ptr have a value #1', () => {
    const store = new Store({ prop: undefined });
    const hasValue = store.has('/prop');
    expect(hasValue).toEqual(true);
});

test('does a ptr have a value #2', () => {
    const store = new Store({ prop: { array: [undefined] } });
    const hasValue = store.has('/prop/array/0');
    expect(hasValue).toEqual(true);
});

test('does a ptr have a value #3', () => {
    const store = new Store();
    const hasValue = store.has('/prop');
    expect(hasValue).toEqual(false);
});

test('does a ptr have a value #4', () => {
    const store = new Store({ prop: [5] });
    expect(store.has('/')).toEqual(true);
    expect(store.has('/prop')).toEqual(true);
    expect(store.has('/prop/0')).toEqual(true);
    expect(store.has('/prop/1')).toEqual(false);
    expect(store.has('/noprop')).toEqual(false);
});

test('does a ptr have a parent', () => {
    const store = new Store({ prop: [5] });
    expect(store.hasParent('/')).toEqual(false);
    expect(store.hasParent('/prop')).toEqual(true);
    expect(store.hasParent('/prop/0')).toEqual(true);
    expect(store.hasParent('/prop/1')).toEqual(true);
    expect(store.hasParent('/noprop')).toEqual(true);
});

test('typeof a ptr value #1', () => {
    const store = new Store({ prop: [5], boolProp: true });
    expect(store.typeof('/')).toEqual("object");
});

test('typeof a ptr value #2', () => {
    const store = new Store({ prop: [5], boolProp: true });
    expect(store.typeof('/prop')).toEqual("object");
});

test('typeof a ptr value #3', () => {
    const store = new Store({ prop: [5], boolProp: true });
    expect(store.typeof('/prop/0')).toEqual("number");
});

test('typeof a ptr value #5', () => {
    const store = new Store({ prop: [5], boolProp: true });
    expect(store.typeof('/prop/1')).toEqual("undefined");
});

test('typeof a ptr value #6', () => {
    const store = new Store({ prop: [5], boolProp: true });
    expect(store.typeof('/noprop')).toEqual("undefined");
});

test('typeof a ptr value #7', () => {
    const store = new Store({ prop: [5], boolProp: true });
    expect(store.typeof('/boolProp')).toEqual("boolean");
});

test('typeof a ptr value #8', () => {
    const store = new Store({ prop: [5], boolProp: true });
    expect(store.typeof('/prop/-')).toEqual("undefined");
});

test('remove a value at a literal property', () => {
    const store = new Store({ hello: { our: 'world', your: 'yourworld', mine: 'mineworld' } });
    store.del(['/hello/your']);
    expect(store.slice<any>('/')).toEqual({ hello: { our: 'world', mine: 'mineworld' } });
});

test('remove an index value in an array', () => {
    const store = new Store({ myarray: [1, 2, 3] });
    store.del(['/myarray/1']);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 3] });
});

test('remove multiple index values in an array atomically #1', () => {
    const store = new Store({ myarray: [1, 2, 3, 4, 5] });
    store.del(['/myarray/1', '/myarray/3'], { atomic: true });
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 3, 5] });
});

test('remove multiple index values in an array atomically #2', () => {
    const store = new Store({
        that: {
            myarray: [1, 2, 3, 4, 5],
            myarray2: [1, 2, 3, 4, 5]
        },
        this: undefined
    });
    store.del(['/that/myarray/1', '/that/myarray2/3'], { atomic: true });
    expect(store.slice<any>('/')).toEqual({ that: { myarray: [1, 3, 4, 5], myarray2: [1, 2, 3, 5] } });
    expect(Object.keys(store.slice<any>('/'))).toEqual(['that', 'this']);
});

test('get the initial value', (done) => {
    const store = new Store({
        greetings: {
            value1: 'hello',
            value2: 'world'
        }
    });
    store.get('/greetings/value1').pipe(take(1)).subscribe(res => {
        expect(res).toBe('hello');
        done();
    })
});

test('get a non existing value', (done) => {
    const store = new Store();
    store.get('/test').pipe(take(1)).subscribe(res => {
        expect(res).toEqual(undefined);
        done();
    });
});

test('get the newly set values', (done) => {
    let idx = 0;
    const store = new Store({
        greetings: {
            value1: 'hello',
            value2: 'world'
        }
    });
    store.get('/greetings/value1').pipe(take(3)).subscribe(res => {
        if (idx === 0) {
            expect(res).toBe('hello');
            expect(store.slice('/')).toEqual({
                greetings: {
                    value1: 'hello',
                    value2: 'world'
                }
            });
        }
        if (idx === 1) {
            expect(res).toBe('bye');
            expect(store.slice('/')).toEqual({
                greetings: {
                    value1: 'bye',
                    value2: 'world'
                }
            });
        }
        if (idx === 2) {
            expect(res).toBe('cheers');
            expect(store.slice('/')).toEqual({
                greetings: {
                    value1: 'cheers',
                    value2: 'world'
                }
            });
            done();
        }
        idx++;
    });
    store.set([{ ptr: '/greetings/value1', value: 'bye' }]);
    store.set([{ ptr: '/greetings/value1', value: 'cheers' }]);
});

test('complete observables when the store is destroyed', (done) => {
    let idx = 0;
    const store = new Store({
        greetings: {
            value1: 'hello',
            value2: 'world'
        }
    });
    store.get('/greetings/value1')
        .subscribe({
            next: res => {
                if (idx === 0) {
                    expect(res).toBe('hello');
                    expect(store.slice('/')).toEqual({
                        greetings: {
                            value1: 'hello',
                            value2: 'world'
                        }
                    });
                }
                if (idx === 1) {
                    expect(res).toBe('bye');
                    expect(store.slice('/')).toEqual({
                        greetings: {
                            value1: 'bye',
                            value2: 'world'
                        }
                    });
                }
                idx++;
            },
            complete: () => {
                expect(idx).toBe(2);
                done();
            }
        });
    store.set([{ ptr: '/greetings/value1', value: 'bye' }]);
    store.destroy();
});

test('set and delete', () => {
    const store = new Store({ prop1: { hello: 'world' } });
    store.setDel([{ ptr: '/prop2/hello', value: 'universe' }], ['/prop1']);
    expect(store.slice('/')).toEqual({ prop2: { hello: 'universe' } });
});

test('assign to an array', () => {
    const store = new Store({ array1: [1, 2, 3, 4] });
    store.assign({ ptr: '/array1', value: [5, 6, 7] });
    expect(store.slice('/')).toEqual({ array1: [1, 2, 3, 4, 5, 6, 7] });
});

test('assign to an object literal', () => {
    const store = new Store({ obj: { prop1: 1, prop2: 2 } });
    store.assign({ ptr: '/obj', value: { prop2: 3, prop4: 4 } });
    expect(store.slice('/')).toEqual({ obj: { prop1: 1, prop2: 3, prop4: 4 } });
});

test('initialise', () => {
    const store = new Store({ obj: { prop1: 1, prop2: 2 } });
    store.initialise({ obj2: { prop1: 1, prop2: 2 } });
    expect(store.slice('/')).toEqual({ obj2: { prop1: 1, prop2: 2 } });
});

test('strictness none', (done) => {
    const store = new Store({
        obj1: { a: 1, b: 2 },
        obj2: { a: 2, b: 3 }
    }, { strictness: 'none' });
    store.get('/obj1').pipe(skip(1)).subscribe(res => {
        expect(res).toEqual({ prop: { a: 1, b: 3 } });
        done();
    });
    store.set([{ ptr: '/obj1', value: { prop: { a: 1, b: 3 } } }]);

});

test('strictness strict #1', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    const store = new Store({
        obj1: obj
    }, { strictness: 'strict' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);

});

test('strictness strict #2', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = obj;
    const store = new Store({
        obj1: obj
    }, { strictness: 'strict' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(false).toBeTruthy();
            done();
        },
        complete: () => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);
    store.destroy();
});

test('strictness strict #3', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = obj;
    obj2.b = 4;
    const store = new Store({
        obj1: obj
    }, { strictness: 'strict' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(false).toBeTruthy();
            done();
        },
        complete: () => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);
    store.destroy();
});

test('strictness isEqual #1', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 3 };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqual' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);

});

test('strictness isEqual #2', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqual' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(false).toBeTruthy();
            done();
        },
        complete: () => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);
    store.destroy();
});

test('strictness isEqual #3', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqual' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(false).toBeTruthy();
            done();
        },
        complete: () => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);
    store.destroy();
});

test('strictness isEqual #4', (done) => {
    const obj = { arr: [1, 2, 3] };
    const obj2 = { arr: [1, 3, 2] };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqual' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);
});

test('strictness isEqual #5', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2, c: undefined };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqual' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);
});

test('strictness isEqualRemoveUndefined #1', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2, c: 3 };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqualRemoveUndefined' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);

});

test('strictness isEqualRemoveUndefined #2', (done) => {
    const obj = { arr: [1, 2, 3] };
    const obj2 = { arr: [1, 2, 3, 4] };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqualRemoveUndefined' });
    store.get('/obj1/arr').pipe(skip(1)).subscribe({
        next: res => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);

});

test('strictness isEqualRemoveUndefined #3', (done) => {
    const obj = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2, c: undefined };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqualRemoveUndefined' });
    store.get('/obj1').pipe(skip(1)).subscribe({
        next: res => {
            expect(false).toBeTruthy();
            done();
        },
        complete: () => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);
    store.destroy();
});

test('strictness isEqualRemoveUndefined #4', (done) => {
    const obj = { arr: [1, 2, 3] };
    const obj2 = { arr: [1, 2, 3, undefined] };
    const store = new Store({
        obj1: obj
    }, { strictness: 'isEqualRemoveUndefined' });
    store.get('/obj1/arr').pipe(skip(1)).subscribe({
        next: res => {
            expect(false).toBeTruthy();
            done();
        },
        complete: () => {
            expect(true).toBeTruthy();
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: obj2 }]);
    store.destroy();
});

test('custom strictness comparer #1', (done) => {
    let ranComparer = false;
    const store = new Store<strictnessType | 'version'>({
        obj1: { prop: { version: 1, other: 2 } },
        obj2: { prop: { version: 1, other: 2 } }
    }, undefined, (obj1, obj2, strictness) => {
        ranComparer = true;
        if (strictness == 'version')
            return obj1.prop?.version == obj2.prop?.version;
        else
            return false;
    });
    store.get('/obj1', 'version').pipe(skip(1)).subscribe(res => {
        expect(res).toEqual({ prop: { version: 2, other: 2 } });
        expect(ranComparer).toBe(true);
        done();
    });
    store.set([{ ptr: '/obj1', value: { prop: { version: 2, other: 2 } } }]);

});

test('custom strictness comparer #2', (done) => {
    let ranComparer = false;
    const store = new Store<'version'>({
        obj1: { prop: { version: 1, other: 2 } },
        obj2: { prop: { version: 1, other: 2 } }
    }, undefined, (obj1, obj2, strictness) => {
        ranComparer = true;
        if (strictness == 'version')
            return obj1.prop?.version == obj2.prop?.version;
        else
            return false;
    });
    store.get('/obj1', 'version').pipe(skip(1)).subscribe({
        next: res => {
            expect(true).toEqual(false);
            done();
        },
        complete: () => {
            expect(true).toBe(true);
            expect(ranComparer).toBe(true);
            done();
        }
    });
    store.set([{ ptr: '/obj1', value: { prop: { version: 1, other: 3 } } }]);
    store.destroy();
});