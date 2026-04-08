type TiledProperty = {
  name?: string;
  value?: unknown;
};

type TiledPoint = {
  x?: number;
  y?: number;
};

type TiledObject = {
  id?: number;
  name?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  visible?: boolean;
  point?: boolean;
  polygon?: TiledPoint[];
  properties?: TiledProperty[];
};

type TiledLayer = {
  id?: number;
  name?: string;
  type?: string;
  visible?: boolean;
  opacity?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  data?: number[];
  objects?: TiledObject[];
  layers?: TiledLayer[];
  properties?: TiledProperty[];
};

type TiledTilesetTile = {
  id?: number;
  objectgroup?: {
    objects?: TiledObject[];
  };
};

type TiledTileset = {
  firstgid?: number;
  source?: string;
  name?: string;
  tilewidth?: number;
  tileheight?: number;
  tilecount?: number;
  columns?: number;
  image?: string;
  imagewidth?: number;
  imageheight?: number;
  margin?: number;
  spacing?: number;
  tiles?: TiledTilesetTile[];
};

type TiledMap = {
  width?: number;
  height?: number;
  tilewidth?: number;
  tileheight?: number;
  layers?: TiledLayer[];
  tilesets?: TiledTileset[];
};

export type RectBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FarmRenderableTileLayer = {
  id: number;
  name: string;
  opacity: number;
  visible: boolean;
  groupPath: string[];
};

export type FarmSpawnPoint = {
  id: string;
  x: number;
  y: number;
  objectId: number;
};

export type FarmSpawnResolution = {
  point: { x: number; y: number };
  resolvedSpawnId: string | null;
  usedFallback: boolean;
};

export type FarmCollisionShape =
  | {
      id: number;
      kind: 'rectangle';
      bounds: RectBounds;
      sourceName: string;
    }
  | {
      id: number;
      kind: 'polygon';
      bounds: RectBounds;
      points: Array<{ x: number; y: number }>;
      sourceName: string;
    };

export type FarmSceneTransition = {
  id: number;
  name: string;
  bounds: RectBounds;
  targetScene: string | null;
  targetSpawn: string | null;
  properties: Record<string, unknown>;
};

export type FarmInteractable = {
  id: number;
  name: string;
  bounds: RectBounds;
  interactionType: string | null;
  targetScene: string | null;
  targetSpawn: string | null;
  properties: Record<string, unknown>;
};

export type FarmPlotLayerCapabilities = {
  farmable: boolean;
  gridBased: boolean;
  supportsSeeds: boolean;
  supportsWatering: boolean;
  toolType: string | null;
};

export type FarmPlotTile = {
  tileX: number;
  tileY: number;
  worldX: number;
  worldY: number;
  centerX: number;
  centerY: number;
  gid: number;
  sourceLayer: string;
};

export type FarmPlotsRuntime = {
  capabilities: FarmPlotLayerCapabilities;
  tiles: FarmPlotTile[];
  tileKeys: Set<string>;
};

export type HarvestableGroupRuntime = {
  groupName: string;
  harvestable: boolean;
  resourceType: string | null;
  toolType: string | null;
};

export type HarvestableTileRuntime = {
  tileX: number;
  tileY: number;
  worldX: number;
  worldY: number;
  centerX: number;
  centerY: number;
  gid: number;
  sourceGroup: string;
  sourceLayer: string;
  resourceType: string | null;
  toolType: string | null;
};

export type FarmTiledMapRuntime = {
  mapData: TiledMap;
  mapSize: {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    pixelWidth: number;
    pixelHeight: number;
  };
  renderableTileLayers: FarmRenderableTileLayer[];
  spawnPoints: Map<string, FarmSpawnPoint>;
  collisions: FarmCollisionShape[];
  sceneTransitions: FarmSceneTransition[];
  interactables: FarmInteractable[];
  farmPlots: FarmPlotsRuntime;
  harvestableGroups: HarvestableGroupRuntime[];
  harvestables: HarvestableTileRuntime[];
};

