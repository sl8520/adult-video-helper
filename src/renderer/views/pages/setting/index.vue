<template>
  <div class="app-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="命名規則" name="nameRule">
        <el-form ref="editForm" :model="editForm" :rules="editRules" label-width="100px" label-position="left">
          <el-form-item label="封面格式" prop="cover">
            <el-input v-model="editForm.cover" />
          </el-form-item>
          <el-form-item label="劇照格式" prop="stills">
            <el-input v-model="editForm.stills" />
          </el-form-item>
          <el-form-item label="影音格式" prop="video">
            <el-input v-model="editForm.video" />
          </el-form-item>

          <el-alert
            title="變數取代可使用項目"
            type="error"
            :closable="false"
          >
            <template>
              <div class="description" v-for="(item, key) in rules" :key="key">
                %{{ key }}% : {{ item }}
              </div>
            </template>
          </el-alert>
        </el-form>

        <div class="button-container">
          <footer-button @cancel="resetRule" @submit="saveRule" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import FooterButton from '@/components/FooterButton'

export default {
  name: 'Setting',
  components: {
    FooterButton,
  },
  data() {
    return {
      activeTab: 'nameRule',
      originData: Object.assign({}, this.$store.state.settings),
      editForm: {
        cover: '',
        stills: '',
        video: '',
      },
      editRules: {
        cover: [{ required: true, trigger: 'blur', message: '請填寫封面格式規則' }],
        stills: [{ required: true, trigger: 'blur', message: '請填寫劇照格式規則' }],
        video: [{ required: true, trigger: 'blur', message: '請填寫影音格式規則' }],
      },
      rules: {
        id: '番號',
        date: '發行日期',
        length: '長度',
        director: '導演',
        maker: '製作商',
        studio: '發行商',
        series: '系列',
        genre: '類別',
        actor: '演員',
      },
    }
  },
  created() {
    this.resetRule(true)
  },
  methods: {
    resetRule(hideMessage) {
      this.editForm = Object.assign({}, this.originData)

      if (!hideMessage) {
        this.$message({
          type: 'warning',
          message: '已還原原始設定',
        })
      }
    },
    saveRule() {
      Object.keys(this.editForm).forEach(key => {
        this.$store.dispatch('settings/changeSetting', {
          key,
          value: this.editForm[key],
        })
      })

      this.$message({
        type: 'success',
        message: '設定已儲存',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
  .description {
    margin-bottom: 8px;
  }
</style>
