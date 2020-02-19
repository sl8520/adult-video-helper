<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="20">
          <el-button icon="el-icon-files" class="filter-item" @click="handleDirectory">選擇資料夾</el-button>
        </el-col>
        <el-col :span="4" class="text-right">
          <el-button icon="el-icon-download" type="danger" class="filter-item" plain @click="handleDownload">開始下載</el-button>
        </el-col>
      </el-row>
    </div>

    <el-table
      v-loading="loading"
      :data="list | pagination(listQuery.page, listQuery.limit)"
      row-key="originId"
      stripe
      border
      fit
      highlight-current-row
    >
      <el-table-column width="100" align="center" prop="originId" label="原始檔名">
        <template slot-scope="scope">
          <span>{{ scope.row.originId }}</span>
        </template>
      </el-table-column>
      <el-table-column width="90" align="center" prop="id" label="番號">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" align="center" prop="date" label="發行日期">
        <template slot-scope="scope">
          <span>{{ scope.row.date }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="length" label="長度">
        <template slot-scope="scope">
          <span>{{ scope.row.length }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="director" label="導演">
        <template slot-scope="scope">
          <span>{{ scope.row.director }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="maker" label="製作商">
        <template slot-scope="scope">
          <span>{{ scope.row.maker }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="studio" label="發行商">
        <template slot-scope="scope">
          <span>{{ scope.row.studio }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="series" label="系列">
        <template slot-scope="scope">
          <span>{{ scope.row.series }}</span>
        </template>
      </el-table-column>
      <el-table-column width="400" align="center" prop="genre" label="類別">
        <template slot-scope="scope">
          <span>{{ scope.row.genre }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="actor" label="演員">
        <template slot-scope="scope">
          <span>{{ scope.row.actor }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" align="center" prop="cover" label="封面圖">
        <template slot-scope="scope">
          <img class="max-width-100-percent" :src="scope.row.cover" alt="">
        </template>
      </el-table-column>
      <el-table-column width="500" align="center" prop="stills" label="劇照">
        <template slot-scope="scope">
          <img v-for="item in scope.row.stills" :key="item" class="width-10-percent" :src="item" alt="">
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'Home',
  components: {
    Pagination,
  },
  filters: {
    pagination(array, page, limit) {
      const offset = (page - 1) * limit
      const data = (offset + limit >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + limit)
      return data
    },
  },
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      directory: [],
      listQuery: {
        page: 1,
        limit: 10,
      },
    }
  },
  created() {
    this.$electron.ipcRenderer.on('tableList', (event, { list, directory }) => {
      this.list = list
      this.total = list.length
      this.directory = directory
      this.loading = false
    })
  },
  beforeDestroy() {
    this.$electron.ipcRenderer.removeAllListeners('tableList')
  },
  methods: {
    handleDirectory() {
      this.loading = true
      this.$electron.ipcRenderer.send('openDirectory')
    },
    handleDownload() {
      if (!this.directory.length) {
        this.$message({
          message: '資料夾為空',
          type: 'error',
        })
      }
      this.$electron.ipcRenderer.send('download', this.directory)
    },
  },
}
</script>

<style lang="scss" scoped>
.max-width-100-percent {
  max-width: 100%;
}

.width-10-percent {
  width: 10%;
}
</style>
