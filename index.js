class vec2
{
    constructor(x,y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

const canvas = document.getElementById("canvas");
const mousePosLabel = document.getElementById("mousePos");
const ctx = canvas.getContext("2d");
const render = document.getElementById("render");
const clear = document.getElementById("clear");
const spacing = document.getElementById("granularity");
const runtime = document.getElementById("runtime");

let start, end;
let alreadyRendered = false;
let resizing = false;
let draggingPoint = false;
let point;
let points = [];
const POINT_WIDTH = 8;
const POINT_HEIGHT = 8;

canvas.width = window.innerWidth/2;
canvas.height = window.innerHeight/2;

function getMousePos(canvas, evt) {
    const mouseX = evt.offsetX * canvas.width / canvas.clientWidth | 0;
    const mouseY = evt.offsetY * canvas.height / canvas.clientHeight | 0;
    return {x: mouseX, y: mouseY};
}
function getPoint(n1, n2, t)
{
    const diff = n2 - n1;
    return n1 + (diff * t);
}

function draw(spacing)
{
    ctx.strokeStyle = "#000000";
    let lines = [];
    for (let t = 0; t <= 1.0; t+=spacing)
    {
        let controlPoints = [...points];
        let level = points.length-1;
        while(level > 0)
        {
            let tempPoints = [...controlPoints];
            controlPoints = [];
            for (let i = 0; i < level; i++)
            {
                let x = getPoint(tempPoints[i].x, tempPoints[i+1].x, t);
                let y = getPoint(tempPoints[i].y, tempPoints[i+1].y, t);
                controlPoints.push(new vec2(x,y));
            }
            level--;
        }
        lines.push(new vec2(controlPoints[0].x, controlPoints[0].y));
    }
    for (let i = 0; i < lines.length; i++)
    {
        if (i+1 >= lines.length) return;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lines[i].x, lines[i].y);
        ctx.lineTo(lines[i+1].x, lines[i+1].y);
        ctx.stroke();
    }
}

window.addEventListener("mousemove", function(evt){
    if (resizing)
    {
        const mousePos = getMousePos(canvas, evt);
        if (mousePos.x < 200 && mousePos.y < 200) return;
        canvas.width = mousePos.x;
        canvas.height = mousePos.y;
    }
});

window.addEventListener("mousedown", function(evt){
    const mousePos = getMousePos(canvas,evt);
    if (mousePos.x >= canvas.width-10 && mousePos.x <= canvas.width && mousePos.y >= canvas.height-10 && mousePos.y <= canvas.height && !draggingPoint)
    {
        resizing = true;
    }
});


window.addEventListener("mouseup", function(evt){
    if (resizing) {resizing = false; points=[]; alreadyRendered = false;}
});

canvas.addEventListener('mousemove', function(evt) {
    const mousePos = getMousePos(canvas, evt);
    mousePosLabel.innerHTML = "Mouse Position: " + Math.floor(mousePos.x) + ',' + Math.floor(mousePos.y + 1);
    if (draggingPoint)
    {
        ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
        points[point].x = mousePos.x;
        points[point].y = mousePos.y;
        if (alreadyRendered) draw(Number(1/spacing.value)    );
        for (let i = 0; i < points.length-1; i++)
        {
            ctx.lineWidth = 1;
            const color = points[i].color;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.fillRect(points[i].x-(POINT_WIDTH/2),points[i].y-(POINT_HEIGHT/2),POINT_WIDTH,POINT_HEIGHT);
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i+1].x, points[i+1].y);
            ctx.stroke();
        }
        ctx.fillRect(points[points.length-1].x-(POINT_WIDTH/2),points[points.length-1].y-(POINT_HEIGHT/2),POINT_WIDTH,POINT_HEIGHT);
    }
});
canvas.addEventListener("mousedown", (evt)=>{
    const mousePos = getMousePos(canvas,evt);
    for (let i = 0; i < points.length; i++)
    {
        if (mousePos.x >= points[i].x-POINT_WIDTH/2 && mousePos.x <= points[i].x+POINT_WIDTH/2 && mousePos.y >= points[i].y-POINT_HEIGHT/2 && mousePos.y <= points[i].y+POINT_HEIGHT/2)
        {
            draggingPoint = true;
            point = i;
        }
    }
});
canvas.addEventListener("mouseup", (evt)=>{
    if (resizing) return;
    if (draggingPoint) {draggingPoint = false; point = null; return;}
    if (!alreadyRendered)
    {
        const mousePos = getMousePos(canvas, evt);
        const color = '#'+Math.floor(Math.random()*16777215).toString(16);
        points.push(new vec2(mousePos.x, mousePos.y, color));
        ctx.fillStyle = color;
        ctx.fillRect(mousePos.x-(POINT_WIDTH/2),mousePos.y-(POINT_HEIGHT/2), POINT_WIDTH, POINT_HEIGHT);
        if (points.length > 1)
        {
            ctx.lineWidth = 1;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(points[points.length-2].x, points[points.length-2].y);
            ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
            ctx.stroke();
        }
    }
});

render.addEventListener("click", () => {
    if (points.length < 2) return window.alert("You need to place at least 2 control points!");
    start = new Date();
    if (!alreadyRendered)
    {
        draw(Number(1/spacing.value));
        alreadyRendered = true;
        end = new Date();
        runtime.innerHTML = "Computed in " + (end-start) + " ms";
    }
    else
    {
        ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
        draw(Number(1/spacing.value));
        end = new Date();
        runtime.innerHTML = "Computed in " + (end-start) + " ms";
        for (let i = 0; i < points.length-1; i++)
        {
            ctx.lineWidth = 1;
            const color = points[i].color;
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.fillRect(points[i].x-(POINT_WIDTH/2),points[i].y-(POINT_HEIGHT/2),POINT_WIDTH,POINT_HEIGHT);
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i+1].x, points[i+1].y);
            ctx.stroke();
        }
        ctx.fillRect(points[points.length-1].x-(POINT_WIDTH/2),points[points.length-1].y-(POINT_HEIGHT/2),POINT_WIDTH,POINT_HEIGHT);
    }
});

clear.addEventListener("click",() => {
   ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
   points = [];
   alreadyRendered = false;
});

