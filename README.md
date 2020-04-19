## Polaroids
Simulates a collage of polaroid pictures.  

![alt text](https://github.com/mwdchang/polaroids/raw/master/images/sample_out.png "")

### Pipeline
The pipeline is split into multiple stages:
- Image file is loaded and cached as a regular texture object.
- The ```masking shader``` renders the meta information about polaroids and their placements into a frame buffer texture object.
- Create a simple quad as a place holder and pass in both textures from before as uniform vars. At this stage the ```polaroid shader``` will figure out how to utilize the image texture based on the masking texture.
