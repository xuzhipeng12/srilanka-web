<template>
  <div class="app-container">
    <el-alert title="这里对开关的修改无效,下载yaml里仍为原始开关, 如需修改请联系分享分重新创建!! " type="error" />
    <el-form ref="dataForm" :model="temp" label-position="left" label-width="100px" style="width: 100%;">
      <el-form-item label="产品名" prop="product_name">
        <el-input v-model="temp.title" placeholder="请输入产品名" />
      </el-form-item>
      <el-form-item label="产品说明" prop="description">
        <el-input v-model="temp.description" placeholder="请输入产品说明" type="textarea" />
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
      <el-button type="primary" @click="downloadYaml(temp)">
        下载yaml
      </el-button>
    </div>
  </div>
</template>

<script>
import { fetchSwitchById } from '@/api/switch'
import waves from '@/directive/waves' // waves directive
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
        id: this.$route.query.id,
        shareToken: this.$route.query.shareToken,
        sort: '+id'
      },
      temp: {
        product_name: '',
        description: ''
      },
      dialogFormVisible: false,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    console.error()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchSwitchById(this.listQuery).then(response => {
        this.temp = response.data
        this.renderTab()
        this.listLoading = false
      })
    },
    handleShow(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.renderTab()
      this.dialogStatus = 'show'
      this.dialogFormVisible = true
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
    }
  }
}
</script>
