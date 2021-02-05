/*
 * @Author: your name
 * @Date: 2021-02-05 18:30:17
 * @LastEditTime: 2021-02-05 18:39:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \hss\vueblog-server\lib\utils.js
 */
// 获取范围内所有时间 getRangeTime('2021-02-01', '2022-02-01')
 function getRangeTime(begin, end) {
    function format(val) {
        var s = '';
        var mouth = (val.getMonth() + 1) >= 10 ? (val.getMonth() + 1) : ('0' + (val.getMonth() + 1));
        var day = val.getDate() >= 10 ? val.getDate() : ('0' + val.getDate());
        s += val.getFullYear() + '-'; // 获取年份。
        s += mouth + "-"; // 获取月份。
        s += day; // 获取日。
        return (s); // 返回日期。
    };
    var arr = [];
    var ab = begin.split("-");
    var ae = end.split("-");
    var db = new Date();
    db.setUTCFullYear(ab[0], ab[1] - 1, ab[2]);
    var de = new Date();
    de.setUTCFullYear(ae[0], ae[1] - 1, ae[2]);
    var unixDb = db.getTime() - 24 * 60 * 60 * 1000;
    var unixDe = de.getTime() - 24 * 60 * 60 * 1000;
    for (var k = unixDb; k <= unixDe;) {
        //console.log((new Date(parseInt(k))).format());
        k = k + 24 * 60 * 60 * 1000;
        arr.push(format((new Date(parseInt(k)))));
    }
    return arr;
}

module.exports = { getRangeTime }
