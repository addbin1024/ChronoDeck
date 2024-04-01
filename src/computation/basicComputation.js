import * as d3 from "d3" 
import { cloneDeep } from "lodash";


export const transformData = (rawData) => {
    //handle this particular timestamp form, otherwise, there will be bugs
    const parseDate = d3.timeParse("%Y-%m-%d");
    return rawData.map(data => {
        if (data.Time.includes(" "))
         { 
            data.Time =new Date(data.Time);
        } 
        else {
            data.Time = parseDate(data.Time);
        }
        // data.Time = new Date(data.Time);
        data.value = data.value === '-' ? 0 : Number(data.value);
        return data;
    });
}

export const filterDataByTimeRange = (data,timeRange) => {
    if (timeRange.length == 2){
        return data.filter(d => {return d.Time >= timeRange[0] && d.Time <= timeRange[1]})
    }
    else {
        return data
    }
    
}

export const getMax = (manySeries) => {
    let max = -Infinity;

    for (const series in manySeries) {
        const seriesMax = Math.max(...manySeries[series].map(item => item.value));
        if (seriesMax > max) {
            max = seriesMax;
        }    
    }
    return max;
}

export const getMin = (manySeries) => {
    let min = Infinity;
    for (const series in manySeries) {
        const seriesMin = Math.min(...manySeries[series].map(item => item.value));
        if (seriesMin < min) {
            min = seriesMin;
        }    
    }
    if(min < 0) {
        return 0
    }
    return min;
}

export const groupData = (seriesCollection) => {
    // console.log("CHECK input data")
    // console.log(seriesCollection)
    const groupedData = seriesCollection.sort((a, b) => a.level - b.level).reduce((acc, item) => {
        const groupIndex = acc.findIndex(group => group.level == item.level)
        if (groupIndex !== -1) {
          acc[groupIndex].data[item.node_name] = item.seriesData
        } else {
          const newGroup = {
            level: item.level,
            data: {
              [item.node_name]: item.seriesData
            }
          };
          acc.push(newGroup)
        }
        return acc
      }, []).map(group => group.data)
    //   console.log("groupedData")
    //   console.log(groupedData)
      return groupedData
}

export const calculateSeriesAverage = (seriesData) => {
    const array = seriesData.map(d => d.value)
    const total = array.reduce((sum, currentValue) => sum + currentValue, 0);
    // console.log("check average")
    // console.log(array.length > 0 ? total / array.length : 0)
    return array.length > 0 ? total / array.length : 0;   
}

export const calculateSeriesTrend = (seriesData) => {
    const array = seriesData.map(d => d.value)
    return (array[array.length - 1] - array[0]) / array[0]
}

export const calculateAverageSeries = (seriesData1, seriesData2) => {
    const averagedSeries = [];

    for (let i = 0; i < seriesData1.length; i++) {
        const averageValue = (seriesData1[i].value + seriesData2[i].value) / 2;
        averagedSeries.push({ Time: seriesData1[i].Time, value: averageValue });
    }
    return averagedSeries;
}

