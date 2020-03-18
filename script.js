let staticPieces = [];
let iter = 0;
let gameOver = false;
let score = 0;
let high_score = 0;
let level = 2;
let next;
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
for(let i = 0;i != 7; i++) {
   images[i].src = `./assets/${colors[i]}.png`;
   images[i].onload = () => {
      console.log('Image loaded');
   }
}

for(let i = 0;i != 20; i++) {
   staticPieces.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}

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
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 10;
            ctx.drawImage(images[staticPieces[i][j]-1], j*box_side+1, i*box_side+1, box_side-2, box_side-2)
         }
      }
   }
   ctx.restore();
   ctx.save();
   ctx.font = 'bold 18px Maiandra GD'
   let text = `Score: ${score}`;
   ctx.fillText(text, box_side*13-ctx.measureText(text).width/2, box_side*14);
   text = `Level: ${level}`;
   ctx.fillText(text, box_side*13-ctx.measureText(text).width/2, box_side*15);
   text = `High Score: ${high_score}`;
   ctx.fillText(text, box_side*13-ctx.measureText(text).width/2, box_side*16);
   text = 'Next Piece';
   ctx.fillText('Next Piece', box_side*13-ctx.measureText(text).width/2, box_side);
   ctx.restore();
};

const drawPiece = (ctx, box_side, piece) => {
   ctx.save();
   ctx.shadowColor = 'black';
   ctx.shadowBlur = 10;
   for(let i = 0;i != piece.mat.length; i++) {
      for(let j = 0;j != piece.mat[0].length; j++) {
         if(piece.mat[i][j] !== 0) {
            ctx.drawImage(images[colors.indexOf(piece.color)], (piece.x + j + piece.offX)*box_side+1, (piece.y + i + piece.offY)*box_side+1, box_side-2, box_side-2);
         }
      }
   }
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
   };
   piece.y = -piece.mat.length;
   if(index === 0) piece.offY = 1;
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
   if(lines && lines <= 4)
      score += points[lines-1]*level;
   else if(lines > 5)
      score += points[4]*level;
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

window.onload = () => {
   const canvas = document.querySelector('#Canvas');
   const ctx = canvas.getContext('2d');
   const wdt = window.innerWidth;
   const hgt = window.innerHeight;
   canvas.height = hgt*0.8;
   const box_side = canvas.height/20;
   canvas.width = box_side*16;
   canvas.style.left = `${wdt/2-(canvas.width<wdt?canvas.width/2:wdt/2)}px`;
   drawGrid(canvas, ctx, box_side);
   let piece = newPiece();
   next = newPiece();

   drawPiece(ctx, box_side, piece);
   canvas.onclick = e => {
      let rot = rotate(piece);
      if(collisionY(rot) || collisionX(rot))
         return;
      piece = rot;
   }
   window.onkeydown = key => {
      if(key.key === 'ArrowUp') {
         if(collisionY(rotate(piece))) 
            return;
         piece = rotate(piece);
         ctx.clearRect(0, 0, wdt, hgt);
         drawGrid(canvas, ctx, box_side);
         drawPiece(ctx, box_side, piece);
      }
      else if(key.key === 'ArrowDown') {
         // do nothing for now
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
   document.querySelector('#right').onclick = () => {
      piece.x += 1;
         if(collisionY(piece) || collisionX(piece))
            piece.x -= 1;
   };
   document.querySelector('#left').onclick = () => {
      piece.x -= 1;
         if(collisionY(piece) || collisionX(piece))
            piece.x += 1;
   };
   const Game = () => {
      if(!gameOver)
         requestAnimationFrame(Game);
      if(iter < Math.floor(20/level)) {
         iter += 1;
         return;
      }
      iter = 0;
      piece.y += 1;
      if(collisionY(piece)) {
         piece.y -= 1;
         if(piece.y <= -1) {
            gameOver = true;
            alert('Game Over');
            return;
         }
         addToGrid(piece);
         piece = next;
         next = newPiece();
         score += 10*level;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(canvas, ctx, box_side);
      drawPiece(ctx, box_side, piece);
      purgeRows();
   };
   Game();
};