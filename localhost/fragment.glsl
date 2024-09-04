#version 300 es
precision mediump float;
in vec2 o_trn_nor_pixel;
out vec4 fragColor;
uniform vec2 o_trn_mouse;
uniform float n_ts_ms_wpn;
uniform vec2 o_scl_canvas;
uniform vec4 o_date;
uniform sampler2D o_texture_0;
uniform int n_id_frame;

//----------------------------------------------------------------------------------------
///  2 out, 2 in...
vec2 f_o2_rnd_from_o2(vec2 p)
{
    
    // Hash without Sine
    // MIT License...
    /* Copyright (c)2014 David Hoskins.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.*/

	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

void main() {
    
    vec2 fragCoord = gl_FragCoord.xy;
    float n_min = min(o_scl_canvas.x, o_scl_canvas.y);
    vec2 o_trn_nor = (fragCoord.xy -o_scl_canvas.xy*.5) / n_min;
    vec2 o_trn_nor_mouse = (o_trn_mouse.xy -o_scl_canvas.xy*.5) / n_min;
    float n = length(o_trn_nor-o_trn_nor_mouse)*20.;

    vec2 uv = gl_FragCoord.xy / o_scl_canvas.xy;
    vec4 o_pixel_from_image_0 = texture(o_texture_0, uv);


    vec4 currentFrameColor = vec4(vec3(n), 1.);
    n = (o_pixel_from_image_0.x > .5) ? 0. : 1.;
    fragColor = vec4(vec3(n), 1.);
    if(n_id_frame < 0){
        fragColor = vec4(vec3(f_o2_rnd_from_o2(fragCoord.xy).x),1.);
    }
}