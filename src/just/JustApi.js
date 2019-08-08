/**
 * @author: justwkj
 * @date: 2019-08-08 13:32
 * @email: justwkj@gmail.com
 * @desc: 所有接口均定义在此,方面调用和管理
 */

export default {
    login: {
        method: 'post',
        url: 'Login/index'
    },
    logout: {
        method: 'get',
        url: 'Login/logout'
    },
    menuDel: {
        method: 'get',
        url: 'Menu/del'
    }

};
