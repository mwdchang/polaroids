const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    // gl_Position = vec4( position, 1.0 );
  }
`;

const maskFragShader = `
  uniform float isFrame;
  void main()	{
    vec2 p = gl_FragCoord.xy;
  
    if (isFrame >= 1.0) {
      gl_FragColor=vec4(1.0, 1.0, 1.0, 1);
    } else if (isFrame >= 0.9) {
      gl_FragColor=vec4(1.0, 0.0, 0.0, 1);
    } else  if (isFrame >= 0.8) {
      gl_FragColor=vec4(0.0, 1.0, 0.0, 1);
    }
  }
`;

const polaroidFragShader = `
  varying vec2 vUv;
  
  uniform int blurSize;
  uniform float width;
  uniform float height;
  uniform sampler2D tImage;
  uniform sampler2D tMask;

  uniform float threshold; 
  
  vec4 sepia(vec3 c) {
    // float threshold = 0.85;
    vec3 sepia;
    sepia.r = dot(c, vec3(0.393, 0.769, 0.189));
    sepia.g = dot(c, vec3(0.349, 0.686, 0.168));
    sepia.b = dot(c, vec3(0.272, 0.534, 0.131));
  
    vec4 outColour;
    outColour.r = (1.0 - threshold)*c.r + threshold*sepia.r;
    outColour.g = (1.0 - threshold)*c.g + threshold*sepia.g;
    outColour.b = (1.0 - threshold)*c.b + threshold*sepia.b;
    outColour.a = 1.0;
  
    return outColour;
  }
  
  vec4 blur(vec2 coord, sampler2D tex, const int threshold) {
    vec4 o = vec4(0, 0, 0, 1);
  
    int c = 0;
    const int t = 13;
  
    for (int x = -t; x < t; x++ ) {
      for (int y = -t; y < t; y++ ) {
        o.rgb += texture2D(tex, coord.xy + vec2( float(x)/width, float(y)/width)).rgb;
        c++;
      }
    }
    o.rgb /= float(c);
   return o;
  }
  
  
  void main() {
  
    vec4 target = texture2D(tMask, vUv);
    vec2 p = gl_FragCoord.xy;
  
    if (target.r >= 0.99 && target.g >= 0.99) {
      // Frame
      gl_FragColor = vec4(0.95, 0.95, 0.95, 1.0);
    } else if (target.r >= 0.99) {
      // Mode 1
      gl_FragColor = texture2D( tImage, vUv + vec2(-0.07, 0.01));
    } else if (target.g >= 0.99) {
      // Mode 2
      gl_FragColor = texture2D( tImage, vUv + vec2(-0.07, 0.01));
      gl_FragColor = sepia(gl_FragColor.rgb);
    } else {
      // Background
      vec4 c = blur(vUv, tImage, blurSize);
  
      // Grey-scale
      float blah = (c.r + c.g + c.b)/3.0;
      c.rgb = vec3(blah, blah, blah);
      gl_FragColor = c;
    }
  }
`;
