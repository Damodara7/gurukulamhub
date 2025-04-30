/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('squizme');

// Search for documents in the current collection.
db.getCollection('games')
    .find(
        {
            /*
            * Filter
            * fieldA: value or expression
            */
            title: '2222 Game On Hero Quiz'
        },
        {
            /*
            * Projection
            * _id: 0, // exclude _id
            * fieldA: 1 // include field
            */
        }
    )
    .sort({
        /*
        * fieldA: 1 // ascending
        * fieldB: -1 // descending
        */
    });
