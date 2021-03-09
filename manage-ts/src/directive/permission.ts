const contentsAuthsMap = [{
	title: '全局参数',
	key: '0',
	children: [
		// {
		// 	title: '运费相关',
		// 	key: '0-0'
		// }
	]
}, {
	title: '仪表板',
	key: '1',
	children: [{
		title: '我的员工',
		key: '1-0'
	},
	]
}]
const buttonsAuthsMap = [{
	title: '全局参数',
	key: '0',
	children: []
},
{
	title: '员工管理',
	key: '1',
	children: [
		{
			title: '编辑员工',
			key: '1-0',
			value: '1-0'
		},
		{
			title: '重置密码',
			key: '1-1',
			value: '1-1'
		},
		{
			title: '删除员工',
			key: '1-2',
			value: '1-2'
		},
	]
},
]

const othersAuthsMap = ['其他权限示例']
export {
	buttonsAuthsMap,
	contentsAuthsMap,
	othersAuthsMap
}
