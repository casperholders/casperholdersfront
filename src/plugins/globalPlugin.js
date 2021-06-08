export default {
    install (Vue) {
        Vue.prototype.getCsprLiveUrl = function (){
            if(process.env.VUE_APP_NETWORK === "casper"){
                return "https://cspr.live/"
            }
            return "https://testnet.cspr.live/"
        }
        Vue.prototype.getValidator = function (){
            return process.env.VUE_APP_VALIDATOR
        }
        Vue.prototype.getApi = function (){
            return process.env.VUE_APP_API
        }
        Vue.prototype.getValidatorUrl = function (){
            return this.getCsprLiveUrl() + "validator/" + this.getValidator();
        }
    }
}