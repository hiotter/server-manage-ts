import request from './index'
import { ResProp } from "@/types/console";
export default {
	//仪表盘
	getDashboard: async () => {
		const res: ResProp = await request.get('/consoles/dashboard')
		return res
	}
}