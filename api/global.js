let URI = {
	// request: 'http://ebangongbao.com/officetreasure/'
	request: 'http://ebangongbao.com/officetreasure/',  // 请求根路径
	uploadAudio: 'http://ebangongbao.com/officetreasure/note/audioUpload',	// 上传音频文件路径
	images: 'http://ebangongbao.com/officetreasure/note/imgUpload'	// 上传图片路径
}
// 声明箭头函数请求方法，参数是一个对象
let request = (param = {}) => {
	let url = param.url || '';
	if (!/http:|https:/.test(url)) {
		// 不是一个完整的地址，拼接上定义好的根路径
		url = URI.request + url;
	}
	let header = {};
	// 默认请求数据类型是 json
	header['content-type'] = 'application/json';
	// header['content-type']='application/x-www-form-urlencoded';
	//header['token']='helang';
	
	// uni.showLoading({
	// 	title: "加载中"
	// }) 
	// 返回 Promise 对象，将结果包在里面
	return new Promise((resolve, reject) => {
		// 使用原始request方法请求
		uni.request({
			url,
			method: param.method || 'GET',
			dataType: 'json',
			header: param.header || header,
			data: param.data,
			success: (res) => {
				if(res.data.status==401){
					// uni.reLaunch({
					// 	// 401 就重定向登录页面
					//     url: "/pages/login/login"
					// });
					// 删除本地存储的用户数据
					// uni.removeStorageSync('userInfo');
				}else{
					// 将结果返回到.then中
					resolve(res.data);
				}
			},
			fail: (err) => {
				// 将失败信息返回到 .catch 中
				reject(err);
			},
			complete() {
				// uni.hideLoading();
			}
		});
	})
}

export default {
	URI,
	request
}
