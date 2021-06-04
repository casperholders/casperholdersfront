<script>
import {Doughnut} from 'vue-chartjs'

export default {
  extends: Doughnut,
  props: ['chartdata'],
  data: () => ({
    options: {
      cutoutPercentage: 90,
      responsive: true,
      maintainAspectRatio: true,
      tooltips:{
        enabled: false,
      },
      legend:{
        display: false,
        position: 'right',
        onClick: null,
        labels:{
          boxWidth: 40,
          fontSize: 20,
          fontColor: "white",
          generateLabels: (chart) => {
            var data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map(function(label, i) {
                var meta = chart.getDatasetMeta(0);
                var style = meta.controller.getStyle(i);
                var amount = parseFloat(data.datasets[0].data[i])
                var total = data.datasets[0].data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)
                var percentage = Number((amount/total)*100).toFixed(2)
                return {
                  text: label + " - Amount : " + amount + " (" + percentage + "%)",
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  lineWidth: style.borderWidth,
                  hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,

                  // Extra data used for toggling the correct item
                  index: i
                };
              });
            }
            return [];
          }
        }
      }
    }
  }),

  mounted () {
    this.renderChart(this.chartdata, this.options)
  }
}
</script>

<style>

</style>