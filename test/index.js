const expect = require('chai').expect
const Composer = require('../lib/index')
const mysql = require('mysql')
describe('#Composer',function(){
    var mockConnection = {
        query:function(sql,callback){
            callback(null,'mockData')
        },
        escape:mysql.escape
    }
    var composer = new Composer(mockConnection)
    describe('#insert',function(){
        it('should throw error when table is not provided',function(){
            var fn = function(){
                composer.insert({
                    data:{
                        type:1
                    },
                    ignore:true
                },function(err){

                })
            }
            expect(fn).to.throw(Error)
        })
        it('should throw error when data is not provided',function(){
            var fn = function(){
                composer.insert({
                    table:'name',
                    ignore:true
                },function(err){

                })
            }
            expect(fn).to.throw(Error)
        })
        it('should throw error when data is an empty object',function(){
            var fn = function(){
                composer.insert({
                    table:'name',
                    ignore:true,
                    data:{

                    }
                },function(err){

                })
            }
            expect(fn).to.throw(Error)
        })
        it('should throw error when a updated field is not in data keys',function(){
            var fn = function(){
                composer.insert({
                    table:'name',
                    ignore:true,
                    onDuplicateKeyUpdate:{
                        field3:'value3'
                    },
                    data:{
                        field1:'value1',
                        field2:'value2'
                    }
                },function(err){

                })
            }
            expect(fn).to.throw(Error)
        })
        it('should be a correct insert syntax with ignore',function(){
            composer.insert({
                table:'name',
                data:{
                    field1:'value1',
                    field2:'value2'
                }
            },function(err,result){

            },function(sql){
                expect(sql).to.satisfy(function(sql){
                    var striped = sql.trim().replace(/\s+/g," ")
                    return striped == "insert ignore into `name` (`field1`,`field2`) values ('value1','value2')"
                })
            })
        })
        it('should be a correct insert syntax without ignore',function(){
            composer.insert({
                table:'name',
                ignore:false,
                data:{
                    field1:'value1',
                    field2:'value2'
                }
            },function(err,result){

            },function(sql){
                expect(sql).to.satisfy(function(sql){
                    var striped = sql.trim().replace(/\s+/g," ")
                    return striped == "insert into `name` (`field1`,`field2`) values ('value1','value2')"
                })
            })
        })
        it('should be a correct insert syntax with on duplicate key update clause',function(){
            composer.insert({
                table:'name',
                ignore:false,
                onDuplicateKeyUpdate:{
                    field1:'value1',
                },
                data:{
                    field1:'value1',
                    field2:'value2'
                }
            },function(err,result){

            },function(sql){
                expect(sql).to.satisfy(function(sql){
                    var striped = sql.trim().replace(/\s+/g," ")
                    return striped == "insert into `name` (`field1`,`field2`) values ('value1','value2') on duplicate key update `field1`='value1'"
                })
            })
        })
        it('should be a correct insert syntax with on duplicate key update clause that use arithmetic string to compute new value',function(){
            composer.insert({
                table:'name',
                ignore:false,
                onDuplicateKeyUpdate:{
                    field1:function(){
                        return 'field1+1 mod 2+field2/2-4*3+5%4'
                    },
                },
                data:{
                    field1:'value1',
                    field2:'value2'
                }
            },function(err,result){

            },function(sql){
                expect(sql).to.satisfy(function(sql){
                    var striped = sql.trim().replace(/\s+/g," ")
                    return striped == "insert into `name` (`field1`,`field2`) values ('value1','value2') on duplicate key update `field1`=`field1`+1 mod 2+`field2`/2-4*3+5%4"
                })
            })
        })
        it('should return a promise when callback is not provided',function(){
            var p = composer.insert({
                table:'name',
                data:{
                    field1:'value1',
                    field2:'value2'
                }
            })
            expect(p).to.satisfy(function(p){

                return typeof p.then === 'function'
            })
        })
    })
    describe('#update',function(){
        it('should throw error when table is not provided',function(){
            var fn = function(){
                composer.update({
                    data:{
                        type:1
                    },
                    ignore:true
                },function(err){

                })
            }
            expect(fn).to.throw(Error)
        })
        it('should throw error when data is not provided',function(){
            var fn = function(){
                composer.update({
                    table:'name',
                    ignore:true,
                    where:'1'
                },function(err){

                })
            }
            expect(fn).to.throw(Error)
        })
        it('should throw error when data is an empty object',function(){
            var fn = function(){
                composer.update({
                    table:'name',
                    ignore:true,
                    data:{

                    },
                    where:'1'
                },function(err){

                })
            }
            expect(fn).to.throw(Error)
        })
        it('should throw error without where clause',function(){
            var fn = function() {
                composer.update({
                    table: 'name',
                    data: {
                        field1: 'value1',
                        field2: 'value2'
                    }
                }, function (err, sql) {

                })
            }
            expect(fn).to.throw(Error)
        })
        it('should be a correct update syntax with where clause',function(){
            composer.update({
                table:'name',
                where:'`id`=2',
                data:{
                    field1:'value1',
                    field2:'value2'
                }
            },function(err,result){

            },function(sql){
                expect(sql).to.satisfy(function(sql){
                    var striped = sql.trim().replace(/\s+/g," ")
                    // throw new Error(sql)
                    return striped == "update `name` set `field1`='value1',`field2`='value2' where `id`=2"
                })
            })
        })
        it('should return a promise when callback is not provided',function(){
            var p = composer.update({
                table:'name',
                where:'id=2',
                data:{
                    field1:'value1',
                    field2:'value2'
                }
            })
            expect(p).to.satisfy(function(p){

                return typeof p.then === 'function'
            })
        })
    })
    describe('#query',function(){
        it('should return a promise when callback is not provided',function(){
            var p = composer.query('select 1 from users')
            expect(p).to.satisfy(function(p){

                return typeof p.then === 'function'
            })
        })
    })
})
