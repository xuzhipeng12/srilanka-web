<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增模板
      </el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出项目列表
      </el-button> -->
    </div>
    <el-table
      v-loading="listLoading"
      :data="tplList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" width="70" />
      <el-table-column label="模板名" prop="template_name" :show-overflow-tooltip="true" />
      <el-table-column label="模板说明" prop="description" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="创建时间" align="create_at" prop="create_at" width="150" />
      <el-table-column label="创建人" align="center" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.create_by }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="update_at" prop="update_at" width="180" />
      <el-table-column label="更新人" align="center" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.update_by }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-receiving"
            @click="handleClone(scope.row)"
          >克隆</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :fullscreen="true" style="margin-top: 0;" append-to-body :modal-append-to-body="false">
      <div class="tpl-create-content">
        <el-form ref="dataForm" :model="temp" :rules="rules" label-width="100px">
          <el-form-item label="名称" prop="template_name">
            <el-input v-model="temp.template_name" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="temp.description" type="textarea" />
          </el-form-item>
          <!-- <el-form-item label="模版""> -->
          <v-form-designer ref="vfDesignerRef" v-model="temp.template" :designer-config="designerConfig" style="width: 100%" />
        </el-form>
        <div style="text-align: center">
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
            提交
          </el-button>
          <el-button @click="dialogFormVisible = false">取 消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;  /* 如果页面出现垂直滚动条，则加入此行CSS以消除之 */
}
</style>

<script>

import { fetchSwitchTemplateList, createSwitchTemplate, updateSwitchTemplate, deleteSwitchTemplate } from '@/api/switch-template'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'Template',
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      dialogStatus: '',
      designerConfig: {
        //   //是否显示语言切换菜单
        languageMenu: true,
        //   //是否显示GitHub、文档等外部链接
        externalLink: false,
        //   //是否显示导入JSON按钮
        importJsonButton: true,
        //   //是否显示导出JSON器按钮
        exportJsonButton: true,
        //   //是否显示导出代码按钮
        exportCodeButton: false,
        //   //是否显示生成SFC按钮
        generateSFCButton: false,
        //   //工具按钮栏最大宽度（单位px）
        //   //如新增按钮后不可见，请调大
        //   //如右侧空白区域过大，请调小
        toolbarMaxWidth: 0,
        //   //工具栏按钮最小宽度（单位px）
        //   //值必须小于toolbarMaxWidth
        toolbarMinWidth: 0
      },
      temp: {
        id: undefined,
        version_id: '',
        template_name: '',
        description: '',
        template: ''
      },
      textMap: {
        update: '修改模板',
        create: '创建模板'
      },

      queryParams: {},
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 是否显示弹出层
      dialogFormVisible: false,
      // 查询参数
      tplList: [],
      listQuery: {
        page: 1,
        limit: 20,
        name: ''
      },
      rules: {
        template_name: [
          { required: true, message: '请输入模版名称', trigger: 'blur' }
        ],
        template: [
          { required: true, message: '请设计模版', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchSwitchTemplateList(this.listQuery).then(response => {
        this.tplList = response.data.data
        this.total = response.data.total_count
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 300)
      })
    },
    handleCreate() {
      this.temp = {
        id: undefined,
        template_name: '',
        description: '',
        template: ''
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.vfDesignerRef.clearDesigner()
        this.$refs.dataForm.clearValidate()
      })
    },
    handleEdit(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.vfDesignerRef.setFormJson(this.temp.template)
      })
    },
    createData(row) {
      this.handleSave(this.$refs.vfDesignerRef.getFormJson())
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createSwitchTemplate(this.temp).then(response => {
            this.temp.id = response.data.id
            this.tplList === null ? this.tplList = [] : this.tplList
            this.tplList.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: response.message,
              type: 'success',
              duration: 2000
            }).$nextTick(() => {
              this.dialogFormVisible = false
            })
          })
        }
      })
    },
    updateData() {
      this.handleSave(this.$refs.vfDesignerRef.getFormJson())
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateSwitchTemplate(this.temp).then(response => {
            const index = this.tplList.findIndex(v => v.id === this.temp.id)
            this.tplList.splice(index, 1, this.temp)
            this.$notify({
              title: 'Success',
              message: response.message,
              type: 'success',
              duration: 2000
            }).$nextTick(() => {
              this.dialogFormVisible = false
            })
          })
        }
      })
    },
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.queryParams.pageSize = 10
      this.getList()
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        const tempData = Object.assign({}, row)
        deleteSwitchTemplate(tempData).then(response => {
          const index = this.tplList.findIndex(v => v.id === this.temp.id)
          this.tplList.splice(index, 1)
          this.$notify({
            title: 'Success',
            message: response.message,
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSave(values) {
      if (values.widgetList.length > 0) {
        this.temp.template = values
      } else {
        this.temp.template = ''
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleClone(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.template_name = this.temp.template_name + ' COPY'
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.vfDesignerRef.setFormJson(this.temp.template)
      })
    }
  }
}

</script>
