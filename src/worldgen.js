import { noa } from './engine'
import { blockIDs } from './registration'
import { encode, decode } from 'voxel-crunch'

/*
 * 
 * New and improved world generation
 * Features multiple biomes, varied terrain, and natural structures
 * 
*/

// this module implements a single world type with multiple biomes
var WORLD_NAME = 'enhanced_world'

// storage for data from voxels that were unloaded
var storage = {}
var chunkIsStored = (id) => { return !!storage[id] }
var storeChunk = (id, arr) => { storage[id] = encode(arr.data) }
var retrieveChunk = (id, arr) => { decode(storage[id], arr.data) }

// set world name
noa.worldName = WORLD_NAME

// catch engine's chunk removal event, and store the data
noa.world.on('chunkBeingRemoved', function (id, array, userData) {
    storeChunk(id, array)
})

/**
 * World generation queue handler
 */
var requestQueue = []
noa.world.on('worldDataNeeded', function (id, array, x, y, z, worldName) {
    requestQueue.push({ id, array, x, y, z, worldName })
})

setInterval(function () {
    for (var i = 0; i < 10; i++) {
        if (requestQueue.length === 0) return
        var req = requestQueue.shift()
        if (chunkIsStored(req.id)) {
            retrieveChunk(req.id, req.array)
        } else {
            // skip out of generating very high or low chunks
            if (req.y < -50 || req.y > 50) {
                var fillVoxel = (req.y >= 0) ? 0 : blockIDs.stone
                return noa.world.setChunkData(req.id, req.array, null, fillVoxel)
            }
            // real worldgen:
            generateChunk(req.array, req.x, req.y, req.z)
        }
        // pass the finished data back to the game engine
        noa.world.setChunkData(req.id, req.array)
    }
}, 10)

/**
 * Noise functions for terrain generation
 */
function noise2D(x, z, scale, magnitude) {
    return magnitude * Math.sin(x / scale) * Math.cos(z / scale)
}

function noise3D(x, y, z, scale, magnitude) {
    return magnitude * Math.sin(x / scale) * Math.cos(z / scale) * Math.sin(y / scale)
}

function ridgedNoise(x, z, scale, magnitude) {
    return magnitude * Math.abs(Math.sin(x / scale) * Math.cos(z / scale))
}

function combinedNoise(x, z) {
    // Combine multiple noise functions for more natural terrain
    let n1 = noise2D(x, z, 100, 15)
    let n2 = noise2D(x, z, 50, 7)
    let n3 = noise2D(x, z, 25, 3)
    let n4 = ridgedNoise(x, z, 200, 10)
    
    return n1 + n2 + n3 + n4
}

/**
 * Biome system
 */
const BIOMES = {
    FOREST: 'forest',
    PLAINS: 'plains',
    MOUNTAINS: 'mountains',
    DESERT: 'desert',
    LAKE: 'lake'
}

function getBiome(x, z) {
    // Use noise to determine biome
    let biomeNoise = noise2D(x, z, 300, 1)
    
    // Create circular lake in the center
    let distFromCenter = Math.sqrt(x * x + z * z)
    if (distFromCenter < 30) {
        return BIOMES.LAKE
    }
    
    // Mountains in one quadrant
    if (x > 50 && z > 50) {
        return BIOMES.MOUNTAINS
    }
    
    // Desert in another quadrant
    if (x < -50 && z < -50) {
        return BIOMES.DESERT
    }
    
    // Forest and plains elsewhere based on noise
    if (biomeNoise > 0) {
        return BIOMES.FOREST
    } else {
        return BIOMES.PLAINS
    }
}

function getTerrainHeight(x, z) {
    const biome = getBiome(x, z)
    let baseHeight = combinedNoise(x, z)
    
    // Adjust height based on biome
    switch (biome) {
        case BIOMES.MOUNTAINS:
            return baseHeight + ridgedNoise(x, z, 80, 25)
        case BIOMES.PLAINS:
            return baseHeight * 0.5
        case BIOMES.FOREST:
            return baseHeight + noise2D(x, z, 20, 2)
        case BIOMES.DESERT:
            return baseHeight * 0.7 + ridgedNoise(x, z, 120, 5)
        case BIOMES.LAKE:
            return -5 + noise2D(x, z, 10, 1)
        default:
            return baseHeight
    }
}

function generateChunk(array, cx, cy, cz) {
    var size = array.shape[0]
    
    for (var i = 0; i < size; ++i) {
        var x = cx + i
        for (var k = 0; k < size; ++k) {
            var z = cz + k
            
            // Get terrain height and biome
            var height = getTerrainHeight(x, z)
            var biome = getBiome(x, z)
            
            for (var j = 0; j < size; ++j) {
                var y = cy + j
                var blockID = getBlockID(x, y, z, height, biome)
                if (blockID) array.set(i, j, k, blockID)
            }
            
            // Add clouds
            if (cy > 30 && cy < 40) {
                var cloudNoise = noise3D(x, cy, z, 30, 1)
                if (cloudNoise > 0.7) {
                    array.set(i, Math.floor((cy - 30) / 2), k, blockIDs.cloud)
                }
            }
        }
    }
}

