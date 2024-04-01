import * as d3 from "d3"

const lineGenerator = (xScale, yScale) => {

    return d3.line()
    .x(d => {
        return xScale(new Date(d.Time));
    })
    .y(d => {
        return yScale(d.value);
    });
    // .curve(d3.curveBasis)
}

export const generatePath = (data,xScale, yScale) => {

    // console.log(data)
    // console.log(xScale)
    // console.log(yScale)





    return lineGenerator(xScale,yScale)(data)

  
}

export const generateSelectedPath = (data,xScale, yScale) => {

    data.forEach(d => {
        d.Time = new Date(d.Time)
    })

    // console.log("check data in function")
    // console.log(data)



  
    // console.log(xScale('2022-12-19T16:00:00.000Z'))
    // console.log(t)
    // console.log(xScale(t))
    // console.log(yScale(0))


    
    return lineGenerator(xScale,yScale)(data)

  
}


