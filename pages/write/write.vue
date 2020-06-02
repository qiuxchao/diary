<template>
	<view>
		<u-navbar back-text="返回" title="写日记" :background="background"></u-navbar>
		
		
		<!-- 内容 -->
		<!-- <editor id="editor" class="ql-container" placeholder="内容..." @ready="onEditorReady"></editor> -->
		<!-- <button type="warn" @tap="undo">撤销</button> -->
		
		<jinEdit :showImgSize="false" :showImgToolbar="false" placeholder="请输入内容" @editOk="editOk" uploadFileUrl="http://192.168.1.169:8080/note/imgUpload"></jinEdit> 
		
	</view>
</template>

<script>
	// 引入富文本编辑器插件
	import jinEdit from '../../components/jin-edit/jin-edit.vue';
	export default {
		data() {
			return {
				background: {
					// 渐变色
					backgroundImage: 'linear-gradient(45deg, rgb(28, 187, 180), rgb(141, 198, 63))'
				},
				placeholder: "",
				content: ""  // 日记内容
			};
		},
		methods: {
			onEditorReady() {
				uni.createSelectorQuery().select('#editor').context((res) => {
					this.editorCtx = res.context
				}).exec()
			},
			undo() {
				this.editorCtx.undo()
			},
			editOk(res) {
				// console.log(res);
			}
		},
		components: {
			// 注册组件
			jinEdit
		}
	}
</script>

<style lang="scss">
	.title {
		height: 50rpx;
		font-size: 40rpx;
		padding: 5rpx 10rpx;
	}
	.ql-container {
		padding: 5rpx 10rpx;
		font-size: 30rpx;
	}
</style>
