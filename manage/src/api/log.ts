import request from './index'
import {
	FiltersProp,
	ResProp,
	ResOperaProp,
	OperatiomProp
} from "@/types/log";

export default {
	getLoginRecords: async (filters: FiltersProp, current: number, pageSize: number) => {
		let url = `/logs/login?crtPage=${current}&pageSize=${pageSize}`
		if (filters.username && filters.username.length > 0) {
			url += `&query-username=${filters.username[0]}`
		}
		if (filters.name && filters.name.length > 0) {
			url += `&query-name=${filters.name[0]}`
		}
		const res: ResProp = await request.get(url)
		return res
	},
	getOperationRecords: async (filters: FiltersProp, current: number, pageSize: number) => {
		let url = `/logs/operation?current=${current}&page-size=${pageSize}`
		if (filters.module && filters.module.length > 0) {
			url = `/logs/operation?query-module=${filters.module[0]}&current=${current}&page-size=${pageSize}`
		}
		if (filters.type && filters.type.length > 0) {
			url = `/logs/operation?query-type=${filters.type[0]}&current=${current}&page-size=${pageSize}`
		}
		if (filters.contents && filters.contents.length > 0) {
			url = `/logs/operation?query-contents=${filters.contents[0]}&current=${current}&page-size=${pageSize}`
		}
		if (filters.operator && filters.operator.length > 0) {
			url = `/logs/operation?query-operator=${filters.operator[0]}&current=${current}&page-size=${pageSize}`
		}
		const res: ResOperaProp = await request.get(url)
		return res
	},
	createOperation: async (payload: OperatiomProp) => {
		return await request.post('/logs/operation', payload)
	}
}