let staticPieces = [];
let iter = 0;
let gameOver = false;
let score = 0;
let high_score = 0;
let level = 1;
let totalLines = 0;
let piece, next, left, right, box_side, canvas, ctx, drop, rot;
const wdt = window.innerWidth;
const hgt = window.innerHeight;
const points = [50, 150, 350, 1000, 2000];
const colors = ['crimson', 'orangered', 'greenyellow', 'dodgerblue', 'pink', 'lime', 'white'];
const pieces = [
   [ [1, 1, 1, 1] ],
   [ [1, 1], [1, 1] ],
   [ [1, 0], [1, 0], [1, 1] ],
   [ [1, 0], [1, 1], [0, 1] ],
   [ [0, 1], [1, 1], [1, 0] ],
   [ [1, 0], [1, 1], [1, 0] ],
   [ [0, 1], [0, 1], [1, 1] ]
];
const images = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];

const drawGrid = (canvas, ctx, box_side) => {
   ctx.save();
   ctx.fillStyle = '#dfdfdf';
   ctx.fillRect(box_side*10+2, 0, box_side*6, box_side*20);
   ctx.beginPath();
   ctx.lineWidth = 2;
   ctx.moveTo(box_side*10, 0);
   ctx.lineTo(box_side*10, canvas.height);
   ctx.closePath();
   ctx.stroke();
   ctx.restore();
   ctx.lineWidth = 1;
   for(let i = 0;i <= box_side*10; i += box_side) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
   }
   for(let i = canvas.height;i >= 0; i -= box_side) {
      ctx.moveTo(0, i);
      ctx.lineTo(box_side*10, i);
   }
   ctx.stroke();
   ctx.restore();
   ctx.save();
   for(let i = 0;i != staticPieces.length; i++) {
      for(let j = 0;j != staticPieces[0].length; j++) {
         if(staticPieces[i][j] !== 0) {
            ctx.drawImage(images[staticPieces[i][j]-1], j*box_side+1, i*box_side+1, box_side-2, box_side-2)
         }
      }
   }
   ctx.restore();
   ctx.save();
   ctx.font = `bold ${box_side*0.7}px Times New Roman`
   let text = 'NEXT PIECE';
   ctx.fillText(text, box_side*13-ctx.measureText(text).width/2, box_side);
   ctx.restore();
   document.querySelector('#score').childNodes[0].nodeValue = score;
   document.querySelector('#level').childNodes[0].nodeValue = level;
   document.querySelector('#high_score').childNodes[0].nodeValue = high_score;
};

const drawPiece = (ctx, box_side, piece) => {
   ctx.save();
   for(let i = 0;i != piece.mat.length; i++) {
      for(let j = 0;j != piece.mat[0].length; j++) {
         if(piece.mat[i][j] !== 0) {
            ctx.drawImage(images[colors.indexOf(piece.color)], (piece.x + j + piece.offX)*box_side+1, (piece.y + i + piece.offY)*box_side+1, box_side-2, box_side-2);
         }
      }
   }
   ctx.shadowColor = 'black';
   ctx.shadowBlur = 2;
   let col = next.mat[0].length;
   for(let i = 0;i != next.mat.length; i++) {
      for(let j = 0;j != col; j++) {
         if(next.mat[i][j] !== 0) {
            let c = 1?col <= 3:0;
            ctx.drawImage(images[colors.indexOf(next.color)], box_side*(11+j+c), box_side*(i+2+next.offY), box_side, box_side);
         }
      }
   }
   ctx.restore();
};

const rotate = piece => {
   let rotPiece = {
      mat: [],
      color: piece.color,
      x:piece.x,
      y:piece.y,
      offY: piece.offY,
      offX: piece.offX,
   };
   if(piece.offX !== 0) { 
      rotPiece.offX = 0;
      rotPiece.offY = 1;
   }
   else if(piece.offY !== 0) {
      rotPiece.offX = 1;
      rotPiece.offY = 0;
   }
   let matrix = [];
   for(let j = 0;j != piece.mat[0].length; j++) {
      let row = [];
      for(let i = 0;i != piece.mat.length; i++) {
         row.push(piece.mat[i][j]);
      }
      matrix.push(row.reverse());
   }
   rotPiece.mat = matrix;
   return rotPiece;
};

