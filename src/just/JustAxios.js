/**
 * @author: justwkj
 * @date: 2019-08-08 13:42
 * @email: justwkj@gmail.com
 * @desc:
 */

import axio from 'axios';
// import {Modal} from 'antd';
// import JustUtils from './JustUtils';
import JustApi from './JustApi';

export default class JustAxios {
    // static requestList (_this, url, options, isMock = true) {
    //     this.ajax({
    //         url,
    //         isMock,
    //         data: options,
    //         method: options.method || 'get'
    //     }).then((res) => {
    //         if (res && res.data) {
    //             let itemList = res.data.list.map((item, index) => {
    //                 item.key = index;
    //                 return item;
    //             });
    //             _this.setState({
    //                 itemList,
    //                 pagination: JustUtils.pagination(res, (current) => {
    //                     _this.params.page = current;
    //                     _this.requestList();
    //                 })
    //             });
    //         }
    //     });
    // }

    // ajax 请求进行封装
    // option.url: 统一使用api定义的请求obj
    // option.data: get 或者 post参数
    static ajax (options) {
        // const baseURL = process.env.NODE_ENV === 'production' ? '/home' : '/api';
        let url = options.url.url;
        let method = options.url.method || 'get';

        return new Promise((resolve, reject) => {
            let requestParams = options.data || '';
            let requestObj = {
                url,
                method,
                // baseURL,
                timeout: 5000
            };

            // get post 参数自动转换
            if (method.toLowerCase() === 'get') {
                requestObj.params = requestParams;
            } else if (method.toLowerCase() === 'post') {
                requestObj.data = requestParams;
            }
            // 此处返回拦截器处理过的内容
            axio(requestObj).then((response) => {
                resolve(response);
            }, fail => {
                reject(fail);
            });
        });
    }

    // excel导出
    static excel (options) {
        let url = options.url.url;
        let data = options.data || {};
        data.export_excel = 1;// 约定传参 export_excel
        this.ajax({
            url,
            data
        }).then((res) => {
            // 约定返回参数 newFileName
            window.open(url + JustApi.directExport.url + '?file=' + res.data.newFileName);
        }, fail => {
            console.log(fail);
        });
    }
}
