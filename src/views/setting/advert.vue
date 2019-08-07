<style lang="less" scoped>
    @import './list.less';
</style>
<template>
    <div>
        <Row>
            <Col span="24">
            <Card style="margin-bottom: 10px">
                <Form inline>
                    <FormItem style="margin-bottom: 0">
                        <Input v-model="searchConf.advert_title" placeholder="请输入标题" />
                    </FormItem>
                    <FormItem style="margin-bottom: 0">
                        <Select v-model="searchConf.advert_status" clearable placeholder='请选择状态' style="width:150px">
                            <Option :value="-1">所有状态</Option>
                            <Option :value="1">启用</Option>
                            <Option :value="0">禁用</Option>
                        </Select>
                    </FormItem>
                    <FormItem style="margin-bottom: 0">
                        <Select v-model="searchConf.advert_type" style="width:200px" placeholder='请选择类别'>
                            <Option v-for="(v, i) in advertType" :value="i" :key="i"> {{v}} </Option>
                        </Select>
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
                <span>{{formItem.advert_id ? '编辑' : '新增'}}</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="标题" prop="advert_title">
                    <Input v-model="formItem.advert_title" placeholder="请输入标题" />
                </FormItem>
                <FormItem label="图片" prop="advert_image">
                    <div class="demo-upload-list" v-if="formItem.advert_image">
                        <img :src="formItem.advert_image">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
                        </div>
                    </div>
                    <input v-if="formItem.advert_image" v-model="formItem.advert_image" type="hidden" name="image">
                    <Upload type="drag"
                            :action="uploadUrl"
                            :headers="uploadHeader"
                            v-if="!formItem.advert_image"
                            :format="['jpg','jpeg','png']"
                            :max-size="5120"
                            :on-success="handleImgSuccess"
                            :on-format-error="handleImgFormatError"
                            :on-exceeded-size="handleImgMaxSize"
                            style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="camera" size="20"></Icon>
                        </div>
                    </Upload>
                </FormItem>
                <FormItem label="类型" prop="advert_type">
                    <Select v-model="formItem.advert_type" style="width:200px">
                        <Option v-for="(value, key, index) in advertType" :value="key" :key="index">{{value}} </Option>
                    </Select>
                </FormItem>
                <FormItem label="跳转类型" prop="advert_jump_type">
                    <Select v-model="formItem.advert_jump_type" style="width:200px">
                        <Option v-for="(value, key, index) in advertJump" :value="value.jump_id" :key="index"> {{value.name}} </Option>
                    </Select>
                </FormItem>
                <FormItem label="跳转id" prop="advert_jump_id">
                    <Input v-model="formItem.advert_jump_id" placeholder="请去对应的类型下面查到对应的序号" />
                </FormItem>
                <FormItem label="排序" prop="advert_sort">
                    <Input v-model="formItem.advert_sort" placeholder="请输入排序，从小到大排序" />
                </FormItem>
                <FormItem label="状态" prop="advert_status">
                    <Select v-model="formItem.advert_status" style="width:200px">
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
    import Input from "iview/src/components/input/input";

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
                    vm.formItem.advert_id = currentRow.advert_id;
                    vm.formItem.advert_title = currentRow.advert_title;
                    vm.formItem.advert_sort = currentRow.advert_sort;
                    vm.formItem.advert_url = currentRow.advert_url;
                    vm.formItem.advert_image = currentRow.advert_image;
                    vm.formItem.advert_type = currentRow.advert_type;
                    vm.formItem.advert_status = currentRow.advert_status;
                    vm.formItem.advert_jump_type = currentRow.advert_jump_type;
                    vm.formItem.advert_jump_id = currentRow.advert_jump_id;
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
                    axios.get('Advert/del', {
                        params: {
                            id: currentRow.advert_id
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
        name: 'setting_advert',
        components: {Input},
        data () {
            return {
                confirmRefresh: false,
                columnsList: [
                    {
                        title: '序号',
                        key: 'advert_id',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '名称',
                        align: 'center',
                        key: 'advert_title'
                    },
                    {
                        title: '类别',
                        align: 'center',
                        key: 'advert_type_trans'
                    },
                    {
                        title: '图片',
                        align: 'center',
                        key: 'advert_image',
                        width: 90,
                        render: (h, params) => params.row.advert_image ? h('img', {
                            attrs: {
                                src: params.row.advert_image,
                                width: '60px',
                                height: '60px'
                            }
                        }) : ''
                    },
                    {
                        title: '排序',
                        align: 'center',
                        key: 'advert_sort',
                        width: 90
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'advert_status_trans',
                        width: 90
                    },
                    {
                        title: '时间',
                        align: 'center',
                        key: 'create_time_trans',
                        width: 150
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        width: 170,
                        handle: ['edit', 'delete']
                    }
                ],
                tableData: [],
                advertType: [],
                advertJump: [],
                tableShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0
                },
                searchConf: {
                    advert_status: '',
                    advert_title: '',
                    advert_type: ''
                },
                modalSetting: {
                    show: false,
                    loading: false,
                    index: 0
                },
                formItem: {
                    advert_id: 0,
                    advert_image: '',
                  advert_type:0
                },
                ruleValidate: {
                    advert_title: [
                        {required: true, message: '名称不能为空', trigger: 'blur'}
                    ]
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
                });
                axios.get('Advert/getAdvertType').then(function (response) {
                    let res = response.data;
                    if (res.code === 1) {
                        vm.advertType = res.data.list;
                        vm.advertJump = res.data.jumpList;
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
                this.uploadUrl = config.baseUrl + 'Index/upload';
                this.uploadHeader = {'justTokn': sessionStorage.getItem('justTokn')};
            },
            alertAdd () {
                this.modalSetting.show = true;
            },
            submit () {
                let self = this;
                this.$refs['myForm'].validate((valid) => {
                    if (valid) {
                        self.modalSetting.loading = true;
                        let target = '';
                        if (this.formItem.advert_id === 0) {
                            target = 'Advert/add';
                        } else {
                            target = 'Advert/edit';
                        }
                        axios.post(target, self.formItem).then(function (response) {
                            self.modalSetting.loading = false;
                            if (response.data.code === 1) {
                                self.$Message.success(response.data.msg);
                                self.getList();
                                self.cancel();
                            } else {
                                self.$Message.error(response.data.msg);
                            }
                        });
                    }
                });
            },
            cancel () {
                this.modalSetting.show = false;
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
                axios.get('Advert/getList', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        type: vm.searchConf.type,
                        advert_status: vm.searchConf.advert_status,
                        advert_title: vm.searchConf.advert_title,
                        advert_type: vm.searchConf.advert_type
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
            doCancel (data) {
                if (!data) {
                    this.formItem.advert_id = 0;
                    this.$refs['myForm'].resetFields();
                    this.modalSetting.loading = false;
                    this.modalSetting.index = 0;
                }
            },
            handleImgFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型不合法',
                    desc: file.name + '的文件类型不正确，请上传jpg或者png图片。'
                });
            },
            handleImgRemove () {
                this.formItem.advert_image = '';
            },
            handleImgSuccess (response) {
                if (response.code === 1) {
                    this.$Message.success(response.msg);
                    this.formItem.advert_image = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            },
            handleImgMaxSize (file) {
                this.$Notice.warning({
                    title: '文件大小不合法',
                    desc: file.name + '太大啦请上传小于5M的文件。'
                });
            }
        }
    };
</script>
