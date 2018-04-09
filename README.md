# Index List By Fields
A simple library that takes an array of objects and indexes it by certain fields on the object.

Useful for arrays of relational data stored as plain objects, i.e. how one might store models in a Redux store.

Also included is a utility for memoizing the indexing function. Standard memoization would recreate the entire Index any time
any element of the array changes. This special memoizer intelligently only changes the parts of the Index that actually change.
This way, we can reuse the array without having to re-render or update the dependant data.