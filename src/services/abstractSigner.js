export class AbstractSigner {
    // eslint-disable-next-line no-unused-vars
    async sign(deploy){
        throw new Error('You must implement this function');
    }
}