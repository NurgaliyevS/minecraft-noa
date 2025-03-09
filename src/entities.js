import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Color3 } from '@babylonjs/core/Maths/math.color'

import { noa } from './engine'
import { setMeshShadows } from './shadows'

/*
 * 
 *      Create a 2D Steve (Minecraft) character
 * 
*/

// get the player entity's ID and other info
var eid = noa.playerEntity
var dat = noa.entities.getPositionData(eid)
var w = dat.width
var h = dat.height

// Create a scene for the player
const scene = noa.rendering.getScene()

// Create front and back planes for the player
const frontPlane = CreatePlane('player-front', { width: w, height: h }, scene)
const backPlane = CreatePlane('player-back', { width: w, height: h }, scene)

// Rotate back plane to face opposite direction
backPlane.rotation.y = Math.PI

// Create materials for front and back
const frontMaterial = new StandardMaterial('steve-front-material', scene)
const backMaterial = new StandardMaterial('steve-back-material', scene)

// Create a procedural texture using canvas for Steve's front
const SIZE = 256
const canvasFront = document.createElement('canvas')
canvasFront.width = SIZE
canvasFront.height = SIZE
const ctxFront = canvasFront.getContext('2d')

// Fill with transparent background
ctxFront.clearRect(0, 0, SIZE, SIZE)

// Draw Steve (front view)
// Head
ctxFront.fillStyle = '#c18c65' // Steve's skin tone
ctxFront.fillRect(SIZE * 0.3, SIZE * 0.1, SIZE * 0.4, SIZE * 0.25)

// Hair/top of head
ctxFront.fillStyle = '#3e321e' // Brown hair
ctxFront.fillRect(SIZE * 0.3, SIZE * 0.1, SIZE * 0.4, SIZE * 0.05)

// Eyes
ctxFront.fillStyle = '#ffffff' // White of eyes
ctxFront.fillRect(SIZE * 0.35, SIZE * 0.15, SIZE * 0.08, SIZE * 0.08)
ctxFront.fillRect(SIZE * 0.57, SIZE * 0.15, SIZE * 0.08, SIZE * 0.08)

ctxFront.fillStyle = '#2a5595' // Blue eyes
ctxFront.fillRect(SIZE * 0.38, SIZE * 0.18, SIZE * 0.05, SIZE * 0.05)
ctxFront.fillRect(SIZE * 0.57, SIZE * 0.18, SIZE * 0.05, SIZE * 0.05)

// Mouth
ctxFront.fillStyle = '#926552' // Darker shade for mouth
ctxFront.fillRect(SIZE * 0.4, SIZE * 0.25, SIZE * 0.2, SIZE * 0.03)

// Body - shirt
ctxFront.fillStyle = '#2a5595' // Blue shirt
ctxFront.fillRect(SIZE * 0.3, SIZE * 0.35, SIZE * 0.4, SIZE * 0.25)

// Arms
ctxFront.fillStyle = '#2a5595' // Blue sleeves
ctxFront.fillRect(SIZE * 0.2, SIZE * 0.35, SIZE * 0.1, SIZE * 0.25)
ctxFront.fillRect(SIZE * 0.7, SIZE * 0.35, SIZE * 0.1, SIZE * 0.25)

// Hands
ctxFront.fillStyle = '#c18c65' // Skin tone
ctxFront.fillRect(SIZE * 0.2, SIZE * 0.6, SIZE * 0.1, SIZE * 0.05)
ctxFront.fillRect(SIZE * 0.7, SIZE * 0.6, SIZE * 0.1, SIZE * 0.05)

// Legs - pants
ctxFront.fillStyle = '#7a5f44' // Darker brown pants
ctxFront.fillRect(SIZE * 0.3, SIZE * 0.6, SIZE * 0.15, SIZE * 0.35)
ctxFront.fillRect(SIZE * 0.55, SIZE * 0.6, SIZE * 0.15, SIZE * 0.35)

