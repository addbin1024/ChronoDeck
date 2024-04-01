import * as d3 from "d3"
import { getMax, getMin } from "../computation/basicComputation"

export const TS_Scales = (data, width, height) => {
    //the format of data(single or multiple series):
    // {
    //     "Metric1": [
    //         {
    //             "Time": "2022-11-27",
    //             "value": 3
    //         },
    //         {
    //             "Time": "2022-11-28",
    //             "value": 4
    //         },
    //         {
    //             "Time": "2022-11-29",
    //             "value": 5
    //         }
    //     ],
    //     "Metric2": [
    //         {
    //             "Time": "2022-11-27",
    //             "value": 5
    //         },
    //         {
    //             "Time": "2022-11-28",
    //             "value": 6
    //         },
    //         {
    //             "Time": "2022-11-29",
    //             "value": 8
    //         }
    //     ]
    // }
    //suppose we have the same time range
    // console.log("check data")
    // console.log(data)
    let max = getMax(data)
    max = max * 1.15
    const min = getMin(data)
    // console.log(max)
    // console.log(min)

    // console.log("w")
    // console.log(width)
    // console.log("h")
    // console.log(height)

    const xScale = d3.scaleTime()
        .domain(d3.extent(Object.values(data)[0], d => d.Time))
        .range([0, width])

    const yScale = d3.scaleLinear()
        .domain([min, max])
        .range([height, 0])

    // console.log("check xScale")
    // console.log(d3.extent(Object.values(data)[0], d => d.Time))
    // console.log(xScale(d3.extent(Object.values(data)[0], d => d.Time)[1]))
    // console.log("check yScale")
    // console.log(yScale(min))


    return { xScale, yScale }
}


export const PLOT_Scale = (data, width, height) => {
    //因为涉及到x,y有负数，所以max,min都要求，然后取绝对值最大的那个,用它的正负作为最终的max,min
    //只return一个XY scale, 对于level的遍历在updateScale里
    // return {}
    // 初始化变量来存储x和y的最大绝对值
    // 提取所有点的 x 和 y 值
    let xValues = data.map(coord => coord.x);   
    let yValues = data.map(coord => coord.y);
    // console.log("data is", data )
    // console.log("xValues is", xValues )

    // 计算 x 和 y 值的最大和最小值
    let xMin = Math.min(...xValues), xMax = Math.max(...xValues);
    let yMin = Math.min(...yValues), yMax = Math.max(...yValues);

    // 找到 x 和 y 值绝对值最大的数
    let maxX = Math.max(Math.abs(xMin), Math.abs(xMax));
    let maxY = Math.max(Math.abs(yMin), Math.abs(yMax));
    // console.log("maxX is", maxX )

    // 使用绝对值最大的数来创建比例尺，确保比例尺能覆盖所有数据点
    const xScale = d3.scaleLinear().domain([-maxX, maxX]).range([15, width-15]);
    const yScale = d3.scaleLinear().domain([-maxY, maxY]).range([height-10, 10]);
    // console.log("width is", width)

    return { xScale, yScale };

}


export const getXScale = (data, width) => {
    console.log("check data")
    console.log(data)
    return d3.scaleTime()
    .domain(d3.extent(data, d => d.Time))
    .range([0, width])

}


export const getYScale = (max, min, height) => {
    return d3.scaleLinear()
    .domain([min, max])
    .range([height-1, 5])
}
