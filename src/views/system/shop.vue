<template>
    <div>
        <Row>
            <Col span="24">
                <Card style="margin-bottom: 10px">
                    <Form inline>
                        <FormItem style="margin-bottom: 0">
                            <Select v-model="searchConf.shop_status" clearable placeholder='请选择状态' style="width:100px">
                                <Option :value="1">启用</Option>
                                <Option :value="0">禁用</Option>
                            </Select>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Input v-model="searchConf.keywords" placeholder="请输入商家名称"></Input>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Button type="primary" @click="search">查询/刷新</Button>
                        </FormItem>
                    </Form>
                </Card>
            </Col>
        </Row>
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title" style="height: 32px">
                        <Button type="primary" @click="alertAdd" icon="plus-round">新增</Button>
                    </p>
                    <div>
                        <Table :columns="columnsList" :data="tableData" border disabled-hover></Table>
                    </div>
                    <div class="margin-top-15" style="text-align: center">
                        <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                              :page-size="tableShow.pageSize" @on-change="changePage"
                              @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
                    </div>
                </Card>
            </Col>
        </Row>
        <Modal v-model="modalSetting.show" width="668" :styles="{top: '30px'}" @on-visible-change="doCancel">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="information-circled"></Icon>
                <span>{{formItem.shop_id ? '编辑' : '新增'}}商家</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="商家名称" prop="shop_name">
                    <Input v-model="formItem.shop_name" placeholder="请输入商家名称"></Input>
                </FormItem>
                <FormItem label="LOGO" prop="shop_logo">
                    <div class="demo-upload-list" v-if="formItem.shop_logo">
                        <img :src="formItem.shop_logo">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
                        </div>
                    </div>
                    <input v-if="formItem.shop_logo" v-model="formItem.shop_logo" type="hidden" name="image">
                    <Upload type="drag"
                            :action="uploadUrl"
                            :headers="uploadHeader"
                            v-if="!formItem.shop_logo"
                            :format="['jpg','jpeg','png']"
                            :max-size="5120"
                            :on-success="handleImgSuccess"
                            :on-format-error="handleImgFormatError"
                            :on-exceeded-size="handleImgMaxSize"
                            style="display: inline-block;width: 58px;height: 58px">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="camera" size="20"></Icon>
                        </div>
                    </Upload>
                </FormItem>
                <FormItem label="手机号" prop="shop_phone">
                    <Input v-model="formItem.shop_phone" placeholder="请输入手机号"></Input>
                </FormItem>
                <FormItem label="联系人" prop="shop_contact">
                    <Input v-model="formItem.shop_contact" placeholder="请输入联系人"></Input>
                </FormItem>
                <FormItem label="微信号" prop="shop_wechat">
                    <Input v-model="formItem.shop_wechat" placeholder="请输入微信号"></Input>
                </FormItem>
                <FormItem label="QQ" prop="shop_qq">
                    <Input v-model="formItem.shop_qq" placeholder="请输入QQ"></Input>
                </FormItem>
                <FormItem label="邮箱" prop="shop_email">
                    <Input v-model="formItem.shop_email" placeholder="请输入邮箱"></Input>
                </FormItem>
                <FormItem label="联系地址" prop="shop_address">
                    <Input v-model="formItem.shop_address" placeholder="请输入联系地址"></Input>
                </FormItem>
                <FormItem label="状态" prop="shop_status">
                    <Select v-model="formItem.shop_status" style="width:200px">
                        <Option :value="0" :key="0"> 失效 </Option>
                        <Option :value="1" :key="1"> 展示 </Option>
                    </Select>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancel" style="margin-right: 8px">取消</Button>
                <Button type="primary" @click="submit" :loading="modalSetting.loading">确定</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import config from '../../../build/config';
    import axios from 'axios';
    const editButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'primary'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.formItem.shop_id = currentRow.shop_id;
                    vm.formItem.shop_name = currentRow.shop_name;
                    vm.formItem.shop_logo = currentRow.shop_logo;
                    vm.formItem.shop_phone = currentRow.shop_phone;
                    vm.formItem.shop_contact = currentRow.shop_contact;
                    vm.formItem.shop_wechat = currentRow.shop_wechat;
                    vm.formItem.shop_qq = currentRow.shop_qq;
                    vm.formItem.shop_email = currentRow.shop_email;
                    vm.formItem.shop_address = currentRow.shop_address;
                    vm.formItem.shop_status = currentRow.shop_status;
                    vm.modalSetting.show = true;
                    vm.modalSetting.index = index;
                }
            }
        }, '编辑');
    };
    const deleteButton = (vm, h, currentRow, index) => {
        return h('Poptip', {
            props: {
                confirm: true,
                title: '您确定要删除这条数据吗? ',
                transfer: true
            },
            on: {
                'on-ok': () => {
                    axios.get('Shop/del', {
                        params: {
                            shop_id: currentRow.shop_id
                        }
                    }).then(function (response) {
                        currentRow.loading = false;
                        if (response.data.code === 1) {
                            vm.tableData.splice(index, 1);
                            vm.$Message.success(response.data.msg);
                        } else {
                            vm.$Message.error(response.data.msg);
                        }
                    });
                }
            }
        }, [
            h('Button', {
                style: {
                    margin: '0 5px'
                },
                props: {
                    type: 'error',
                    placement: 'top',
                    loading: currentRow.isDeleting
                }
            }, '删除')
        ]);
    };

    export default {
        name: 'system_user',
        data () {
            return {
                columnsList: [
                    {
                        title: '序号',
                        type: 'index',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '商家名称',
                        align: 'center',
                        key: 'shop_name'
                    },
                    {
                        title: '商家logo',
                        align: 'center',
                        key: 'shop_logo',
                        width: 90,
                        render: (h, params) => params.row.shop_logo ? h('img', {
                            attrs: {
                                src: params.row.shop_logo,
                                width: '60px',
                                height: '60px'
                            }
                        }) : ''
                    },
                    {
                        title: '手机号',
                        align: 'center',
                        key: 'shop_phone'
                    },
                    {
                        title: '联系人',
                        align: 'center',
                        key: 'shop_contact'
                    },
                    {
                        title: '微信号',
                        align: 'center',
                        key: 'shop_wechat'
                    },
                    {
                        title: '地址',
                        align: 'center',
                        key: 'shop_address'
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'shop_status_trans'
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        width: 175,
                        handle: ['edit', 'delete']
                    }
                ],
                tableData: [],
                groupList: [],
                tableShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0
                },
                searchConf: {
                    type: '',
                    keywords: '',
                    status: ''
                },
                modalSetting: {
                    show: false,
                    loading: false,
                    index: 0
                },
                formItem: {
                    shop_name: '',
                    shop_phone: '',
                    shop_contact: '',
                    shop_logo: '',
                    shop_id: 0
                },
                ruleValidate: {
                    /*shop_name: [
                        { required: true, message: '商家名称不能为空', trigger: 'blur' }
                    ],
                    shop_phone: [
                        { required: true, message: '商家手机号不能为空', trigger: 'blur' }
                    ],
                    shop_contact: [
                        { required: true, message: '商家联系人不能为空', trigger: 'blur' }
                    ]*/
                }
            };
        },
        created () {
            this.init();
            this.getList();
        },
        methods: {
            init () {
                let vm = this;
                this.columnsList.forEach(item => {
                    if (item.handle) {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('div', [
                                editButton(vm, h, currentRowData, param.index),
                                deleteButton(vm, h, currentRowData, param.index)
                            ]);
                        };
                    }
                    if (item.key === 'status') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('i-switch', {
                                attrs: {
                                    size: 'large'
                                },
                                props: {
                                    'true-value': 1,
                                    'false-value': 0,
                                    value: currentRowData.status
                                },
                                on: {
                                    'on-change': function (status) {
                                        axios.get('Shop/changeStatus', {
                                            params: {
                                                status: status,
                                                shop_id: currentRowData.shop_id
                                            }
                                        }).then(function (response) {
                                            let res = response.data;
                                            if (res.code === 1) {
                                                vm.$Message.success(res.msg);
                                            } else {
                                                if (res.code === -14) {
                                                    vm.$store.commit('logout', vm);
                                                    vm.$router.push({
                                                        name: 'login'
                                                    });
                                                } else {
                                                    vm.$Message.error(res.msg);
                                                    vm.getList();
                                                }
                                            }
                                            vm.cancel();
                                        });
                                    }
                                }
                            }, [
                                h('span', {
                                    slot: 'open'
                                }, '启用'),
                                h('span', {
                                    slot: 'close'
                                }, '禁用')
                            ]);
                        };
                    }
                });
                this.uploadUrl = config.baseUrl + 'Index/upload';
                this.uploadHeader = {'justTokn': sessionStorage.getItem('justTokn')};
            },
            alertAdd () {
                let vm = this;
                axios.get('Auth/getGroups').then(function (response) {
                    let res = response.data;
                    if (res.code === 1) {
                        vm.groupList = res.data.list;
                    } else {
                        if (res.code === -14) {
                            vm.$store.commit('logout', vm);
                            vm.$router.push({
                                name: 'login'
                            });
                        } else {
                            vm.$Message.error(res.msg);
                        }
                    }
                });
                this.modalSetting.show = true;
            },
            submit () {
                let self = this;
                this.$refs['myForm'].validate((valid) => {
                    if (valid) {
                        self.modalSetting.loading = true;
                        let target = '';
                        if (this.formItem.shop_id === 0) {
                            target = 'Shop/add';
                        } else {
                            target = 'Shop/edit';
                        }
                        axios.post(target, this.formItem).then(function (response) {
                            if (response.data.code === 1) {
                                self.$Message.success(response.data.msg);
                            } else {
                                self.$Message.error(response.data.msg);
                            }
                            self.getList();
                            self.cancel();
                        });
                    }
                });
            },
            cancel () {
                this.modalSetting.show = false;
            },
            doCancel (data) {
                if (!data) {
                    this.formItem.shop_id = 0;
                    this.$refs['myForm'].resetFields();
                    this.modalSetting.loading = false;
                    this.modalSetting.index = 0;
                }
            },
            changePage (page) {
                this.tableShow.currentPage = page;
                this.getList();
            },
            changeSize (size) {
                this.tableShow.pageSize = size;
                this.getList();
            },
            search () {
                this.tableShow.currentPage = 1;
                this.getList();
            },
            getList () {
                let vm = this;
                axios.get('Shop/getList', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        type: vm.searchConf.type,
                        keywords: vm.searchConf.keywords,
                        shop_status: vm.searchConf.shop_status
                    }
                }).then(function (response) {
                    let res = response.data;
                    if (res.code === 1) {
                        vm.tableData = res.data.list;
                        vm.tableShow.listCount = res.data.count;
                    } else {
                        if (res.code === -14) {
                            vm.$store.commit('logout', vm);
                            vm.$router.push({
                                name: 'login'
                            });
                        } else {
                            vm.$Message.error(res.msg);
                        }
                    }
                });
            },
            handleImgFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型不合法',
                    desc: file.name + '的文件类型不正确，请上传jpg或者png图片。'
                });
            },
            handleImgRemove () {
                this.formItem.shop_logo = '';
            },
            handleImgSuccess (response) {
                if (response.code === 1) {
                    this.$Message.success(response.msg);
                    this.formItem.shop_logo = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            },
            handleImgMaxSize (file) {
                this.$Notice.warning({
                    title: '文件大小不合法',
                    desc: file.name + '太大啦请上传小于5M的文件。'
                });
            },
        }
    };
</script>
