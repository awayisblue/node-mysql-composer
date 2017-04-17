
# Table of Contents
- [Introduction](#user-content-introduction)
- [Installation](#user-content-installation)
- [Apis](#user-content-Apis)
  - [insert](#user-content-insert)
  - [update](#user-content-update)
  - [query](#user-content-query)
  - [beginTransaction](#user-content-begintransaction)
  - [rollback](#user-content-rollback)
  - [commit](#user-content-commit)
- [Promise support](#user-content-promise-support)

# Introduction

One of the duty of my job is to write web scraper -- scrape data and store to mysql tables. And most of the time, the origin tables are not created by myself. It's inefficient to model these tables like `sequelize` do. All I want is having direct access to the tables and being efficient. That's why I develop `mysql-composer`.

If you are looking for a more powerful tool, [sequelize](https://github.com/sequelize/sequelize) may be a better choice.

# Installation

`npm i -S mysql-composer`

# Apis

`mysql-composer` is a simple tool for you to execute sql on mysql database.
```js
const Composer = require('mysql-composer')
const mysql = require('mysql')
const connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'me',
      password : 'secret',
      database : 'my_db'
    });
const composer = new Composer(connection)
```


## insert
**insert(config,callback,inspect)**<br/>
 - config:
 
```js
{
   table:'tableName', //require
   data:{ //require
         field1:'value1',
         field2:'value2'
       },
   ignore:true,//optional,defaults to true
   onDuplicateKeyUpdate:{field1:'value1',
   field2:function(){
        return 'field1+1'
    }},//optional 
}
```
 - callback: will be called when sql is executed: `callback(err,result)`
 - inspect: will be called with generated sql : `inspect(sql)`

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
  //your code after sql is executed
},function(sql){
    console.log(sql)
})

```

## update
**update(config,callback,inspect)** <br/>
 - config:
 
   ```js
    {
       table:'tableName', //require
       data:{ //require
             field1:'value1',
             field2:function(){
                  return 'field2+1'
              }
           },
       where:'id=1' //require,if you need to update all, you should explicitly set 'where' to 1.
    }
    ```
 - callback: will be called when sql is executed: `callback(err,result)`
 - inspect: will be called with generated sql : `inspect(sql)`

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
  //your code after sql is executed
},function(sql){
    console.log(sql)
})

```

## query

**query(sql,callback,inspect)** <br/>
 - sql: a valid sql syntax
 - callback: will be called when sql is executed: `callback(err,result)`
 - inspect: will be called with generated sql : `inspect(sql)`

example:
```js
//update `user` set age='18' where id=1
composer.query('select * from user where id=1',function(err,result){
  //your code after sql is executed
},function(sql){
    console.log(sql)
})

```

## beginTransaction

**beginTransaction(callback)** <br/>
 - callback: will be called when beginTransaction is executed: `callback(err)`

example:
```js
composer.beginTransaction(function(err){
    if(err)throw err
    composer.insert({
     table:'user',
     data:{
      name:'Tom',
      age:'18'
      }
    },function(err,result){
      if(err)return composer.rollback(function(){
        throw err
      })

      composer.commit(function(err){
         if(err)return composer.rollback(function(){
            throw err
         })

         console.log('success')
      })
    })
})

```
## rollback

**rollback(callback)** <br/>
 - callback: will be called when rollback is executed: `callback(err)`

## commit

**commit(callback)** <br/>
 - callback: will be called when commit is executed: `callback(err)`


# Promise support

`mysql-composer` supports promise, it will be convenient if you like to use `mysql-composer` with `co` or async/await.
if you do not provide a callback in the `apis` above, they will return a promise:
```js
var promise = composer.update({
            table:'name',
            where:'id=2',
            data:{
                field1:'value1',
                field2:'value2'
            }
        })
promise.then(function(result){

}).catch(function(err){

})
```
    