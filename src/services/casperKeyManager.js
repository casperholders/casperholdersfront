import {AbstractKeyManager} from "@/services/abstractKeyManager";
import store from "@/store";
import {NoActiveKeyError} from "@/services/errors/noActiveKeyError";

export class CasperKeyManager extends AbstractKeyManager{
    static get activeKey() {
        if (store.state.signer.connected && store.state.signer.activeKey) {
            return store.state.signer.activeKey;
        }

        throw new NoActiveKeyError();
    }
}