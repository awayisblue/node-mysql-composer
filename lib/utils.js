/**
 * Created by John on 2017/4/6.
 */

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
    },
    queryPromise:function(connection,sql){
        return new Promise(function(resolve,reject){
            connection.query(sql,function(err,result){
                if(err)return reject(err)
                resolve(result)
            })
        })
    },
    /**
     * 用于组成sql语句中的insert字符串，比如说有
     * var insertString = utils.composeInsertString(data)
     * 则可以用于以下方法组成插入语句
     * 'insert into merchant_images '+insertString
     *
     *@param connection  mysql链接，主要用于escape
     * @param data  object,键值对 columnName:value
     * @returns string
     */
    composeInsertString:function(connection,data){
        if(!data || Object.keys(data).length===0)throw new Error('input should  be a none empty object.')
        var keys = Object.keys(data)
        var columnStr = '('
        var valueStr = '('
        var lastIndex = keys.length-1
        for(var index in keys){
            var column = keys[index]
            var value = connection.escape(data[column])
            columnStr += '`'+column+'`'
            valueStr +=value
            if(index!=lastIndex){
                columnStr +=','
                valueStr +=','
            }else{
                columnStr +=')'
                valueStr +=')'
            }
        }
        return ' '+columnStr+' values '+valueStr
    },
    /**
     * 用于组成sql语句中的update字符串,比如说
     * var str = utils.composeUpdateString(data)
     * var sql = 'update merchant set '+str+' where merchantId=?'
     * @param connection  mysql链接，主要用于escape
     * @param data  object,键值对 columnName:value
     * @returns {string}
     */
    composeUpdateString:function(connection,data){
        if(!data || Object.keys(data).length===0)throw new Error('input should  be a none empty object.')
        var keys = Object.keys(data)
        var str = ' '
        var lastIndex = keys.length-1
        for(var index in keys){
            var column = keys[index]
            var value = data[column]
            if(typeof value ==='function'){
                var statementStr = value()
                if(typeof statementStr !=='string')throw new Error ('data property of function type must return string!')
                value = utils.polishStatementStr(statementStr)
            }else{
                value = connection.escape(value)
            }
            str += '`'+column+'`'+'='+value
            if(index!=lastIndex){
                str +=','
            }
        }
        return str
    }


}

module.exports = utils