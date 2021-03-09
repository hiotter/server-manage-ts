import request from './index'
import { RoleProp, ResProp } from "../types/role";

export default {
	getRoles: async () => {
		const res: ResProp = await request.get('/roles')
		return res
	},
	createRole: async (payload: RoleProp) => {
		return await request.post('/roles', payload)
	},
	updateRole: async (id: string | undefined, payload: RoleProp) => {
		return await request.put(`/roles/${id}`, payload)
	},
	deleteRole: async (id: string | undefined) => {
		return await request.delete(`/roles/${id}`)
	}
}
