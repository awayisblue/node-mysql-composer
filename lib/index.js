
var mysql = require('mysql');
var utils = {
    isSubArray:function(subArray,arr){
        return subArray.every(function(elm){
            return arr.indexOf(elm) > -1
        })

    }
}
var operation = {};
/**
 * 用于组成sql语句中的insert字符串，比如说有
 * var insertString = operation.composeInsertString(data);
 * 则可以用于以下方法组成插入语句
 * 'insert into merchant_images '+insertString
 *
 *
 * @param data  object,键值对 columnName:value
 * @returns string
 */
operation.composeInsertString = function(data){
    if(!data || Object.keys(data).length===0)throw new Error('input should  be a none empty object.')
    var keys = Object.keys(data);
    var columnStr = '(';
    var valueStr = '(';
    var lastIndex = keys.length-1;
    for(var index in keys){
        var column = keys[index];
        var value = mysql.escape(data[column]);
        columnStr += '`'+column+'`';
        valueStr +=value;
        if(index!=lastIndex){
            columnStr +=',';
            valueStr +=',';
        }else{
            columnStr +=')';
            valueStr +=')';
        }
    }
    return ' '+columnStr+' values '+valueStr;
};
/**
 * 用于组成sql语句中的update字符串,比如说
 * var str = operation.composeUpdateString(data);
 * var sql = 'update merchant set '+str+' where merchantId=?';
 * @param data  object,键值对 columnName:value
 * @returns {string}
 */
operation.composeUpdateString = function(data){
    if(!data || Object.keys(data).length===0)throw new Error('input should  be a none empty object.')
    var keys = Object.keys(data);
    var str = ' ';
    var lastIndex = keys.length-1;
    for(var index in keys){
        var column = keys[index];
        var value = mysql.escape(data[column]);
        str += '`'+column+'`'+'='+value;
        if(index!=lastIndex){
            str +=',';
        }
    }
    return str;
};

operation.composer = function(connection){

    return {
        /**
         * config:{
         *   table:'',
         *   ignore:true,
         *   onDuplicateKeyUpdate:['field1',field2],
         *   data:{} //key value maps
         * }
         */
        insert:function(config,callback){
            var tableName = config.table
            if(!tableName)throw new Error('Table should not be empty.')
            var data = config.data
            if(!data || Object.keys(data).length===0) throw new Error('Data should not be empty.')
            var keysForUpdate = config.onDuplicateKeyUpdate
            if(!keysForUpdate || keysForUpdate.length===0){
                var updateClause = ''
            }else{
                if(!utils.isSubArray(keysForUpdate,Object.keys(data))) throw new Error('onDuplicateKeyUpdate array elements not match keys in data')
                var updateData = {}
                keysForUpdate.forEach(function(key){
                    updateData[key] = data[key]
                })
                var str = operation.composeUpdateString(updateData)
                updateClause = ' on duplicate key update '+str
            }

            var ignore = config.ignore!== false
            var insertString = operation.composeInsertString(data);
            var sql = 'insert '+(ignore?'ignore':'')+' into '+tableName+insertString+updateClause;
            connection.query(sql,callback);
        },
        /**
         * config:{
         *   table:'',
         *   where:'', //where clause
         *   data:{} //key value maps
         * }
         */
        update:function(config,callback){
            var tableName = config.table
            if(!tableName)throw new Error('Table should not be empty.')
            var data = config.data
            if(!data || Object.keys(data).length===0)throw new Error('Data should be a none empty object.')
            var whereClause = config.where?' where '+config.where:''
            var updateStr = operation.composeUpdateString(data);
            var sql = 'update '+tableName+" set "+updateStr+whereClause;
            connection.query(sql,callback);
        },
        query:function(sql,callback){
            connection.query(sql,callback);
        }
    }
};
module.exports = operation;
