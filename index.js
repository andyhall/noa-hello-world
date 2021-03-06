/* globals BABYLON */
'use strict';


/** 
 * # Deprecated
 * 
 * .
 * 
 * .
 * 
 * .
 * 
 * >  
 * > This has been rolled into the main [noa](https://github.com/andyhall/noa)
 * repo as `/examples/hello-world/`. 
 * > 
 * > Go look there!
 * >  
 * 
 * .
 * 
 * .
 * 
 * .
 */


/** 
 * @class noa-hello-world
 * 
 * A *minimal* implementation of a voxel game built on the 
 * [noa](https://github.com/andyhall/noa) engine. For a
 * nontrivial example that implements most/all of the engine's
 * features see [noa-testbed](https://github.com/andyhall/noa-testbed).
 * 
 * [Live demo](http://andyhall.github.io/noa-hello-world)
 * 
 * To run the demo locally:
 * 
 * ```shell
 * git clone <this repo>
 * cd noa-hello-world
 * npm install
 * npm start
 * ```
 * Then view the demo on `localhost:8080`.
 * 
 * Source is self-explanatory!
*/


var noaEngine = require('noa-engine')

var opts = {
	// 
	// 		Random sampling of some possible options:
	// 
	// inverseY: true,
	// chunkSize: 32,
	// chunkAddDistance: 1,
	// chunkRemoveDistance: 3,
	// blockTestDistance: 20,
	// texturePath: 'textures/',
	// playerStart: [0.5,15,0.5],
	// playerHeight: 1.4,
	// playerWidth: 1.0,
	// playerAutoStep: true,
	// useAO: true,
	// AOmultipliers: [ 0.93, 0.8, 0.5 ],
	// reverseAOmultiplier: 1.0,
}



// create engine
var noa = noaEngine(opts)



//		World generation


// register some block materials (just colors here)
var textureURL = null // replace that to use a texture
var brownish = [0.45, 0.36, 0.22]
var greenish = [0.1, 0.8, 0.2]
noa.registry.registerMaterial('dirtMat', brownish, textureURL)
noa.registry.registerMaterial('grassMat', greenish, textureURL)


// register block types and their material name
var dirtID = noa.registry.registerBlock('dirt', 'dirtMat')
var grassID = noa.registry.registerBlock('grass', 'grassMat')


// add a listener for when the engine requests a new world chunk
// `data` is an ndarray - see https://github.com/scijs/ndarray
noa.world.on('worldDataNeeded', function (id, data, x, y, z) {
	// populate ndarray with world data (block IDs or 0 for air)
	for (var i = 0; i < data.shape[0]; ++i) {
		for (var k = 0; k < data.shape[2]; ++k) {
			var height = getHeightMap(x+i, z+k)
			for (var j = 0; j < data.shape[1]; ++j) {
				if (y + j < height) {
					if (y + j < 0) data.set(i, j, k, dirtID)
					else data.set(i, j, k, grassID);
				}
			}
		}
	}
	// pass the finished data back to the game engine
	noa.world.setChunkData(id, data)
})

// worldgen - return a heightmap for a given [x,z]
function getHeightMap(x, z) {
	var xs = 0.8 + Math.sin(x / 10)
	var zs = 0.4 + Math.sin(z / 15 + x / 30)
	return xs + zs
}




// 		add a mesh to represent the player


// get the player entity's ID and other info (aabb, size)
var eid = noa.playerEntity
var dat = noa.entities.getPositionData(eid)
var w = dat.width
var h = dat.height

// make a Babylon.js mesh and scale it, etc.
var scene = noa.rendering.getScene()  // Babylon's "Scene" object
var mesh = BABYLON.Mesh.CreateBox('player', 1, scene)
mesh.scaling.x = mesh.scaling.z = w
mesh.scaling.y = h

// offset of mesh relative to the entity's "position" (center of its feet)
var offset = [0, h/2, 0]

// a "mesh" component to the player entity
noa.entities.addComponent(eid, noa.entities.names.mesh, {
	mesh: mesh,
	offset: offset
})




// 		Interactivity:


// on left mouse, set targeted block to be air
noa.inputs.down.on('fire', function () {
	var loc = noa.getTargetBlockPosition()
	if (loc) noa.setBlock(0, loc);
})

// on right mouse, place some grass
noa.inputs.down.on('alt-fire', function () {
	var loc = noa.getTargetBlockAdjacent()
	if (loc) noa.addBlock(grassID, loc);
})

// add a key binding for "E" to do the same as alt-fire
noa.inputs.bind('alt-fire', 'E')




