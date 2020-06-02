<template>
	<view class="container" :style="{
		paddingBottom: showMoreTool ? '220rpx' : '120rpx'
	}"> 
		<editor
			class="ql-container"
			:placeholder="placeholder"
			:show-img-size="true"
			:show-img-toolbar="true"
			:show-img-resize="true"
			@ready="onEditorReady"
			id="editor"
			@statuschange="statuschange"
			@focus="editFocus" 
			@blur="editBlur"
			ref="editot"
		></editor>   
		<!-- 操作工具 -->
		<view class="tool-view" > 
			<view class="tool">
				<jinIcon class="single" type="&#xe6f3;" font-size="44rpx" title="插入图片" @click="insertImage"></jinIcon>
				<jinIcon class="single" type="&#xe6f9;" font-size="44rpx" title="修改文字样式" @click="showMore" :color="showMoreTool ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6eb;" font-size="44rpx" title="分割线" @click="insertDivider"></jinIcon>
				<jinIcon class="single" type="&#xe6e8;" font-size="44rpx" title="撤销" @click="undo"></jinIcon>
				<jinIcon class="single" type="&#xe705;" font-size="44rpx" title="重做" @click="redo"></jinIcon>
				<jinIcon class="single" type="&#xeb8a;" font-size="44rpx" title="设置" @click="showSetting"></jinIcon>
			</view>
			<!-- 文字相关操作 -->
			<view class="font-more" :style="{ height: showMoreTool ? '100rpx' : 0 }">
				<jinIcon class="single" type="&#xe6e7;" font-size="44rpx" title="加粗" @click="setBold" :color="showBold ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6fe;" font-size="44rpx" title="斜体" @click="setItalic" :color="showItalic ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6f8;" font-size="44rpx" title="分割线" @click="setIns" :color="showIns ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6e3;" font-size="44rpx" title="标题" @click="setHeader" :color="showHeader ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6f1;" font-size="44rpx" title="居中" @click="setCenter" :color="showCenter ? activeColor : '#666666'"></jinIcon>
				<jinIcon class="single" type="&#xe6ed;" font-size="44rpx" title="居右" @click="setRight" :color="showRight ? activeColor : '#666666'"></jinIcon>
			</view>
			<view class="setting-layer-mask" v-if="showSettingLayer" @click="showSetting"></view>
			
			<!-- 对号提交按钮 -->
			<view class="setting-layer" v-if="showSettingLayer">
				<view class="single" @click="release(true)">
					<jinIcon class="icon" type="&#xe639;" ></jinIcon>
					<view>公开发布</view>
				</view>
				<view class="single" @click="release(false)">
					<jinIcon class="icon" type="&#xe655;" ></jinIcon>
					<view>私密保存</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import jinIcon from './jin-icons.vue';