const VISUAL_ROOT_GROUPS = new Set(['Terrain', 'Decor_Below', 'Gameplay', 'Architecture']);
const HARVESTABLE_GROUP_PREFIX = 'Harvestables_';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeGlobalTileId(value: unknown): number {
  const gid = toNumber(value, 0);
  if (gid <= 0) {
    return 0;
  }

  const unsigned = Math.trunc(gid) >>> 0;
  return unsigned & 0x1fffffff;
}

function getPropertiesRecord(properties: TiledProperty[] | undefined): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  if (!Array.isArray(properties)) {
    return output;
  }

  for (const property of properties) {
    const name = toString(property.name);
    if (!name) {
      continue;
    }
    output[name] = property.value;
  }

  return output;
}

function parseTilesetName(tileset: TiledTileset, index: number): string {
  const explicitName = toString(tileset.name);
  if (explicitName) {
    return explicitName;
  }

  const source = toString(tileset.source);
  if (source) {
    const normalized = source.replace(/\\/g, '/');
    const fileName = normalized.split('/').at(-1) ?? normalized;
    const withoutExtension = fileName.replace(/\.tsx$/i, '').trim();
    if (withoutExtension.length > 0) {
      return withoutExtension;
    }
  }

  return `tileset_${index + 1}`;
}

function collectMaxGidFromLayers(layers: TiledLayer[] | undefined): number {
  if (!Array.isArray(layers)) {
    return 0;
  }

  let maxGid = 0;
  for (const layer of layers) {
    if (layer.type === 'tilelayer' && Array.isArray(layer.data)) {
      for (const rawGid of layer.data) {
        const gid = normalizeGlobalTileId(rawGid);
        if (gid > maxGid) {
          maxGid = gid;
        }
      }
    }

    if (Array.isArray(layer.layers)) {
      const nestedMaxGid = collectMaxGidFromLayers(layer.layers);
      if (nestedMaxGid > maxGid) {
        maxGid = nestedMaxGid;
      }
    }
  }

  return maxGid;
}

function normalizeTilesets(map: TiledMap): void {
  if (!Array.isArray(map.tilesets) || map.tilesets.length === 0) {
    return;
  }

  const tileWidth = Math.max(1, toNumber(map.tilewidth, 16));
  const tileHeight = Math.max(1, toNumber(map.tileheight, 16));
  const maxGid = collectMaxGidFromLayers(map.layers);
  const sortedTilesets = map.tilesets
    .map((tileset, index) => ({
      index,
      firstGid: Math.max(1, toNumber(tileset.firstgid, 1)),
    }))
    .sort((a, b) => a.firstGid - b.firstGid);
  const usedTilesetNames = new Map<string, number>();

  for (const [sortedIndex, current] of sortedTilesets.entries()) {
    const tileset = map.tilesets[current.index];
    if (!tileset) {
      continue;
    }

    const next = sortedTilesets[sortedIndex + 1];
    const currentFirstGid = current.firstGid;
    const nextFirstGid = next ? next.firstGid : maxGid + 1;
    const inferredTileCount = Math.max(1, nextFirstGid - currentFirstGid);
    const parsedName = parseTilesetName(tileset, current.index);
    const existingCount = usedTilesetNames.get(parsedName) ?? 0;
    const uniqueName = existingCount === 0 ? parsedName : `${parsedName}__${existingCount + 1}`;
    usedTilesetNames.set(parsedName, existingCount + 1);

    tileset.firstgid = currentFirstGid;
    tileset.name = uniqueName;
    tileset.tilewidth = Math.max(1, toNumber(tileset.tilewidth, tileWidth));
    tileset.tileheight = Math.max(1, toNumber(tileset.tileheight, tileHeight));
    tileset.tilecount = Math.max(1, toNumber(tileset.tilecount, inferredTileCount));
    tileset.columns = Math.max(1, toNumber(tileset.columns, Math.min(tileset.tilecount, 64)));
    tileset.margin = Math.max(0, toNumber(tileset.margin, 0));
    tileset.spacing = Math.max(0, toNumber(tileset.spacing, 0));
    tileset.imagewidth = Math.max(
      tileset.tilewidth,
      toNumber(tileset.imagewidth, tileset.columns * tileset.tilewidth),
    );
    tileset.imageheight = Math.max(
      tileset.tileheight,
      toNumber(
        tileset.imageheight,
        Math.ceil(tileset.tilecount / Math.max(1, tileset.columns)) * tileset.tileheight,
      ),
    );
    tileset.image = toString(tileset.image) ?? '__runtime_generated_fallback__.png';
    delete tileset.source;
  }
}

