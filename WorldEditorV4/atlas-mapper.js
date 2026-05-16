export function BuildAtlasManifest({
    imageName,
    tileWidth,
    tileHeight,
    columns,
    rows,
    prefix,
    kind = "tiles",
}) {
    const atlas = {
        sprite: imageName,
        tileWidth,
        tileHeight,
    };

    if (kind === "sprites") {
        atlas.sprites = {};
        forEachCell(columns, rows, (col, row) => {
            atlas.sprites[`${prefix}_${col}_${row}`] = rect(col, row, tileWidth, tileHeight);
        });
    } else {
        atlas.tiles = {};
        forEachCell(columns, rows, (col, row) => {
            atlas.tiles[`${prefix}_${col}_${row}`] = rect(col, row, tileWidth, tileHeight);
        });
        atlas.terrainSets = {
            [`${prefix}_terrain`]: {
                tiles: {
                    topLeft: `${prefix}_0_0`,
                    top: `${prefix}_${Math.min(1, columns - 1)}_0`,
                    topRight: `${prefix}_${Math.max(0, columns - 1)}_0`,
                    middleLeft: `${prefix}_0_${Math.min(1, rows - 1)}`,
                    middle: `${prefix}_${Math.min(1, columns - 1)}_${Math.min(1, rows - 1)}`,
                    middleRight: `${prefix}_${Math.max(0, columns - 1)}_${Math.min(1, rows - 1)}`,
                    bottomLeft: `${prefix}_0_${Math.max(0, rows - 1)}`,
                    bottom: `${prefix}_${Math.min(1, columns - 1)}_${Math.max(0, rows - 1)}`,
                    bottomRight: `${prefix}_${Math.max(0, columns - 1)}_${Math.max(0, rows - 1)}`,
                },
            },
        };
    }

    return {
        atlases: {
            [imageName]: atlas,
        },
    };
}

function forEachCell(columns, rows, callback) {
    for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
            callback(col, row);
        }
    }
}

function rect(col, row, tileWidth, tileHeight) {
    return {
        x: col * tileWidth,
        y: row * tileHeight,
        width: tileWidth,
        height: tileHeight,
    };
}
