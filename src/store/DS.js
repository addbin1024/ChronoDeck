// originalTree 包含了整棵树包含的所有结点
const originalTree = [
    {
        "id": 1,
        "node_name": "T1",
        "parent_id": 0,
        "children_id": [
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12
        ],
        "level": 1
    },
]

// selectionTree 包含了当前展示的所有结点
// 如果是create/delete layers的情况直接操作selectionTree
const selectionTree = [
    {
        "id": 1,
        "node_name": "T1",
        "parent_id": 0,
        "children_id": [
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12
        ],
        "level": 1
    }
]

// constraint 存储了对于可视化形式的约束集合
const contraint = {
    "Compare":[
        { "ids": [2,3,4], "mode": "Juxtapose"},
        { "ids": [5,6,7], "mode": "Overlap"}
    ],
    "Hide": {"ids": [3,4,6,7]}
}

// displayTree 包含了selectionTree经过constraint处理后得到的用于可视化的结点集合
// Compare: 在树上的本质是一个结点叠加在另外一个结点上，所以在拓扑结构上，只需要保留第一个结点的parent_id, children_id, 然后删除叠加上去的那个结点
// Hide, 只需要备注一下是hide状态即可
const displayTree = [
    //正常结点
    {
        "id": 1,
        "node_name": "T1",
        "parent_id": 0,
        "children_id": [2,3,4],
        "level": 1,
        "ids":[1],
        "state": "Normal",
        "mode":"Normal"
    },
    //Compare结点
    {
        "id": 2,
        "node_name": "T1-C1",
        "parent_id": 1,
        "children_id": [11,12,13],
        "level": 2,
        "ids":[2,3,4],
        "state": "Compare",
        "mode": "Juxtapose",
    },
    //Hide结点
    {
        "id": 5,
        "node_name": "T1",
        "parent_id": 1,
        "children_id": [],
        "level": 2,
        "ids":[5],
        "state": "Hide",
        "mode":"Hide"
    },
]

