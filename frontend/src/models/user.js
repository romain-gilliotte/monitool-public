import axios from 'axios';

export default class User {

	static async fetchAll() {
		const response = await axios.get('/resources/user');
		return response.data.map(i => new User(i));
	}

	constructor(data) {
		Object.assign(this, data);
	}

	async save() {
		const response = await axios.put(
			'/resources/user/' + this._id,
			JSON.parse(angular.toJson(this))
		);

		Object.assign(this, response.data);
	}

}

