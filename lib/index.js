
var mysql = require('mysql');
var utils = {
    isSubArray:function(subArray,arr){
        return subArray.every(function(elm){
            return arr.indexOf(elm) > -1
        })

    },
    /**
     * 把类似于 'a+b*c-1'的字符串转换成'`a`+`b`*`c`-1',支持的运算符有+,-,*,/,%,DIV,MOD,跟mysql的运算符一样,另外支持=，用于where语句
     * https://dev.mysql.com/doc/refman/5.7/en/arithmetic-functions.html
     * @param statementStr
     * @returns {string}
     */
    polishStatementStr:function(statementStr){

        var aStr = statementStr.replace(/([^\+|\*|\/|\-|%|=]+)/ig,'`$1`')
        var bStr = aStr.replace(/(\s+DIV\s+|\s+MOD\s+)/gi,'`$1`')
        return bStr.replace(/`(\d+)`/g,'$1')
    },
    polishTableName:function(tableName){
        return '`'+tableName.replace('`','').trim()+'`'
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
        var value = data[column]
        if(typeof value ==='function'){
            var statementStr = value()
            if(typeof statementStr !=='string')throw new Error ('data property of function type must return string!')
            value = utils.polishStatementStr(statementStr)
        }else{
            value = mysql.escape(value)
        }
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
         *   onDuplicateKeyUpdate:{},
         *   data:{} //key value maps
         * }
         */
        insert:function(config,callback,inspect){
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

                var str = operation.composeUpdateString(onDuplicateKeyUpdate)
                updateClause = ' on duplicate key update '+str
            }

            var ignore = config.ignore!== false
            var insertString = operation.composeInsertString(data);
            var sql = 'insert '+(ignore?'ignore':'')+' into '+tableName+insertString+updateClause;
            inspect&&inspect(sql)
            connection.query(sql,callback);
        },
        /**
         * config:{
         *   table:'',
         *   where:false, //where clause
         *   data:{} //key value maps
         * }
         */
        update:function(config,callback,inspect){
            var tableName = config.table
            if(!tableName)throw new Error('Table should not be empty.')
            tableName = utils.polishTableName(tableName)
            var data = config.data
            if(!data || Object.keys(data).length===0)throw new Error('Data should be a none empty object.')
            if(!config.where)throw new Error('where clause must be set, if you want to update all rows, it should explicitly be set to 1')
            var whereClause = ' where '+utils.polishStatementStr(config.where)
            var updateStr = operation.composeUpdateString(data);
            var sql = 'update '+tableName+" set "+updateStr+whereClause;
            inspect&&inspect(sql)
            connection.query(sql,callback);
        },
        query:function(sql,callback,inspect){
            inspect&&inspect(sql)
            connection.query(sql,callback);
        }
    }
};
module.exports = operation;