const newPiece = () => {
   let index = Math.floor(Math.random()*7);
   let piece = {
      mat: pieces[index],
      color: colors[index],
      x: 4, 
      y: 0,
      offY: 0,
      offX: 0
   }
   if(index === 0) piece.offY = 1;
   piece.y = -piece.mat.length-piece.offY+1;
   if(collisionY(piece))
      gameOver = true;
   return piece;
};

const purgeRows = () => {
   let lines = 0;
   for(let i = 0;i != staticPieces.length; i++) {
      if(staticPieces[i].filter(x => x !== 0).length === 10) {
         staticPieces[i] = staticPieces[i].map(x => 0);
         staticPieces.splice(i, 1);
         staticPieces.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
         lines += 1;
      }
   }
   if(!lines)
      return;
   totalLines += lines;
   if(level <= 10 && totalLines >= Math.pow(2, level+1)) {
      level += 1;
   }
   if(lines <= 5)
      score += points[lines-1]*level;
   else if(lines > 5)
      score += (points[4])*level*(Math.pow(2, lines-6+1));
};

const collisionY = piece => {
   if(piece.y+piece.mat.length+piece.offY > 20)
      return true;
   let startY = (piece.y >= 0)?piece.y:0;
   for(let i = startY;i != piece.y+piece.mat.length; i++) {
      for(let j = piece.x;j != piece.x+piece.mat[0].length; j++) {
         if(staticPieces[i+piece.offY][j+piece.offX] !== 0 && piece.mat[i-piece.y][j-piece.x] !== 0) {
            return true;
         }
      }
   }
   return false;
};

const collisionX = piece => {
   if(piece.x + piece.mat[0].length + piece.offX > 10 || piece.x + piece.offX < 0) 
      return true;
   return false;
};

const addToGrid = piece => {
   for(let i = piece.y;i != piece.y+piece.mat.length; i++) {
      for(let j = piece.x; j != piece.x+piece.mat[0].length; j++) {
         if(piece.mat[i-piece.y][j-piece.x] !== 0)
            staticPieces[i+piece.offY][j+piece.offX] = colors.indexOf(piece.color)+1;
      }
   }
};

