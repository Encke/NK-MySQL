const mysql		=	require( 'mysql' )
const NKSQL = require( '@encke/nk-mysql-builder' )

const mysqlDBJSObject = {
	db: null,
	retryTimeout: 100,
	connectionTimeout: 30000,
	insertList: {},
	deleteList: {},
	updateList: {},
	databaseList: {},
	id: name => objectid( name ),
	run: ( dbName, sql, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )  {
			mysqlDBJSObject.databaseList[dbName].query( sql, ( error, results, fields ) => callback( error? []: results ) )
		} else {
			callback( [] )
		}
	},
	start: ( dbName, ip, port, user, pass, timeoutInMS, callback ) => {
		let connectionOptions = { host: ip, database: dbName, port: parseInt( port ), connectTimeout: ( timeoutInMS? parseInt( timeoutInMS ): mysqlDBJSObject.connectionTimeout ) }
		if( user )  {
			connectionOptions.user = user
		}
		if( pass )  {
			connectionOptions.password = pass
		}
		mysqlDBJSObject.databaseList[dbName] = mysql.createConnection( connectionOptions )
		mysqlDBJSObject.databaseList[dbName].connect() 
		if( mysqlDBJSObject.databaseList[dbName] )  {
			callback( false, null )
		}	else	{
			callback( true, 'cannot connect' )
		}
	},
	insert: ( dbName, table, rowOrRows, callback ) => mysqlDBJSObject.run( dbName, NKSQL.insert( table, rowOrRows ), callback ),
	delete: ( dbName, table, dataToRemove, callback ) => mysqlDBJSObject.run( dbName, NKSQL.delete( table, dataToRemove ), callback ),
	update: ( dbName, table, dataToUpdate, newData, callback ) => mysqlDBJSObject.run( dbName, NKSQL.update( table, newData, dataToUpdate ), callback ),
	singleQuery: ( dbName, table, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, 1, {}, query, null ), callback ),
	query: ( dbName, table, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, null, {}, query, null ), callback ),
	join: ( dbName, table, tableIDField, joinTo, joinToIDField, joinedToElement, sortBy, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, null, sortBy, query, [ { from: joinTo, field: tableIDField, fromField: joinToIDField, name: joinedToElement } ] ), callback ),
	joinsLimit: ( dbName, table, joins, max, sortBy, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, max, sortBy, query, joins ), callback ),
	querySort: ( dbName, table, sortBy, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, null, sortBy, query, null ), callback ),
	queryLimitSort: ( dbName, table, max, sortBy, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, max, sortBy, query, null ), callback )
}

module.exports = mysqlDBJSObject
