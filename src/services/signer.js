import store from "../store";
import { NoActiveKeyError } from "./errors/noActiveKeyError";

export class Signer {
    static get activeKey() {
        if (store.state.signer.connected && store.state.signer.activeKey) {
            return store.state.signer.activeKey;
        }

        throw new NoActiveKeyError();
    }
}