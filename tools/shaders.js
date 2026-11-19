/* StyleForge (working name) — tools/shaders.js — WebGL shader effects — Copyright (C) 2026 Zarir Madon — GNU GPL v3 or later (see LICENSE) */
(function () {
  const { R, C, S, B } = SF;
  SF.category('Shader effects', 'GPU-drawn plasma, fluid, fractals, cells, kaleidoscopes and more (needs WebGL)');
  const sp = (v = 1) => R('speed', 'Speed', 0, 4, v, '×', .05);
  const cols = (a, b, c) => [C('c1', 'Colour 1', a), C('c2', 'Colour 2', b), C('c3', 'Colour 3', c)];

  SF.glTool({ id: 'sh-plasma', name: 'Plasma', learn: 'Plasma adds several sine waves together. Where they agree the result is bright, where they cancel it is dark, which gives smooth swirling bands.',
    p: [sp(1), R('scale', 'Zoom', 1, 12, 4, '', .1), ...cols('#1a0b4d', '#ff3d9a', '#ffd166')],
    body: `vec2 p=uv*u_scale; float t=u_t*u_speed; float v=sin(p.x+t)+sin((p.y+t)*.7)+sin((p.x+p.y+t)*.5)+sin(length(p)*1.5-t); v=v*.25+.5; col=mix(u_c1,u_c2,smoothstep(0.,.5,v)); col=mix(col,u_c3,smoothstep(.5,1.,v));` });

  SF.glTool({ id: 'sh-flow', name: 'Fluid flow', learn: 'Noise is used to bend noise (domain warping), which creates smoke- and marble-like folds that slowly move.',
    p: [sp(.6), R('scale', 'Zoom', .5, 8, 2.2, '', .1), R('mix', 'Third colour', 0, 1.5, .8, '', .05), ...cols('#0b1030', '#35d0ba', '#ff5c9d')],
    body: `vec2 p=uv*u_scale; float t=u_t*u_speed*.3; vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t)); vec2 r=vec2(fbm(p+4.*q+vec2(1.7,9.2)+t*.5),fbm(p+4.*q+vec2(8.3,2.8))); float f=fbm(p+4.*r); col=mix(u_c1,u_c2,clamp(f*f*3.,0.,1.)); col=mix(col,u_c3,clamp(length(q),0.,1.)*u_mix);` });

  SF.glTool({ id: 'sh-aurora', name: 'Aurora curtains', learn: 'Vertical curtains of light that ripple sideways, drawn by stretching noise upwards.',
    p: [sp(.7), R('scale', 'Curtain width', .5, 6, 2, '', .1), R('h', 'Curtain height', .2, 2, 1, '', .05), ...cols('#050816', '#35f0b0', '#7c5cff')],
    body: `float t=u_t*u_speed*.3; float x=uv.x*u_scale; float w=fbm(vec2(x*1.3+t,t*.5)); float band=smoothstep(.0,.5,uv.y*u_h+.2+w*.6)*smoothstep(1.4,.2,uv.y*u_h+w*.5+.3); float rays=fbm(vec2(x*6.+w*3.,t)); float a=band*(.4+rays); col=u_c1+mix(u_c2,u_c3,uv.y*.5+.5+w*.3)*a*1.3; col+=u_c1*.0;` });

  SF.glTool({ id: 'sh-voronoi', name: 'Voronoi cells', learn: 'Scatter points and colour each pixel by its nearest point. The borders between regions look like cells, cracked mud or stained glass.',
    p: [sp(.5), R('scale', 'Cell count', 1, 20, 6, '', .5), R('edge', 'Edge softness', .02, .5, .08, '', .01), ...cols('#ff5c9d', '#7c5cff', '#0b0f22')],
    body: `vec2 p=uv*u_scale; vec2 i=floor(p),f=fract(p); float md=8.,m2=8.; vec2 mc=vec2(0.); for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y)); vec2 o=vec2(h(i+g),h(i+g+17.3)); o=.5+.5*sin(u_t*u_speed+6.28*o); float d=length(g+o-f); if(d<md){m2=md;md=d;mc=i+g;} else if(d<m2){m2=d;}} float edge=smoothstep(0.,u_edge,m2-md); vec3 cc=mix(u_c1,u_c2,h(mc)); col=mix(u_c3,cc,edge);` });

  SF.glTool({ id: 'sh-clouds', name: 'Clouds', learn: 'Fractal noise (fbm) layers noise at several sizes. Thresholding it gives believable cloud shapes.',
    p: [sp(.4), R('scale', 'Cloud size', .5, 8, 2.5, '', .1), R('cover', 'Cloud cover', 0, 1, .45, '', .01), ...cols('#2b6cb0', '#ffffff', '#ffd9a8')],
    body: `float f=fbm(uv*u_scale+vec2(u_t*u_speed*.2,0.)); float d=smoothstep(u_cover,u_cover+.35,f); col=mix(u_c1,u_c2,d); col=mix(col,u_c3,smoothstep(.0,.6,fbm(uv*u_scale*2.+3.))*d*.4);` });

  SF.glTool({ id: 'sh-kaleido', name: 'Kaleidoscope', learn: 'Space is folded into mirrored wedges, so any pattern drawn in one wedge is repeated all the way round.',
    p: [sp(.6), R('n', 'Segments', 3, 24, 8, '', 1), R('scale', 'Pattern size', .5, 8, 2.5, '', .1), ...cols('#14082e', '#ff5c9d', '#ffd166')],
    body: `vec2 p=uv; float a=atan(p.y,p.x),r=length(p); float seg=6.2831853/u_n; a=abs(mod(a,seg)-seg*.5); p=r*vec2(cos(a),sin(a)); p=rot(u_t*u_speed*.2)*p; float f=fbm(p*u_scale+u_t*u_speed*.1); col=mix(u_c1,u_c2,f); col=mix(col,u_c3,smoothstep(.5,.9,fbm(p*u_scale*2.-f)));` });

  SF.glTool({ id: 'sh-julia', name: 'Julia fractal', learn: 'Every pixel is run through a tiny formula repeatedly; how quickly it escapes decides its colour. Changing the two seed numbers morphs the whole shape.',
    p: [sp(.3), R('zoom', 'Zoom', .6, 4, 1, '', .05), R('cr', 'Shape A', -1, 1, -.74, '', .01), R('ci', 'Shape B', -1, 1, .11, '', .01), ...cols('#050b2a', '#35d0ba', '#ffd166')],
    body: `vec2 z=uv*1.5/u_zoom; vec2 c=vec2(u_cr,u_ci)+.03*vec2(sin(u_t*u_speed),cos(u_t*u_speed)); float it=0.; for(int i=0;i<90;i++){z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c; if(dot(z,z)>16.)break; it+=1.;} float f=it/90.; col=mix(u_c1,u_c2,sqrt(f)); col=mix(col,u_c3,smoothstep(.5,1.,f)); if(it>=89.)col=u_c1*.35;` });

  SF.glTool({ id: 'sh-metaballs', name: 'Metaballs', learn: 'Blobs that merge like liquid when they get close. Each blob adds an inverse-square glow, and a threshold decides the surface.',
    p: [sp(1), R('size', 'Blob size', .01, .2, .05, '', .005), R('edge', 'Merge threshold', .5, 3, 1.2, '', .05), ...cols('#0b0f22', '#ff5c9d', '#ffd166')],
    body: `float s=0.; for(int i=0;i<7;i++){float fi=float(i); vec2 c=vec2(sin(u_t*u_speed*.7+fi*1.7)*.8,cos(u_t*u_speed*.5+fi*2.3)*.6); s+=u_size/dot(uv-c,uv-c);} col=mix(u_c1,u_c2,smoothstep(u_edge*.7,u_edge,s)); col=mix(col,u_c3,smoothstep(u_edge*2.,u_edge*4.,s));` });

  SF.glTool({ id: 'sh-caustics', name: 'Water caustics', learn: 'The shifting light patterns at the bottom of a pool, built by repeatedly bending coordinates and adding sine waves.',
    p: [sp(.7), R('scale', 'Pattern size', 1, 12, 4, '', .1), R('sharp', 'Sharpness', 1, 8, 3, '', .1), ...cols('#04295a', '#2fb4e8', '#e8fbff')],
    body: `vec2 p=uv*u_scale; float t=u_t*u_speed; float v=0.; for(int i=0;i<4;i++){float fi=float(i); p+=vec2(sin(p.y*1.3+t+fi),cos(p.x*1.1-t*.8+fi*2.)); v+=sin(p.x+p.y)*.5+.5;} v/=4.; v=pow(v,u_sharp); col=mix(u_c1,u_c2,v)+u_c3*pow(v,6.)*.8;` });

  SF.glTool({ id: 'sh-checker', name: 'Warped checkerboard', learn: 'A plain chessboard whose coordinates are pushed around by noise, so it ripples like cloth.',
    p: [sp(.5), R('scale', 'Square count', 1, 20, 6, '', .5), R('warp', 'Warp', 0, 3, 1.2, '', .05), ...cols('#1c1f45', '#ff5c9d', '#35d0ba')],
    body: `vec2 p=uv*u_scale; p+=u_warp*vec2(fbm(p+u_t*u_speed*.2),fbm(p+9.1-u_t*u_speed*.2)); float c=mod(floor(p.x)+floor(p.y),2.); col=mix(u_c1,u_c2,c); col=mix(col,u_c3,.18*fbm(p*3.));` });

  SF.glTool({ id: 'sh-tunnel', name: 'Spiral tunnel', learn: 'Converting each pixel to angle and distance from the centre lets stripes spiral into the distance.',
    p: [sp(.8), R('arms', 'Spiral arms', 1, 16, 6, '', 1), R('depth', 'Depth', .2, 6, 2, '', .1), ...cols('#10052e', '#7c5cff', '#ff5c9d')],
    body: `float a=atan(uv.y,uv.x)/6.2831853,r=length(uv); float z=1./(r+.15); float s=fract(a*u_arms+z*u_depth-u_t*u_speed); col=mix(u_c1,u_c2,smoothstep(.4,.6,s)); col=mix(col,u_c3,smoothstep(.45,.5,s)*smoothstep(.55,.5,s)); col*=smoothstep(0.,.6,r);` });

  SF.glTool({ id: 'sh-moire', name: 'Moiré rings', learn: 'Two sets of circular waves overlap and create new, larger patterns where they interfere.',
    p: [sp(.6), R('freq', 'Ring density', 5, 80, 30, '', 1), R('sep', 'Separation', 0, 1.5, .5, '', .02), ...cols('#0b0f22', '#35d0ba', '#ffffff')],
    body: `vec2 a=uv-vec2(u_sep*.5,0.),b=uv+vec2(u_sep*.5,0.); float v=sin(length(a)*u_freq-u_t*u_speed)*sin(length(b)*u_freq+u_t*u_speed); v=v*.5+.5; col=mix(u_c1,u_c2,smoothstep(.3,.7,v)); col+=u_c3*pow(v,8.)*.5;` });
})();
