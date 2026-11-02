/* ---------------- SNAKE ---------------- */
function snake(api, signal, lv){
  const C = 18, R = 27, S = 20;
  let body = [{x:9,y:13},{x:8,y:13},{x:7,y:13}], dir = 'r', next = 'r', food, score = 0, dead = false, acc = 0, speed = [150, 125, 100][lv];
  const opp = { l:'r', r:'l', u:'d', d:'u' }, vec = { l:[-1,0], r:[1,0], u:[0,-1], d:[0,1] };
  const rocks = [];
  if (lv === 2) while (rocks.length < 10) { const rx = rand(C), ry = rand(R); if (Math.abs(ry - 13) > 2 && !rocks.some(r => r.x === rx && r.y === ry)) rocks.push({ x: rx, y: ry }); }
  function place(){ do { food = { x: rand(C), y: rand(R) }; } while (body.some(b => b.x === food.x && b.y === food.y) || rocks.some(r => r.x === food.x && r.y === food.y)); }
  place();
  const turn = d => { if (d !== opp[dir]) next = d; };
  swipe(signal, turn);
  function step(){
    dir = next;
    const h = { x: body[0].x + vec[dir][0], y: body[0].y + vec[dir][1] };
    if (lv === 0) { h.x = (h.x + C) % C; h.y = (h.y + R) % R; }
    if (h.x < 0 || h.y < 0 || h.x >= C || h.y >= R || body.some(b => b.x === h.x && b.y === h.y) || rocks.some(r => r.x === h.x && r.y === h.y)) { dead = true; api.end(score); return; }
    body.unshift(h);
    if (h.x === food.x && h.y === food.y) { score++; api.score(score); speed = Math.max([95, 65, 42][lv], speed - [2, 2, 3][lv]); place(); }
    else body.pop();
  }
  function draw(){
    clear();
    ctx.fillStyle = '#1d2243';
    for (let x = 0; x < C; x++) for (let y = 0; y < R; y++) if ((x + y) % 2) ctx.fillRect(x * S, y * S, S, S);
    rocks.forEach(r => rr(r.x * S + 2, r.y * S + 2, S - 4, S - 4, 5, '#6c73a6'));
    circle(food.x * S + S/2, food.y * S + S/2, S/2 - 3, '#ff5c7a');
    body.forEach((b, i) => rr(b.x * S + 1, b.y * S + 1, S - 2, S - 2, 6, i ? '#2fd08a' : '#7dffc4'));
  }
  loop(signal, dt => { if (dead) return; acc += dt * 1000; while (acc >= speed && !dead) { acc -= speed; step(); } draw(); });
  return { dir: turn };
}
