export class AbstractKeyManager {
    get activeKey(){
        throw new Error('You must implement this function');
    }
}