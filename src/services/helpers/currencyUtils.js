export class CurrencyUtils {
    static convertMotesToCasper(motesAmount) {
        return motesAmount / 1000000000;
    }

    static convertCasperToMotes(casperAmount) {
        return casperAmount * 1000000000;
    }
}