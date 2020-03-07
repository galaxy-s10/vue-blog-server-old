const qiniu = require('qiniu')

var ppp = {
    getQiniuToken: function () {
        var accessKey = '';
        var secretKey = '';
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
        // const mac = new qiniu.auth.digest.Mac(QINIU_ACCESS_KEY, QINIU_SECRET_KEY)
        const options = {
            scope: 'hssblog',
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
        };
        const putPolicy = new qiniu.rs.PutPolicy(options)
        const uploadToken = putPolicy.uploadToken(mac)
        return uploadToken
    },
    del: function (filename) {
        var accessKey = '';
        var secretKey = '';
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        var config = new qiniu.conf.Config();
        //config.useHttpsDomain = true;
        config.zone = qiniu.zone.Zone_z0;
        var bucketManager = new qiniu.rs.BucketManager(mac, config);

        var bucket = "hssblog";
        var key = filename;
        var key = filename.substr(32)
        return new Promise((resolve, reject) => {
            bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
                if (respInfo.statusCode == 200) {
                    console.log('删除七牛云图片成功')
                    resolve(1)
                } else {
                    console.log('删除七牛云图片失败');
                    console.log(respInfo)
                    reject(0)
                }
            })
        })
    },
    // upimg: function () {
    //     var localFile = "/Users/jemy/Documents/qiniu.mp4";
    //     var formUploader = new qiniu.form_up.FormUploader(config);
    //     var putExtra = new qiniu.form_up.PutExtra();
    //     var key = 'test.mp4';
    //     // 文件上传
    //     formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr,
    //         respBody, respInfo) {
    //         if (respErr) {
    //             throw respErr;
    //         }
    //         if (respInfo.statusCode == 200) {
    //             console.log(respBody);
    //         } else {
    //             console.log(respInfo.statusCode);
    //             console.log(respBody);
    //         }
    //     });

    // }
}

module.exports = ppp