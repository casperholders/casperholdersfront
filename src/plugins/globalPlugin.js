export default {
    install (Vue) {
        Vue.prototype.getCsprLiveUrl = function (){
            if(this.getNetwork() === "casper"){
                return "https://cspr.live/"
            }
            return "https://testnet.cspr.live/"
        }
        Vue.prototype.getNetwork = function (){
            return process.env.VUE_APP_NETWORK
        }
        Vue.prototype.getValidator = function (){
            return process.env.VUE_APP_VALIDATOR
        }
        Vue.prototype.getApi = function (){
            return process.env.VUE_APP_API
        }
        Vue.prototype.getApi = function (){
            return process.env.VUE_APP_API
        }
        Vue.prototype.getValidatorUrl = function (){
            return this.getCsprLiveUrl() + "validator/" + this.getValidator();
        }
    }
}