function getBlockID(x, y, z, height, biome) {
    // Underground layers (common to all biomes)
    if (y < height - 5) {
        return blockIDs.stone
    }
    
    if (y < height - 1) {
        // Small chance of ore veins
        if (Math.random() < 0.05) {
            return blockIDs.shinyDirt
        }
        return blockIDs.dirt
    }
    
    // Surface and above
    if (y < height) {
        switch (biome) {
            case BIOMES.FOREST:
                return blockIDs.grass
            case BIOMES.PLAINS:
                return blockIDs.grass
            case BIOMES.MOUNTAINS:
                return y > 20 ? blockIDs.stone : blockIDs.grass
            case BIOMES.DESERT:
                return blockIDs.shinyDirt // Using shiny dirt as sand
            case BIOMES.LAKE:
                return blockIDs.dirt
            default:
                return blockIDs.grass
        }
    }
    
    // Water in lakes and below sea level
    if (y <= 0) {
        return blockIDs.water
    }
    
    // Vegetation and decorations
    if (y === Math.floor(height) + 1) {
        switch (biome) {
            case BIOMES.FOREST:
                // Tall grass and flowers
                if (Math.random() < 0.3) {
                    return blockIDs.grassDeco
                }
                break
            case BIOMES.PLAINS:
                // Occasional tall grass
                if (Math.random() < 0.1) {
                    return blockIDs.grassDeco
                }
                break
            case BIOMES.MOUNTAINS:
                // Very rare vegetation on mountains
                if (y < 15 && Math.random() < 0.05) {
                    return blockIDs.grassDeco
                }
                break
            case BIOMES.DESERT:
                // Rare desert plants (cacti)
                if (Math.random() < 0.02) {
                    return blockIDs.pole
                }
                break
        }
    }
    
    return 0 // Air
}

// After the world is initialized, add structures and features
setTimeout(function () {
    addWorldFeatures()
}, 500)

function addWorldFeatures() {
    // Add trees in forest biome
    for (let i = 0; i < 100; i++) {
        // Random positions in the forest biome area
        const x = Math.floor(Math.random() * 100) - 50
        const z = Math.floor(Math.random() * 100) - 50
        
        if (getBiome(x, z) === BIOMES.FOREST) {
            const y = Math.floor(getTerrainHeight(x, z))
            if (y > 0) {
                createTree(x, y, z)
            }
        }
    }
    
    // Add some large boulders in mountains
    for (let i = 0; i < 20; i++) {
        const x = 50 + Math.floor(Math.random() * 50)
        const z = 50 + Math.floor(Math.random() * 50)
        
        if (getBiome(x, z) === BIOMES.MOUNTAINS) {
            const y = Math.floor(getTerrainHeight(x, z))
            createBoulder(x, y, z)
        }
    }
    
    // Add some desert structures
    for (let i = 0; i < 5; i++) {
        const x = -50 - Math.floor(Math.random() * 50)
        const z = -50 - Math.floor(Math.random() * 50)
        
        if (getBiome(x, z) === BIOMES.DESERT) {
            const y = Math.floor(getTerrainHeight(x, z))
            createDesertStructure(x, y, z)
        }
    }
    
    // Add a small village near spawn
    createVillage(-20, Math.floor(getTerrainHeight(-20, 10)), 10)
}

function createTree(x, y, z) {
    // Create tree trunk
    const trunkHeight = 4 + Math.floor(Math.random() * 3) // 4-6 blocks tall
    for (let i = 0; i < trunkHeight; i++) {
        noa.setBlock(blockIDs.pole, x, y + i, z)
    }
    
    // Create tree leaves
    const leafRadius = 2
    const leafHeight = 3
    const leafStartY = trunkHeight - 2
    
    for (let ly = 0; ly < leafHeight; ly++) {
        const r = ly === 0 ? leafRadius : ly === leafHeight - 1 ? 1 : leafRadius
        for (let lx = -r; lx <= r; lx++) {
            for (let lz = -r; lz <= r; lz++) {
                // Skip corners for a more natural rounded shape
                if (Math.abs(lx) === r && Math.abs(lz) === r) continue
                
                // Add leaves
                noa.setBlock(blockIDs.grassDeco, x + lx, y + leafStartY + ly, z + lz)
            }
        }
    }
}

