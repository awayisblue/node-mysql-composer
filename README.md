# node-mysql-composer
A simple nodejs mysql syntax composer for insert and update syntax.

# Installation

`npm i -S mysql-composer`

# Why mysql-composer?
The reason why I write this module is that personally I prefer writing sql syntax from scratch rather than using an orm. Writing sql syntax directly offers me more flexibility and I know what exactly is done. But this way sometimes the syntax is so long that it becomes tedious and so here comes mysql-composer.

# What does mysql-composer do?

Suppose that you have a table with 10 or more columns. If you wanna insert a row, your syntax will be like:
```js
const sql = "insert ignore into tableName (`c1`,`c2`,`c3`,`c4`,`c5`,`c6`,`c7`,`c8`,`c9`,`c10`) values ('v1','v2','v3','v4','v5','v6','v7','v8','v9','v10')"

```
 It's quite a long sql string which is tedious to concat and escape . With `mysql-composer`, I can now write it in this way:
```js
const sqlUtil = require('mysql-composer')
const str = sqlUtil.composeInsertString({
    c1:'v1',
    c2:'v2',
    c3:'v3',
    c4:'v4',
    c5:'v5',
    c6:'v6',
    c7:'v7',
    c8:'v8',
    c9:'v9',
    c10:'v10'
})
const sql = "insert ignore into tableName "+str
```
And the values are escaped by `mysql.escape()` under the hook to prevent sql injection.
If you still find it tedious to concat your sql , you can use `composer` api instead.

# Api

## composeInsertString

insert ignore into tableName ``(`c1`,`c2`) values ('v1','v2')``<br/>
The highlighted part of this syntax is handled by composerInsertString.Call composeInsertString(obj) to get this part and concat the sql.

## composeUpdateString

update tableName  set `` `c1`='v1',`c2`='v2' `` where id=1<br/>
The highlighted part of this syntax is handled by composeUpdateString.Call composeUpdateString(obj) to get this part and concat the sql.

## composer

`composer`, based on `composeInsertString` and `composerInsertString`, is a simple tool for you to operate mysql database.
```js
const sqlUtil = require('mysql-composer')
const mysql = require('mysql')
const connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'me',
      password : 'secret',
      database : 'my_db'
    });
const composer = sqlUtil.composer(connection)
```
`composer` has 3 apis.

- insert
- update
- query

### insert
 insert(config,callback) <br/>
 - config:
 
   ```js
    {
       table:'tableName', //require
       data:{ //require
             field1:'value1',
             field2:'value2'
           },
       ignore:true,//optional,defaults to true
       onDuplicateKeyUpdate:['field1,field2'],//optional 
    }
    ```
 - callback: will be called when sql executed as `callback(err,result)`
 example:
    ```js
    //insert ignore into user (`name`,`age`) values ('Tom','18')
    composer.insert({
     table:'user',
     data:{
      name:'Tom',
      age:'18'
      }
    },function(err,result){
      //your code after sql executed
    })
    
    ```

### update
 insert(config,callback) <br/>
 - config:
 
   ```js
    {
       table:'tableName', //require
       data:{ //require
             field1:'value1',
             field2:'value2'
           },
       where:'id=1' //recommended, because otherwise your whole table will be updated.
    }
    ```
 - callback: will be called when sql executed as `callback(err,result)`
 example:
    ```js
    //update `user` set age='18' where id=1
    composer.update({
     table:'user',
     data:{
      age:'18'
      },
     where:"id=1"
    },function(err,result){
      //your code after sql executed
    })
    
    ```

### query

 query(sql,callback) <br/>
 - sql: a valid sql syntax
 - callback: will be called when sql executed as `callback(err,result)`
 example:
    ```js
    //update `user` set age='18' where id=1
    composer.query('select * from user where id=1',function(err,result){
      //your code after sql executed
    })
    
    ```
    