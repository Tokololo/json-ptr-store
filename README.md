# What is json-ptr-store?
json-ptr-store is a  [rxjs](https://github.com/reactivex/rxjs) enabled reactive store that uses [json pointers](https://datatracker.ietf.org/doc/html/rfc6901) to get and set values. It is intuitive, minimalist yet powerful.
> For the latest documentation please consult the repo  [readme](https://github.com/Tokololo/json-ptr-store#readme).
# How to use
You create an instance of the store, use it as long as you need and when you are done you destroy the store.
## Create an instance of the store
### constructor(initial?:  IStoreValue, private  _flags?:  StoreFlags<Strictness>, private  _comparer?:  customStrictnessComparerType<Strictness>)
You create a new instance of the store as follows:

    const store = new Store(initial, flags, comparer);

It has the following parameters:
- initial - Optional initial values for the store. Must be an object literal.
- flags: { nextTick?: boolean, strictness?: 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none' | string }
  - nextTick - run a set on the next tick timeout  
  - strictness - the strictness to use when comparing previous and current values. It has the following meaning:  
     - string - user defined for use with supplemental comparer  
     - none - no comparison is done and the store get function will retrieve the value even if it is the same as the previous value. This is the default and fastest method of comparison and will satisfy the majority of all use cases.  
     - strict - stict equality === comparison  
     - isEqual - lodash isEqual  
     - isEqualRemoveUndefined - lodash isEqual with both objects stripped of empty values  
     - isEqualRemoveUndefinedSorted - lodash isEqual with both objects stripped of empty values and internally sorted. This is the slowest most precise method of comparison and is rarely needed.  
- comparer: (obj1:  any, obj2:  any, strictness: string) =>  boolean  
Optional supplemental comparer function for determining whether a get observable value has changed. Used with custom string values for strictness. The use case for this would be very rare as the default 'none' would suffice for the vast majority of cases.

Below is an example custom comparer function:

    (o1, o2, strictness) => strictness === 'version' && o1.v === o2.v
which can be invoked as follows:

    useStoreGet<Roles[]>(
      '/roles',
      undefined,
      undefined,
      undefined,
      'version'
    );

## Set values
### set(data:  IStorePtr[], flags?: { nextTick?:  boolean }): void
You set a new value in the store as follows:

    store.set([{ ptr: '/pages/welcome/heading', value: "Hi there" }]); 
Set takes an array of pointer values and hence multiple values can be set in one call.
Array values can be set and appended. For instance, if you have the following store values: 

    {
        notesRead: [1, 2, 3]
    }

You can alter the value at index 1 as follows:

    store.set([{ ptr: '/notesRead/1', value: 6 }]);

You can append a value as follows:

    store.set([{ ptr: '/notesRead/-', value: 4 }]);

You can also set a value at a non-existing index and it will pad the entries with undefined.

## Get values
### get<T  =  any>(ptr:  string, strictness?:  Strictness):  Observable<T  |  undefined>
You subscribe to values in the store as follows:

    const obs = store.get('/pages/welcome/heading');
    obs.subscribe(res => console.log(res));
Any time that the value at the json pointer changes the get observable will  emit the new value. It will also detect should any value along the json ptr path (root or children) change. Hence, if you issue a get at the following path:

    '/pages/welcome/items'

it will emit if the value at the following ptrs change:

    '/pages/welcome'
    '/pages/welcome/items/4'

This behavior is influenced by the strictness that is set. If strictness is `none` the new value will emit even if the change that was made results in the same value. If strictness is set as 
`isEqualRemoveUndefinedSorted` then it will do a deep comparison and only emit if the value is deep unequal.  
The strictness flag can be set on the store as a whole, or an individual `get()` can override it.

You can manually unsubscribe from the observable returned by `get()` though on `destroy()` all subscriptions will be released.
## Slice values
### slice<T  =  any>(ptr:  string, clone?:  boolean, defaultValue?:  T):  T  |  undefined
The store values can also be sliced which returns the value directly, ie:

    store.slice('/pages/welcome/heading/subheadings/4')

will return `'my sub-heading'`

Slice takes a second boolean parameter which when set will return a clone of the data, as well as a third parameter which will return a default value should the sliced value be undefined.
## Delete values
### del(ptrs:  string[], flags?: { nextTick?:  boolean, atomic?:  boolean }): void
Values in the store can be deleted via the json pointer to it, ie:

    store.del(['/pages/home/heading', '/pages/home/index/4']);
An additional flag parameter atomic can be passed which will ensure that the operation is atomic, ie:

    store.del(['/index/0', '/index/1'], { atomic: true });

**Why is this important?**  
Using the following data structure:

    { 
        index: [1, 2, 3, 4, 5];
    }
If you issue the following delete:

    store.del(['/index/0', '/index/1']);

You will end up with:

    { 
        index: [2, 4, 5];
    }
This happens because after deleting the entry at /index/0 the array changes to [2, 3, 4, 5] and deleting /index/1 now deletes the entry with value 3.
Hence the following is equavalent:

    store.del(['/index/0', '/index/1'], { atomic: true });
    store.del(['/index/0', '/index/0']);
Please note that atomic has a slight side-effect. Internally it sets the value at each json pointer to undefined after which it removes all undefined values at the common pointer. Should you have undefined values along that common pointer that was not part of the delete they will also be deleted. For the most part this should not cause problems as a get to an existing path with an undefined value functions the same as a get to a non-existing path.
## Destroy the store
Destroy the store when you are done with it to free up resources:

    store.destroy();
## A few additional operations
### setDel(sets:  IStorePtr[], dels:  string[], flags?: { nextTick?:  boolean })
Set and delete in one method call.
### assign(data: { ptr:  string, value:  any[] |  Object }, nextTick?:  boolean)
Assign data (array append or object literal assign). This is a handy shortcut for doing it manually which will entail a slice and a set. In addition it creates a new reference.
### has(ptr:  string):  boolean  |  undefined
Returns true if the store has an explicit value at the json pointer. Note that should the store be defined as follows it will be deemed to have a value for the following pointer:

    const store = new Store({ myArray: undefined });
    store.has('/myArray); // returns true
### typeof(ptr:  string): "string"  |  "number"  |  "bigint"  |  "boolean"  |  "symbol"  |  "undefined"  |  "object"  |  "function"
Returns the type of the json pointer value in the store. Note that the following two pointers will both return "undefined":

    const store = new Store({ myArray: undefined });
    store.typeof('/myArray') == store.typeof('/bogus') == 'undefined'
### hasParent(ptr:  string): boolean
Returns whether a json pointer has a parent in the store. It functions similarly to has().

## A note on observables
Setting, slicing and subscribing using json pointers are intuitive an easy. Because get() returns an observable you can combine, transform, slice and dice to great complexity and it remains reactive. 

    const obs$ = forkJoin([
        store.get('/users/10').pipe(  
          map(user => user.posts)
        ),
        store.get('/users/10').pipe(  
          switchMap(user => getFetchUserPrefsObservable$(user.id))
        )	
    ]);

# Change Log
## version 1.1.5
 - Remove undefined set limitation