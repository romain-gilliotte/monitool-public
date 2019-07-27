import validator from'is-my-json-valid';
import UserStore from'../store/user';
import DbModel from'./db-model';
import schema from'../schema/user.json';

const validate = validator(schema);
const storeInstance = new UserStore();

export default class User extends DbModel {

	static get storeInstance() {
		return storeInstance;
	}

	/**
	 * Deserialize and validate POJO
	 */
	constructor(data) {
		super(data, validate);
	}
}

