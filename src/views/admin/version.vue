<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增版本
      </el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出版本列表
      </el-button> -->
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="版本ID" prop="id" sortable="custom" align="center" width="100" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="版本名" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.version_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.create_by }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.update_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新人" align="center" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.update_by }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属产品" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.project_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            更新
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="所属项目" prop="project_id">
          <el-select v-model="temp.project_id" placeholder="所属项目名" clearable class="filter-item">
            <el-option v-for="item in proejcts" :key="item.id" :label="item.project_name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本名" prop="version_name">
          <el-input v-model="temp.version_name" placeholder="请输入版本名" />
        </el-form-item>
        <el-form-item label="版本说明" prop="description">
          <el-input v-model="temp.description" placeholder="请输入版本说明" type="textarea" />
        </el-form-item>
        <el-form-item label="绑定模板" prop="switch_template_id">
          <el-select v-model="temp.switch_template_id" placeholder="所属项目名" clearable class="filter-item">
            <el-option v-for="item in switchTemplates" :key="item.id" :label="item.template_name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchProjectList } from '@/api/project'
import { fetchVersionList, createVersion, updateVersion, deleteVersion } from '@/api/version'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

import { fetchSwitchTemplateList } from '@/api/switch-template'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    // versionFilter(type) {
    //   return calendarTypeKeyValue[type]
    // }
  },
  data() {
    return {
      proejcts: [],
      switchTemplates: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        version_id: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      temp: {
        project_id: undefined,
        switch_template_id: undefined,
        version_name: '',
        description: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改版本',
        create: '创建版本'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        project_id: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ],
        version_name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请设计模版', trigger: 'blur' }
        ],
        switch_template_id: [
          { required: true, message: '请选择项目', trigger: 'change' }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.getPrjectList()
    this.getSwitchTemplateList()
  },
  methods: {
    getPrjectList() {
      const tempData = Object.assign({}, this.listQuery)
      tempData.limit = -1
      fetchProjectList(tempData).then(response => {
        this.proejcts = response.data.data
      })
    },
    getSwitchTemplateList() {
      const tempData = Object.assign({}, this.listQuery)
      tempData.limit = -1
      fetchSwitchTemplateList(tempData).then(response => {
        this.switchTemplates = response.data.data
      })
    },
    getList() {
      this.listLoading = true
      fetchVersionList(this.listQuery).then(response => {
        this.list = response.data.data
        this.total = response.data.total_count
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        'product_id': undefined,
        'switch_template_id': undefined,
        'version_name': '',
        'description': ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createVersion(this.temp).then(response => {
            this.temp.id = response.data.id
            this.list === null ? this.list = [] : this.list
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: response.message,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateVersion(tempData).then(response => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: response.message,
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const tempData = Object.assign({}, row)
        deleteVersion(tempData).then(response => {
          const index = this.list.findIndex(v => v.id === this.temp.id)
          this.list.splice(index, 1)
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
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['id', 'title', 'type', 'importance', 'status']
        const filterVal = ['id', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
