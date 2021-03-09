import request from './index'
import store from '@/store'
import { FiltersProp, ResProp, StaffProp, StaffProps } from "@/types/user";

export default {
	login: async (username: string, password: string) => {
		const res: string = await request.post('/staffs/login', { username, password })
		return res
	},
	getRoles: async () => {
		return await request.get('/roles')
	},
	createStaff: async (payload: StaffProp) => {
		return await request.post('/staffs', payload)
	},
	deleteStaff: async (id: string) => {
		return await request.delete(`/staffs/${id}`)
	},
	updateStaff: async (id: string, payload: StaffProp) => {
		return await request.put(`/staffs/${id}`, payload)
	},
	getStaff: async () => {
		request.defaults.headers.common['authorization'] = store.state.token
		const res: StaffProps = await request.get('/staffs/staffInfo')
		return res
	},
	getStaffs: async (filters: FiltersProp, current: number, pageSize: number) => {

		let url = `/staffs?crtPage=${current}&pageSize=${pageSize}`

		if (filters.name && filters.name.length > 0) {
			url = `/staffs?query-name=${filters.name[0]}&crtPage=${current}&pageSize=${pageSize}`
		}
		if (filters['role.name'] && filters['role.name'].length > 0) {
			url = `/staffs?query-role=${filters['role.name']}&crtPage=${current}&pageSize=${pageSize}`
		}
		const res: ResProp = await request.get(url)
		return res
	},
	resetPassword: async (id: string, password: string) => {
		return await request.patch(`/staffs/${id}`, { password })
	}
}