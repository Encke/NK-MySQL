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
			mysqlDBJSObject.databaseList[dbName].query( sql, ( error, results, fields ) => {
				let fieldAliases = []
				let fieldList = {}
				for( let i = 0; ( i < results.length ) && ( i < 1 ); i++ )	{
					for( let x in results[i] )	{
						fieldAliases.push( x )
					}
				}
				for( let i = 0; i < fields.length; i++ )	{
					fieldList[fieldAliases[i]] = fields[i].name
				}
				for( let i = 0; i < results.length; i++ )	{
					for( let x in results[i] )	{
						if( fieldList[x] && ( fieldList[x] != x ) )	{
							results[i][fieldList[x]] = results[i][x]
							delete results[i][x]
						}
					}
				}
				callback( error? []: results )
			})
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
		mysqlDBJSObject.databaseList[dbName].connect( err => {
			if( err )	{
				callback( true, err.sqlMessage )
			}	else {
				callback( false, null )
			}
		})
	},
	insert: ( dbName, table, rowOrRows, callback ) => mysqlDBJSObject.run( dbName, NKSQL.insert( table, rowOrRows ), callback ),
	delete: ( dbName, table, dataToRemove, callback ) => mysqlDBJSObject.run( dbName, NKSQL.delete( table, dataToRemove ), callback ),
	update: ( dbName, table, dataToUpdate, newData, callback ) => mysqlDBJSObject.run( dbName, NKSQL.update( table, newData, dataToUpdate ), callback ),
	singleQuery: ( dbName, table, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, 1, {}, query, null ), ( rows ) => callback( ( rows && ( rows.length > 0 ) )? rows[0]: null ) ),
	query: ( dbName, table, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, null, {}, query, null ), callback ),
	join: ( dbName, table, tableIDField, joinTo, joinToIDField, joinedToElement, sortBy, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, null, sortBy, query, [ { from: joinTo, field: tableIDField, fromField: joinToIDField, name: joinedToElement } ] ), callback ),
	joinsLimit: ( dbName, table, joins, max, sortBy, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, max, sortBy, query, joins ), callback ),
	querySort: ( dbName, table, sortBy, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, null, sortBy, query, null ), callback ),
	queryLimitSort: ( dbName, table, max, sortBy, query, callback ) => mysqlDBJSObject.run( dbName, NKSQL.query( table, max, sortBy, query, null ), callback )
}

module.exports = mysqlDBJSObject
