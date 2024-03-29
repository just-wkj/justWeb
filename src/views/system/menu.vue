<style lang="less" scoped>
    @import './menu.less';
</style>

<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title" style="height: 32px">
                        <Button type="primary" @click="alertAdd" icon="plus-round">新增</Button>
                    </p>
                    <div>
                        <Table :loading="tableLoading" :columns="columnsList" :data="tableData" border disabled-hover></Table>
                    </div>
                </Card>
            </Col>
        </Row>
        <Modal v-model="modalSetting.show" width="668" :styles="{top: '30px'}" @on-visible-change="doCancel">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="information-circled"></Icon>
                <span>{{formItem.id ? '编辑' : '新增'}}菜单</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="菜单名称" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入菜单名称"></Input>
                </FormItem>
                <FormItem label="父级菜单" prop="fid">
                    <Select v-model="formItem.fid" filterable>
                        <Option :value="0">顶级菜单</Option>
                        <Option v-for="item in tableData" :value="item.id" :key="item.id">{{ item.showName }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="菜单URL" prop="url">
                    <Input v-model="formItem.url" placeholder="请输入菜单URL">
                    <span slot="prepend">admin/</span>
                    </Input>
                </FormItem>
                <FormItem label="菜单排序" prop="sort">
                    <InputNumber :min="0" v-model="formItem.sort"></InputNumber>
                    <Badge count="数字越小越靠前" style="margin-left:5px"></Badge>
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
    import axios from 'axios';
    import JustAxios from '../../just/JustAxios';
    import JustApi from '../../just/JustApi';
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
                    vm.formItem.id = currentRow.id;
                    vm.formItem.name = currentRow.name;
                    vm.formItem.fid = currentRow.fid;
                    vm.formItem.url = currentRow.url.slice(6);
                    vm.formItem.sort = currentRow.sort;
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
                    JustAxios.ajax({
                        url: JustApi.menuDel,
                        data: {
                            id: currentRow.id
                        }
                    }).then(response => {
                        currentRow.loading = false;
                        vm.tableData.splice(index, 1);
                        vm.$Message.success(response.msg);
                    }, fail => {

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
        name: 'system_menu',
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
                        title: '菜单名称',
                        align: 'left',
                        key: 'showName'
                    },
                    {
                        title: '排序',
                        align: 'center',
                        key: 'sort',
                        width: 80
                    },
                    {
                        title: '菜单URL',
                        align: 'left',
                        key: 'url',
                        width: 200
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'hide',
                        width: 100
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        width: 200,
                        handle: ['edit', 'delete']
                    }
                ],
                tableLoading: false,
                tableData: [],
                modalSetting: {
                    show: false,
                    loading: false,
                    index: 0
                },
                formItem: {
                    name: '',
                    fid: 0,
                    url: '',
                    sort: 0,
                    id: 0
                },
                ruleValidate: {
                    name: [
                        { required: true, message: '菜单名称不能为空', trigger: 'blur' }
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
                    if (item.key === 'hide') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('i-switch', {
                                attrs: {
                                    size: 'large'
                                },
                                props: {
                                    'true-value': 1,
                                    'false-value': 0,
                                    value: currentRowData.hide
                                },
                                on: {
                                    'on-change': function (status) {
                                        axios.get('Menu/changeStatus', {
                                            params: {
                                                status: status,
                                                id: currentRowData.id
                                            }
                                        }).then(response => {
                                            this.$Message.success(response.msg);
                                            this.cancel();
                                        }, () => {
                                            this.getList();
                                        });
                                    }
                                }
                            }, [
                                h('span', {
                                    slot: 'open'
                                }, '隐藏'),
                                h('span', {
                                    slot: 'close'
                                }, '显示')
                            ]);
                        };
                    }
                });
            },
            alertAdd () {
                this.modalSetting.show = true;
            },
            submit () {
                this.$refs['myForm'].validate((valid) => {
                    if (valid) {
                        this.modalSetting.loading = true;
                        let url = this.formItem.id === 0 ? JustApi.menuAdd : JustApi.menuEdit;
                        JustAxios.ajax({
                            url,
                            data: this.formItem
                        }).then(res => {
                            this.$Message.success(res.msg);
                            this.getList();
                            this.cancel();
                        }, err => {

                        });
                    }
                });
            },
            cancel () {
                this.modalSetting.show = false;
            },
            doCancel (data) {
                if (!data) {
                    this.formItem.id = 0;
                    this.$refs['myForm'].resetFields();
                    this.modalSetting.loading = false;
                    this.modalSetting.index = 0;
                }
            },
            getList () {
                let vm = this;
                vm.tableLoading = true;
                axios.get('Menu/index').then(response => {
                    this.tableData = response.data.data;
                    this.tableLoading = false;
                });
            }
        }
    };
</script>
