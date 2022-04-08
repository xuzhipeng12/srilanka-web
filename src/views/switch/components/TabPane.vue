<template>
  <div>
    <v-form-render ref="vFormRef" :form-json="formJson" :form-data="formData" :option-data="optionData" @formChange="handleFormChange" />
  </div>
</template>

<script>
export default {
  props: ['formJson', 'formData', 'optionData'],
  data() {
    return {
    }
  },
  created() {
  },
  mounted() {
    this.handleFormMounted()
  },
  methods: {
    handleFormMounted() {
      // this.$emit('update:formData', this.$refs['vFormRef'].getFormData())
      this.$refs['vFormRef'].getFormData().then(formdata => {
        this.$emit('update:formData', formdata)
      })
    },
    handleFormChange() {
      this.$refs['vFormRef'].getFormData().then(formdata => {
        this.$emit('update:formData', formdata)
      })
    }
  }
}
</script>