function cloneAndNormalizeMap(rawMap: unknown): TiledMap | null {
  if (!isRecord(rawMap)) {
    return null;
  }

  let clonedMap: TiledMap;
  try {
    clonedMap = JSON.parse(JSON.stringify(rawMap)) as TiledMap;
  } catch {
    return null;
  }

  if (!Array.isArray(clonedMap.layers)) {
    return null;
  }

  clonedMap.width = Math.max(1, toNumber(clonedMap.width, 1));
  clonedMap.height = Math.max(1, toNumber(clonedMap.height, 1));
  clonedMap.tilewidth = Math.max(1, toNumber(clonedMap.tilewidth, 16));
  clonedMap.tileheight = Math.max(1, toNumber(clonedMap.tileheight, 16));
  if (!Array.isArray(clonedMap.tilesets)) {
    clonedMap.tilesets = [];
  }
  normalizeTilesets(clonedMap);
  return clonedMap;
}

function findGroupLayer(layers: TiledLayer[] | undefined, groupName: string): TiledLayer | null {
  if (!Array.isArray(layers)) {
    return null;
  }

  for (const layer of layers) {
    if (layer.type === 'group' && layer.name === groupName) {
      return layer;
    }
  }

  return null;
}

function findLayerByName(
  layers: TiledLayer[] | undefined,
  layerName: string,
  expectedType?: 'group' | 'objectgroup' | 'tilelayer',
): TiledLayer | null {
  if (!Array.isArray(layers)) {
    return null;
  }

  for (const layer of layers) {
    if (layer.name !== layerName) {
      continue;
    }

    if (expectedType && layer.type !== expectedType) {
      continue;
    }

    return layer;
  }

  return null;
}

function normalizeBounds(x: number, y: number, width: number, height: number): RectBounds {
  const normalizedWidth = Math.abs(width);
  const normalizedHeight = Math.abs(height);
  const normalizedX = width >= 0 ? x : x + width;
  const normalizedY = height >= 0 ? y : y + height;
  return {
    x: normalizedX,
    y: normalizedY,
    width: Math.max(1, normalizedWidth),
    height: Math.max(1, normalizedHeight),
  };
}

function getObjectRotationDegrees(object: TiledObject): number {
  const rotation = toNumber(object.rotation, 0);
  if (!Number.isFinite(rotation)) {
    return 0;
  }

  // Tiled stores clockwise degrees in top-left coordinate space.
  return rotation;
}

function getRotatedRectanglePoints(object: TiledObject): Array<{ x: number; y: number }> | null {
  const width = toNumber(object.width, 0);
  const height = toNumber(object.height, 0);
  if (Math.abs(width) <= 0.0001 || Math.abs(height) <= 0.0001) {
    return null;
  }

  const rotationDeg = getObjectRotationDegrees(object);
  if (Math.abs(rotationDeg) <= 0.0001) {
    return null;
  }

  const originX = toNumber(object.x, 0);
  const originY = toNumber(object.y, 0);
  const radians = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const rotateLocalPoint = (localX: number, localY: number): { x: number; y: number } => ({
    x: originX + localX * cos - localY * sin,
    y: originY + localX * sin + localY * cos,
  });

  return [
    rotateLocalPoint(0, 0),
    rotateLocalPoint(width, 0),
    rotateLocalPoint(width, height),
    rotateLocalPoint(0, height),
  ];
}

