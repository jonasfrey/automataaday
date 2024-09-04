
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@1.1/mod.js"

import {
    f_o_html__and_make_renderable,
}
from 'https://deno.land/x/f_o_html_from_o_js@2.9/mod.js'

import {
    f_o_webgl_program,
    f_delete_o_webgl_program,
    f_resize_canvas_from_o_webgl_program,
    f_render_from_o_webgl_program
} from "https://deno.land/x/handyhelpers@4.0.7/mod.js"

import {
    f_s_hms__from_n_ts_ms_utc,
} from "https://deno.land/x/date_functions@1.4/mod.js"
import { f_s_date } from "./functions.module.js";


let o_state = {}

window.o_state = o_state
o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        min-height: 100vh;
        min-width: 100vw;
        /* background: rgba(0,0,0,0.84);*/
        display:flex;
        justify-content:center;
        align-items:flex-start;
    }
    canvas{
        width: 100%;
        height: 100%;
        position:fixed;
        z-index:-1;
    }
    #o_el_time{
        margin:1rem;
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
    }
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    `
);

// it is our job to create or get the cavas
let o_canvas = document.createElement('canvas'); // or document.querySelector("#my_canvas");
document.body.appendChild(o_canvas);



let o_webgl_program = null;

let s_shader_vertex_glsl = await (await fetch('./vertex.glsl')).text();
let s_shader_fragment_glsl = await (await fetch('./fragment.glsl')).text();

let f_update_shader = async function(){

    if(o_webgl_program){
        f_delete_o_webgl_program(o_webgl_program)
    }

    o_webgl_program = f_o_webgl_program(
        o_canvas,
        s_shader_vertex_glsl,
        s_shader_fragment_glsl,
    )
    o_state.o_ufloc__o_scl_canvas = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'o_scl_canvas');
    o_state.o_ufloc__o_date = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'o_date');
    o_state.o_ufloc__o_trn_mouse = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'o_trn_mouse');
    o_state.o_ufloc__n_ts_ms_wpn = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'n_ts_ms_wpn');
    o_state.o_ufloc__n_id_frame = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'n_id_frame');
    o_state.o_ufloc__u_texture = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'u_texture');

    f_resize()
}


// just for the demo 
// o_canvas.style.position = 'fixed';
// o_canvas.style.width = '100vw';
// o_canvas.style.height = '100vh';
let f_resize = function(){
    if(o_webgl_program){
        // this will resize the canvas and also update 'o_scl_canvas'
        f_resize_canvas_from_o_webgl_program(
            o_webgl_program,
            window.innerWidth, 
            window.innerHeight
        )
    
        o_webgl_program?.o_ctx.uniform2f(o_state.o_ufloc__o_scl_canvas,
            window.innerWidth, 
            window.innerHeight
        );


        // Render the scene
        f_render_from_o_webgl_program(o_webgl_program); 

    }
}
window.onmousemove = function(o_e){
    o_webgl_program?.o_ctx.uniform2f(o_state.o_ufloc__o_trn_mouse,
        o_e.clientX, 
        o_canvas.height - o_e.clientY
    );
}
window.addEventListener('resize', ()=>{
    f_resize();
});

let n_id_raf = -1;


let mouseX = 0;
let mouseY = 0;
let clickX = 0;
let clickY = 0;
let isMouseDown = false;

// Event listener for mouse move
o_canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Event listener for mouse down
o_canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    clickX = event.clientX;
    clickY = event.clientY;
});

// Event listener for mouse up
o_canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

let o_el_time = document.createElement('div');
o_el_time.id = 'o_el_time'
document.body.appendChild(o_el_time);

let n_ms_update_time_last = 0;
let n_ms_update_time_delta_max = 1000;

let f_raf = function(){

    if(o_webgl_program){
        let o_date = new Date();
        let n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value = (o_date.getTime()/1000.)%(60*60*24)
        // n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value = (60*60*24)-1 //test
        o_webgl_program?.o_ctx.uniform4f(o_state.o_ufloc__o_date,
            o_date.getUTCFullYear(),
            o_date.getUTCMonth(), 
            o_date.getUTCDate(),
            n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value
        );
        o_webgl_program?.o_ctx.uniform4f(o_state.o_ufloc__i_mouse,
            isMouseDown ? mouseX : 0.0,
            isMouseDown ? mouseY : 0.0,
            clickX,
            clickY
        );
        o_webgl_program?.o_ctx.uniform1f( o_state.o_ufloc__n_ts_ms_wpn,
            n_sec_of_the_day_because_utc_timestamp_does_not_fit_into_f32_value
        );
        o_webgl_program?.o_ctx.uniform1i( o_state.o_ufloc__n_id_frame,
            n_id_raf-1
        );

        let n_ms = window.performance.now()
        let n_ms_delta = Math.abs(n_ms_update_time_last - n_ms);
        n_ms_update_time_last = n_ms;

        f_render_from_o_webgl_program(o_webgl_program);

    }

    n_id_raf = requestAnimationFrame(f_raf)

}
n_id_raf = requestAnimationFrame(f_raf)


let n_id_timeout = 0;
window.onpointermove = function(){
    clearTimeout(n_id_timeout);
    o_el_time.style.display = 'block'
    n_id_timeout = setTimeout(()=>{
        o_el_time.style.display = 'none'
    },5000)
}
window.onpointerdown = function(){

    // f_update_shader();
}
await f_update_shader()



let s_date = f_s_date();
o_el_time.innerText = s_date;
document.title = s_date;

// // Determine the current domain
// const s_hostname = window.location.hostname;

// // Create the WebSocket URL, assuming ws for http and wss for https
// const s_protocol_ws = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// const s_url_ws = `${s_protocol_ws}//${s_hostname}:${window.location.port}`;

// // Create a new WebSocket instance
// const o_ws = new WebSocket(s_url_ws);

// // Set up event listeners for your WebSocket
// o_ws.onopen = function(o_e) {
//     console.log({
//         o_e, 
//         s: 'o_ws.onopen called'
//     })
// };

// o_ws.onerror = function(o_e) {
//     console.log({
//         o_e, 
//         s: 'o_ws.onerror called'
//     })
// };

// o_ws.onmessage = function(o_e) {
//     console.log({
//         o_e, 
//         s: 'o_ws.onmessage called'
//     })
//     o_state.a_o_msg.push(o_e.data);
//     o_state?.o_js__a_o_mod?._f_render();

// };
// window.addEventListener('pointerdown', (o_e)=>{
//     o_ws.send('pointerdown on client')
// })
