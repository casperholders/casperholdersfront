<script>
import {Doughnut, mixins} from 'vue-chartjs'

const {reactiveProp} = mixins

/**
 * Donut chart component from the vue-chartjs library
 */
export default {
    extends: Doughnut,
    mixins: [reactiveProp],
    data: () => ({
        options: {
            cutoutPercentage: 90,
            responsive: true,
            maintainAspectRatio: true,
            tooltips: {
                enabled: false,
            },
            legend: {
                display: false,
            }
        }
    }),

    mounted() {
        this.renderChart(this.chartData, this.options)
    }
}
</script>

<style>

</style>