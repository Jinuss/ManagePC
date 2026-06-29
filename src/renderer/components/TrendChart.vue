<template>
  <div class="trend-chart">
    <div class="chart-header">
      <span class="chart-icon">{{ icon }}</span>
      <span class="chart-title">{{ title }}</span>
      <div class="chart-values" v-if="hasMultipleSeries">
        <span class="value-item">
          <span class="value-label">{{ seriesNames[0] }}</span>
          <span class="value-num" :style="{ color: colors[0] }">{{ currentRecv }} {{ t('network.unit') }}</span>
        </span>
        <span class="value-item">
          <span class="value-label">{{ seriesNames[1] }}</span>
          <span class="value-num" :style="{ color: colors[1] }">{{ currentSent }} {{ t('network.unit') }}</span>
        </span>
      </div>
      <span class="chart-value" v-else>{{ currentValue }}{{ t('cpu.unit') }}</span>
    </div>
    <div class="chart-container">
      <v-chart :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

const { t } = useI18n()

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '📊'
  },
  data: {
    type: Array,
    default: () => []
  },
  color: {
    type: String,
    default: '#667eea'
  },
  colors: {
    type: Array,
    default: () => ['#28a745', '#17a2b8']
  },
  hasMultipleSeries: {
    type: Boolean,
    default: false
  },
  seriesNames: {
    type: Array,
    default: () => ['接收', '发送']
  }
})

const currentValue = computed(() => {
  if (props.data.length === 0) return '0.0'
  return props.data[props.data.length - 1]?.toFixed(1) || '0.0'
})

const currentRecv = computed(() => {
  if (!props.hasMultipleSeries || props.data.length === 0) return '0.0'
  return props.data[props.data.length - 1]?.recv?.toFixed(1) || '0.0'
})

const currentSent = computed(() => {
  if (!props.hasMultipleSeries || props.data.length === 0) return '0.0'
  return props.data[props.data.length - 1]?.sent?.toFixed(1) || '0.0'
})

const chartOption = computed(() => {
  const times = props.data.map((_, index) => `${index * 2}s`)
  
  if (props.hasMultipleSeries) {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e9ecef',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        formatter: (params) => {
          let result = `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 8px;">${params[0].name}</div>`
          params.forEach(param => {
            result += `<div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 4px;">
              <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color};margin-right:6px;"></span>${param.seriesName}</span>
              <span style="font-weight: 600;">${param.value.toFixed(1)} ${t('network.unit')}</span>
            </div>`
          })
          result += '</div>'
          return result
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: {
          lineStyle: {
            color: '#e9ecef'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#888',
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#888',
          fontSize: 10,
          formatter: `{value} ${t('network.unit')}`
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: props.seriesNames[0],
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: props.colors[0],
            width: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: props.colors[0] + '40' },
                { offset: 1, color: props.colors[0] + '05' }
              ]
            }
          },
          data: props.data.map(d => d?.recv || 0)
        },
        {
          name: props.seriesNames[1],
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: props.colors[1],
            width: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: props.colors[1] + '40' },
                { offset: 1, color: props.colors[1] + '05' }
              ]
            }
          },
          data: props.data.map(d => d?.sent || 0)
        }
      ]
    }
  }
  
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e9ecef',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: (params) => {
        const data = params[0]
        return `<div style="padding: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
          <div style="color: ${props.color};">${data.value.toFixed(1)}${t('cpu.unit')}</div>
        </div>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: {
        lineStyle: {
          color: '#e9ecef'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#888',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#888',
        fontSize: 10,
        formatter: `{value}${t('cpu.unit')}`
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: props.title,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: props.color,
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: props.color + '40' },
              { offset: 1, color: props.color + '05' }
            ]
          }
        },
        data: props.data
      }
    ]
  }
})
</script>

<style scoped>
.trend-chart {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-icon {
  font-size: 1.4rem;
}

.chart-title {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.chart-values {
  display: flex;
  gap: 15px;
}

.value-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.value-label {
  font-size: 0.7rem;
  color: #888;
}

.value-num {
  font-size: 1rem;
  font-weight: bold;
}

.chart-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
}

.chart-container {
  height: 150px;
}
</style>