const Begin = () => {
   score = 0;
   staticPieces = [];
   for(let i = 0;i != 20; i++) {
      staticPieces.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
   }

   drawGrid(canvas, ctx, box_side);
   piece = newPiece();
   next = newPiece();

   drawPiece(ctx, box_side, piece);
   window.onkeydown = key => {
      if(key.key === 'ArrowUp') {
         let rot = rotate(piece);
         if(collisionY(rot) || collisionX(rot))
            return;
         piece = rot;
      }
      else if(key.key === 'ArrowDown') {
         if(piece.y+piece.mat.length < 1) return;
         for(let i = piece.y;i != 20; i++) {
            piece.y += 1;
            if(collisionY(piece)) {
               piece.y -= 1;
               return;
            }
         }
      }
      else if(key.key === 'ArrowLeft') {
         piece.x -= 1;
         if(collisionY(piece) || collisionX(piece)) 
            piece.x += 1;
      }
      else if(key.key === 'ArrowRight') {
         piece.x += 1;
         if(collisionY(piece) || collisionX(piece))
            piece.x -= 1;
      }
   };
   right.onclick = () => {
      piece.x += 1;
         if(collisionY(piece) || collisionX(piece))
            piece.x -= 1;
   };
   left.onclick = () => {
      piece.x -= 1;
         if(collisionY(piece) || collisionX(piece))
            piece.x += 1;
   };
   rot.onclick = () => {
      let rot = rotate(piece);
      if(collisionY(rot) || collisionX(rot))
         return;
      piece = rot;
   }
   drop.onclick = () => {
      if(piece.y < 1) return;
      for(let i = piece.y;i != 20; i++) {
         piece.y += 1;
         if(collisionY(piece)) {
            piece.y -= 1;
            return;
         }
      }
   }
   
   const Game = () => {
      let anim = window.requestAnimationFrame(Game);
      if(iter === 25-level*2) {
         piece.y += 1;
      }
      iter = (iter+1)%(25-level*2);
      if(collisionY(piece)) {
         piece.y -= 1
         score += 10*level;
         if(piece.y <= -1) {
            if(score > high_score) high_score = score;
            alert('Game Over');
            level = 1;
            window.cancelAnimationFrame(anim);
            window.onclick = Begin();
            return;
         }
         addToGrid(piece);
         purgeRows();
         piece = next;
         next = newPiece();
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(canvas, ctx, box_side);
      drawPiece(ctx, box_side, piece);
      iter += 1;
   };
   Game();
}

window.onload = () => {
   canvas = document.querySelector('#Canvas');
   ctx = canvas.getContext('2d');
   left = document.querySelector('#left');
   right = document.querySelector('#right');
   drop = document.querySelector('#drop');
   rot = document.querySelector('#rotate');

   canvas.height = hgt*0.8;
   box_side = canvas.height/20;
   canvas.width = box_side*16;
   if(canvas.width > wdt) {
      let diff = canvas.width - wdt;
      canvas.width -= diff;
      canvas.height -= diff;
      box_side = canvas.height/20;
   }

   canvas.style.left = `${wdt/2-(canvas.width<wdt?canvas.width/2:wdt/2)}px`;
   let t = 0;
   for(let elem of document.querySelectorAll('.stats')) {
      elem.style.width = `${box_side*4-2}px`;
      elem.style.height = `${box_side*0.8-2}px`;
      elem.style.left = `${(wdt-canvas.width)/2 + box_side*11}px`;
      elem.style.top = `${box_side*(13+t*1.6)}px`;
      elem.style.fontSize = `${0.8*box_side-4}px`;
      t += 1;
   }
   for(let elem of document.querySelectorAll('.name')) {
      elem.style.width = `${box_side*4-2}px`;
      elem.style.height = `${box_side*0.8-2}px`;
      elem.style.top = `-${box_side*0.6}px`;
      elem.style.fontSize = `${0.55*box_side-2}px`;
   }

   left.style.width = `${hgt*0.15}px`;
   left.style.height = `${hgt*0.15}px`;
   left.style.left = `${(wdt-canvas.width)/2}px`;
   left.style.top = `${hgt*0.825}px`;

   right.style.width = `${hgt*0.15}px`;
   right.style.height = `${hgt*0.15}px`;
   right.style.right = `${(wdt-canvas.width)/2}px`;
   right.style.top = `${hgt*0.825}px`;

   drop.style.width = `${hgt*0.1}px`;
   drop.style.height = `${hgt*0.1}px`;
   drop.style.left = `${wdt/2-hgt*0.12}px`;
   drop.style.top = `${hgt*0.825}px`;

   rot.style.width = `${hgt*0.1}px`;
   rot.style.height = `${hgt*0.1}px`;
   rot.style.right = `${wdt/2-hgt*0.12}px`;
   rot.style.top = `${hgt*0.825}px`;

   t = 0;
   for(let i = 0;i != 7; i++) {
      images[i].src = `https://github.com/Gamma-001/Classic_Tetris/blob/master/assets/${colors[i]}.png?raw=true`;
      images[i].onload = () => {
         t += 1;
         document.querySelector('#slider').style.width = `${100*(t+1)/7}%`;
         document.querySelector('#progress-text').innerHTML = `${Math.floor(100*(t+1)/7)}% loaded`;
         if(i == 6) {
            document.querySelector('#progress').style.visibility = 'hidden';
            document.querySelector('#cover').style.visibility = 'hidden';
            setTimeout(Begin(), 500);
         }
      }
   }
};
