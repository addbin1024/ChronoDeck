import  {ifEmphasize}  from "../computation/treeComputation"

export const highlightCards = (id_list) => {
    id_list.forEach(id => {
        const id_name = "card" + id.toString()
        const TSCard = document.getElementById(id_name)
        if(TSCard !== null){
            TSCard.classList.add("opacity-100")
        }
    })
}

export const deHighlightCards = (id_list) => {
    id_list.forEach(id => {
        const id_name = "card" + id.toString()
        const TSCard = document.getElementById(id_name)
        if(TSCard !== null){
            TSCard.classList.remove("opacity-100")
        }
    })
}


export const highlightNodes = (id_list) => {
    deHightLigtEmphasize()
    id_list.forEach(nodeId => {
        const circle = document.getElementById(`node${nodeId}`);
        if (circle) {
            circle.style.fillOpacity = '1'; // 完全不透明
            circle.style.stroke = "#DFDEDE"; // 设置描边颜色为灰色
            circle.style.strokeWidth = 2; // 设置描边宽度  
        }
    })
    highlightCards(id_list)

}

export const deHighlightNodes = (id_list) => {
    highlightEmphasize()
    id_list.forEach(nodeId => {
        const circle = document.getElementById(`node${nodeId}`);
        if (circle && !Array.from(circle.classList).includes("foldNode")) {
            circle.style.fillOpacity = '0.05'; 
            circle.style.strokeWidth = 0; 
        }
    })
    highlightEmphasize()
    deHighlightCards(id_list) 
}

export const highlightLink = (id) => {
    const link = document.getElementById(id)
    if(link) {
        link.style.stroke = "rgba(243,194,18,1)"
        link.style.strokeWidth = 2
    }
}



export const highlightEmphasize = () => {
    const emphasizeLinks = document.getElementsByClassName("emphasizeLink")
    Array.from(emphasizeLinks).forEach(link => {
        link.style.stroke = "rgba(243,194,18,1)"
    })

    const emphasizeNodes = document.getElementsByClassName("emphasizeNode")
    Array.from(emphasizeNodes).forEach(node => {
        node.style.fillOpacity = 1
        node.style.stroke ="rgba(245, 245, 245,1)"
        node.style.strokeWidth = 2
    })

    const foldNodes = document.getElementsByClassName("foldNode")
    Array.from(foldNodes).forEach(node => {
        node.style.fillOpacity = 0.3
        node.style.stroke ="rgba(245, 245, 245,1)"
        node.style.strokeWidth = 2
    })

}

export const deHightLigtEmphasize = () => {
    const emphasizeLinks = document.getElementsByClassName("emphasizeLink")
    Array.from(emphasizeLinks).forEach(link => {
        link.style.stroke = "rgba(243,194,18, 0.2)"
    })

    const emphasizeNodes = document.getElementsByClassName("emphasizeNode")
    Array.from(emphasizeNodes).forEach(node => {
        node.style.fillOpacity = 0.2
        node.style.stroke ="rgba(245, 245, 245,0.08)"
    })

    const foldNodes = document.getElementsByClassName("foldNode")
    Array.from(foldNodes).forEach(node => {
        node.style.fillOpacity = 0.05
        node.style.strokeWidth = 0
    })


}

export const highlightEmphaizeCards = () => {
    const emphasizeCards = document.getElementsByClassName("emphasizeCard")
    Array.from(emphasizeCards).forEach(card => {
        card.classList.remove("opacity-40")
        card.classList.add("opacity-100")  
    })   

}

export const deHighlightEmphasizeCards = () => {
    const emphasizeCards = document.getElementsByClassName("emphasizeCard")
    Array.from(emphasizeCards).forEach(card => {
        card.classList.remove("opacity-100")
        card.classList.add("opacity-40")
    })   
}

// export const resetNodes = (selectionTree, level_id_list) => {
//     //修改函数形参
//     //把刚刚hover后高亮的所有点恢复到原来的状态,也就是stroke为none, 透明度为0.1
//     document.querySelectorAll('.node').forEach(circle => {
//         let match = circle.id.match(/\d+/); // 使用正则表达式匹配连续的数字
//         let number = parseInt(match[0], 10); // 将匹配的字符串转换成数字
//         const node = selectionTree.find(node => node.id === number);
//         if (node) {
//             const level_id = node.level;
//             if (ifEmphasize(selectionTree, number, level_id, level_id_list)) {
//                 circle.style.fillOpacity = '1'; // 恢复默认透明度为50%
//                 circle.style.r = '10'; // 恢复默认半径
//                 circle.style.strokeWidth = 3; // 设置描边宽度
//                 circle.style.stroke = "#F5F5F5"; // 设置描边颜色为灰色
//             }
//             else {
//                 circle.style.fillOpacity = '0.05';
//                 circle.style.r = '10'; // 恢复默认半径
//                 circle.style.strokeWidth = 0; // 设置描边宽度 
//             }
//         }
//         //is unfold node
//         else {
//             circle.style.fillOpacity = '0.05';
//             circle.style.r = '10'; // 恢复默认半径
//             circle.style.strokeWidth = 0; // 设置描边宽度 
//         }
//     });
// };