function getBoundsFromPoints(points: Array<{ x: number; y: number }>): RectBounds | null {
  if (points.length === 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  return normalizeBounds(minX, minY, maxX - minX, maxY - minY);
}

function getObjectBounds(object: TiledObject): RectBounds | null {
  const objectX = toNumber(object.x, 0);
  const objectY = toNumber(object.y, 0);
  const objectWidth = toNumber(object.width, 0);
  const objectHeight = toNumber(object.height, 0);

  if (Array.isArray(object.polygon) && object.polygon.length > 0) {
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const point of object.polygon) {
      const px = objectX + toNumber(point.x, 0);
      const py = objectY + toNumber(point.y, 0);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
      return null;
    }

    return normalizeBounds(minX, minY, maxX - minX, maxY - minY);
  }

  const rotatedRectanglePoints = getRotatedRectanglePoints(object);
  if (rotatedRectanglePoints) {
    return getBoundsFromPoints(rotatedRectanglePoints);
  }

  if (objectWidth > 0 || objectHeight > 0) {
    return normalizeBounds(objectX, objectY, objectWidth, objectHeight);
  }

  return null;
}

function collectRenderableTileLayers(
  layers: TiledLayer[] | undefined,
  parentPath: string[] = [],
  parentVisible = true,
  parentOpacity = 1,
): FarmRenderableTileLayer[] {
  if (!Array.isArray(layers)) {
    return [];
  }

  const output: FarmRenderableTileLayer[] = [];
  for (const layer of layers) {
    const layerName = toString(layer.name) ?? '';
    const layerVisible = parentVisible && toBoolean(layer.visible, true);
    const layerOpacity = parentOpacity * toNumber(layer.opacity, 1);
    const path = [...parentPath, layerName];

    // FarmPlots is a logical gameplay layer and must never be rendered visually.
    if (layerName === 'FarmPlots') {
      continue;
    }

    if (layer.type === 'group') {
      output.push(
        ...collectRenderableTileLayers(
          layer.layers,
          path,
          layerVisible,
          layerOpacity,
        ),
      );
      continue;
    }

    if (layer.type !== 'tilelayer' || !layerVisible) {
      continue;
    }

    const layerId = toNumber(layer.id, -1);
    if (layerId < 0) {
      continue;
    }

    output.push({
      id: layerId,
      name: layerName,
      opacity: layerOpacity,
      visible: layerVisible,
      groupPath: path,
    });
  }

  return output;
}

function buildSpawnPoints(spawnObjects: TiledObject[] | undefined): Map<string, FarmSpawnPoint> {
  const output = new Map<string, FarmSpawnPoint>();
  if (!Array.isArray(spawnObjects)) {
    return output;
  }

  for (const object of spawnObjects) {
    const spawnId = toString(object.name);
    if (!spawnId) {
      continue;
    }

    output.set(spawnId, {
      id: spawnId,
      x: toNumber(object.x, 0),
      y: toNumber(object.y, 0),
      objectId: toNumber(object.id, -1),
    });
  }

  return output;
}

export function resolveSpawnPoint(
  spawnPoints: Map<string, FarmSpawnPoint>,
  spawnId: string | null | undefined,
  fallbackSpawnId = 'spawn_default',
): FarmSpawnResolution {
  const requestedSpawnId = toString(spawnId);
  if (requestedSpawnId && spawnPoints.has(requestedSpawnId)) {
    const point = spawnPoints.get(requestedSpawnId)!;
    return {
      point: { x: point.x, y: point.y },
      resolvedSpawnId: point.id,
      usedFallback: false,
    };
  }

  const fallbackPoint = spawnPoints.get(fallbackSpawnId);
  if (fallbackPoint) {
    return {
      point: { x: fallbackPoint.x, y: fallbackPoint.y },
      resolvedSpawnId: fallbackPoint.id,
      usedFallback: true,
    };
  }

  const firstPoint = spawnPoints.values().next().value as FarmSpawnPoint | undefined;
  if (firstPoint) {
    return {
      point: { x: firstPoint.x, y: firstPoint.y },
      resolvedSpawnId: firstPoint.id,
      usedFallback: true,
    };
  }

  return {
    point: { x: 0, y: 0 },
    resolvedSpawnId: null,
    usedFallback: true,
  };
}

