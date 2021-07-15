export class AbstractSigner {
    // eslint-disable-next-line no-unused-vars
    static async sign(deploy, options = {}){
        throw new Error('You must implement this function');
    }
}