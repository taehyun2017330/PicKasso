export interface SelectionEdges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export function selectionEdgesFor({
  index,
  columns,
  selected
}: {
  index: number;
  columns: number;
  selected: boolean[];
}): SelectionEdges | null {
  if (!selected[index]) return null;

  const col = index % columns;
  const hasLeft = col > 0 && selected[index - 1];
  const hasRight = col < columns - 1 && selected[index + 1];
  const hasTop = index >= columns && selected[index - columns];
  const hasBottom = index + columns < selected.length && selected[index + columns];

  return {
    top: !hasTop,
    right: !hasRight,
    bottom: !hasBottom,
    left: !hasLeft
  };
}