export function buildCollisionShapes(
  collisionObjects: TiledObject[] | undefined,
  sourceName = 'Collisions',
): FarmCollisionShape[] {
  if (!Array.isArray(collisionObjects)) {
    return [];
  }

  const output: FarmCollisionShape[] = [];
  for (const object of collisionObjects) {
    if (!toBoolean(object.visible, true)) {
      continue;
    }

    const objectId = toNumber(object.id, -1);
    const bounds = getObjectBounds(object);
    if (!bounds) {
      continue;
    }

    if (Array.isArray(object.polygon) && object.polygon.length > 0) {
      const points = object.polygon.map((point) => ({
        x: toNumber(object.x, 0) + toNumber(point.x, 0),
        y: toNumber(object.y, 0) + toNumber(point.y, 0),
      }));
      output.push({
        id: objectId,
        kind: 'polygon',
        bounds,
        points,
        sourceName,
      });
      continue;
    }

    const rotatedRectanglePoints = getRotatedRectanglePoints(object);
    if (rotatedRectanglePoints) {
      output.push({
        id: objectId,
        kind: 'polygon',
        bounds,
        points: rotatedRectanglePoints,
        sourceName,
      });
      continue;
    }

    output.push({
      id: objectId,
      kind: 'rectangle',
      bounds,
      sourceName,
    });
  }

  return output;
}

type GameplayTileLayerEntry = {
  layer: TiledLayer;
  layerName: string;
  groupPath: string[];
};

type TilesetCollisionMetadata = {
  firstGid: number;
  lastGid: number;
  collisionObjectsByLocalTileId: Map<number, TiledObject[]>;
};

function collectGameplayTileLayers(
  layers: TiledLayer[] | undefined,
  parentPath: string[] = [],
): GameplayTileLayerEntry[] {
  if (!Array.isArray(layers)) {
    return [];
  }

  const output: GameplayTileLayerEntry[] = [];
  for (const layer of layers) {
    if (!toBoolean(layer.visible, true)) {
      continue;
    }

    const layerName = toString(layer.name) ?? '';
    const nextPath = [...parentPath, layerName];

    if (layer.type === 'group') {
      output.push(...collectGameplayTileLayers(layer.layers, nextPath));
      continue;
    }

    if (layer.type !== 'tilelayer' || layerName === 'FarmPlots') {
      continue;
    }

    output.push({
      layer,
      layerName: layerName || 'tile_layer',
      groupPath: nextPath,
    });
  }

  return output;
}

function buildTilesetCollisionMetadata(tilesets: TiledTileset[] | undefined): TilesetCollisionMetadata[] {
  if (!Array.isArray(tilesets) || tilesets.length === 0) {
    return [];
  }

  const output: TilesetCollisionMetadata[] = [];
  for (const tileset of tilesets) {
    const firstGid = Math.max(1, toNumber(tileset.firstgid, 1));
    const tileCount = Math.max(1, toNumber(tileset.tilecount, 1));
    const tileEntries = Array.isArray(tileset.tiles) ? tileset.tiles : [];
    const collisionObjectsByLocalTileId = new Map<number, TiledObject[]>();

    for (const tileEntry of tileEntries) {
      const localTileId = toNumber(tileEntry.id, -1);
      if (localTileId < 0) {
        continue;
      }

      const objectGroup = tileEntry.objectgroup;
      const objects = Array.isArray(objectGroup?.objects) ? objectGroup.objects : [];
      if (objects.length === 0) {
        continue;
      }

      collisionObjectsByLocalTileId.set(localTileId, objects);
    }

    if (collisionObjectsByLocalTileId.size === 0) {
      continue;
    }

    output.push({
      firstGid,
      lastGid: firstGid + tileCount - 1,
      collisionObjectsByLocalTileId,
    });
  }

  output.sort((a, b) => a.firstGid - b.firstGid);
  return output;
}

