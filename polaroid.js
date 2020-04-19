const dist = (x1, y1, x2, y2) => {
  return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)); 
};

class Polaroid {
  constructor(element) {
    this.canvasContainer = element;
    this.camera = null;
    this.width = 1;
    this.height = 1;
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.scene = new THREE.Scene();
    this.shaderMaterial = {};
  }

  changeShaderUniform(key, v) {
    this.shaderMaterial.uniforms[key].value = v;
    this.renderFrame();
  }

  renderFrame() {
    this.renderer.render(this.scene, this.camera);
  }

  run(texture) {
    // Clean
    while(this.scene.children.length > 0){ 
      this.scene.remove(this.scene.children[0]); 
    }
  
    // Start
    // console.log('run', texture);
    // console.log(`\twidth ${texture.image.width}`);
    // console.log(`\theight ${texture.image.height}`);
  
    this.width = texture.image.width;
    this.height = texture.image.height;
  
    this.camera = new THREE.OrthographicCamera(0 , this.width, this.height, 0, 1, 1000);
    this.camera.position.z = 100;
  
    this.renderer.setSize(this.width, this.height);
    const canvasContainer = document.getElementById('canvas');
    canvasContainer.appendChild(this.renderer.domElement);
  
    const maskBuffer = this.renderMaskingBuffer();
    this.combineBuffers(maskBuffer, texture); 
    this.renderFrame();
  }

  renderMaskingBuffer() {
    const maskScene = this.seedScene();
  
    // FIXME If just do width, height it becomes jagged ????? Filter issues?
    const textureBuffer = new THREE.WebGLRenderTarget(this.width, this.height, { 
      minFilter: THREE.NearestMipMapNearestFilter, 
      magFilter: THREE.LinearMipMapLinearFilter,
    }); 
  
    this.renderer.setRenderTarget(textureBuffer);
    this.renderer.render(maskScene, this.camera);
    this.renderer.setRenderTarget(null);
    return textureBuffer;
  }

  combineBuffers(maskBuffer, texture) {
    const width = this.width;
    const height = this.height;

    this.shaderMaterial = new THREE.ShaderMaterial( {
      uniforms: { 
        tImage: { type: 't',  value: texture },
        tMask: { type: 't', value: maskBuffer },
        width: { type: 'f', value: width },
        height: { type: 'f', value: height },
        blurSize: { type: 'i', value: 4 },
        threshold: { type: 'f', value: 0.0 }
      },
      vertexShader: vertexShader,
      fragmentShader: polaroidFragShader,
      depthWrite: false
    });
  
    const plane = new THREE.PlaneGeometry(width, height);
    const quad = new THREE.Mesh( plane, this.shaderMaterial);
    quad.position.x = width / 2;
    quad.position.y = height / 2;
  
    this.scene.add( quad );
  }


  createPolaroid(px, py, rz, len, isFrame) {
    let mesh, geometry, material;
    let x1 = 0; 
    let y1 = 0;
    let x2 = len;
    let y2 = len + 10;
  
    if (isFrame < 1.0) {
      x1 += 4; 
      y1 += 20; 
      x2 -= 4; 
      y2 -= 6; 
    }
  
    let cx = 0.5 * this.width;
    let cy = 0.5 * this.height;
  
    let F1 = { x: x1, y: y1 };
    let F2 = { x: x2, y: y2 };
  
    geometry = new THREE.Geometry();
    geometry.vertices.push( new THREE.Vector3( F1.x, F1.y, 2 ) );
    geometry.vertices.push( new THREE.Vector3( F2.x, F1.y, 2 ) );
    geometry.vertices.push( new THREE.Vector3( F2.x, F2.y, 2 ) );
    geometry.vertices.push( new THREE.Vector3( F1.x, F2.y, 2 ) );
    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) ); // counter-clockwise winding order
    geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );
    geometry.computeFaceNormals();
  
    let uniforms = {};
    uniforms.isFrame = {
      type: 'f', value: isFrame
    };
  
    material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: maskFragShader,
      depthTest: false
    });
  
    mesh = new THREE.Mesh( geometry, material);
    mesh.position.x = cx + px;
    mesh.position.y = cy + py;
    mesh.rotation.z = rz;
    return mesh;
  }

  seedScene() {
    const maskScene = new THREE.Scene();

    const spread = [];
    const width = this.width;
    const height = this.height;

    for (let i=0; i < 25; i++) {
      let px, py, rz, len;
  
      //rz = Math.random() * (2 * Math.PI) - Math.PI;
      rz = Math.random() * (0.75*Math.PI) - 0.75/2.0*Math.PI;
  
      len = Math.random() * 45 + 100;
      px = Math.random() * width - 0.5 * width;
      py = Math.random() * height - 0.5 * height;
    
    
      while(true) {
        px = Math.random() * width - 0.5 * width;
        py = Math.random() * height - 0.5 * height;
    
        var tooClose = false;
        for (var j=0; j < spread.length; j++) {
          if (dist(spread[j].x, spread[j].y, px, py) < 30.0) {
            tooClose = true;
            break;
          }
        }
        if (tooClose === false) break;
      }
    
      spread.push({
        x: px,
        y: py
      });
      
      // FIXME: render order problem
      maskScene.add(this.createPolaroid(px, py, rz, len, 1.0));
      if (Math.random() > 0.5) {
        maskScene.add(this.createPolaroid(px, py, rz, len, 0.9));
      } else {
        maskScene.add(this.createPolaroid(px, py, rz, len, 0.8));
      }
    }
    return maskScene;
  }


}
