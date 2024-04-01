import { cloneDeep } from 'lodash'

export const updateSelectionFromOriginal = (oldSelectionTree, newOriginalTree, level_id) => {
    // change chidren_id of upper layer, push current added layer, and change parent_id of grouped layer
    let newSelectionTree = cloneDeep(oldSelectionTree)
    const node_list = newSelectionTree.filter(node => node.level === level_id);

    node_list.forEach(Node1 => {
        const parentIndex = newSelectionTree.findIndex(node => node.id === Node1.parent_id);
        if (parentIndex != -1 && newSelectionTree[parentIndex].init != true) {
            newSelectionTree[parentIndex].init = true
            newSelectionTree[parentIndex].children_id = [];
        }

        const Node2 = newOriginalTree.find(node =>
            node.level === level_id &&
            node.parent_id === Node1.parent_id &&
            node.children_id.includes(Node1.id)
        );

        // If Node2 is found
        if (Node2) {
            if (!newSelectionTree.some(node => node.id === Node2.id)) {
                newSelectionTree.push({...Node2}); 
            }

            // Update Node1's parent_id and level, and ensure Node2.id is in its parent's children_id
            const Node1Index = newSelectionTree.findIndex(node => node.id === Node1.id);
            if (Node1Index !== -1) {
                newSelectionTree[Node1Index].parent_id = Node2.id;
                newSelectionTree[Node1Index].level = level_id + 1;
                // Find Node2's parent and update its children_id array
                const Node2ParentIndex = newSelectionTree.findIndex(node => node.id === Node2.parent_id);
                if (Node2ParentIndex !== -1 && !newSelectionTree[Node2ParentIndex].children_id.includes(Node2.id)) {
                    newSelectionTree[Node2ParentIndex].children_id.push(Node2.id);
                }
            }
        }
    });

    // console.log("check SSSS")
    // console.log(newSelectionTree)

    return newSelectionTree;
}

export const addLevels = (levels, level_id) => {
    const levels_copy = cloneDeep(levels)
    const level_name = levels_copy[level_id - 1]
    const grouped_level_name = "Grouped_" + level_name
    levels_copy.splice(level_id - 1, 0, grouped_level_name)
    return levels_copy 
}

export const updateSeriesCollection = (seriesCollection, level_id) => {
    const collection = cloneDeep(seriesCollection)
    collection.forEach(series => {
        if(series.level == level_id){
            series.level = level_id + 1
        }
    })
    return collection
}
