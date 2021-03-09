import { createStore } from 'vuex'
const timeLocalStorage = window.localStorage
import api from '@/api/staff'
import {RoleProps,UserProps,GlobalDataProps} from '@/types/store'

const initState = () => {
	return {
		token: '',
		addRoutesDone: false,
		menu: [],
		userInfo: {
			avatar: '',
			name: '',
			nickname: '',
			role: {
				buttonsAuths: [''],
				contentsAuths: [''],
				othersAuths: [''],
				routesAuths: [''],
				desc: '',
				name: '',
				_id: '',
			},
			username: '',
			_id: ''
		}
	}
}
const store = createStore<GlobalDataProps>({
	// namespaced: true,
	state: initState(),
	getters: {

		getToken: (state) => {
			return state.token
		},
		getAddRoutesDone: (state) => {
			return state.addRoutesDone
		},
		getMenu: (state) => {
			return state.menu
		},
		getUSerInfo: (state) => {
			return state.userInfo
		}
	},
	actions: {
		__login: ({ commit }, { username, password }) => {
			return new Promise(async (resolve, reject) => {
				try {
					const token = await api.login(username, password)
					commit('STORE_TOKEN', token)
					timeLocalStorage.setItem('token', token)
					resolve('login success')
				} catch (err) {
					reject(err)
				}
			})
		},
		__getUserInfo: ({ commit }) => {
			return new Promise(async (resolve, reject) => {
				try {
					const staff = await api.getStaff()
					commit('STORE_USER_INFO', staff)
					resolve({ role: staff.role.name, routesAuths: staff.role.routesAuths })
				} catch (err) {
					reject(err)
				}
			})
		}
	},
	mutations: {
		CLEAR_PERMISSION: (state) => {
			timeLocalStorage.removeItem('token')
			Object.assign(state, initState())
		},
		STORE_TOKEN: (state, payload) => {
			state.token = payload
		},
		STORE_USER_INFO: (state, payload) => {
			state.userInfo = payload
		},
		SET_ADD_ROUTES_DONE: (state) => {
			state.addRoutesDone = true
		},
		STORE_MENU: (state, payload) => {
			state.menu = payload
		}
	}
})

export default store