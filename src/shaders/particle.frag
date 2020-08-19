// @author brunoimbrizi / http://brunoimbrizi.com

precision highp float;

uniform sampler2D uTexture;
uniform float uTime;

varying vec2 vPUv;
varying vec2 vUv;

// void main() {
// 	vec4 color = vec4(0.0);
// 	vec2 uv = vUv;
// 	vec2 puv = vPUv;

// 	// pixel color
// 	vec4 colA = texture2D(uTexture, puv);

// 	// greyscale
// 	float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;
// 	vec4 colB = vec4(random(grey), random(grey), random(grey), 1.0);

// 	// circle
// 	float border = 0.3;
// 	float radius = 0.5;
// 	float dist = radius - distance(uv, vec2(0.5));
// 	float t = smoothstep(0.0, border, dist);

// 	// final color
// 	color = colB;
// 	color.a = t;

// 	gl_FragColor = color;
// }

void main() {
	vec4 color = vec4(0.0);
	vec2 uv = vUv;
	vec2 puv = vPUv;

	// pixel color
	vec4 colA = texture2D(uTexture, puv);

	// greyscale
	float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;
	vec4 colB = vec4(grey, grey, grey, 1.0);

	// circle
	float border = 0.3;
	float radius = 0.5;
	float dist = radius - distance(uv, vec2(0.5));
	float t = smoothstep(0.0, border, dist);
    // Scale UV coords to account for rectangular window
	// vec2 uv = vec2(fragCoord.x - 0.25 * iResolution.x, fragCoord.y) / iResolution.y;
    
    uv = 2.0 * uv - 1.0;
    
    // Double the speed
    float wave = sin(uTime * 2.0);
    
    // Scale to make the circle bigger so it reaches the far edges
    float circle = (uv.x * uv.x + uv.y * uv.y) * 0.2;
    vec4 color1 = vec4(0.1, 0.2, 0.8, 1.0); // Red
    vec4 color2 = vec4(0.2, 0.1, 0.8, 1.0); // Blue

	color = mix(color1, color2, circle + wave);
	// final color
	// color = colB;
	color.a = t;

	gl_FragColor = color;
}