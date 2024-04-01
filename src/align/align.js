export const findAlignAncester = (id, selectionTree, align_level) => {
    const tree = JSON.parse(JSON.stringify(selectionTree))
    let node = tree.find(node => node.id == id)
    while(node.level != align_level){
        node = tree.find(n => n.id == node.parent_id)
    }
    return node.id
}



