import { clone, cloneDeep } from "lodash"

export const addYScale = (y_Scale_List, level_id) => {
    const list = cloneDeep(y_Scale_List)
    const scale = list[ level_id - 1 ]
    list.splice(level_id - 1, 0, scale)
    return list
}

export const addPlotScale = (Plot_X_Scale, Plot_Y_Scale, level_id) => {

    const plotX = cloneDeep(Plot_X_Scale)
    const plotY = cloneDeep(Plot_Y_Scale)

    const xScale = plotX.find(scale => scale.level_id == level_id)
    const yScale = plotY.find(scale => scale.level_id == level_id)

    plotX.splice(level_id-1, 0, cloneDeep(xScale))
    plotY.splice(level_id-1, 0, cloneDeep(yScale))
    
    xScale.level_id = (level_id + 1).toString()
    yScale.level_id = (level_id + 1).toString()



    return {plotX, plotY}


}