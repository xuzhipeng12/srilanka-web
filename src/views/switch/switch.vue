<template>
  <div class="app-container">
    <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 100%;">
      <el-form-item label="标题" prop="title">
        <el-input v-model="temp.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="说明" prop="description">
        <el-input v-model="temp.description" placeholder="说明" type="textarea" />
      </el-form-item>
      <el-form-item label="版本模板">
        <el-cascader
          ref="refVersionSelect"
          v-model="versionSelectValue"
          :options="versionTemplateCascaderValue"
          :props="{ expandTrigger: 'hover' }"
          clearable
          filterable
          @change="handleChange"
        />
        <el-button icon="el-icon-plus" @click="addTab" />
      </el-form-item>
      <el-form-item label="项目开关">
        <el-tabs v-model="editableTabsValue" type="card" closable @tab-remove="removeTab">
          <el-tab-pane
            v-for="(item) in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name"
          >
            <component :is="item.content" :form-json.sync="item.formJson" :form-data.sync="item.formData" :option-data.sync="item.optionData" />
            <!-- <tab-component :index="index" :name="index"></tab-component> -->
          </el-tab-pane>
        </el-tabs>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="createData()">
        提交
      </el-button>
    </div>
  </div>
</template>
<script>

import { fetchProdcutListDepts } from '@/api/product'
import { fetchVersionSwitchTemplateById } from '@/api/version'
import { createSwitch } from '@/api/switch'

import waves from '@/directive/waves' // waves directive
import TabPane from './components/TabPane'
export default {
  name: 'ComplexTable',
  components: { TabPane },
  directives: { waves },
  filters: {
    // projectFilter(type) {
    //   return calendarTypeKeyValue[type]
    // }
  },
  data() {
    return {
      versionSelectValue: [],
      versionTemplateCascaderValue: [],
      editableTabsValue: '2',
      editableTabs: [],
      tabIndex: 2,
      activeName: 'CN',
      createdTimes: 0,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        project_id: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      temp: {
        title: '',
        description: '',
        data: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改项目',
        create: '创建项目'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请填写说明', trigger: 'blur' }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getProductListDepts()
  },
  methods: {
    getProductListDepts() {
      fetchProdcutListDepts(this.listQuery).then(response => {
        const products = []
        for (const project of response.data) {
          const projects = []
          if (project.projects.length > 0) {
            for (const project of project.projects) {
              const versions = []
              if (project.versions.length > 0) {
                for (const version of project.versions) {
                  versions.push({
                    value: version.id,
                    label: version.version_name,
                    children: undefined
                  })
                }
              }
              projects.push({
                value: project.id,
                label: project.project_name,
                children: versions
              })
            }
          }
          products.push({
            value: project.id,
            label: project.product_name,
            children: projects
          })
        }
        this.versionTemplateCascaderValue = products
      })
    },
    handleChange(currentVal) {
    },
    addTab(targetName) {
      if (this.versionSelectValue.length === 3) {
        const tabTitle = this.$refs['refVersionSelect'].getCheckedNodes()[0].pathLabels.join('/')
        for (const tab of this.editableTabs) {
          if (tab.title === tabTitle) {
            this.$notify({
              title: '警告',
              message: '重复添加',
              type: 'warning',
              duration: 2000
            }).then(() => { return })
          }
        }
        fetchVersionSwitchTemplateById({ id: this.versionSelectValue[2] }).then(response => {
          const newTabName = ++this.tabIndex + ''
          this.editableTabs.push({
            title: tabTitle,
            name: newTabName,
            content: TabPane,
            formJson: response.data.template,
            formData: {},
            optionData: {},
            productID: this.versionSelectValue[0],
            projectID: this.versionSelectValue[1],
            versionID: this.versionSelectValue[2]
          })
          this.editableTabsValue = newTabName
        })
      } else {
        this.$notify({
          title: '警告',
          message: '请选择正确版本模板',
          type: 'warning',
          duration: 2000
        })
      }
    },
    resetTemp() {
      this.temp.title = ''
      this.temp.description = ''
      this.temp.data = []
    },
    removeTab(targetName) {
      const tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter(tab => tab.name !== targetName)
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.editableTabs.length <= 0) {
            this.$notify({
              title: '警告',
              message: '请选择版本模板并填写',
              type: 'warning',
              duration: 2000
            })
          } else {
            for (const tab of this.editableTabs) {
              const aaa = {
                'tabTitle': tab.title,
                'newTabName': tab.newTabName,
                'productID': tab.productID,
                'projectID': tab.projectID,
                'versionID': tab.versionID,
                'formJson': tab.formJson,
                'formData': tab.formData,
                'optionData': tab.optionData
              }
              this.temp.data.push(aaa)
            }
            createSwitch(this.temp).then(response => {
              this.temp.id = response.data.id
              this.$notify({
                title: 'Success',
                message: response.message,
                type: 'success',
                duration: 2000
              })
              this.$router.push({ path: '/switch/switch-list' })
            })
          }
        }
      })
    }
  }
}
</script>
