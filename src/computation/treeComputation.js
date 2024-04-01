import { select } from "d3"

export const hasChildren = (selectionTree, id) => {
    const node = selectionTree.find(node => node.id == id)
    if (node === undefined) {
        return false
    }
    const children_list = node["children_id"]
    if (children_list.length == 0) {
        return false
    }
    else {
        return true
    }
}

// the following two functions are for 
export const ifEmphasize = (selectionTree, id, level, level_id_list) => {
    if (hasChildren(selectionTree, id)) {
        return true
    }
    else if (level == level_id_list.length && hasNode(selectionTree, id)) {
        return true
    }
    else {
        return false
    }
}

export const hasNode = (selectionTree, id) => {
    const id_list = selectionTree.map(node => node.id)
    return id_list.includes(id)
}


export const calculateEdges = (tree) => {
    // parameter tree is linearizedTree
    const edges = []
    tree.forEach((node, index) => {
        if (node.children_id.length > 0) {
            node.children_id.forEach(child => {
                const edge = {}
                edge.startIndex = index
                edge.startLevel = node.level

                const endNode = tree.find(n => n.id == child)
                edge.endIndex = tree.findIndex(n => n.id == child)
                edge.endLevel = endNode.level
                edges.push(edge)
            })
        }
    })
    return edges
}



export const calculateCircles = (level_id_list, coordinateCollection, plot_X_Scale, plot_Y_Scale, selectionTree) => {
    const initialCirclesData = level_id_list.reduce((acc, level_id) => {
        acc[level_id] = [];
        return acc;
    }, {});
    // 填充数据
    Object.entries(coordinateCollection).forEach(
        ([level_id, coordinates]) => {
            if (level_id <= level_id_list.length) {
                const xScaleObj = plot_X_Scale.find(
                    (scale) => scale.level_id == level_id
                );
                const yScaleObj = plot_Y_Scale.find(
                    (scale) => scale.level_id == level_id
                );
                if (!xScaleObj && !yScaleObj) return; // 确保找到了比例尺
                const circles = coordinates.map((coordinate) => ({
                    cx: xScaleObj.xScale(coordinate.x),
                    cy: yScaleObj.yScale(coordinate.y),
                    r: 9,
                    key: coordinate.id,
                    stroke: "#F5F5F5",
                    strokeWidth: hasNode(selectionTree, coordinate.id)  ? 2 : 0,
                    fillOpacity: ifEmphasize(selectionTree, coordinate.id, level_id, level_id_list) 
                        ? 1.0
                        : hasNode(selectionTree, coordinate.id) ? 0.3 : 0.05
                }));
                initialCirclesData[level_id] = circles;
            }
        }
    );
    return initialCirclesData;
}
//计算初始展开节点的link
export const calculatePlotLinks = (hoveredId, selectionTree, coordinateCollection, xScale, yScale, offset, level_id_list) => {
    const paths = [];
    const hoveredNode = findNodeById(hoveredId, coordinateCollection);
    const relatedNodeIds = findAllRelatedNodeIds(hoveredId, selectionTree);
    // console.log('related node id is', relatedNodeIds)
    relatedNodeIds.forEach(childId => {
        // 假设 findNodeCoordinates 可以从 coordinateCollection 获取节点坐标
        const start = findNodeCoordinates(hoveredId, coordinateCollection, xScale, yScale, offset);
        const end = findNodeCoordinates(childId, coordinateCollection, xScale, yScale, offset);
        const node = selectionTree.find(node => node.id === childId);
        const level_id = node.level

        if (start && end && childId !== hoveredId && ifEmphasize(selectionTree, childId, level_id, level_id_list)) {
            // console.log("paths is", paths)
            const pathD = generateBezierPath(start, end);
            paths.push({
                d: pathD, // 路径数据
                key: `${hoveredId}-${childId}`, // 组合 key
                hoveredId: hoveredId, // 保存 hoveredId
                childId: childId // 保存 childId
            });
        }
    });
    return paths;
}
//计算高亮节点的link
export const highlightLinks = (hoveredId, originalTree, coordinateCollection, xScale, yScale, offset, level_id_list) => {
    const paths = [];
    const hoveredNode = findNodeById(hoveredId, coordinateCollection);
    const relatedNodeIds = findAllRelatedNodeIds(hoveredId, originalTree);
    // console.log('related node id is', relatedNodeIds)
    relatedNodeIds.forEach(childId => {
        // findNodeCoordinates 可以从 coordinateCollection 获取节点坐标
        // console.log("link id is", childId)
        const start = findNodeCoordinates(hoveredId, coordinateCollection, xScale, yScale, offset);
        const end = findNodeCoordinates(childId, coordinateCollection, xScale, yScale, offset);
        const node = originalTree.find(node => node.id === childId);
        const level_id = node.level

        if (start && end && childId !== hoveredId) {
            const pathD = generateBezierPath(start, end);
            paths.push({
                d: pathD, // 路径数据
                key: `${hoveredId}-${childId}`, // 组合 key
                hoveredId, // 保存 hoveredId
                childId // 保存 childId
            });
        }
    });
    return paths;
}
export const findAllRelatedNodeIds = (nodeId, tree) => {
    let ids = [nodeId]; // 初始化包含当前节点ID的数组

    const findChildrenIds = (id, nodes) => {
        const node = nodes.find(node => node.id === id);
        if (node && node.children_id) {
            node.children_id.forEach(childId => {
                ids.push(childId); // 添加子节点ID到数组
                // findChildrenIds(childId, nodes); // 递归查找更深层的子节点
            });
        }
    };

    findChildrenIds(nodeId, tree);
    return ids;
}

export const findChildrenIds = (id, tree) => {
    let ids = [id]
    const node = tree.find(node => node.id === id);
    if (node && node.children_id) {
        node.children_id.forEach(childId => {
            ids.push(childId); // 添加子节点ID到数组
            // findChildrenIds(childId, nodes); // 递归查找更深层的子节点
        });
    }

    return ids
}

function findNodeById(id, coordinateCollection) {
    let node = null
    Object.entries(coordinateCollection).forEach(
        ([level_id, coordinates]) => {
            const temp = coordinates.find(node => node.id === id);
            // console.log("node is", node)
            if (temp) {
                node = temp
            };
        }
    );
    return node;
}
function generateBezierPath(start, end) {
    const control1X = start.x + (end.x - start.x) / 3;
    const control1Y = start.y - 20; // 第一个控制点向上弯曲
    const control2X = start.x + 2 * (end.x - start.x) / 3;
    const control2Y = end.y - 20; // 第二个控制点也向上弯曲，保持曲线的平滑性

    return `M ${start.x},${start.y} C ${control1X},${control1Y} ${control2X},${control2Y} ${end.x},${end.y}`;
}
function findNodeCoordinates(nodeId, coordinateCollection, x_Scale, y_Scale, offset) {
    let coordinate = null
    Object.entries(coordinateCollection).forEach(
        ([level_id, coordinates]) => {
            const xScaleObj = x_Scale.find(
                (scale) => scale.level_id === level_id
            );
            const yScaleObj = y_Scale.find(
                (scale) => scale.level_id === level_id
            );
            const node = coordinates.find(node => node.id === nodeId);
            if (node) {
                // console.log("link node is", node)
                coordinate = { x: xScaleObj.xScale(node.x) + offset * (level_id - 1), y: yScaleObj.yScale(node.y) };
            }
        }
    );
    return coordinate; // 如果没有找到节点，返回null
}



