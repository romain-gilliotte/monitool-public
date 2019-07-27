import Store from './store';
import User from '../model/user';

import {Transform} from 'stream';

export default class UserStore extends Store {

	get modelString() {
		return 'user';
	}

	get modelClass() {
		return User;
	}
}