function resolveTilesetCollisionObjectsForGid(
  gid: number,
  metadata: TilesetCollisionMetadata[],
): TiledObject[] | null {
  for (let index = metadata.length - 1; index >= 0; index -= 1) {
    const entry = metadata[index];
    if (!entry || gid < entry.firstGid || gid > entry.lastGid) {
      continue;
    }

    const localTileId = gid - entry.firstGid;
    return entry.collisionObjectsByLocalTileId.get(localTileId) ?? null;
  }

  return null;
}

function buildTileCollisionShapesFromGameplayTiles(
  gameplayGroup: TiledLayer | null,
  mapData: TiledMap,
  mapSize: { width: number; height: number; tileWidth: number; tileHeight: number },
): FarmCollisionShape[] {
  if (!gameplayGroup || gameplayGroup.type !== 'group') {
    return [];
  }

  const tilesetCollisionMetadata = buildTilesetCollisionMetadata(mapData.tilesets);
  if (tilesetCollisionMetadata.length === 0) {
    return [];
  }

  const gameplayTileLayers = collectGameplayTileLayers(gameplayGroup.layers, ['Gameplay']);
  if (gameplayTileLayers.length === 0) {
    return [];
  }

  const output: FarmCollisionShape[] = [];
  for (const layerEntry of gameplayTileLayers) {
    const tiles = extractTilesFromTileLayer(layerEntry.layer, mapSize);
    for (const tile of tiles) {
      const collisionObjects = resolveTilesetCollisionObjectsForGid(tile.gid, tilesetCollisionMetadata);
      if (!collisionObjects || collisionObjects.length === 0) {
        continue;
      }

      const tileWorldX = tile.tileX * mapSize.tileWidth;
      const tileWorldY = tile.tileY * mapSize.tileHeight;
      const shiftedObjects = collisionObjects.map((object) => ({
        ...object,
        x: tileWorldX + toNumber(object.x, 0),
        y: tileWorldY + toNumber(object.y, 0),
      }));
      const sourceName = `TileCollision:${layerEntry.groupPath.join('/')}:tile_${tile.tileX}_${tile.tileY}:gid_${tile.gid}`;
      output.push(...buildCollisionShapes(shiftedObjects, sourceName));
    }
  }

  return output;
}

export function buildSceneTransitions(
  transitionObjects: TiledObject[] | undefined,
): FarmSceneTransition[] {
  if (!Array.isArray(transitionObjects)) {
    return [];
  }

  const output: FarmSceneTransition[] = [];
  for (const object of transitionObjects) {
    if (!toBoolean(object.visible, true)) {
      continue;
    }

    const bounds = getObjectBounds(object);
    if (!bounds) {
      continue;
    }

    const properties = getPropertiesRecord(object.properties);
    output.push({
      id: toNumber(object.id, -1),
      name: toString(object.name) ?? `transition_${toNumber(object.id, 0)}`,
      bounds,
      targetScene: toString(properties.targetScene) ?? null,
      targetSpawn: toString(properties.targetSpawn) ?? null,
      properties,
    });
  }

  return output;
}

export function buildInteractables(
  interactableObjects: TiledObject[] | undefined,
): FarmInteractable[] {
  if (!Array.isArray(interactableObjects)) {
    return [];
  }

  const output: FarmInteractable[] = [];
  for (const object of interactableObjects) {
    if (!toBoolean(object.visible, true)) {
      continue;
    }

    const bounds = getObjectBounds(object);
    if (!bounds) {
      continue;
    }

    const properties = getPropertiesRecord(object.properties);
    output.push({
      id: toNumber(object.id, -1),
      name: toString(object.name) ?? `interactable_${toNumber(object.id, 0)}`,
      bounds,
      interactionType: toString(properties.interactionType) ?? null,
      targetScene: toString(properties.targetScene) ?? null,
      targetSpawn: toString(properties.targetSpawn) ?? null,
      properties,
    });
  }

  return output;
}

function buildTileKey(tileX: number, tileY: number): string {
  return `${tileX}:${tileY}`;
}

