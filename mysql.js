const mongo		=	require( 'mysql' )
const objectid	=	require( 'mongodb' ).ObjectID

const mysqlDBJSObject = {
	db: null,
	retryTimeout: 100,
	connectionTimeout: 30000,
	insertList: {},
	deleteList: {},
	updateList: {},
	databaseList: {},
	id: name => objectid( name ),
	start: ( dbName, ip, port, user, pass, timeoutInMS, callback ) => mongo.connect( ( 'mongodb://' + ( user? escape( user ): '' ) + ( ( user && pass )? ':': '' ) + ( pass? escape( pass ): '' ) + ( ( user || pass )? '@': '' ) + escape( ip ) + ':' + parseInt( port ),toString() + '/' + escape( dbName ) ), { serverSelectionTimeoutMS: ( timeoutInMS? parseInt( timeoutInMS ): mysqlDBJSObject.connectionTimeout ), useNewUrlParser: true, useUnifiedTopology: true }, ( err, db ) => {
		if( !err && db )	{
			mysqlDBJSObject.databaseList[dbName] = db.db( dbName )
			mysqlDBJSObject.databaseList[dbName].collection( dbName )
			callback( false, null )
		}	else	{
			callback( true, err )
		}
	}),
	insert: ( dbName, table, rowOrRows, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			if( mysqlDBJSObject.insertList[table] )	{
				setTimeout( () => mysqlDBJSObject.insert( dbName, table, rowOrRows, callback ), mysqlDBJSObject.retryTimeout )
			}	else	{
				mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => {
					if( Array.isArray( rowOrRows ) )	{
						mysqlDBJSObject.insertList[table] = 1
						collection.insertMany( rowOrRows, () => mysqlDBJSObject.insertDone( table, callback ) )
					}	else	{
						mysqlDBJSObject.insertList[table] = 1
						collection.insertOne( rowOrRows, () => mysqlDBJSObject.insertDone( table, callback ) )
					}
				})
			}
		}
	},
	insertDone: ( table, callback ) => {
		if( mysqlDBJSObject.insertList[table] )	{
			mysqlDBJSObject.insertList[table]--
			if( mysqlDBJSObject.insertList[table] < 1 )	{
				delete mysqlDBJSObject.insertList[table]
			}
		}
		if( callback )	{
			callback()
		}
	},
	delete: ( dbName, table, dataToRemove, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			if( mysqlDBJSObject.deleteList[table] )	{
				setTimeout( () => mysqlDBJSObject.delete( dbName, table, dataToRemove, callback ), mysqlDBJSObject.retryTimeout )
			}	else	{
				mysqlDBJSObject.deleteList[table] = true;
				mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => collection.deleteMany( dataToRemove, () => mysqlDBJSObject.deleteDone( table, callback ) ) )
			}
		}
	},
	deleteDone: ( table, callback ) => {
		if( mysqlDBJSObject.deleteList[table] )	{
			delete mysqlDBJSObject.deleteList[table]
		}
		if( callback )	{
			callback()
		}
	},
	update: ( dbName, table, dataToUpdate, newData, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			if( mysqlDBJSObject.updateList[table] )	{
				setTimeout( () => mysqlDBJSObject.update( dbName, table, dataToUpdate, newData, callback ), mysqlDBJSObject.retryTimeout )
			}	else	{
				mysqlDBJSObject.updateList[table] = true
				mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => collection.updateMany( dataToUpdate, { $set: newData }, () => mysqlDBJSObject.updateDone( table, callback ) ) )
			}
		}
	},
	updateDone: ( table, callback ) => {
		if( mysqlDBJSObject.updateList[table] )	{
			delete mysqlDBJSObject.updateList[table]
		}
		if( callback )	{
			callback()
		}
	},
	singleQuery: ( dbName, table, query, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => collection.findOne( query, ( err, item ) => callback( item ) ) );
		}
	},
	query: ( dbName, table, query, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => collection.find( query ).toArray( ( err, items ) => callback( items ) ) );
		}
	},
	join: ( dbName, table, tableIDField, joinTo, joinToIDField, joinedToElement, sortBy, query, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => {
				let lkData = { $lookup: { from: joinTo, localField: tableIDField, foreignField: joinToIDField, as: joinedToElement } }
				collection.aggregate( [ lkData, { $match: query } ], { $sort: sortBy } ).toArray( ( err, items ) => callback( items ) )
			});
		}
	},
	joinsLimit: ( dbName, table, joins, max, sortBy, query, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => {
				let lookupdata = []
				for( let i = 0; i < joins.length; i++ )	{
					let lookupDataItem = { from: joins[i].from, localField: joins[i].field, foreignField: joins[i].fromField, as: joins[i].name }
					lookupdata.push( { $lookup: lookupDataItem } )
				}
				lookupdata.push( { $match: query } )
				collection.aggregate( lookupdata, { $sort: sortBy, $limit: max } ).toArray( ( err, items ) => callback( items ) )
			})
		}
	},
	querySort: ( dbName, table, sortBy, query, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => collection.find( query ).sort( sortBy ).toArray( ( err, items ) => callback( items ) ) )
		}
	},
	queryLimitSort: ( dbName, table, max, sortBy, query, callback ) => {
		if( mysqlDBJSObject.databaseList[dbName] )	{
			mysqlDBJSObject.databaseList[dbName].collection( table, ( err, collection ) => collection.find( query ).limit( max ).sort( sortBy ).toArray( ( err, items ) => callback( items ) ) )
		}
	}
}

module.exports = mysqlDBJSObject
