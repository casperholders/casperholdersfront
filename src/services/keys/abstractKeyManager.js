export class AbstractKeyManager {
    /**
     * @return string - Must return a public key hex
     */
    get activeKey() {
        throw new Error('You must implement this function');
    }
}