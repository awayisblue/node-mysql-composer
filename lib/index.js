
var mysql = require('mysql');
var operation = {};
/**
 * 用于组成sql语句中的insert字符串，比如说有
 * var insertString = operation.composeInsertString(data);
 * 则可以用于以下方法组成插入语句
 * 'insert into merchant_images '+insertString.columnStr+' values '+insertString.valueStr;
 *
 *
 * @param data  object,键值对 columnName:value
 * @returns {{columnStr: string, valueStr: string}}
 */
operation.composeInsertString = function(data){
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
    return {columnStr:columnStr,valueStr:valueStr};
};
/**
 * 用于组成sql语句中的update字符串,比如说
 * var str = operation.composeUpdateString(data);
 * var sql = 'update merchant set '+str+' where merchantId=?';
 * @param data  object,键值对 columnName:value
 * @returns {string}
 */
operation.composeUpdateString = function(data){
    var keys = Object.keys(data);
    var str = '';
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


module.exports = operation;
