export const isPointInPolygon = (point, polygon, offset) => {
    var x = point[0] + offset,
      y = point[1];
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i][0],
        yi = polygon[i][1];
      var xj = polygon[j][0],
        yj = polygon[j][1];

      var intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };
  export const isIdInSelectionTree = (id, selectionTree) => {
    // 这里我们遍历 selectionTree 并检查给定的 id 是否存在于树中
    return selectionTree.some(node => node.id === id);
  }

  export const lassoHasChildren = (id, selectionTree) => {
    const node = selectionTree.find(node => node.id === id);
    return node && node.children_id && node.children_id.length > 0;
  }