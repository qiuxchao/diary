<script>
	export default {
		methods: {
			login() {
				// 用户登录
				uni.showLoading({
					// 加载动画
					title: '登录中...'
				});
				this.api.request({
					url: "/user/login",
					method: "POST",
					header: {"Content-Type": "application/json"},
					data: {"pass_word": "qiu123456","user_name": "13683823372"}  
				}).then(res => {
					console.log('登录请求发送成功', res);
					uni.showToast({  
						title: '登录成功',
						duration: 1000
					});
					uni.hideLoading();
				}).catch(err => {
					uni.showToast({
						title: '登录失败',  
						duration: 1000
					});
					uni.hideLoading()
					console.log('登录失败：', err);
				});
			},
			getLoacation() {
				// console.log('获取位置了')  
				//获取定位
				plus.geolocation.getCurrentPosition( function(position){
				   console.log( '获取定位成功', position.address);
				   uni.setStorage({
						key: "location",
						data: position.address
				   });
				}, function ( e ) {
				   console.log( '获取定位失败：', e.message );
				},{geocode:true, provider:'amap'});
				
			}
		},
		onLaunch: function() {
			console.log('App Launch')
			this.login();
			this.getLoacation();
		},
		onShow: function() {
			console.log('App Show') 
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "uview-ui/index.scss";
</style>
