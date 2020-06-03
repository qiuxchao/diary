<template>
	<view>
		<u-navbar back-text="返回" title="写日记" :background="background"></u-navbar>
		
		<!-- 内容 -->
		<jinEdit 
		:html="html" 
		:showImgSize="false" 
		:showImgToolbar="false" 
		placeholder="请输入内容" 
		@editOk="editOk" 
		uploadFileUrl="http://192.168.1.169:8080/note/imgUpload" 
		:networkVideoPaths="networkVideoPaths"
		></jinEdit> 
		
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
				html: "<h1>Hello</h1>",  // 日记内容
				networkVideoPaths: [],	// 音频文件
			};
		},
		onLoad(data) {
			// 页面加载完成，获取上个页面传来的笔记的id
			// 通过日记id获取 html 字符串，音频文件数组，赋值给 data 中的 html，再传入富文本组件进行解析
			console.log(data.id);
			
		},
		onReady() {
			// 进入页面，获取日记id

			uni.request({
				url: "http://192.168.1.169:8080/note/createSql",
				method: "GET"
			}).then(res => {
				console.log('创建空记录');
			}).catch(err => {
				console.log(err);
			});
			
		},
		onUnload() {
			console.log("页面卸载");
		},
		methods: {
			editOk(html) {
				// 富文本编辑器注册的事件，接受的值是 html 字符串
				// console.log(html);
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
