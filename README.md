# NK-MySQL
MySQL Connection Class for the NK Node Package

## Installation

Install using NPM

```bash
npm i nk-mysql --save
```
---
## How to use

MySQL (MariaDB) is a very popular database system used in many public platforms such as WordPress, Joomla and many more!

---

## Connecting

### To connect to a server use NKMySQL.start():

```
NKMySQL.start( 
  <Database Name>, //String
  <IP>, //String
  <Port>, //Number
  <User>, //String
  <Password>, //String
  <Timeout in milliseconds>, //Number
  <Callback> //Function
);
```

The **database connection** object is saved in the **NKMySQL Object**. Indexed by the database **name**, so there is a caveat to not use the same database name across distinct servers.

Example:
```node
const NKMySQL = require( 'nk-MySQL' )

NKMySQL.start( 'MyDatabase', '127.0.0.1', 27017, null, null, null, ( isError, errorMessage ) => {
  //Super duper awesome code here!
  console.log( isError, errorMessage )
})
```

### To Start and connect to **Multiple Servers**

WHAT?! Yes, you can connect to multiple servers in the same core, using them as objects for real-time compliances, for example:
```node
const NKMySQL = require( 'nk-MySQL' )

NKMySQL.start( 'MyDatabase', '127.0.0.1', 27017, null, null, null, ( isError1, errorMessage1 ) => NKMySQL.start( 'RemoteDB1', 'remote.mydomain.com', 27017, null, null, null, ( isError2, errorMessage2 ) => NKMySQL.start( 'RemoteDB2', 'remote2.mydomain.com', 27017, null, null, null, ( isError3, errorMessage3 ) => {
  //Even more super duper awesome code here!
  console.log( isError1, errorMessage1, isError2, errorMessage2, isError3, errorMessage3 )
})))
```
---

## Common Utility Functions

### To INSERT a new row or a set of rows, use NKMySQL.insert():
```
NKMySQL.insert( 
  <Database Name>, //String 
  <Collection Name>, //String
  <ROW OR ROWS>, //A single Object to insert one, or an Array of Objects to insert many
  <Callback> //Function
) 
```

Example:
```node
NKMySQL.insert( 'MyDatabase', 'users', 
  { 
    username: 'jose', 
    pass: '123', 
    active: false, 
    added: ( new Date() ).getTime() 
  }, 
  () => console.log( 'all done' ) )
```

### To DELETE rows from the collection, use NKMySQL.delete():
```
NKMySQL.delete(
  <Database Name>, //String 
  <Collection Name>, //String
  <DATA TO REMOVE>, //Object
  <Callback> //Function
)
```
Example:
```node
NKMySQL.delete( 'MyDatabase', 'users', 
  { 
    myuser: NKMySQL.id( user._id ) 
  }, 
  () => console.log( 'all done' ) )
```

### To UPDATE rows in the collection use NKMySQL.update: 
```
NKMySQL.update(
  <Database Name>, //String 
  <Collection Name>, //String
  <DATA TO UPDATE>, //Object
  <NEW DATA>, //Object
  <Callback> //Function
)
```
Example:
```node
NKMySQL.update( 'MyDatabase', 'users', 
  { 
    active: false 
  }, 
  { 
    active: true
  }, 
  () => console.log( 'all done' ) 
)
```

### To QUERY the collection use NKMySQL.query():
```
NKMySQL.query(
  <Database Name>, //String 
  <Collection Name>, //String
  <QUERY>, //Object
  <Callback> //Function, Recieves rows from query
)
```
Example:
```node
NKMySQL.query( 'MyDatabase', 'users', 
  { 
    active: true 
  }, 
  rowsFromQuery => console.log( rowsFromQuery ) 
)
```

### To QUERY with a SORT use NKMySQL.querySort:
```
NKMySQL.querySort(
  <Database Name>, //String 
  <Collection Name>, //String
  <SORT BY>, //Object
  <QUERY>, //Object
  <Callback> //Function, Recieves rows from query
)
```
Example:
```node
NKMySQL.querySort( 'MyDatabase', 'users', 
  { added: 1 }, 
  { active: true }, 
rowsFromQuery => console.log( rowsFromQuery ) )
```


### To QUERY with a SORT and LIMIT, use NKMySQL.queryLimitSort:
```
NKMySQL.queryLimitSort(
  <Database Name>, //String 
  <Collection Name>, //String
  <LIMIT>, //Number
  <SORT BY>, //Object
  <QUERY>, //Object
  <Callback> //Function, Recieves rows from query
)
```
Example
```node
NKMySQL.queryLimitSort( 'MyDatabase', 'users', 
  100, 
  { added: 1 }, 
  { active: true }, 
  rowsFromQuery => console.log( rowsFromQuery ) 
)
```

### For a SINGLE QUERY the collection use NKMySQL.singleQuery():
Note: singleQuery should only ever query **ONE ROW**.
```
NKMySQL.singleQuery(
  <Database Name>, //String 
  <Collection Name>, //String
  <QUERY>, //Object
  <Calback> //Function, Recieves a single row from query.
);
```
Example:
```node
NKMySQL.singleQuery( 'MyDatabase', 'users', 
  { 
    myuser: NKMySQL.id( user._id ) 
  }, 
  rowFromQuery => console.log( rowFromQuery ) 
)
```
This **singleQuery** is very useful in the authentication methods, e.g.
```node
NKMySQL.singleQuery( 'MyDatabase', 'users', 
  { loginSessionKey: req.sessionKey }, 
  rowFromQuery => res.json( rowFromQuery? true: false ) 
)
```

### To JOIN a SINGLE COLLECTION to another, use NKMySQL.join()
```
NKMySQL.singleQuery(
  <Database Name>, //String 
  <Collection Name>, //String
  <Collection ID Field>, //String
  <Name of Collection to join to>, //String
  <ID Field of collection to join to>, //String
  <Join to Element>, //String
  <Sort By>, //Object
  <Query>, // Object
  <Calback> //Function, Recieves rows from query
);
```
Example:
```node
NKMySQL.join( 'MyDatabase', 'users', 
  '_id', 
  'photos',
  'user_id', 
  'photos', 
  { added: 1 }, 
  { myuser: NKMySQL.id( user._id ) }, 
  rowsFromQuery => console.log( rowsFromQuery ) 
)
```

### To QUERY, and perform a LIST of JOINS defined in the query, use NKMySQL.joinsLimit():
```
NKMySQL.joinsLimit(
  <Database Name>, //String 
  <Collection Name>, //String
  <JOINS>, //Array of Objects
  <LIMIT>, //Number
  <SORT BY>, //Object
  <QUERY>, //Object
  <Calback> //Function, Recieves rows from query
);
```
Example
```node
const joins = [
  { from: 'photos', field: '_id', fromField: 'user_id', as: 'photos' },
  { from: 'history', field: '_id', fromField: 'user_id', as: 'transactions' }
];

NKMySQL.joinsLimit( 'MyDatabase', 'users', 
  joins, 
  100, 
  { added: 1 }, 
  { active: true }, 
  rowsFromQuery => console.log( rowsFromQuery ) 
)
```
---

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
