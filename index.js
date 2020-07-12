const NK = require( "nk-node" )
const mysql = require( 'mysql' )

const mySQLTransport = {
  obj: null,
  connect: ( configuration ) => {
    mySQLTransport.obj = mysql.createConnection( configuration )
    mySQLTransport.obj.connect()
  },
  query: ( sql, callback ) => {
    if( mySQLTransport.obj )  {
        mySQLTransport.obj.query( sql, ( error, results, fields ) => callback( error? []: results ) )
    } else {
      callback( [] )
    }
  },
  close: () => mySQLTransport.obj.end()
}