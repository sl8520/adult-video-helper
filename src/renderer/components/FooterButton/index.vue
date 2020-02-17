<template>
  <div class="buttonGroup">
    <hr>
    <slot name="buttons">
      <el-button class="cancel" @click="cancel">
        取消
      </el-button>
      <el-button class="submit" @click="submit">
        儲存
      </el-button>
    </slot>
  </div>
</template>
<script>
export default {
  name: 'FooterButton',
  methods: {
    submit() {
      this.$emit('submit')
    },
    cancel() {
      this.$emit('cancel')
    },
  },
}
</script>
<style lang="scss" scoped>
.buttonGroup {
  display: block;
  width: 100%;
  height: 3rem;
  // position: absolute;
  // left: 0;
  // bottom: 0;
  background: #FFFFFF;
  z-index: 9;
  margin-bottom: 0;
  border-top: 1px solid #ccc;
  text-align: center;

  hr {
    border: 0;
    margin: 0 0 5px 0;
  }

  button {
    color: #FFFFFF;
    height: 2rem;
    line-height: 2rem;
    vertical-align: middle;
    padding: 0 1rem;

    &:hover {
      color: #FFFFFF;
    }
  }

  .submit {
    border: none;
    background: #43725A;

    &:hover {
      border: none;
      background: lighten(#43725A, 5%);
      cursor: pointer;
    }
  }

  .cancel {
    border: none;
    background: #888888;
    &:hover {
      border: none;
      background: lighten(#888888, 5%);
      cursor: pointer;
    }
  }
}
</style>