// Shoes
ctxFront.fillStyle = '#3d3a38' // Dark gray shoes
ctxFront.fillRect(SIZE * 0.3, SIZE * 0.95, SIZE * 0.15, SIZE * 0.05)
ctxFront.fillRect(SIZE * 0.55, SIZE * 0.95, SIZE * 0.15, SIZE * 0.05)

// Create a canvas for the back view
const canvasBack = document.createElement('canvas')
canvasBack.width = SIZE
canvasBack.height = SIZE
const ctxBack = canvasBack.getContext('2d')

// Fill with transparent background
ctxBack.clearRect(0, 0, SIZE, SIZE)

// Draw Steve (back view)
// Head
ctxBack.fillStyle = '#c18c65' // Steve's skin tone
ctxBack.fillRect(SIZE * 0.3, SIZE * 0.1, SIZE * 0.4, SIZE * 0.25)

// Hair (all brown for back of head)
ctxBack.fillStyle = '#3e321e' // Brown hair
ctxBack.fillRect(SIZE * 0.3, SIZE * 0.1, SIZE * 0.4, SIZE * 0.25)

// Body - shirt back
ctxBack.fillStyle = '#224578' // Darker blue for back of shirt
ctxBack.fillRect(SIZE * 0.3, SIZE * 0.35, SIZE * 0.4, SIZE * 0.25)

// Arms
ctxBack.fillStyle = '#224578' // Darker blue for back of sleeves
ctxBack.fillRect(SIZE * 0.2, SIZE * 0.35, SIZE * 0.1, SIZE * 0.25)
ctxBack.fillRect(SIZE * 0.7, SIZE * 0.35, SIZE * 0.1, SIZE * 0.25)

// Hands
ctxBack.fillStyle = '#c18c65' // Skin tone
ctxBack.fillRect(SIZE * 0.2, SIZE * 0.6, SIZE * 0.1, SIZE * 0.05)
ctxBack.fillRect(SIZE * 0.7, SIZE * 0.6, SIZE * 0.1, SIZE * 0.05)

// Legs - pants
ctxBack.fillStyle = '#64503a' // Darker brown for back of pants
ctxBack.fillRect(SIZE * 0.3, SIZE * 0.6, SIZE * 0.15, SIZE * 0.35)
ctxBack.fillRect(SIZE * 0.55, SIZE * 0.6, SIZE * 0.15, SIZE * 0.35)

// Shoes
ctxBack.fillStyle = '#3d3a38' // Dark gray shoes
ctxBack.fillRect(SIZE * 0.3, SIZE * 0.95, SIZE * 0.15, SIZE * 0.05)
ctxBack.fillRect(SIZE * 0.55, SIZE * 0.95, SIZE * 0.15, SIZE * 0.05)

// Create textures from canvases
const textureFront = new Texture(canvasFront.toDataURL(), scene)
const textureBack = new Texture(canvasBack.toDataURL(), scene)

// Apply textures to materials
frontMaterial.diffuseTexture = textureFront
backMaterial.diffuseTexture = textureBack

// Make materials emissive to ensure visibility in all lighting conditions
frontMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5)
backMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5)

// Remove specular reflection
frontMaterial.specularColor = new Color3(0, 0, 0)
backMaterial.specularColor = new Color3(0, 0, 0)

// Apply materials to meshes
frontPlane.material = frontMaterial
backPlane.material = backMaterial

// Create a parent mesh to hold both planes
const playerMesh = frontPlane
playerMesh.addChild(backPlane)

// Make the player always face the camera horizontally (Y-axis billboarding)
// This preserves the up direction but makes the character face the camera horizontally
playerMesh.billboardMode = 2 // BABYLON.Mesh.BILLBOARDMODE_Y

// offset of mesh relative to the entity's "position" (center of its feet)
var offset = [0, h/2, 0]

// add a "mesh" component to the player entity
noa.entities.addComponent(eid, noa.entities.names.mesh, {
    mesh: playerMesh,
    offset: offset
})

// apply shadows
setMeshShadows(playerMesh, true)