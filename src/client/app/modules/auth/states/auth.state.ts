import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';

export interface IAuthState {
  loggedIn: boolean;
  role: string;
  user: User | null;
}

export const authInitialState: IAuthState = {
  loggedIn: false,
  role: null,
  user: null,
};

export function getLoggedIn(state$: Observable<IAuthState>) {
	console.log("qio");
  return state$.select(state => state.loggedIn);
}

export function getRole(state$: Observable<IAuthState>) {
  return state$.select(state => state.role);
}

export function getUser(state$: Observable<IAuthState>) {
  return state$.select(state => state.user);
}