function createBoulder(x, y, z) {
    const size = 2 + Math.floor(Math.random() * 3) // 2-4 blocks
    
    for (let bx = -size; bx <= size; bx++) {
        for (let by = -size; by <= size; by++) {
            for (let bz = -size; bz <= size; bz++) {
                // Create a roughly spherical shape
                const dist = Math.sqrt(bx * bx + by * by + bz * bz)
                if (dist <= size) {
                    noa.setBlock(blockIDs.stone, x + bx, y + by, z + bz)
                }
            }
        }
    }
}

function createDesertStructure(x, y, z) {
    // Create a small pyramid
    const size = 5
    
    for (let level = 0; level < size; level++) {
        for (let px = -size + level; px <= size - level; px++) {
            for (let pz = -size + level; pz <= size - level; pz++) {
                noa.setBlock(blockIDs.shinyDirt, x + px, y + level, z + pz)
            }
        }
    }
    
    // Add some decorative elements
    noa.setBlock(blockIDs.stoneTrans, x, y + size, z)
    noa.setBlock(blockIDs.window, x + 1, y + 1, z)
    noa.setBlock(blockIDs.window, x - 1, y + 1, z)
}

function createVillage(x, y, z) {
    // Create a few small houses
    createHouse(x, y, z, 5, 4, 6)
    createHouse(x + 10, y, z - 5, 6, 4, 5)
    createHouse(x - 8, y, z + 8, 4, 4, 4)
    
    // Create a central well
    createWell(x + 5, y, z + 5)
    
    // Add some paths connecting buildings
    createPath(x + 3, y, z + 3, x + 5, y, z + 5)
    createPath(x + 5, y, z + 5, x + 10, y, z - 5)
    createPath(x + 5, y, z + 5, x - 8, y, z + 8)
}

function createHouse(x, y, z, width, height, depth) {
    // Create the floor
    for (let px = 0; px < width; px++) {
        for (let pz = 0; pz < depth; pz++) {
            noa.setBlock(blockIDs.stone, x + px, y, z + pz)
        }
    }
    
    // Create walls
    for (let py = 1; py < height; py++) {
        for (let px = 0; px < width; px++) {
            noa.setBlock(blockIDs.pole, x + px, y + py, z)
            noa.setBlock(blockIDs.pole, x + px, y + py, z + depth - 1)
        }
        
        for (let pz = 1; pz < depth - 1; pz++) {
            noa.setBlock(blockIDs.pole, x, y + py, z + pz)
            noa.setBlock(blockIDs.pole, x + width - 1, y + py, z + pz)
        }
    }
    
    // Add a door
    noa.setBlock(0, x + Math.floor(width / 2), y + 1, z)
    noa.setBlock(0, x + Math.floor(width / 2), y + 2, z)
    
    // Add windows
    noa.setBlock(blockIDs.window, x + 1, y + 2, z)
    noa.setBlock(blockIDs.window, x + width - 2, y + 2, z)
    noa.setBlock(blockIDs.window, x + 1, y + 2, z + depth - 1)
    noa.setBlock(blockIDs.window, x + width - 2, y + 2, z + depth - 1)
    
    // Create a roof
    for (let px = -1; px < width + 1; px++) {
        for (let pz = -1; pz < depth + 1; pz++) {
            noa.setBlock(blockIDs.shinyDirt, x + px, y + height, z + pz)
        }
    }
}

function createWell(x, y, z) {
    // Create the well structure
    for (let px = -1; px <= 1; px++) {
        for (let pz = -1; pz <= 1; pz++) {
            if (px === 0 && pz === 0) continue // Center is empty
            noa.setBlock(blockIDs.stone, x + px, y, z + pz)
            noa.setBlock(blockIDs.stone, x + px, y + 1, z + pz)
        }
    }
    
    // Add water in the center
    noa.setBlock(blockIDs.water, x, y, z)
    
    // Add a roof structure
    noa.setBlock(blockIDs.pole, x - 1, y + 2, z - 1)
    noa.setBlock(blockIDs.pole, x + 1, y + 2, z - 1)
    noa.setBlock(blockIDs.pole, x - 1, y + 2, z + 1)
    noa.setBlock(blockIDs.pole, x + 1, y + 2, z + 1)
    
    for (let px = -1; px <= 1; px++) {
        for (let pz = -1; pz <= 1; pz++) {
            noa.setBlock(blockIDs.shinyDirt, x + px, y + 3, z + pz)
        }
    }
}

function createPath(x1, y1, z1, x2, y2, z2) {
    // Create a simple path between two points
    const dx = x2 - x1
    const dz = z2 - z1
    const steps = Math.max(Math.abs(dx), Math.abs(dz))
    
    for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps
        const x = Math.round(x1 + dx * t)
        const z = Math.round(z1 + dz * t)
        noa.setBlock(blockIDs.stone, x, y1, z)
    }
}

