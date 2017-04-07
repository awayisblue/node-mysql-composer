
var utils = require('./utils')

function Composer(connection){
    if(!connection)throw new Error('A mysql connection should be provided when instantiating Composer')
    this.connection = connection
}
Composer.prototype.insert = function(config,callback,inspect){
    var tableName = config.table
    if(!tableName)throw new Error('Table should not be empty.')
    tableName = utils.polishTableName(tableName)
    var data = config.data
    if(!data || Object.keys(data).length===0) throw new Error('Data should not be empty.')
    var onDuplicateKeyUpdate = config.onDuplicateKeyUpdate
    if(!onDuplicateKeyUpdate || Object.keys(onDuplicateKeyUpdate).length===0){
        var updateClause = ''
    }else{
        if(!utils.isSubArray(Object.keys(onDuplicateKeyUpdate),Object.keys(data))) throw new Error('onDuplicateKeyUpdate key elements not match keys in data')

        var str = utils.composeUpdateString(this.connection,onDuplicateKeyUpdate)
        updateClause = ' on duplicate key update '+str
    }

    var ignore = config.ignore!== false
    var insertString = utils.composeInsertString(this.connection,data)
    var sql = 'insert '+(ignore?'ignore':'')+' into '+tableName+insertString+updateClause
    inspect&&inspect(sql)
    if(callback)return this.connection.query(sql,callback)
    return utils.queryPromise(this.connection,sql)

}
Composer.prototype.update = function(config,callback,inspect){
    var tableName = config.table
    if(!tableName)throw new Error('Table should not be empty.')
    tableName = utils.polishTableName(tableName)
    var data = config.data
    if(!data || Object.keys(data).length===0)throw new Error('Data should be a none empty object.')
    if(!config.where)throw new Error('where clause must be set, if you want to update all rows, it should explicitly be set to 1')
    var whereClause = ' where '+config.where
    var updateStr = utils.composeUpdateString(this.connection,data)
    var sql = 'update '+tableName+" set "+updateStr+whereClause
    inspect&&inspect(sql)
    if(callback)return this.connection.query(sql,callback)
    return utils.queryPromise(this.connection,sql)
}

Composer.prototype.query = function(sql,callback,inspect){
    inspect&&inspect(sql)
    if(callback)return this.connection.query(sql,callback)
    return utils.queryPromise(this.connection,sql)
}


module.exports = Composer
