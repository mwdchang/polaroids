## Polaroids
Simulates a collage of polaroid pictures.  


### Pipeline
The pipeline is split into multiple stages:
- Image file is loaded and cached as a regular texture object.
- The ```masking shader``` renders the meta information about polaroids and their placements into a frame buffer texture object.
- Create a simple quad as a place holder and pass in both textures from before as uniform vars. At this stage the ```polaroid shader``` will figure out how to utilize the image texture based on the masking texture.

// 0) Create frame buffer texture
// 1) Seed position P1 ... Pn
// 2) Generate box outline for Pi in colour R
// 3) Generate box for Pi in colour R'
// 4) Buffer memory to FBT F
// 5) Store image as texture T
// 6) Super impose F and T such that:
//      c(u, v) = T(u, v) iff F(u, v) == R'  
//      c(u, v) = R iff F(u, v) == R
//      c(u, v) = 0 otherwise
