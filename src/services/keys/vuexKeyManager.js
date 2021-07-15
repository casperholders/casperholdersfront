import {AbstractKeyManager} from "@/services/keys/abstractKeyManager";
import store from "@/store";
import {NoActiveKeyError} from "@/services/errors/noActiveKeyError";

export class VuexKeyManager extends AbstractKeyManager {
    static get activeKey() {
        if (store.state.signer.connected && store.state.signer.activeKey) {
            return store.state.signer.activeKey;
        }

        throw new NoActiveKeyError();
    }
}