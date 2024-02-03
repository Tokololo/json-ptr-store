# What is PtrStore?
json-ptr-store is a rxjs enabled reactive store that uses json pointers to get and set values.
# How to use
## Creating an instance of the store
You create a new instance of the store as follows:

    const store = new Store(initial, comparer, flags);

It has the following parameters:
- initial - Optional initial values for the store. Must be an object literal.
- flags: { nextTick?: boolean, strictness?: 'isEqualRemoveUndefinedSorted' | 'isEqualRemoveUndefined' | 'isEqual' | 'strict' | 'none' | string }
**nextTick** - run a set on the next tick timeout  
**strictness** - the strictness to use when comparing previous and current values. It has the following meaning:  
*string* - user defined for use with supplemental comparer  
*none* - no comparison is done and the store get function will retrieve the value even if it is the same as the previous value. This is the default and fastest method of comparison and will satisfy the majority of all use cases.  
*strict* - stict equality === comparison  
*isEqual* - lodash isEqual  
*isEqualRemoveUndefined* - lodash isEqual with both objects stripped of empty values  
*isEqualRemoveUndefinedSorted* - lodash isEqual with both objects stripped of empty values and internally sorted. This is the slowest most precise method of comparison and is rarely needed.  
- comparer: (obj1:  any, obj2:  any, strictness: string) =>  boolean
Optional supplemental comparer function for determining whether a get observable value has changed. Used with custom string values for strictness.
## Setting values
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
## Getting values
You subscribe to values in the store as follows:

    const obs = store.get('/pages/welcome/heading');
    obs.subscribe(res => console.log(res));
Any time that the value at the json pointer changes the get observable will  emit the new value. Not only will PtrStore (using its default configuration) detect when the value at '/pages/welcome/heading' changes, but it will also detect should any value along that path change. 

    ie: store.set([{ ptr: '/pages/welcome', value: { heading: 'my heading' }}]);

This works in both directions, ie:

    store.get('/pages');

will detect the following set:

    store.set([{ ptr: '/pages/welcome/heading/subheadings/4', value: 'my sub-heading' }]);
  Get also takes a strictness flag to override the store default.
## Slicing values
The store values can also be sliced which returns the value directly, ie:

    store.slice('/pages/welcome/heading/subheadings/4')

will return `'my sub-heading'`
Slice takes a second boolean parameter which when set will return a clone of the data, as well as a third parameter which will return a default value should the sliced value be undefined.
## Deleting values
Values in the store can be deleted via the json pointer to it, ie:

    store.del(['/pages/home/heading', '/pages/home/index/4']);
An additional flag parameter atomic can be passed which will ensure that the operation is atomic, ie:

    store.del(['/index/0', '/index/1'], { atomic: true });

**Why is this important**
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
Please note that atomic has a slight side-effect. Internally it sets the value at each json pointer to undefined after which it removes all undefined values at the common pointer. Should you have undefined values along that common pointer that was not part of the delete they will also be deleted. For the most part this should not cause problems as a get to an esxisting path with an undefined value functions the same as a get to a non-existing path.
## Destroying the store
Destroy the store when you are done with it to free up resources:

    store.destroy();
## A few additional operations
For convenience you can set and delete in one method call `setDel` as well as `assign` data (array append or object literal assign).
## Why is it awesome
Setting, slicing and subscribing using json pointers are intuitive an easy. Because get() returns an observable you can combine, transform, slice and dice to great comprexity and it remains reactive. 

