<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
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
      <el-table-column label="产品ID" prop="id" sortable="custom" align="center" width="100" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_by }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.create_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-receiving"
            @click="handleShow(row)"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-share"
            @click="handleShare(row)"
          >分享</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(row,$index)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :fullscreen="true">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 100%;">
        <el-form-item v-show="dialogStatus==='show'" label="产品名" prop="product_name">
          <el-input v-model="temp.title" placeholder="产品名" />
        </el-form-item>
        <el-form-item v-show="dialogStatus==='show'" label="产品说明" prop="description">
          <el-input v-model="temp.description" placeholder="产品说明" type="textarea" />
        </el-form-item>
        <el-form-item v-show="dialogStatus==='share'" label="分享连接">
          <span>{{ temp.shareUrl }}</span>
          <el-button v-clipboard:copy="temp.shareUrl" v-clipboard:success="onCopy" v-clipboard:error="onError" size="mini" type="text" icon="el-icon-document-copy">复制连接</el-button>
        </el-form-item>
        <el-form-item label="项目开关" prop="description">
          <el-tabs v-model="editableTabsValue" type="card" closable>
            <el-tab-pane
              v-for="(item) in editableTabs"
              :key="item.name"
              :label="item.title"
              :name="item.name"
            >
              <component :is="item.content" :form-json="item.formJson" :form-data="item.formData" :option-data="item.optionData" />
              <!-- <tab-component :index="index" :name="index"></tab-component> -->
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">
          关闭
        </el-button>
        <el-button type="primary" @click="downloadYaml(temp)">
          下载yaml
        </el-button>
        <el-button v-show="dialogStatus==='update'" type="primary" @click="updateData()">
          更新
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deleteSwitch, fetchSwitchList, updateSwitch } from '@/api/switch'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import TabPane from './components/TabPane'
import { saveAs } from 'file-saver'
export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tabIndex: 2,
      editableTabsValue: '',
      editableTabs: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      temp: {
        product_name: '',
        description: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        show: '查看',
        share: '分享'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        product_name: [
          { required: true, message: '请选择产品', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请设计模版', trigger: 'blur' }
        ]
      },
      downloadLoading: false,
      origin: window.location.origin
    }
  },
  created() {
    this.getList()
  },
  methods: {
    onCopy(e) {
      this.$message.success('内容已复制到剪切板！')
    },
    // 复制失败时的回调函数
    onError(e) {
      this.$message.error('抱歉，复制失败！')
    },
    dialogClose() {
      this.dialogFormVisible = false
      this.resetTemp()
    },
    getList() {
      this.listLoading = true
      fetchSwitchList(this.listQuery).then(response => {
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
        'title': '',
        'description': '',
        'shareUrl': '',
        'data': []
      }
      // this.tabIndex = 2
      this.editableTabs = []
      // this.editableTabsValue = '2'
    },
    handleShow(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.renderTab()
      this.dialogStatus = 'show'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        // this.$refs['dataForm'].clearValidate()
      })
    },
    handleShare(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.shareUrl = this.origin + '/#/switchshare?id=' + this.temp.id + '&shareToken=' + this.temp.share_token
      this.renderTab()
      this.dialogStatus = 'share'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        // this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.renderTab()
      this.$nextTick(() => {
        // this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateSwitch(tempData).then(response => {
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
    renderTab() {
      for (const tab of this.temp.data) {
        this.editableTabs.push({
          title: tab.tabTitle,
          name: tab.newTabName,
          content: TabPane,
          formJson: tab.formJson,
          formData: tab.formData,
          optionData: tab.optionData,
          productID: tab.productID,
          projectID: tab.projectID,
          versionID: tab.versionID
        })
      }
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).then(() => {
        const tempData = Object.assign({}, row)
        deleteSwitch(tempData).then(response => {
          const index = this.list.findIndex(v => v.id === row.id)
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
    downloadYaml(data) {
      console.info(data.data)
      var json2yaml = require('json2yaml')
      for (var i = 0; i < data.data.length; i++) {
        var formData = data.data[i].formData
        const forTn = []
        for (var key in formData) {
          forTn.push({
            'name': key,
            'value': formData[key]
          })
        }
        console.info(forTn)
        this.yamlStr = json2yaml.stringify(forTn)
        saveAs(new Blob([this.yamlStr]), data.title + '-' + data.data[i].tabTitle + '.yaml')
      }
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
