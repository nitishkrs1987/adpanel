var pool = require('../lib/mysql_conn.js');
var moment = require('moment');

module.exports = {
    log: function(action,user,campaign_id){
        // console.log(action);
        s = [];
        s['action'] = action;
        s['user'] = user;
        s['campaign_id'] = campaign_id;

        s['logged_at'] = new moment().format('YYYY-MM-DD HH:mm:ss');
        var insert_sql = "insert into log set ";
        for (let key in s)
        {
            insert_sql += key+"='"+s[key]+"',"
        }
        insert_sql = insert_sql.slice(0, -1);
        // console.log(insert_sql);
        pool.query(insert_sql,function(err,rows){ });
    }
}