function extractTilesFromTileLayer(
  layer: TiledLayer,
  mapSize: { width: number; height: number; tileWidth: number; tileHeight: number },
): Array<{ tileX: number; tileY: number; gid: number }> {
  if (!Array.isArray(layer.data)) {
    return [];
  }

  const output: Array<{ tileX: number; tileY: number; gid: number }> = [];
  const layerWidth = Math.max(1, toNumber(layer.width, mapSize.width));

  for (let index = 0; index < layer.data.length; index += 1) {
    const gid = normalizeGlobalTileId(layer.data[index]);
    if (gid <= 0) {
      continue;
    }

    const tileX = index % layerWidth;
    const tileY = Math.floor(index / layerWidth);
    output.push({ tileX, tileY, gid });
  }

  return output;
}

export function extractFarmPlots(
  farmPlotsLayer: TiledLayer | null,
  mapSize: { width: number; height: number; tileWidth: number; tileHeight: number },
): FarmPlotsRuntime {
  const defaultCapabilities: FarmPlotLayerCapabilities = {
    farmable: false,
    gridBased: false,
    supportsSeeds: false,
    supportsWatering: false,
    toolType: null,
  };

  if (!farmPlotsLayer) {
    return {
      capabilities: defaultCapabilities,
      tiles: [],
      tileKeys: new Set<string>(),
    };
  }

  const properties = getPropertiesRecord(farmPlotsLayer.properties);
  const capabilities: FarmPlotLayerCapabilities = {
    farmable: toBoolean(properties.farmable, false),
    gridBased: toBoolean(properties.gridBased, false),
    supportsSeeds: toBoolean(properties.supportsSeeds, false),
    supportsWatering: toBoolean(properties.supportsWatering, false),
    toolType: toString(properties.toolType),
  };

  const tiles: FarmPlotTile[] = [];
  const tileKeys = new Set<string>();
  const pushLayerTiles = (layer: TiledLayer, sourceLayerNameFallback: string) => {
    if (layer.type !== 'tilelayer') {
      return;
    }

    const sourceLayerName = toString(layer.name) ?? sourceLayerNameFallback;
    const layerTiles = extractTilesFromTileLayer(layer, mapSize);
    for (const tile of layerTiles) {
      const worldX = tile.tileX * mapSize.tileWidth;
      const worldY = tile.tileY * mapSize.tileHeight;
      tiles.push({
        tileX: tile.tileX,
        tileY: tile.tileY,
        worldX,
        worldY,
        centerX: worldX + mapSize.tileWidth / 2,
        centerY: worldY + mapSize.tileHeight / 2,
        gid: tile.gid,
        sourceLayer: sourceLayerName,
      });
      tileKeys.add(buildTileKey(tile.tileX, tile.tileY));
    }
  };

  if (farmPlotsLayer.type === 'tilelayer') {
    pushLayerTiles(farmPlotsLayer, 'FarmPlots');
  } else if (farmPlotsLayer.type === 'group') {
    const childLayers = Array.isArray(farmPlotsLayer.layers) ? farmPlotsLayer.layers : [];
    for (const childLayer of childLayers) {
      pushLayerTiles(childLayer, 'FarmPlots');
    }
  }

  return {
    capabilities,
    tiles,
    tileKeys,
  };
}