export default {
	props: {
		// 点击图片时显示图片大小控件
		showImgSize: {
			type: Boolean,
			default: false
		},
		// 点击图片时显示工具栏控件
		showImgToolbar: {
			type: Boolean,
			default: false
		},
		// 点击图片时显示修改尺寸控件
		showImgResize: {
			type: Boolean,
			default: false
		},
		// 占位符
		placeholder: {
			type: String,
			default: '开始输入...'
		},
		// 图片上传的地址
		uploadFileUrl: {
			type: String,
			default: '#'
		},
		// 上传文件时的name
		fileKeyName: {
			type: String,
			default: 'file'
		},
		// 上传图片时，http请求的header
		header: {
			type: Object
		},
		// 初始化html
		html: {
			type: String
		}
	},
	computed:{
		
	},
	data() {
		return {
			showMoreTool: false,  // 是否显示更多工具
			showBold: false,	// 是否显示字体加粗按钮
			showItalic: false,  // 是否显示字体倾斜按钮
			showIns: false,	 	// 是否显示下划线按钮
			showHeader: false,	// 是否显示标题按钮
			showCenter: false,  // 是否显示居中按钮
			showRight: false,   // 是否显示右对齐按钮
			showSettingLayer: false,  // 是否显示设置层
			activeColor: '#F56C6C',  // 选中样式
			localeImgPaths: {},	// 选择的所有本地图片路径
			networkImgPaths: []	// 接受到接口返回的网络路径
		};
	},
	components: {
		jinIcon
	},
	created() {
		
	},
	methods: {
		onEditorReady(e) {
			// 编辑器初始化完成时触发
			uni.createSelectorQuery()
				.in(this)
				.select('.ql-container')
				.fields({
					size: true,
					context: true
				},res => {
					this.editorCtx = res.context;
					this.editorCtx.setContents({
						html: this.html
					})
				})
				.exec();
		},
		undo() {
			// 清空内容
			this.editorCtx.undo();
		},
		// 插入图片
		insertImage() {
			// 选择图片
			uni.chooseImage({
				count: 9, // 默认9
				sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], //从相册选择
				success: async(res) => {  // 图片选择成功
					// console.log(res);
					// var tempFilePaths = res.tempFilePaths;
					// 拿到图片的本地路径
					var tempFilePaths = res.tempFilePaths;
					uni.showLoading({
						// 加载动画
						// title: '正在上传中...'
						title: ''
					});
					// 选择图片完成后处理
					for (let tempFilePath of tempFilePaths) {
						this.editorCtx.insertImage({
							src: tempFilePath,  // 将当前图片设置为本地路径
							alt: '图片',
							success: function(e) {}
						});
						// 关闭加载动画
						uni.hideLoading();
						console.log(tempFilePath);
						// 将当前图片添加到图片数组
						this.localeImgPaths.push({uri: tempFilePath, name: tempFilePath});
					}

					
					// // 遍历包含所有的图片本地路径的数组
					// for (let temp of tempFilePaths) {
					// 	// 图片上传服务器
					// 	await uni.uploadFile({
					// 		url: this.uploadFileUrl,  // 接收的接口地址
					// 		filePath: temp,	// 要上传文件资源的本地路径
					// 		name: this.fileKeyName,  // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容	
					// 		header: this.header,	// HTTP 请求 Header, header 中不能设置 Referer。
					// 		success: res => {
					// 			// 上传完成后处理
					// 			this.editorCtx.insertImage({
					// 				src: temp,  // 此处需要将图片地址切换成服务器返回的真实图片地址
					// 				alt: '图片',
					// 				success: function(e) {}
					// 			});
					// 			uni.hideLoading()
					// 		},
							
					// 	});
					// }
				}
			});
		},
		// 插入分割线
		insertDivider() {
			this.editorCtx.insertDivider();
		},
		// 撤销
		redo() {
			this.editorCtx.redo();
		},
		// 修改文字样式
		showMore() {
			this.showMoreTool = !this.showMoreTool;
			this.editorCtx.setContents()
		},
		setBold() {
			this.showBold = !this.showBold;
			this.editorCtx.format('bold');
		},
		setItalic() {
			this.showItalic = !this.showItalic;
			this.editorCtx.format('italic');
		},
		checkStatus(name, detail, obj) {
			if (detail.hasOwnProperty(name)) {
				this[obj] = true;
			} else {
				this[obj] = false;
			}
		},
		statuschange(e) {
			var detail = e.detail;
			this.checkStatus('bold', detail, 'showBold');
			this.checkStatus('italic', detail, 'showItalic');
			this.checkStatus('ins', detail, 'showIns');
			this.checkStatus('header', detail, 'showHeader');
			if (detail.hasOwnProperty('align')) {
				if (detail.align == 'center') {
					this.showCenter = true;
					this.showRight = false;
				} else if (detail.align == 'right') {
					this.showCenter = false;
					this.showRight = true;
				} else {
					this.showCenter = false;
					this.showRight = false;
				}
			} else {
				this.showCenter = false;
				this.showRight = false;
			}
		},
		setIns() {
			this.showIns = !this.showIns;
			this.editorCtx.format('ins');
		},
		setHeader() {
			this.showHeader = !this.showHeader;
			this.editorCtx.format('header', this.showHeader ? 'H2' : false);
		},
		setCenter() {
			this.showCenter = !this.showCenter;
			this.editorCtx.format('align', this.showCenter ? 'center' : false);
		},
		setRight() {
			this.showRight = !this.showRight;
			this.editorCtx.format('align', this.showRight ? 'right' : false);
		},
		showSetting() {
			// 点击提交按钮触发的事件
			// this.showSettingLayer = !this.showSettingLayer;
			// 提交数据
			this.upLoadImgs();
		},
		editFocus() {},
		editBlur() {},
		release(isPublic) {
			this.showSettingLayer = false;
			this.editorCtx.getContents({
				success: res => {
					// console.log(res);
					let html = res.html;
					console.log("替换前：", html);
					
					// 遍历本地图片路径与网络图片路径的对象数组，逐个替换
					this.networkImgPaths.imgList.forEach(item => {
						// 本地路径 : 网络路径
						// 获取键名
						console.log("item:", item);
						let key = Object.keys(item)[0];
						console.log("key:", key);
						let reg = new RegExp(key, 'g');
						console.log("reg:", reg);
						html = html.replace(reg, item[key]);
					});
					console.log("替换后：", html);
					Object.assign(res, {
						isPublic: isPublic
					})
					this.$emit('editOk', html);
				} 
			})
		},
		upLoadImgs() {
			// 上传全部图片到服务器
			uni.uploadFile({
				url: this.uploadFileUrl,  // 接收的接口地址
				files: this.localeImgPaths,	// 要上传文件资源的本地路径
				name: this.fileKeyName,  // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容	
				header: this.header,	// HTTP 请求 Header, header 中不能设置 Referer。
				success: res => {
					// 上传完成后处理
					// this.editorCtx.insertImage({
					// 	src: temp,  // 此处需要将图片地址切换成服务器返回的真实图片地址
					// 	alt: '图片',
					// 	success: function(e) {}
					// });
					console.log("res", JSON.parse(res.data));
					// 将数据存储到本地
					this.networkImgPaths = JSON.parse(res.data).data;				
					// {blob:http://localhost:8080/bb756484-43c9-476d-96f3-415501538659: "http://192.168.1.169:8080/folder/note/dd47e536-f2ff-4c33-9828-7b99117f3a8e7.png"}
					// {blob:http://localhost:8080/dc851962-a2e5-40e7-9b21-df0dc2acc33e: "http://192.168.1.169:8080/folder/note/b3a94604-494c-492a-bd2c-fe687812a5004.jpg"}
					// {blob:http://localhost:8080/9e80c9b1-fad0-48b0-a84c-85b0a5e50fe6: "http://192.168.1.169:8080/folder/note/9d07b51b-a574-4b52-a33e-d09ca07c07697.png"}
					
					// 将html字符串中的本地路径替换为网络路径
					this.release(true);
					
					// 关闭加载动画
					uni.hideLoading()
					console.log(this.localeImgPaths, "发送完成");
				}
			});
		}
	}
};
</script>

<style scoped>
.container {
	padding: 30rpx 0;
	box-sizing: border-box;
	padding-bottom: 120rpx;
}

.ql-container {
	line-height: 160%;
	font-size: 34rpx;
	width: calc(100% - 60rpx); 
	height: auto;
	margin: 0 auto;
} 
.tool-view{
	width: 100vw;
	position: fixed;
	bottom: 0;
	left: 0;
	
}
.tool {
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	background: #eee;
}

.font-more {
	position: absolute;
	left: 0;
	bottom: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	width: 100%;
	background: rgb(235, 235, 235);
	overflow: hidden;
	transition: all 0.15s;
}

.setting-layer {
	position: absolute;
	bottom: 100rpx;
	background: #fff;
	width: 250rpx;
	right: 20rpx;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	border-radius: 8rpx;
}
.setting-layer .single {
	height: 80rpx;
	font-size: 32rpx;
	padding: 0 30rpx;
	display: flex;
	align-items: center;
	line-height: 80rpx;
	flex-direction: row;
	color: #666;
}
.setting-layer .single .icon {
	margin-right: 20rpx;
}
.setting-layer-mask{
	position: fixed;
	left: 0;
	top: 0;
	width: 100vw;
	height: 100vh;
	background: transparent; 
}
</style>
