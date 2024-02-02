import { skip, take } from 'rxjs';
import { Store } from '../src';
import { strictnessType } from '../src/library';

test('create the store', () => {
    const store = new Store();
    expect(store instanceof Store).toBe(true);
});

test('slice the root value of the store', () => {
    const store = new Store({ hello: 'world' });
    expect(store.slice<any>('/')).toEqual({ hello: 'world' });
});

test('slice deep literal value in the store', () => {
    const store = new Store({ hello: { our: 'world' } });
    expect(store.slice<any>('/hello/our')).toBe('world');
});

test('set a literal property value in the store', () => {
    const store = new Store();
    store.set([{ ptr: '/hello/our', value: 'world' }]);
    expect(store.slice<any>('/')).toEqual({ hello: { our: 'world' } });
});

test('set an array value in the store', () => {
    const store = new Store();
    store.set([{ ptr: '/myarray', value: [1, 2, 3] }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 2, 3] });
});

test('add a value to the end of an array in the store', () => {
    const store = new Store({ myarray: [1, 2, 3] });
    store.set([{ ptr: '/myarray/-', value: 4 }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 2, 3, 4] });
});

test('set a value at an array index in the store', () => {
    const store = new Store({ myarray: [1, 2, 3] });
    store.set([{ ptr: '/myarray/1', value: 4 }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 4, 3] });
});

test('set a value at an non-existing array index in the store', () => {
    const store = new Store({ myarray: [1, 2, 3] });
    store.set([{ ptr: '/myarray/4', value: 5 }]);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 2, 3, undefined, 5] });
});

test('remove a value at a literal property in the store', () => {
    const store = new Store({ hello: { our: 'world', your: 'yourworld', mine: 'mineworld' } });
    store.del(['/hello/your']);
    expect(store.slice<any>('/')).toEqual({ hello: { our: 'world', mine: 'mineworld' } });
});

test('remove an index value in an array in the store', () => {
    const store = new Store({ myarray: [1, 2, 3] });
    store.del(['/myarray/1']);
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 3] });
});

test('remove multiple index values in an array in the store atomically #1', () => {
    const store = new Store({ myarray: [1, 2, 3, 4, 5] });
    store.del(['/myarray/1', '/myarray/3'], { atomic: true });
    expect(store.slice<any>('/')).toEqual({ myarray: [1, 3, 5] });
});

test('remove multiple index values in an array in the store atomically #2', () => {
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

test('get the initial value in the store', (done) => {
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

test('get the newly set values in the store', (done) => {
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