export function extractHarvestableTiles(
  gameplayGroupLayer: TiledLayer | null,
  mapSize: { width: number; height: number; tileWidth: number; tileHeight: number },
): { groups: HarvestableGroupRuntime[]; tiles: HarvestableTileRuntime[] } {
  if (!gameplayGroupLayer || gameplayGroupLayer.type !== 'group') {
    return { groups: [], tiles: [] };
  }

  const groups: HarvestableGroupRuntime[] = [];
  const tiles: HarvestableTileRuntime[] = [];
  const gameplayLayers = Array.isArray(gameplayGroupLayer.layers) ? gameplayGroupLayer.layers : [];

  for (const layer of gameplayLayers) {
    if (layer.type !== 'group') {
      continue;
    }

    const groupName = toString(layer.name);
    if (!groupName || !groupName.startsWith(HARVESTABLE_GROUP_PREFIX)) {
      continue;
    }

    const properties = getPropertiesRecord(layer.properties);
    const groupRuntime: HarvestableGroupRuntime = {
      groupName,
      harvestable: toBoolean(properties.harvestable, false),
      resourceType: toString(properties.resourceType),
      toolType: toString(properties.toolType),
    };
    groups.push(groupRuntime);

    const childLayers = Array.isArray(layer.layers) ? layer.layers : [];
    for (const childLayer of childLayers) {
      if (childLayer.type !== 'tilelayer') {
        continue;
      }

      const sourceLayer = toString(childLayer.name) ?? groupName;
      const layerTiles = extractTilesFromTileLayer(childLayer, mapSize);
      for (const tile of layerTiles) {
        const worldX = tile.tileX * mapSize.tileWidth;
        const worldY = tile.tileY * mapSize.tileHeight;
        tiles.push({
          tileX: tile.tileX,
          tileY: tile.tileY,
          worldX,
          worldY,
          centerX: worldX + mapSize.tileWidth / 2,
          centerY: worldY + mapSize.tileHeight / 2,
          gid: tile.gid,
          sourceGroup: groupName,
          sourceLayer,
          resourceType: groupRuntime.resourceType,
          toolType: groupRuntime.toolType,
        });
      }
    }
  }

  return { groups, tiles };
}

export function loadTiledMap(rawMap: unknown): FarmTiledMapRuntime | null {
  const mapData = cloneAndNormalizeMap(rawMap);
  if (!mapData || !Array.isArray(mapData.layers)) {
    return null;
  }

  const mapSize = {
    width: Math.max(1, toNumber(mapData.width, 1)),
    height: Math.max(1, toNumber(mapData.height, 1)),
    tileWidth: Math.max(1, toNumber(mapData.tilewidth, 16)),
    tileHeight: Math.max(1, toNumber(mapData.tileheight, 16)),
    pixelWidth: Math.max(1, toNumber(mapData.width, 1)) * Math.max(1, toNumber(mapData.tilewidth, 16)),
    pixelHeight: Math.max(1, toNumber(mapData.height, 1)) * Math.max(1, toNumber(mapData.tileheight, 16)),
  };

  const visualRootLayers = mapData.layers.filter((layer) => VISUAL_ROOT_GROUPS.has(toString(layer.name) ?? ''));
  const renderableTileLayers = collectRenderableTileLayers(visualRootLayers);

  const gameplayGroup = findGroupLayer(mapData.layers, 'Gameplay');
  const playerSpawnLayer = findLayerByName(gameplayGroup?.layers, 'PlayerSpawn', 'objectgroup');
  const collisionsLayer = findLayerByName(gameplayGroup?.layers, 'Collisions', 'objectgroup');
  const sceneTransitionsLayer = findLayerByName(gameplayGroup?.layers, 'SceneTransitions', 'objectgroup');
  const interactablesLayer = findLayerByName(gameplayGroup?.layers, 'Interactables', 'objectgroup');
  const farmPlotsLayer = findLayerByName(gameplayGroup?.layers, 'FarmPlots');

  const spawnPoints = buildSpawnPoints(playerSpawnLayer?.objects);
  const collisions = [
    ...buildCollisionShapes(collisionsLayer?.objects, 'Collisions'),
    ...buildTileCollisionShapesFromGameplayTiles(gameplayGroup, mapData, mapSize),
  ];
  const sceneTransitions = buildSceneTransitions(sceneTransitionsLayer?.objects);
  const interactables = buildInteractables(interactablesLayer?.objects);
  const farmPlots = extractFarmPlots(farmPlotsLayer, mapSize);
  const harvestableExtraction = extractHarvestableTiles(gameplayGroup, mapSize);

  return {
    mapData,
    mapSize,
    renderableTileLayers,
    spawnPoints,
    collisions,
    sceneTransitions,
    interactables,
    farmPlots,
    harvestableGroups: harvestableExtraction.groups,
    harvestables: harvestableExtraction.tiles,
  };
}
